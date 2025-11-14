import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login",
  "/register",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!isPublicRoute(req) && !userId) {
    return (await auth()).redirectToSignIn();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
