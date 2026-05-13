import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      activeOrgId: string | null;
      role: Role | null;
      memberships: Array<{
        orgId: string;
        orgName: string;
        role: Role;
      }>;
    };
  }

  interface User {
    id: string;
    activeOrgId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    activeOrgId?: string | null;
    role?: Role | null;
    memberships?: Array<{
      orgId: string;
      orgName: string;
      role: Role;
    }>;
  }
}
