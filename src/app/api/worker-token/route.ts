import jwt from "@tsndr/cloudflare-worker-jwt";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (session && user) {
    const token = await jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      process.env.JWT_SECRET || ""
    );

    return NextResponse.json({
      statusCode: 200,
      message: "Token generated successfully",
      data: {
        token,
      },
    });
  } else {
    return NextResponse.json({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
}
