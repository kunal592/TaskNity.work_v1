"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ChevronLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RateLimitPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2">
          429
        </h1>

        <p className="text-xl font-semibold text-center text-slate-800 mb-2">
          Too Many Requests
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">
                Rate Limit Exceeded
              </p>
              <p className="text-red-800 text-sm mt-1">
                You've made too many requests in a short time. Please wait before trying again.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-slate-600 text-sm mb-2">Please wait</p>
          <p className="text-3xl font-bold text-blue-600">
            {countdown > 0 ? `${countdown}s` : "Ready"}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.refresh()}
            disabled={countdown > 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Try Again
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
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

        <p className="text-xs text-slate-500 text-center mt-6">
          This is a temporary limit. Try again in a few moments.
        </p>
      </div>
    </div>
  );
}
