import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnection from "@/lib/dbConnect";
import ConversationModel from "@/models/Conversation";
import { NextResponse } from "next/server";
import {
  getFollowUpQuestions,
  getKeyInfoFromResponse,
} from "@/services/gptService";

interface responseType {
  questionId: string;
  response: string;
}

export default async function POST(req: Request) {
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
    if (req.method === "POST") {
      const { userId, responses } = await req.json();

      if (!userId || !responses) {
        return NextResponse.json({
          statusCode: 400,
          message: "Invalid input: userId and responses are required",
        });
      }

      //save response to conversation document
      const conversation = new ConversationModel({
        userId,
        status: "in_progress",
        responses: responses.map((resp: responseType) => ({
          questionId: resp.questionId,
          response: resp.response,
        })),
      });

      //   await conversation.save();

      const keyInfoFromResponse = await getKeyInfoFromResponse(responses);
      const followUpQuestions = await getFollowUpQuestions(responses);

      conversation.status =
        followUpQuestions.length === 0 ? "completed" : "in_progress";
      await conversation.save();

      const result = { keyInfoFromResponse, followUpQuestions };

      return NextResponse.json({
        statusCode: 200,
        message: "Conversation processed successfully",
        data: result,
      });

      //   return { keyInfoFromResponse, followUpQuestions}
    }
  } catch (error) {
    console.log(error);
  }
}