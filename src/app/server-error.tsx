"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ChevronLeft, ServerCrash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ServerErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full">
            <ServerCrash className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2">
          500
        </h1>

        <p className="text-xl font-semibold text-center text-slate-800 mb-2">
          Server Error
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900 text-sm">
                Something Went Wrong
              </p>
              <p className="text-orange-800 text-sm mt-1">
                Our servers are having trouble processing your request. Please try again in a few moments.
              </p>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-center mb-8 text-sm">
          If this problem persists, please contact our support team. We're working to fix this issue as soon as possible.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.refresh()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
          Please try refreshing the page. If the problem continues, contact support@tasknity.work
        </p>
      </div>
    </div>
  );
}
