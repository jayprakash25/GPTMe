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

    const prompt = constructPrompt(conversation.extractedInfo, message);

    const gptResponse = await openai.chat.completions.create({
      model: conversation.gptConfiguration.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
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

//TODO: add typesafety
function constructPrompt(extractedInfo, message) {
  let prompt =
    "You are an AI assistant based on the following person's characteristics:\n\n";

  for (const [key, value] of Object.entries(extractedInfo)) {
    prompt += `${key}: ${value}\n`;
  }

  prompt += `\nRespond to the following message as if you were this person: "${message}"`;

  return prompt;
}
