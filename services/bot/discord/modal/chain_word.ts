import {
  getGameByChannelId,
  setGameByChannelId,
} from "@/db/games/wc-unlimited";
import { checkSpell } from "@/games/wordchain/lib/api/wiktionary";
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

    const word =
      (
        interaction.data?.components?.[0]
          .components?.[0] as DiscordInputTextComponent
      )?.value || (interaction.data?.options?.[0]?.value as string);

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

    try {
      const correctSpelling = await checkSpell(word);

      let emoji = "";

      if (correctSpelling) {
        emoji = "✅";
      } else {
        emoji = "❌";
        const result = await bot.rest.sendFollowupMessage(interaction.token, {
          content: `### ${playerName}: ${word}`,
        });
        await bot.rest.addReaction(result.channelId, result.id, emoji);
        return;
      }

      if (!correctSpelling) return;

      const game = await getGameByChannelId(interaction.channel_id);

      logger.info({ game });

      if (!game) {
        await bot.rest.sendFollowupMessage(interaction.token, {
          content: `### There is no game running currently in this channel.`,
        });

        return;
      } else if (game.endedAt === null) {
        game.count += 1;
        await setGameByChannelId(interaction.channel_id, game);
        await bot.rest.sendFollowupMessage(interaction.token, {
          content: `> ${playerName}: **${word}**`,
          components: [
            {
              type: MessageComponentTypes.ActionRow,
              components: [counter(game.count), chainWordBtn()],
            },
          ],
        });
      }
    } catch (error) {
      logger.error(error);
    }
  },
};

export default handler;
