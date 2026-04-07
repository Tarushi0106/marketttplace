import type { NextAuthConfig } from "next-auth";

// Hardcoded Amplify URL for SSR runtime (env vars not available at runtime on Amplify)
const AMPLIFY_URL = 'https://developer.d28fa2102uro78.amplifyapp.com';

/**
 * Edge-compatible auth config (no Prisma, no bcrypt).
 * Used by middleware only. The full auth config in auth.ts
 * extends this with PrismaAdapter and CredentialsProvider.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'your-auth-secret-here',
  providers: [], // Providers added in auth.ts (requires Node.js runtime)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAuth = nextUrl.pathname.startsWith("/login") ||
                       nextUrl.pathname.startsWith("/register");

      if (isOnAdmin) {
        if (isLoggedIn && (auth.user.role === "ADMIN" || auth.user.role === "SUPER_ADMIN")) {
          return true;
        }
        // Redirect to login with callbackUrl using the correct Amplify URL
        const loginUrl = new URL("/login", AMPLIFY_URL);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        // Redirect to login with callbackUrl using the correct Amplify URL
        const loginUrl = new URL("/login", AMPLIFY_URL);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL("/", AMPLIFY_URL));
      }

      return true;
    },
  },
};
