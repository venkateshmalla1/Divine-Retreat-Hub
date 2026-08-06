import { and, asc, eq } from "drizzle-orm";
import { db, retreatCentreRecordsTable, type RetreatCentreRecord } from "@workspace/db";
import { logger } from "./logger";

type RecordData = Record<string, unknown>;

const seedData: Array<{ entity: string; data: RecordData }> = [
  {
    entity: "retreat",
    data: {
      title: "Inner Stillness",
      slug: "inner-stillness",
      description:
        "Three days of prayer, silence, and guided reflection beside the quiet hills of Vizag. Come as you are and make room for grace.",
      startDate: "2026-09-18",
      endDate: "2026-09-20",
      location: "Divine Retreat Centre, Vizag",
      capacity: 80,
      enrolled: 34,
      price: 3500,
      status: "upcoming",
      spiritualTheme: "Be still and know",
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    },
  },
  {
    entity: "retreat",
    data: {
      title: "Healing & Hope",
      slug: "healing-and-hope",
      description:
        "A gentle retreat for anyone carrying a heavy season. Find a listening community, compassionate guidance, and a renewed hope.",
      startDate: "2026-10-09",
      endDate: "2026-10-11",
      location: "Divine Retreat Centre, Vizag",
      capacity: 100,
      enrolled: 51,
      price: 3000,
      status: "upcoming",
      spiritualTheme: "Hope does not disappoint",
      imageUrl:
        "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=85",
    },
  },
  {
    entity: "retreat",
    data: {
      title: "Families in Grace",
      slug: "families-in-grace",
      description:
        "A warm weekend for families to slow down, pray together, and rediscover the joy of being present to one another.",
      startDate: "2026-11-06",
      endDate: "2026-11-08",
      location: "Divine Retreat Centre, Vizag",
      capacity: 70,
      enrolled: 22,
      price: 2800,
      status: "upcoming",
      spiritualTheme: "Love bears all things",
      imageUrl:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85",
    },
  },
  {
    entity: "registration",
    data: {
      retreatId: 1,
      retreatTitle: "Inner Stillness",
      fullName: "Ananya Rao",
      email: "ananya@example.com",
      phone: "+91 98765 43210",
      guests: 1,
      status: "confirmed",
      createdAt: "2026-07-28T09:00:00.000Z",
    },
  },
  {
    entity: "prayer",
    data: {
      fullName: "Michael Joseph",
      email: "michael@example.com",
      request: "Please pray for peace and healing in my family during this difficult season.",
      isAnonymous: false,
      status: "praying",
      createdAt: "2026-08-02T11:30:00.000Z",
    },
  },
  {
    entity: "prayer",
    data: {
      fullName: "A retreat guest",
      email: "guest@example.com",
      request: "For courage to make a wise decision and trust the path ahead.",
      isAnonymous: true,
      status: "new",
      createdAt: "2026-08-04T15:10:00.000Z",
    },
  },
  {
    entity: "donation",
    data: {
      donorName: "Priya Menon",
      email: "priya@example.com",
      amount: 5000,
      purpose: "Retreat scholarships",
      status: "received",
      createdAt: "2026-08-01T08:20:00.000Z",
    },
  },
  {
    entity: "donation",
    data: {
      donorName: "David Thomas",
      email: "david@example.com",
      amount: 2500,
      purpose: "Centre meals",
      status: "pledged",
      createdAt: "2026-08-05T13:45:00.000Z",
    },
  },
  {
    entity: "announcement",
    data: {
      title: "Welcome to our September retreats",
      body: "Registration is now open for Inner Stillness. Places are intentionally limited so every guest receives the care they need.",
      category: "Retreats",
      publishedAt: "2026-08-05T07:30:00.000Z",
      isPinned: true,
    },
  },
  {
    entity: "announcement",
    data: {
      title: "A note from the centre",
      body: "The chapel is open every day from 6:00 AM to 8:00 PM for quiet prayer and reflection.",
      category: "Centre news",
      publishedAt: "2026-08-01T07:30:00.000Z",
      isPinned: false,
    },
  },
  {
    entity: "gallery",
    data: {
      title: "Morning prayer",
      category: "Life at the centre",
      imageUrl:
        "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=85",
    },
  },
  {
    entity: "gallery",
    data: {
      title: "The garden chapel",
      category: "Our spaces",
      imageUrl:
        "https://images.unsplash.com/photo-1548625361-ec4e9d7d3d3a?auto=format&fit=crop&w=1200&q=85",
    },
  },
  {
    entity: "event",
    data: {
      title: "Sunday Eucharistic celebration",
      date: "2026-08-09",
      time: "8:00 AM",
      location: "Main chapel",
      category: "Worship",
    },
  },
  {
    entity: "event",
    data: {
      title: "Open prayer evening",
      date: "2026-08-14",
      time: "6:30 PM",
      location: "Garden chapel",
      category: "Prayer",
    },
  },
  {
    entity: "certificate",
    data: {
      email: "ananya@example.com",
      retreatTitle: "Summer Renewal Retreat",
      issueDate: "2026-06-22",
      certificateNumber: "VDRC-2026-0014",
      downloadUrl: "/api/certificates/VDRC-2026-0014",
    },
  },
  {
    entity: "accommodation",
    data: {
      registrationId: 1,
      roomType: "shared",
      nights: 2,
      status: "assigned",
      notes: "Lower wing, room 6",
    },
  },
];

let seedPromise: Promise<void> | undefined;

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db
        .select({ id: retreatCentreRecordsTable.id })
        .from(retreatCentreRecordsTable)
        .limit(1);
      if (existing.length > 0) return;
      await db.insert(retreatCentreRecordsTable).values(seedData);
      logger.info({ records: seedData.length }, "Seeded retreat centre records");
    })().catch((error) => {
      seedPromise = undefined;
      throw error;
    });
  }
  await seedPromise;
}

export async function listRecords(entity: string): Promise<RetreatCentreRecord[]> {
  await ensureSeeded();
  return db
    .select()
    .from(retreatCentreRecordsTable)
    .where(eq(retreatCentreRecordsTable.entity, entity))
    .orderBy(asc(retreatCentreRecordsTable.createdAt));
}

export async function getRecord(id: number): Promise<RetreatCentreRecord | undefined> {
  await ensureSeeded();
  const [record] = await db
    .select()
    .from(retreatCentreRecordsTable)
    .where(eq(retreatCentreRecordsTable.id, id));
  return record;
}

export async function findRecord(
  entity: string,
  field: string,
  value: string | number,
): Promise<RetreatCentreRecord | undefined> {
  const records = await listRecords(entity);
  return records.find((record) => record.data[field] === value);
}

export async function createRecord(
  entity: string,
  data: RecordData,
): Promise<RetreatCentreRecord> {
  await ensureSeeded();
  const [record] = await db
    .insert(retreatCentreRecordsTable)
    .values({ entity, data })
    .returning();
  return record;
}

export async function updateRecord(
  id: number,
  data: RecordData,
): Promise<RetreatCentreRecord | undefined> {
  await ensureSeeded();
  const current = await getRecord(id);
  if (!current) return undefined;
  const [record] = await db
    .update(retreatCentreRecordsTable)
    .set({ data })
    .where(and(eq(retreatCentreRecordsTable.id, id)))
    .returning();
  return record;
}