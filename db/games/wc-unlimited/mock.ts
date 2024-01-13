import { WordChainUnlimited } from "@/games/wordchain/unlimited";

export const mockGameMap = new Map<string, WordChainUnlimited | undefined>();

export const mockChainedWordsMap = new Map<string, string[]>();

export async function getGameByChannelId(
  channelId: string,
): Promise<WordChainUnlimited | undefined> {
  //#region Mock
  return mockGameMap.get(channelId);
  //#endregion Mock
}

export async function setGameByChannelId(
  channelId: string,
  game: WordChainUnlimited | undefined,
): Promise<void> {
  //#region Mock

  if (!game) {
    mockChainedWordsMap.delete(channelId);
    mockGameMap.delete(channelId);
    return;
  }

  mockGameMap.set(channelId, game);
  //#endregion Mock
}

export async function deleteGameByChannelId(channelId: string): Promise<void> {
  //#region Mock
  mockChainedWordsMap.delete(channelId);
  mockGameMap.delete(channelId);
  //#endregion Mock
}

export async function getChainedWordsByChannelId(
  channelId: string,
): Promise<string[]> {
  const game = await getGameByChannelId(channelId);

  if (!game) {
    return [];
  }

  //#region Mock
  return mockChainedWordsMap.get(channelId) ?? [];
  //#endregion Mock
}

export async function addChainedWordByChannelId(
  channelId: string,
  word: string,
): Promise<void> {
  const game = await getGameByChannelId(channelId);

  if (!game) {
    return;
  }

  //#region Mock
  const chainedWords = mockChainedWordsMap.get(channelId) ?? [];

  chainedWords.push(word);

  mockChainedWordsMap.set(channelId, chainedWords);
  //#endregion Mock
}
