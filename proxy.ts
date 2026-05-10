import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// All routes are public — piano is 100% functional as guest
const isPublicRoute = createRouteMatcher(["/(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Do not protect any routes — guest-first design
  // Auth context is still available everywhere via auth()
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
