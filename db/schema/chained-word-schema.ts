import {
  boolean,
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { wordChainUnlimited } from "./word-chain-unlimited-schema";

export const chainedWords = mysqlTable("literally-chained-words", {
  id: serial("id").primaryKey(),

  chainId: int("chain_id")
    .notNull()
    .references(() => wordChainUnlimited.id),

  // useful to remove words from inactive chains
  // id == firstWordId means it's the first word in the chain
  firstWordId: varchar("first_word_id", {
    length: 255,
  }).notNull(),

  word: varchar("word", { length: 255 }).notNull(),
  previousWord: varchar("previous_word", { length: 255 }),

  correctSpelling: boolean("correct_spelling").notNull(),

  discordUserId: varchar("discord_user_id", {
    length: 255,
  }),
  discordMessageId: varchar("discord_message_id", {
    length: 255,
  }),

  createdAt: timestamp("created_at").defaultNow(),
});

export type ChainedWordInDatabase = typeof chainedWords.$inferInsert;
