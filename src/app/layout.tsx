import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/Components/ui/toaster"

export const metadata: Metadata = {
  title: "GPT ME",
  description: "Create a digital version of yourself",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
      <body>
        {children}
        <Toaster />
      </body>
      </AuthProvider>
    </html>
  );
}
