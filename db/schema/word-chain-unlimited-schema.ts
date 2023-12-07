import {
  bigint,
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const wordChainUnlimited = mysqlTable(
  "literally-wc-unlimited",
  {
    id: serial("id").primaryKey(),

    count: int("count").notNull(),

    lastCorrectWord: varchar("last_correct_word", {
      length: 255,
    }).notNull(),

    lastCorrectWordPlayerId: varchar(
      "last_correct_word_player_id",
      {
        length: 255,
      },
    ).notNull(),

    starterUserId: varchar("starter_user_id", {
      length: 255,
    }).notNull(),

    discordGuildId: varchar("discord_guild_id", {
      length: 255,
    }),

    discordChannelId: varchar("discord_channel_id", {
      length: 255,
    }),

    longestWord: varchar("longest_word", {
      length: 255,
    }).notNull(),

    // bitfield to toggle game rules
    ruleFlags: bigint("rule_flags", {
      mode: "bigint",
    }).notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    endedAt: timestamp("ended_at"),
  },
);

export type WordChainUnlimitedInDatabase =
  typeof wordChainUnlimited.$inferInsert;
