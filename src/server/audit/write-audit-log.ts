import type { Prisma, PrismaClient } from "@prisma/client";

type AuditClient = Prisma.TransactionClient | PrismaClient;

type AuditInput = {
  orgId: string;
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  payload?: Prisma.InputJsonValue;
};

export async function writeAuditLog(client: AuditClient, input: AuditInput) {
  await client.auditLog.create({
    data: {
      orgId: input.orgId,
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      payload: input.payload,
    },
  });
}
