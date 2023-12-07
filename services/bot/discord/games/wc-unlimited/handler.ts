import {
  addChainedWordByChannelId,
  getChainedWordsByChannelId,
  getGameByChannelId,
  setGameByChannelId,
} from "@/db/games/wc-unlimited";
import { checkSpell } from "@/games/wordchain/lib/api/wiktionary";
import { applyGameRule } from "@/games/wordchain/lib/rules";
import bot from "@/services/bot/discord/index";
import {
  ButtonComponent,
  ButtonStyles,
  DiscordInteraction,
  MessageComponentTypes,
  logger,
} from "@discordeno/bot";

const counter = (count: number): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "counter",
  label: `${count}`,
  style: ButtonStyles.Secondary,
  emoji: { name: "✅" },
  disabled: true,
});

const resetCounter = (count?: number): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "counter",
  label: count?.toString() || "0",
  style: ButtonStyles.Secondary,
  emoji: { name: "❌" },
  disabled: true,
});

const chainWordBtn = (): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "chain_word",
  label: "word",
  style: ButtonStyles.Primary,
  emoji: { name: "⛓️" },
  disabled: false,
});

const player = (name: string): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "player",
  label: name,
  style: ButtonStyles.Secondary,
  emoji: { name: "✍️" },
  disabled: true,
});

type HandleGameParams = {
  interaction: DiscordInteraction;
  word: string;
};

export async function handleGame({
  interaction,
  word,
}: HandleGameParams) {
  if (
    !interaction.channel_id ||
    !interaction.guild_id ||
    !interaction.member?.user.id
  ) {
    return;
  }

  const playerName =
    interaction.member?.nick ||
    interaction.member?.user.global_name ||
    interaction.user?.global_name ||
    interaction.user?.username;

  if (!playerName) return;

  try {
    const game = await getGameByChannelId(
      interaction.channel_id,
    );

    logger.info({ game });

    if (!game) {
      await bot.rest.sendFollowupMessage(
        interaction.token,
        {
          content: `### There is no game running currently in this channel.`,
        },
      );

      return;
    }

    //#region Rule: Word must be correctly spelled

    const correctSpelling = await checkSpell(word);

    if (!correctSpelling) {
      await bot.rest.sendFollowupMessage(
        interaction.token,
        {
          content: `> **${word}**\nThe word is incorrect according to Wiktionary.\nCurrent word: **${game.lastCorrectWord}**`,
          components: [
            {
              type: MessageComponentTypes.ActionRow,
              components: [
                resetCounter(),
                player(playerName),
              ],
            },
          ],
        },
      );

      await applyGameRule({
        game,
        word,
        brokenRule:
          game.gameSettingsFlags.wrongWordBreaksChain,
      });

      return;
    }

    if (!correctSpelling) return;

    if (game.endedAt !== null) {
      return;
    }

    //#endregion Rule: Word must be correctly spelled

    //#region Rule: Last letter of the previous word must be the first letter of the current word

    const lastLetter =
      game.lastCorrectWord[game.lastCorrectWord.length - 1];

    if (lastLetter !== word[0]) {
      await bot.rest.sendFollowupMessage(
        interaction.token,
        {
          content: `> **${word}**\nThe word does not start with the last letter (${lastLetter}) of the previous word.\nCurrent word: **${game.lastCorrectWord}**`,
          components: [
            {
              type: MessageComponentTypes.ActionRow,
              components: [
                resetCounter(),
                player(playerName),
              ],
            },
          ],
        },
      );

      await applyGameRule({
        game,
        word,
        brokenRule:
          game.gameSettingsFlags.wrongWordBreaksChain,
      });

      return;
    }

    //#endregion Rule: Last letter of the previous word must be the first letter of the current word

    //#region Rule: Word must not be repeated

    if (game.gameSettingsFlags.uniqueWords) {
      const chainedWords = await getChainedWordsByChannelId(
        interaction.channel_id,
      );

      if (chainedWords.includes(word)) {
        await bot.rest.sendFollowupMessage(
          interaction.token,
          {
            content: `> **${word}**\nThe word was used before.\nCurrent word: **${game.lastCorrectWord}**`,
            components: [
              {
                type: MessageComponentTypes.ActionRow,
                components: [
                  resetCounter(game.count),
                  player(playerName),
                  chainWordBtn(),
                ],
              },
            ],
          },
        );

        return;
      }
    }

    //#endregion Rule: Word must not be repeated

    //#region Rule: Different player in each turn

    if (game.gameSettingsFlags.differentPlayerInEachTurn) {
      if (
        game.starterUserId === interaction.member.user.id
      ) {
        await bot.rest.sendFollowupMessage(
          interaction.token,
          {
            content: `> **${word}**\nYou already played your turn. Please wait for other players to play their turn.\nCurrent word: **${game.lastCorrectWord}**`,
            components: [
              {
                type: MessageComponentTypes.ActionRow,
                components: [
                  resetCounter(game.count),
                  player(playerName),
                  chainWordBtn(),
                ],
              },
            ],
          },
        );

        return;
      }
    }

    //#endregion Rule: Different player in each turn

    //#region Successful turn

    game.count += 1;
    game.lastCorrectWord = word;
    game.lastCorrectWordPlayerId =
      interaction.member.user.id;

    await addChainedWordByChannelId(
      interaction.channel_id,
      word,
    );

    await setGameByChannelId(interaction.channel_id, game);

    await bot.rest.sendFollowupMessage(interaction.token, {
      content: `> **${word}**`,
      components: [
        {
          type: MessageComponentTypes.ActionRow,
          components: [
            counter(game.count),
            player(playerName),
            chainWordBtn(),
          ],
        },
      ],
    });

    //#endregion Successful turn
  } catch (error) {
    logger.error(error);
  }
}
