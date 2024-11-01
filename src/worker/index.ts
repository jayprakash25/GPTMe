import { Ai } from "@cloudflare/ai";
import { Hono } from "hono";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { D1Database } from "@cloudflare/workers-types";
import { cors } from "hono/cors";
import { Context } from "hono";
import { systemPrompt } from "@/prompts/prompt1";

// Types
interface Env {
  DB: D1Database;
  AI: Ai;
  JWT_SECRET: string;
}

interface User {
  google_id: string;
  name: string | null;
  email: string;
  picture: string | null;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: number;
  userId: string;
  status: "in_progress" | "completed";
  messages: string;
  extractedInfo: string;
  createdAt: string;
}

interface JWTPayload {
  payload: {
    sub: string;
    name: string;
    email: string;
    picture: string;
    exp: number;
  };
}

interface Message {
  role: string;
  content: string;
}


const prompt: string = systemPrompt;

// Type declaration for Hono context with user
type UserContext = Context<{ Bindings: Env; Variables: { user: JWTPayload } }>;

const app = new Hono<{ Bindings: Env }>();

//CORS middleware
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"], // Add your frontend domains
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Centralized error handling middleware
app.use(async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error("Unhandled error:", error);
    return c.json(
      { statusCode: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
});

// Add user management endpoints
app.post("/api/user", async (c) => {
  try {
    const { googleId, name, email, picture, operation } = await c.req.json();

    if (operation === "upsert") {
      const existingUser = await c.env.DB.prepare(
        "SELECT * FROM users WHERE google_id = ?"
      )
        .bind(googleId)
        .first<User>();

      const now = new Date().toISOString();

      if (!existingUser) {
        await c.env.DB.prepare(
          `INSERT INTO users (
              google_id, 
              name, 
              email, 
              picture, 
              created_at, 
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(googleId, name, email, picture, now, now)
          .run();
      } else {
        await c.env.DB.prepare(
          `UPDATE users 
             SET name = ?, 
                 email = ?, 
                 picture = ?, 
                 updated_at = ? 
             WHERE google_id = ?`
        )
          .bind(name, email, picture, now, googleId)
          .run();
      }

      return c.json({
        statusCode: 200,
        message: existingUser ? "User updated" : "User created",
        data: { googleId, email },
      });
    }

    return c.json(
      { statusCode: 400, message: "Invalid operation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in user operation:", error);
    return c.json(
      { statusCode: 400, message: "Invalid input data" }, // More specific error message
      { status: 400 }
    );
  }
});

// Add user verification endpoint
app.get("/api/user/verify", async (c) => {
  try {
    const googleId = c.req.query("googleId");

    if (!googleId) {
      return c.json(
        { statusCode: 400, message: "Missing googleId" },
        { status: 400 }
      );
    }

    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE google_id = ?"
    )
      .bind(googleId)
      .first<User>();

    return c.json({
      statusCode: 200,
      message: user ? "User found" : "User not found",
      data: { exists: !!user },
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return c.json(
      { statusCode: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
});

//JWT middeware
app.use("/api/*", async (c: UserContext, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { statusCode: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const isValid = await jwt.verify(token, c.env.JWT_SECRET);

    if (!isValid) {
      return c.json(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = jwt.decode(token) as JWTPayload;
    console.log("payload", payload);

    if (
      payload.payload.exp &&
      payload.payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return c.json(
        { statusCode: 401, message: "Token expired" },
        { status: 401 }
      );
    }

    c.set("user", payload);
  } catch (error) {
    console.log("error", error);
    return c.json(
      { statusCode: 400, message: "Invalid token" },
      { status: 400 }
    );
  }

  await next();
});

app.post("/api/conversation", async (c: UserContext) => {
  const ai = new Ai(c.env.AI);

  try {
    const { message, action } = await c.req.json();
    const userId = c.get("user").payload.sub;

    if (action === "fetch_history") {
      return await fetchConversationHistory(c.env.DB, userId);
    }

    return await processMessage(c.env.DB, ai, userId, message);
  } catch (error) {
    console.error("Error in conversation processing:", error);
    return c.json(
      { statusCode: 400, message: "Invalid input data" }, // More specific error message
      { status: 400 }
    );
  }
});

// to get gpt configuration
app.get("/api/gpt-config", async (c: UserContext) => {
  const userId = c.get("user").payload.sub;
  try {
    const config = await c.env.DB.prepare(
      "SELECT * FROM gpt_configurations WHERE userId = ?"
    ).bind(userId).first();

    if (!config) {
      // If no configuration exists, return the extracted info from the conversation
      // You'll need to implement a function to get this information
      const conversation = await c.env.DB.prepare(
        "SELECT extractedinfo FROM conversations WHERE userId = ? ORDER BY createdAt DESC LIMIT 1"
      ).bind(userId).first();

      return c.json({
        statusCode: 200,
        message: "No existing configuration, returning extracted info",
        data: {
          name: "",
          instructions: "",
          extractedInfo: JSON.parse(conversation?.extractedInfo as string)
        }
      });
    }

    return c.json({
      statusCode: 200,
      message: "Configuration fetched",
      data: {
        name: config.name,
        instructions: config.instructions,
        extractedInfo: JSON.parse(config.extractedInfo as string)
      }
    });
  } catch (error) {
    console.error("Error fetching configuration:", error);
    return c.json(
      { statusCode: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
});

// New endpoint to update GPT configuration
app.put("/api/gpt-config", async (c: UserContext) => {
  const userId = c.get("user").payload.sub;
  const { name, instructions, extractedInfo } = await c.req.json();

  try {
    const existingConfig = await c.env.DB.prepare(
      "SELECT id FROM gpt_configurations WHERE userId = ?"
    )
      .bind(userId)
      .first();

    if (existingConfig) {
      await c.env.DB.prepare(
        `UPDATE gpt_configurations 
         SET name = ?, instructions = ?, extractedInfo = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE userId = ?`
      )
        .bind(name, instructions, JSON.stringify(extractedInfo), userId)
        .run();
    } else {
      await c.env.DB.prepare(
        `INSERT INTO gpt_configurations (userId, name, instructions, extractedInfo) 
         VALUES (?, ?, ?, ?)`
      )
        .bind(userId, name, instructions, JSON.stringify(extractedInfo))
        .run();
    }

    return c.json({
      statusCode: 200,
      message: "GPT configuration updated",
      data: { name, instructions, extractedInfo },
    });
  } catch (error) {
    console.error("Error updating GPT configuration:", error);
    return c.json(
      { statusCode: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
});

// app.get("/api/conversation/history", async (c) => {
//   const userId = c.get("user").sub;
//   return await fetchConversationHistory(c.env.DB, userId);
// });

async function fetchConversationHistory(db: D1Database, userId: string) {
  const conversation = await db
    .prepare(
      "SELECT * FROM conversations WHERE userId = ? ORDER BY createdAt DESC LIMIT 1"
    )
    .bind(userId)
    .first();

  if (!conversation) {
    return Response.json(
      {
        statusCode: 404,
        message: "No conversation found",
      },
      { status: 404 }
    );
  }

  return Response.json({
    statusCode: 200,
    message: "Conversation history fetched",
    data: {
      messages: JSON.parse(conversation.messages as string),
      status: conversation.status,
      extractedInfo: JSON.parse((conversation.extractedInfo as string) || "{}"),
    },
  });
}

async function processMessage(
  db: D1Database,
  ai: Ai,
  userId: string,
  message: string
) {
  try {
    let conversation = await db
      .prepare(
        "SELECT * FROM conversations WHERE userId = ? ORDER BY createdAt DESC LIMIT 1"
      )
      .bind(userId)
      .first<Conversation>();

    if (!conversation) {
      await db
        .prepare(
          "INSERT INTO conversations (userId, status, messages, extractedInfo) VALUES (?, ?, ?, ?)"
        )
        .bind(userId, "in_progress", "[]", "{}")
        .run();

      conversation = await db
        .prepare(
          "SELECT * FROM conversations WHERE userId = ? ORDER BY createdAt DESC LIMIT 1"
        )
        .bind(userId)
        .first<Conversation>();

      if (!conversation) {
        throw new Error("Failed to create conversation");
      }
    }

    const messages = JSON.parse(conversation.messages) as Message[];
    messages.push({ role: "user", content: message });

    let aiResponse = "";
    let extractedInfo = JSON.parse(conversation.extractedInfo || "{}");

    if (conversation.status === "completed") {
      aiResponse =
        "Thank you for the additional information. Your digital twin has been updated.";
      extractedInfo = await extractKeyInfo(ai, messages);
    } else {
      const systemPrompt = `${prompt}`;
      const augmentedMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
      ];

      const completion = await ai.run("@cf/meta/llama-2-7b-chat-int8", {
        messages: augmentedMessages,
      });

      if (
        typeof completion === "object" &&
        completion !== null &&
        "response" in completion
      ) {
        aiResponse = completion.response as string;
      } else {
        throw new Error("Invalid AI response format");
      }

      if (
        aiResponse.toLowerCase().includes("your digital version is created now")
      ) {
        conversation.status = "completed";
        extractedInfo = await extractKeyInfo(ai, messages);
      }
    }

    messages.push({ role: "assistant", content: aiResponse });

    await db
      .prepare(
        "UPDATE conversations SET messages = ?, status = ?, extractedInfo = ? WHERE userId = ?"
      )
      .bind(
        JSON.stringify(messages),
        conversation.status,
        JSON.stringify(extractedInfo),
        userId
      )
      .run();

    return Response.json({
      statusCode: 200,
      message:
        conversation.status === "completed"
          ? "Conversation completed"
          : "Message processed",
      data: {
        aiResponse,
        status: conversation.status,
        extractedInfo:
          conversation.status === "completed" ? extractedInfo : undefined,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

async function extractKeyInfo(ai: Ai, messages: Message[]) {
  const prompt = `
 Analyze the conversation and provide insights about the user in the following strict markdown structure:
    
    # Personal Traits
    - **Trait:** [trait name]
      [description]
    
    # Experiences
    - **Experience:** [experience name]
      [description]
    
    # Opinions
    - **Opinion:** [opinion]
      [description]
    
    # Behavioral Patterns
    - **Pattern:** [pattern name]
      [description]

    Conversation:
    ${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}
  `;

  const completion = await ai.run("@cf/meta/llama-2-7b-chat-int8", {
    messages: [{ role: "user", content: prompt }],
  });

  if (
    typeof completion === "object" &&
    completion !== null &&
    "response" in completion
  ) {
    return completion.response as string;
  }
  throw new Error("Invalid AI response format");
}

export default app;
