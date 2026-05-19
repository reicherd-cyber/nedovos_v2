import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const defaultPublicDonationOptions = [
  {
    key: "general",
    title: "תרומה כללית",
    description: "מעבר למסלול תרומה כללי של הארגון.",
    tone: "soft",
  },
];

const homepageOrgs = [
  {
    slug: "dir-mosdot-anshei-emunim",
    name: "מוסדות אנשי אמונים",
    publicSubtitle: "ירושלים",
    publicCategory: "מוסד",
    directoryOrder: 1,
  },
  {
    slug: "dir-anshei-sabriya",
    name: "אנשי סבריה",
    publicCategory: "מוסד",
    directoryOrder: 2,
  },
  {
    slug: "dir-beit-tefila-belza",
    name: "בית תפילה לבעלזא",
    publicSubtitle: "בית מדרש",
    publicCategory: "קהילה",
    directoryOrder: 3,
  },
  {
    slug: "dir-kehal-anshei-yerushalayim",
    name: "קהל אנשי ירושלים",
    publicCategory: "קהילה",
    directoryOrder: 4,
  },
  {
    slug: "dir-agudat-achim",
    name: "אגודת אחים",
    publicSubtitle: "אמריקאן ירושלים",
    publicCategory: "אגודה",
    directoryOrder: 5,
  },
  {
    slug: "dir-anshei-chesed",
    name: "אנשי חסד",
    publicCategory: "חסד",
    directoryOrder: 6,
  },
  {
    slug: "dir-beit-hamidrash-kehilot-yerushalayim",
    name: "בית המדרש קהילות ירושלים",
    publicSubtitle: "לעילוי",
    publicCategory: "בית מדרש",
    directoryOrder: 7,
  },
  {
    slug: "dir-even-tzion",
    name: "אבן ציון",
    publicSubtitle: "כולל",
    publicCategory: "כולל",
    directoryOrder: 8,
  },
  {
    slug: "dir-anashim-shenoseim-echad-et-hasheni",
    name: "אנשים שנושאים אחד את השני",
    publicCategory: "חסד",
    directoryOrder: 9,
  },
  {
    slug: "dir-anshei-salta-veshamna",
    name: "אנשי סלתה ושמנה",
    publicCategory: "מוסד",
    directoryOrder: 10,
  },
  {
    slug: "dir-kehal-anshei-yerushalayim-kiryat-malachi",
    name: "קהל אנשי ירושלים קרית מלאכי",
    publicSubtitle: "מ.ס.מ.ד",
    publicCategory: "קהילה",
    directoryOrder: 11,
  },
  {
    slug: "dir-kehal-anshei-yerushalayim-busha",
    name: "קהל אנשי ירושלים בושה",
    publicSubtitle: "מ-ש.ע.ב",
    publicCategory: "קהילה",
    directoryOrder: 12,
  },
  {
    slug: "dir-kehal-anshei-yerushalayim-mh",
    name: "קהל אנשי ירושלים - מ.ה",
    publicCategory: "קהילה",
    directoryOrder: 13,
  },
  {
    slug: "dir-chotam-yerushalmi",
    name: "חותם ירושלמי",
    publicCategory: "רישום",
    directoryOrder: 14,
  },
  {
    slug: "dir-shaarei-chesed-yerushalayim",
    name: "שערי חסד ירושלים",
    publicSubtitle: "מדרשת",
    publicCategory: "מדרשה",
    directoryOrder: 15,
  },
  {
    slug: "dir-talmud-torah-klal-chassidei-leanshei-yerushalayim",
    name: "תלמוד תורה כלל חסידי לאנשי ירושלים",
    publicCategory: "תלמוד תורה",
    directoryOrder: 16,
  },
  {
    slug: "dir-pitchei-shearim",
    name: "פתחי שערים",
    publicSubtitle: "קהילת קודש",
    publicCategory: "קהילה",
    directoryOrder: 17,
  },
  {
    slug: "dir-kehal-anshei-yerushalayim-ramat-beit-shemesh-d1",
    name: "קהל אנשי ירושלים רמת בית שמש ד' - א'",
    publicCategory: "קהילה",
    directoryOrder: 18,
  },
];

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const parsedDatabaseUrl = new URL(databaseUrl);
const sslAcceptMode = parsedDatabaseUrl.searchParams.get("sslaccept");
const databaseName = parsedDatabaseUrl.pathname.replace(/^\//, "");

const adapter = new PrismaMariaDb({
  host: parsedDatabaseUrl.hostname,
  port: parsedDatabaseUrl.port ? Number(parsedDatabaseUrl.port) : 3306,
  user: decodeURIComponent(parsedDatabaseUrl.username),
  password: decodeURIComponent(parsedDatabaseUrl.password),
  database: databaseName,
  connectionLimit: 3,
  ssl:
    sslAcceptMode === "accept_invalid_certs"
      ? { rejectUnauthorized: false }
      : sslAcceptMode
        ? true
        : undefined,
});

const prisma = new PrismaClient({ adapter });

try {
  for (const org of homepageOrgs) {
    await prisma.org.upsert({
      where: { slug: org.slug },
      update: {
        name: org.name,
        publicListingEnabled: true,
        publicCategory: org.publicCategory,
        publicSubtitle: org.publicSubtitle ?? null,
        publicDonationOptions: defaultPublicDonationOptions,
        directoryOrder: org.directoryOrder,
      },
      create: {
        slug: org.slug,
        name: org.name,
        publicListingEnabled: true,
        publicCategory: org.publicCategory,
        publicSubtitle: org.publicSubtitle ?? null,
        publicDonationOptions: defaultPublicDonationOptions,
        directoryOrder: org.directoryOrder,
      },
    });
  }

  console.log(`Seeded ${homepageOrgs.length} homepage orgs.`);
} finally {
  await prisma.$disconnect();
}
