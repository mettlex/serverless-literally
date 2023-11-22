import { mysqlTable, serial, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const wordChainUnlimited = mysqlTable("literally-wc-unlimited", {
  id: serial("id").primaryKey(),
  starterUserId: varchar("starter_user_id", { length: 255 }).notNull(),
  discordGuildId: varchar("discord_guild_id", { length: 255 }),
  discordChannelId: varchar("discord_channel_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const insertWCUnlimitedSchema = createInsertSchema(wordChainUnlimited);

export const selectWCUnlimitedSchema = createSelectSchema(wordChainUnlimited);

export type WordChainUnlimitedInDatabase = z.infer<
  typeof selectWCUnlimitedSchema
>;
