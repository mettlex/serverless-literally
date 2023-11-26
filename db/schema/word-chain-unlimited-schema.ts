import {
  bigint,
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const wordChainUnlimited = mysqlTable("literally-wc-unlimited", {
  id: serial("id").primaryKey(),

  count: int("count").notNull().default(0),

  starterUserId: varchar("starter_user_id", { length: 255 }).notNull(),

  discordGuildId: varchar("discord_guild_id", { length: 255 }),
  discordChannelId: varchar("discord_channel_id", { length: 255 }),

  // bitfield to toggle game rules
  ruleFlags: bigint("rule_flags", { mode: "bigint" }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const insertWCUnlimitedSchema = createInsertSchema(wordChainUnlimited);

export const selectWCUnlimitedSchema = createSelectSchema(wordChainUnlimited);

export type WordChainUnlimitedInDatabase = z.infer<
  typeof selectWCUnlimitedSchema
>;
