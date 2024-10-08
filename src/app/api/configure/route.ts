import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import dbConnection from "@/lib/dbConnect";
import ConversationModel from "@/models/Conversation";

export async function GET() {
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
    const conversation = await ConversationModel.findOne({ userId: user.id });
    if (!conversation) {
      return NextResponse.json({
        statusCode: 404,
        message: "No conversation found",
      });
    }
    return NextResponse.json({
      statusCode: 200,
      message: "Conversation retrieved successfully",
      data: conversation,
    });
  } catch (error) {
    return NextResponse.json({
      statusCode: 500,
      message: "Error retrieving conversation",
      error,
    });
  }
}



export async function PUT(req: Request){
    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    const userId = user.id

    if (!session || !user) {
        return NextResponse.json({
            statusCode: 401,
            message: 'Unauthorized',
        });
    }

    await dbConnection();

    try {
        const {extractedInfo} = await req.json();

        const updatedConfiguration = await ConversationModel.findOneAndUpdate(
            {userId},
            {$set: {extractedInfo: new Map(Object.entries(extractedInfo))}},
            {new: true}
        );

        if(!updatedConfiguration){
            return NextResponse.json({
                statusCode: 404,
                message: 'No configuration found',
            });
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Configuration updated successfully',
            data: updatedConfiguration,
        });


    } catch (error) {
        return NextResponse.json({
            statusCode: 500,
            message: 'Error updating configuration',
            error,
        });
    }
}
