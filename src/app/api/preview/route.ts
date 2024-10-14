import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";
import ConversationModel from "@/models/Conversation";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your-openai-api-key", // Ensure API key is securely stored
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  const { message } = await req.json();

  if (!session || !user) {
    return NextResponse.json({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  await dbConnection();

  try {
    const conversation = await ConversationModel.findOne({ userId: user.id });
    if (!conversation) {
      return NextResponse.json({
        statusCode: 404,
        message: "No conversation found",
      });
    }

    const messages = constructMessages(conversation.gptConfiguration, message, conversation.messages);

    const gptResponse = await openai.chat.completions.create({
      model: conversation.gptConfiguration.model || "gpt-3.5-turbo",
      messages: messages,
      max_tokens: conversation.gptConfiguration.max_tokens || 150,
      temperature: conversation.gptConfiguration.temperature || 0.7,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Response generated successfully",
      data: gptResponse,
    });
  } catch (error) {
    return NextResponse.json({
      statusCode: 500,
      message: "Error creating configuration",
      error,
    });
  }
}

function constructMessages(gptConfig: any, userMessage: string, conversation): OpenAI.ChatCompletionMessageParam[] {
  const systemMessage = `You are a digital version of a person, designed to sound like them—casual, relatable, and human. Keep replies short, friendly, and adapt your tone to match the user's mood. Use humor where it fits, and keep it real, like how friends chat on social media. If asked about yourself, share the person's interests casually without sounding too formal. Here's what you know about them: ${JSON.stringify(gptConfig)}. And here are some past chats: ${JSON.stringify(conversation)}. Answer as if you were them.`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage }
  ];
}

