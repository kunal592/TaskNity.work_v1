import axios, { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Setup API error interceptor
 * Call this once in your app root to enable automatic error handling
 */
export function setupApiErrorInterceptor(router?: any, toast?: any) {
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Get error status
      const status = error.response?.status;
      const errorData = error.response?.data as any;
      const errorMessage = errorData?.error || errorData?.message || "An error occurred";

      // Handle specific HTTP status codes
      switch (status) {
        case 403:
          // Forbidden - user lacks permission
          if (router) {
            router.push("/forbidden");
          }
          if (toast) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to perform this action.",
              variant: "destructive",
            });
          }
          break;

        case 404:
          // Not Found
          if (router) {
            router.push("/not-found");
          }
          if (toast) {
            toast({
              title: "Not Found",
              description: "The requested resource could not be found.",
              variant: "destructive",
            });
          }
          break;

        case 429:
          // Too Many Requests - Rate Limited
          if (router) {
            router.push("/rate-limit");
          }
          if (toast) {
            toast({
              title: "Rate Limited",
              description: "Too many requests. Please try again later.",
              variant: "destructive",
            });
          }
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server Errors
          if (router) {
            router.push("/server-error");
          }
          if (toast) {
            toast({
              title: "Server Error",
              description: "Something went wrong on our end. Please try again later.",
              variant: "destructive",
            });
          }
          break;

        case 401:
          // Unauthorized - user not logged in
          if (router) {
            router.push("/login");
          }
          if (toast) {
            toast({
              title: "Session Expired",
              description: "Please log in again to continue.",
              variant: "destructive",
            });
          }
          break;

        default:
          // Generic error
          if (toast) {
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
      }

      return Promise.reject(error);
    }
  );
}

export default apiClient;
