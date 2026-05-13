import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signInSchema } from "@/lib/schemas/auth";
import { ensureUserHasOrg } from "@/server/auth/bootstrap";
import { prisma } from "@/server/prisma";

function getConfiguredProviders() {
  const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordMatches = await compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        await ensureUserHasOrg(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  return providers;
}

async function resolveMembershipContext(userId: string) {
  await ensureUserHasOrg(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: { org: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    return null;
  }

  const memberships = user.memberships.map((membership) => ({
    orgId: membership.orgId,
    orgName: membership.org.name,
    role: membership.role,
  }));

  const activeMembership =
    memberships.find((membership) => membership.orgId === user.activeOrgId) ??
    memberships[0] ??
    null;

  return {
    memberships,
    activeOrgId: activeMembership?.orgId ?? null,
    role: activeMembership?.role ?? null,
  };
}

function isMembershipToken(
  value: unknown,
): value is { orgId: string; orgName: string; role: Role } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.orgId === "string" &&
    typeof record.orgName === "string" &&
    typeof record.role === "string"
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: getConfiguredProviders(),
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user?.activeOrgId) {
        token.activeOrgId = session.user.activeOrgId;
      }

      const userId = user?.id ?? token.sub;

      if (!userId) {
        return token;
      }

      const membershipContext = await resolveMembershipContext(userId);

      token.sub = userId;
      token.activeOrgId = membershipContext?.activeOrgId ?? null;
      token.role = membershipContext?.role ?? null;
      token.memberships = membershipContext?.memberships ?? [];

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.activeOrgId =
          typeof token.activeOrgId === "string" ? token.activeOrgId : null;
        session.user.role =
          typeof token.role === "string" ? (token.role as Role) : null;
        session.user.memberships = Array.isArray(token.memberships)
          ? token.memberships.filter(isMembershipToken)
          : [];
      }

      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await ensureUserHasOrg(user.id);
    },
  },
};

export const authHandler = NextAuth(authOptions);

export function auth() {
  return getServerSession(authOptions);
}
