import { prisma } from "@/server/prisma";

type DonorWriteInput = {
  fullName: string;
  nationalId?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  language?: string;
  tags: string[];
};

function normalizeTags(rawTags: string[]) {
  return [...new Set(rawTags.map((tag) => tag.trim()).filter(Boolean))];
}

export async function listDonors(
  orgId: string,
  input?: {
    query?: string;
    tag?: string;
    take?: number;
  },
) {
  const query = input?.query?.trim();
  const tag = input?.tag?.trim();

  return prisma.donor.findMany({
    where: {
      orgId,
      ...(query
        ? {
            OR: [
              { fullName: { contains: query } },
              { email: { contains: query } },
              { phone: { contains: query } },
              { city: { contains: query } },
            ],
          }
        : {}),
      ...(tag
        ? {
            tags: {
              some: {
                label: tag,
              },
            },
          }
        : {}),
    },
    include: {
      tags: {
        orderBy: {
          label: "asc",
        },
      },
      _count: {
        select: {
          notes: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { fullName: "asc" }],
    take: input?.take ?? 100,
  });
}

export async function getDonorById(orgId: string, donorId: string) {
  return prisma.donor.findFirst({
    where: {
      id: donorId,
      orgId,
    },
    include: {
      tags: {
        orderBy: {
          label: "asc",
        },
      },
      notes: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function createDonor(orgId: string, input: DonorWriteInput) {
  const tags = normalizeTags(input.tags);

  return prisma.$transaction(async (tx) => {
    const donor = await tx.donor.create({
      data: {
        orgId,
        fullName: input.fullName,
        nationalId: input.nationalId,
        email: input.email,
        phone: input.phone,
        addressLine1: input.addressLine1,
        city: input.city,
        language: input.language,
      },
    });

    if (tags.length > 0) {
      await tx.donorTag.createMany({
        data: tags.map((label) => ({
          orgId,
          donorId: donor.id,
          label,
        })),
        skipDuplicates: true,
      });
    }

    return donor;
  });
}

export async function updateDonor(
  orgId: string,
  donorId: string,
  input: DonorWriteInput,
) {
  const tags = normalizeTags(input.tags);

  return prisma.$transaction(async (tx) => {
    const donor = await tx.donor.findFirst({
      where: {
        id: donorId,
        orgId,
      },
    });

    if (!donor) {
      return null;
    }

    await tx.donor.update({
      where: {
        id: donorId,
      },
      data: {
        fullName: input.fullName,
        nationalId: input.nationalId,
        email: input.email,
        phone: input.phone,
        addressLine1: input.addressLine1,
        city: input.city,
        language: input.language,
      },
    });

    await tx.donorTag.deleteMany({
      where: {
        donorId,
        orgId,
      },
    });

    if (tags.length > 0) {
      await tx.donorTag.createMany({
        data: tags.map((label) => ({
          orgId,
          donorId,
          label,
        })),
        skipDuplicates: true,
      });
    }

    return donor;
  });
}

export async function addDonorNote(
  orgId: string,
  donorId: string,
  body: string,
  createdByUserId?: string,
) {
  const donor = await prisma.donor.findFirst({
    where: {
      id: donorId,
      orgId,
    },
    select: {
      id: true,
    },
  });

  if (!donor) {
    return null;
  }

  return prisma.donorNote.create({
    data: {
      orgId,
      donorId,
      createdByUserId,
      body,
    },
  });
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function resolveHeaderIndexes(headers: string[]) {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  const findIndex = (aliases: string[]) =>
    normalized.findIndex((value) => aliases.includes(value));

  return {
    fullName: findIndex(["name", "full_name", "fullname", "full name", "שם", "שם מלא"]),
    email: findIndex(["email", "אימייל", "דוא\"ל", "דואל"]),
    phone: findIndex(["phone", "טלפון", "mobile", "נייד"]),
    city: findIndex(["city", "עיר"]),
    address: findIndex(["address", "כתובת"]),
    language: findIndex(["language", "שפה"]),
    tags: findIndex(["tags", "tag", "תגיות", "תגית"]),
    nationalId: findIndex(["nationalid", "national_id", "id", "תז", "תעודת זהות"]),
  };
}

export async function importDonorsFromCsv(orgId: string, csv: string) {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return 0;
  }

  const headers = parseCsvLine(lines[0]);
  const indexes = resolveHeaderIndexes(headers);

  if (indexes.fullName < 0) {
    throw new Error("MISSING_NAME_COLUMN");
  }

  let importedCount = 0;

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const fullName = values[indexes.fullName]?.trim();

    if (!fullName) {
      continue;
    }

    const rawTags = indexes.tags >= 0 ? values[indexes.tags] ?? "" : "";

    await createDonor(orgId, {
      fullName,
      nationalId: indexes.nationalId >= 0 ? values[indexes.nationalId] ?? "" : "",
      email: indexes.email >= 0 ? values[indexes.email] ?? "" : "",
      phone: indexes.phone >= 0 ? values[indexes.phone] ?? "" : "",
      city: indexes.city >= 0 ? values[indexes.city] ?? "" : "",
      addressLine1: indexes.address >= 0 ? values[indexes.address] ?? "" : "",
      language: indexes.language >= 0 ? values[indexes.language] ?? "" : "",
      tags: rawTags
        .split(/[|;]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    importedCount += 1;
  }

  return importedCount;
}
