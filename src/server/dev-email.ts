import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type DevEmailKind =
  | "verify-email"
  | "password-reset"
  | "invitation"
  | "verification-reminder";

export type DevEmailRecord = {
  id: string;
  kind: DevEmailKind;
  toEmail: string;
  subject: string;
  previewText: string;
  actionUrl: string;
  createdAt: string;
};

const outboxDir = path.join(process.cwd(), ".dev");
const outboxPath = path.join(outboxDir, "outbox.json");

async function readOutbox() {
  try {
    const content = await readFile(outboxPath, "utf8");
    return JSON.parse(content) as DevEmailRecord[];
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }
}

async function writeOutbox(records: DevEmailRecord[]) {
  await mkdir(outboxDir, { recursive: true });
  await writeFile(outboxPath, JSON.stringify(records, null, 2), "utf8");
}

export async function queueDevEmail(
  input: Omit<DevEmailRecord, "id" | "createdAt">,
) {
  const existing = await readOutbox();
  const record: DevEmailRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  await writeOutbox([record, ...existing].slice(0, 200));

  return record;
}

export async function listDevEmails(email?: string) {
  const records = await readOutbox();

  if (!email) {
    return records;
  }

  return records.filter((record) => record.toEmail === email.toLowerCase());
}

export function getDevOutboxUrl(email: string, kind?: DevEmailKind) {
  const params = new URLSearchParams({ email });

  if (kind) {
    params.set("kind", kind);
  }

  return `/dev/outbox?${params.toString()}`;
}
