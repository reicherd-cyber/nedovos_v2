import { randomBytes } from "crypto";
import { prisma } from "@/server/prisma";

export type AuthTokenType = "verify-email" | "password-reset";

function buildIdentifier(type: AuthTokenType, email: string) {
  return `${type}:${email.toLowerCase()}`;
}

export function buildAppUrl(pathname: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3005";
  return new URL(pathname, baseUrl).toString();
}

export async function issueAuthToken(params: {
  type: AuthTokenType;
  email: string;
  ttlHours: number;
}) {
  const identifier = buildIdentifier(params.type, params.email);
  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + params.ttlHours * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return { identifier, token, expires };
}

export async function consumeAuthToken(params: {
  type: AuthTokenType;
  email: string;
  token: string;
}) {
  const identifier = buildIdentifier(params.type, params.email);

  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier,
        token: params.token,
      },
    },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier,
        token: params.token,
      },
    },
  });

  return record;
}

export async function findAuthToken(params: {
  type: AuthTokenType;
  email: string;
  token: string;
}) {
  const identifier = buildIdentifier(params.type, params.email);

  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier,
        token: params.token,
      },
    },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  return record;
}
