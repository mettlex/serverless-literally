import { setGameByChannelId } from "@/db/games/wc-unlimited";
import { WordChainUnlimited } from "@/games/wordchain/unlimited";

type ApplyGameRuleParams = {
  game: WordChainUnlimited;
  word: string;
  brokenRule: WordChainUnlimited["gameSettingsFlags"][keyof WordChainUnlimited["gameSettingsFlags"]];
};

export async function applyGameRule({
  game,
  word,
  brokenRule,
}: ApplyGameRuleParams) {
  const { gameSettingsFlags: rules, discordChannelId } = game;

  if (
    rules.wrongWordBreaksChain.enabled &&
    brokenRule.order === rules.wrongWordBreaksChain.order
  ) {
    game.count = 0;

    if (discordChannelId) {
      await setGameByChannelId(discordChannelId, game);
    }
  }
}
