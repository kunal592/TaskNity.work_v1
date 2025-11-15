"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-4 rounded-full">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        
        <p className="text-xl font-semibold text-slate-800 mb-2">
          Page Not Found
        </p>

        <p className="text-slate-600 mb-8">
          The page you're looking for doesn't exist. Please check the URL or navigate to a valid section.
        </p>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Link>
          </Button>

          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
