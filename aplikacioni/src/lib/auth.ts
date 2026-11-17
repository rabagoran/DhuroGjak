import "server-only";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const providers: NextAuthOptions["providers"] = [];
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(GitHubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET }));
}
// Opsionale: Google, që dhuruesit pa GitHub të mund të hyjnë.
if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(GoogleProvider({ clientId: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET }));
}

export const ofruesitAktive = providers.map((p) => ({ id: p.id, emri: p.name }));

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/hyrja" },
  callbacks: {
    async jwt({ token, account }) {
      // ID e qëndrueshme: "github:12345" ose "google:9876".
      if (account) token.uid = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
