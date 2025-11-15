import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/layout/Sidebar";
import OrgTree from "@/components/layout/OrgTree";
import LeaveRequestButton from "@/components/layout/LeaveRequestButton";
import { ApiErrorInterceptorInitializer } from "@/components/providers/ApiErrorInterceptorInitializer";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "TaskNity.Work",
  description: "Premium Task Management Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="font-body antialiased">
          <AppProvider>
            <ApiErrorInterceptorInitializer />
            <SignedIn>
              <Sidebar />
              <main className="p-6 pt-20">
                <div className="flex justify-end items-center gap-4 mb-6">
                  <OrgTree />
                  <LeaveRequestButton />
                  <UserButton afterSignOutUrl="/" />
                </div>
                {children}
              </main>
            </SignedIn>

            <SignedOut>
              <div className="flex flex-col items-center justify-center h-screen space-y-6">
                <h1 className="text-2xl font-bold">Welcome to TaskNity.Work</h1>
                <div className="flex gap-4">
                  <SignInButton mode="modal">
                    <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-secondary text-white px-4 py-2 rounded-lg font-medium">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </div>
            </SignedOut>

            <Toaster />
            <HotToaster />
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
