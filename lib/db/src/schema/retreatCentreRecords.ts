import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const retreatCentreRecordsTable = pgTable("retreat_centre_records", {
  id: serial("id").primaryKey(),
  entity: text("entity").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RetreatCentreRecord = typeof retreatCentreRecordsTable.$inferSelect;
export type InsertRetreatCentreRecord = z.infer<typeof insertRetreatCentreRecordSchema>;

export const insertRetreatCentreRecordSchema = z.object({
  entity: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});