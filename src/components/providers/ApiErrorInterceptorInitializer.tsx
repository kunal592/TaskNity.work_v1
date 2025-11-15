"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { setupApiErrorInterceptor } from "@/lib/apiClient";

/**
 * Initialize API error interceptor
 * Must be placed in a client component at the root of your app
 */
export function ApiErrorInterceptorInitializer() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Setup the interceptor once when component mounts
    setupApiErrorInterceptor(router, toast);
  }, [router, toast]);

  return null; // This component doesn't render anything
}
