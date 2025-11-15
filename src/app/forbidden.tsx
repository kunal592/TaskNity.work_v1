"use client";

import { Button } from "@/components/ui/button";
import { Lock, Home, ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2">
          403
        </h1>

        <p className="text-xl font-semibold text-center text-slate-800 mb-2">
          Access Forbidden
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 mb-2">
            <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">
                Permission Denied
              </p>
              <p className="text-red-800 text-sm mt-1">
                You don't have permission to access this resource. Please contact your administrator if you believe this is a mistake.
              </p>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-center mb-8 text-sm">
          Your current role may not have access to this section. Please use the navigation menu to access allowed sections.
        </p>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
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

        <p className="text-xs text-slate-500 text-center mt-6">
          If you need access to this resource, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
