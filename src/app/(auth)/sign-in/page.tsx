"use client";

import { Button } from "@/Components/ui/button";
import { signIn } from "next-auth/react";
import React from "react";

const SignIn = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });
      console.log("Sign in successful");
    } catch (error) {
      console.log("Sign in failed");
    }
  };
  return (
    <div>
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <h1 className="text-6xl font-bold text-gray-800 tracking-tight">
              Create Your GPT
            </h1>
            <div className="absolute inset-0 overflow-hidden"></div>
          </div>
          <div className="mt-8">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="px-6 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200 ease-in-out"
            >
              <svg
                className="w-5 h-5 mr-2 -ml-1"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
