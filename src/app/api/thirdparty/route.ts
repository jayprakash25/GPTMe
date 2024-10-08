import { thirdparty } from "@/services/thirdparty";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "No question provided" },
        { status: 400 }
      );
    }

    // Call the thirdparty function and get the GPT response
    
    const response = await thirdparty(question);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error calling GPT handler:", error);
    return NextResponse.json(
      { error: "There was an error processing your request." },
      { status: 500 }
    );
  }
}
