import {
  getGameByChannelId,
  setGameByChannelId,
} from "@/db/games/wc-unlimited";
import { checkSpell } from "@/games/wordchain/lib/api/wiktionary";
import { applyGameRule } from "@/games/wordchain/lib/rules";
import bot from "@/services/bot/discord/index";
import { Modal } from "@/services/bot/discord/modal/index";
import { sleep } from "@/utils";
import {
  ButtonComponent,
  ButtonStyles,
  DiscordInputTextComponent,
  InputTextComponent,
  InteractionResponse,
  InteractionResponseTypes,
  MessageComponentTypes,
  logger,
} from "@discordeno/bot";

const name = "chain_word";

const textInput: InputTextComponent = {
  type: MessageComponentTypes.InputText,
  customId: "chained_word",
  label: "Your new word",
  style: 1,
  minLength: 1,
  maxLength: 200,
  placeholder: "Enter a word here",
  required: true,
};

const counter = (count: number): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "counter",
  label: `${count}`,
  style: ButtonStyles.Secondary,
  emoji: { name: "✅" },
  disabled: true,
});

const chainWordBtn = (): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "chain_word",
  label: "word",
  style: ButtonStyles.Secondary,
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

const modal: InteractionResponse = {
  type: InteractionResponseTypes.Modal,
  data: {
    title: "Enter your word",
    customId: name,
    components: [
      {
        type: 1,
        components: [textInput],
      },
    ],
  },
};

export const handler: Modal = {
  name,
  modal,
  async handle(interaction) {
    if (
      !interaction.channel_id ||
      !interaction.guild_id ||
      !interaction.member?.user.id
    ) {
      return;
    }

    await sleep(200);

    let word =
      (
        interaction.data?.components?.[0]
          .components?.[0] as DiscordInputTextComponent
      )?.value || (interaction.data?.options?.[0]?.value as string);

    word = word?.trim()?.toLowerCase();

    if (!word) {
      await bot.rest.sendInteractionResponse(
        interaction.id,
        interaction.token,
        this.modal,
      );

      return;
    }

    await bot.rest.sendInteractionResponse(interaction.id, interaction.token, {
      type: 5,
    });

    const playerName =
      interaction.member?.nick ||
      interaction.member?.user.global_name ||
      interaction.user?.global_name ||
      interaction.user?.username;

    if (!playerName) return;

    try {
      const game = await getGameByChannelId(interaction.channel_id);

      logger.info({ game });

      if (!game) {
        await bot.rest.sendFollowupMessage(interaction.token, {
          content: `### There is no game running currently in this channel.`,
        });

        return;
      }

      const correctSpelling = await checkSpell(word);

      let emoji = "";

      if (correctSpelling) {
        emoji = "✅";
      } else {
        emoji = "❌";

        const result = await bot.rest.sendFollowupMessage(interaction.token, {
          content: `> **${word}**\nThe word is incorrect according to Wiktionary.`,
        });

        await applyGameRule({
          game,
          word,
          brokenRule: game.gameSettingsFlags.wrongWordBreaksChain,
        });

        await bot.rest.addReaction(result.channelId, result.id, emoji);

        return;
      }

      if (!correctSpelling) return;

      if (game.endedAt !== null) {
        return;
      }

      const lastLetter = game.lastCorrectWord[game.lastCorrectWord.length - 1];

      if (lastLetter !== word[0]) {
        const result = await bot.rest.sendFollowupMessage(interaction.token, {
          content: `> **${word}**\nThe word does not start with the last letter (${lastLetter}) of the previous word.`,
        });

        await applyGameRule({
          game,
          word,
          brokenRule: game.gameSettingsFlags.wrongWordBreaksChain,
        });

        await bot.rest.addReaction(result.channelId, result.id, "❌");

        return;
      }

      game.count += 1;
      game.lastCorrectWord = word;
      await setGameByChannelId(interaction.channel_id, game);
      await bot.rest.sendFollowupMessage(interaction.token, {
        content: `> **${word}**`,
        components: [
          {
            type: MessageComponentTypes.ActionRow,
            components: [
              counter(game.count),
              chainWordBtn(),
              player(playerName),
            ],
          },
        ],
      });
    } catch (error) {
      logger.error(error);
    }
  },
};

export default handler;
