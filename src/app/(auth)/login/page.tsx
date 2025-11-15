"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dcamqqj3j/image/upload/v1762322564/Login_tasknity.png')",
      }}
    >
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Login Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            TaskNity.Work
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Premium Task Management Platform
          </p>
        </div>

        <SignInButton mode="modal">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-lg">
            Sign In
          </Button>
        </SignInButton>
      </div>
    </div>
  );
}
