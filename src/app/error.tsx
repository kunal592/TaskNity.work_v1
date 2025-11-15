"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
          Something Went Wrong
        </h1>

        <p className="text-center text-slate-600 mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
            <p className="text-sm text-red-800 font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>

          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>

          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="w-full"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-slate-500 text-center mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
