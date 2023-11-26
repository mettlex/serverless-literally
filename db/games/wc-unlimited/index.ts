import { mockGameMap } from "@/db/games/wc-unlimited/mock";
import { WordChainUnlimited } from "@/games/wordchain/unlimited";

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
  mockGameMap.set(channelId, game);
  //#endregion Mock
}
