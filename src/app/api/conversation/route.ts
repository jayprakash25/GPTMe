import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnection from "@/lib/dbConnect";
import ConversationModel from "@/models/Conversation";
import { NextResponse } from "next/server";
import {
  getFollowUpQuestions,
  getKeyInfoFromResponse,
  createGptConfiguration,
} from "@/services/gptService";

interface ResponseType {
  questionId: string;
  question: string;
  response: string;
}

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
    const { responses, isFollowUp } = await req.json();

    if (!user.id || !responses) {
      return NextResponse.json({
        statusCode: 400,
        message: "Invalid input: userId and responses are required",
      });
    }

    let conversation = await ConversationModel.findOne({ userId: user.id, status: "in_progress" });
    
    if (!conversation) {
      conversation = new ConversationModel({
        userId: user.id,
        status: "in_progress",
        responses: [],
        followUpResponses: [],
        extractedInfo: {},
      });
    }

    if (!isFollowUp) {
      // Process initial responses
      conversation.responses = responses.map((resp: ResponseType) => ({
        // questionId: resp.questionId,
        question: resp.question,
        response: resp.response,
      }));

      const keyInfoFromInitialResponse = await getKeyInfoFromResponse(responses);
      conversation.extractedInfo = new Map(Object.entries(keyInfoFromInitialResponse));

      const followUpQuestions = await getFollowUpQuestions(responses);

      await conversation.save();
      console.log("saved");

      return NextResponse.json({
        statusCode: 200,
        message: "Initial responses processed successfully",
        data: {
          followUpQuestions,
          extractedInfo: Object.fromEntries(conversation.extractedInfo),
        },
      });
    } else {
      // Process follow-up responses
      conversation.followUpResponses = responses.map((resp: ResponseType) => ({
        // questionId: resp.questionId,
        question: resp.question,
        response: resp.response,
      }));


      // Combine all responses for final processing
      const allResponses = [...conversation.responses, responses];
      const keyInfo = await getKeyInfoFromResponse(allResponses);
      conversation.extractedInfo = new Map(Object.entries(keyInfo));

      // Generate GPT configuration
      const gptConfiguration = await createGptConfiguration(conversation.extractedInfo);
      conversation.gptConfiguration = gptConfiguration;

      conversation.status = "completed";
      await conversation.save();
      console.log("saved");

      return NextResponse.json({
        statusCode: 200,
        message: "Conversation completed successfully",
        data: {
          extractedInfo: conversation.extractedInfo,
          gptConfiguration,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
}