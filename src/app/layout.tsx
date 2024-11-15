import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "@/Providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/Providers/Provider";


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
      <Providers>
      <AuthProvider>
      <body>
        {children}
        <Toaster />
      </body>
      </AuthProvider>
      </Providers>
    </html>
  );
}
