import { db } from "@/db";
import { chainedWords } from "@/db/schema/chained-word-schema";
import { wordChainUnlimited } from "@/db/schema/word-chain-unlimited-schema";
import {
  WordChainUnlimited,
  WordChainUnlimitedExtra,
} from "@/games/wordchain/unlimited";
import { eq } from "drizzle-orm";

export async function getGameByChannelId(
  channelId: string,
): Promise<(WordChainUnlimited & { id: number }) | undefined> {
  let game;
  let gameInDb;

  gameInDb = (
    await db
      .select()
      .from(wordChainUnlimited)
      .where(eq(wordChainUnlimited.discordChannelId, channelId))
      .limit(1)
  )[0];

  if (gameInDb) {
    game = {
      ...new WordChainUnlimitedExtra(),
      ...gameInDb,
    };
  }

  return game;
}

export async function setGameByChannelId(
  channelId: string,
  game: WordChainUnlimited,
): Promise<void> {
  try {
    const gameInDb = await getGameByChannelId(channelId);

    if (!gameInDb) {
      await db.insert(wordChainUnlimited).values([
        {
          count: game.count,
          discordChannelId: channelId,
          lastCorrectWord: game.lastCorrectWord,
          lastCorrectWordPlayerId: game.lastCorrectWordPlayerId,
          longestWord: game.longestWord,
          ruleFlags: game.ruleFlags,
          starterUserId: game.starterUserId,
          createdAt: game.createdAt,
          discordGuildId: game.discordGuildId,
          endedAt: game.endedAt,
        },
      ]);

      return;
    }

    await db
      .update(wordChainUnlimited)
      .set({
        count: game.count,
        discordChannelId: channelId,
        lastCorrectWord: game.lastCorrectWord,
        lastCorrectWordPlayerId: game.lastCorrectWordPlayerId,
        longestWord: game.longestWord,
        ruleFlags: game.ruleFlags,
        starterUserId: game.starterUserId,
        createdAt: game.createdAt,
        discordGuildId: game.discordGuildId,
        endedAt: game.endedAt,
      })
      .where(eq(wordChainUnlimited.discordChannelId, channelId));
  } catch (error) {
    console.error(error);
  }
}

export async function deleteGameByChannelId(channelId: string): Promise<void> {
  const game = await getGameByChannelId(channelId);

  if (!game) {
    return;
  }

  await db.delete(chainedWords).where(eq(chainedWords.chainId, game.id));

  await db
    .delete(wordChainUnlimited)
    .where(eq(wordChainUnlimited.discordChannelId, channelId));
}

export async function getChainedWordsByChannelId(
  channelId: string,
): Promise<string[]> {
  const game = await getGameByChannelId(channelId);

  if (!game) {
    return [];
  }

  const words = (
    await db
      .select()
      .from(chainedWords)
      .where(eq(chainedWords.chainId, game.id))
  ).map((x) => x.word);

  return words;
}

export async function addChainedWordByChannelId({
  channelId,
  word,
  discordUserId,
  discordMessageId,
}: {
  channelId: string;
  word: string;
  discordUserId: string;
  discordMessageId: string;
}): Promise<void> {
  const game = await getGameByChannelId(channelId);

  if (!game) {
    return;
  }

  await db.insert(chainedWords).values([
    {
      chainId: game.id,
      word,
      correctSpelling: true,
      previousWord: game.lastCorrectWord,
      firstWordId: "", // TODO: implement
      discordMessageId,
      discordUserId,
    },
  ]);
}

export async function deleteChainedWordsByChannelId(
  channelId: string,
): Promise<void> {
  const game = await getGameByChannelId(channelId);

  if (!game) {
    return;
  }

  await db.delete(chainedWords).where(eq(chainedWords.chainId, game.id));
}
