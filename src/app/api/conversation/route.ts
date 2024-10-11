import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnection from "@/lib/dbConnect";
import ConversationModel from "@/models/Conversation";
import { NextResponse } from "next/server";
import {
  createGptConfiguration,
  generateResponse,
  extractKeyInfo,
} from "@/services/gptService";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !user) {
    return NextResponse.json({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  await dbConnection();

  try {
    const { message, action} = await req.json();

    let conversation = await ConversationModel.findOne({ userId: user.id }).sort({ createdAt: -1 });

    if (!conversation) {
      conversation = new ConversationModel({
        userId: user.id,
        status: "in_progress",
        messages: [],
      });
    }

    if (action === "fetch_history") {
      return NextResponse.json({
        statusCode: 200,
        message: "Conversation history fetched",
        data: {
          messages: conversation.messages,
          status: conversation.status,
        },
      });
    }

    // Add user message to conversation
    conversation.messages.push({ role: "user", content: message });

    let aiResponse;
    if (conversation.status === "completed") {
      // If the conversation is already completed, just acknowledge the new information
      aiResponse = "Thank you for the additional information. Your digital twin has been updated.";
    } else {
      // Generate AI response
      aiResponse = await generateResponse(conversation.messages);
      
      // Check if conversation is complete
      if (aiResponse.toLowerCase().includes("digital version is now created")) {
        conversation.status = "completed";

        // Extract key information
        conversation.extractedInfo = await extractKeyInfo(conversation.messages);

        // Generate GPT configuration
        conversation.gptConfiguration = await createGptConfiguration(conversation.extractedInfo);
      }
    }

    conversation.messages.push({ role: "assistant", content: aiResponse });
    await conversation.save();

    return NextResponse.json({
      statusCode: 200,
      message: conversation.status === "completed" ? "Conversation completed" : "Message processed",
      data: {
        aiResponse,
        status: conversation.status,
        extractedInfo: conversation.status === "completed" ? conversation.extractedInfo : undefined,
        gptConfiguration: conversation.status === "completed" ? conversation.gptConfiguration : undefined,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
}