import dbConnection from "@/lib/dbConnect";
import UserModel from "@/models/User"; // Adjust import to match your model name
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
 

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
      },
    }),
  ],
  debug: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        try {
          // Step 1: Connect to the database
          await dbConnection();

          // Step 2: Ensure profile.sub (Google ID) exists
          if (profile?.sub) {
            // Step 3: Check if user already exists in the database
            const existingUser = await UserModel.findOne({
              googleId: profile.sub,
            });

            if (!existingUser) {
              // Step 4: Create a new user if one doesn't exist
              await UserModel.create({
                googleId: profile.sub,
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            } else {
              // Step 5: Update existing user's details
              await UserModel.findOneAndUpdate(
                { googleId: profile.sub },
                {
                  name: profile.name,
                  email: profile.email,
                  picture: profile.picture,
                  updatedAt: new Date(), 
                }
              );
            }
            // Step 6: Allow the sign-in
            return true;
          } else {
            // If Google profile does not contain a sub, deny sign-in
            console.error("No profile.sub found");
            return false;
          }
        } catch (error) {
          console.error("Error during sign-in:", error);
          return false;
        }
      }
      return false;
    },
    async session({ session, token }) {
      // Attach user details to the session
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.picture = token.picture;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Add additional user info to the JWT token after login
      if (account?.provider === "google" && profile) {
        token.id = profile.sub;
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
      }
      return token;
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

