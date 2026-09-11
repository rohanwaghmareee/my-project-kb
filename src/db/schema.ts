import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Birthday wishes left by friends & family.
 * Every wish blooms as a tulip inside the 3D Wish Garden.
 */
export const wishes = pgTable("wishes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  message: text("message").notNull(),
  color: varchar("color", { length: 20 }).notNull().default("pink"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Which fairy friends / treasures a visitor has already touched.
 * Keyed by an anonymous visitor id generated in the browser.
 */
export const discoveries = pgTable(
  "discoveries",
  {
    id: serial("id").primaryKey(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    itemKey: varchar("item_key", { length: 40 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("discoveries_visitor_item_idx").on(t.visitorId, t.itemKey),
  ],
);

/**
 * Every time the ring in the deepest room of the castle is opened.
 */
export const ringMoments = pgTable("ring_moments", {
  id: serial("id").primaryKey(),
  visitorId: varchar("visitor_id", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Wish = typeof wishes.$inferSelect;
export type NewWish = typeof wishes.$inferInsert;
export type Discovery = typeof discoveries.$inferSelect;
