import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from 'axios';
import jwt from "@tsndr/cloudflare-worker-jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
        },
      }}),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.sub) {
        try {
          const checkResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_WORKER_URL}/api/user/verify?googleId=${profile.sub}`
          );

          if (!checkResponse.data.data.exists) {
            const createResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_WORKER_URL}/api/user`,
              {
                googleId: profile.sub,
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
                operation: 'upsert'
              },
              {
                headers: { 'Content-Type': 'application/json' }
              }
            );

            if (createResponse.status !== 200) {
              throw new Error('Failed to create user');
            }
          }
          return true;
        } catch (error) {
          console.error("Error during sign-in:", error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, account, profile}) {
      // Initial sign in
      if (account?.provider === "google" && profile) {
        token.id = profile.sub;
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
        token.accessToken = await generateAccessToken(profile as { sub: string; name: string; email: string; picture: string });
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, regenerate it
      return {
        ...token,
        accessToken: await generateAccessToken({
          sub: token.id as string,
          name: token.name as string,
          email: token.email as string,
          picture: token.picture as string,
        }),
        accessTokenExpires: Date.now() + 60 * 60 * 1000,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.picture = token.picture as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function generateAccessToken(profile: { sub: string; name: string; email: string; picture: string }) {
  return jwt.sign(
    {
      sub: profile.sub,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    },
    process.env.JWT_SECRET as string
  );
}

export default authOptions;