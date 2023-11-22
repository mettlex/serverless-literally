import { checkSpell } from "@/games/wordchain/lib/api/wiktionary";
import bot from "@/services/bot/discord/index";
import { Modal } from "@/services/bot/discord/modal/index";
import { sleep } from "@/utils";
import {
  DiscordInputTextComponent,
  InputTextComponent,
  InteractionResponse,
  InteractionResponseTypes,
  MessageComponentTypes,
  logger,
} from "@discordeno/bot";

const name = "wc_unlimited";

const textInput: InputTextComponent = {
  type: MessageComponentTypes.InputText,
  customId: "word",
  label: "Word to start the chain",
  style: 1,
  minLength: 1,
  maxLength: 200,
  placeholder: "Enter a word here",
  required: true,
};

const modal: InteractionResponse = {
  type: InteractionResponseTypes.Modal,
  data: {
    title: "Start the game",
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
  handle: async (interaction) => {
    if (!interaction.channel_id) return;

    await bot.rest.sendInteractionResponse(interaction.id, interaction.token, {
      type: 5,
    });

    await sleep(200);

    const word = (
      interaction.data?.components?.[0]
        .components?.[0] as DiscordInputTextComponent
    ).value;

    if (!word) return;

    const playerName =
      interaction.member?.nick ||
      interaction.member?.user.global_name ||
      interaction.user?.global_name ||
      interaction.user?.username;

    const result = await bot.rest.sendFollowupMessage(interaction.token, {
      content: `### ${playerName}: ${word}`,
    });

    try {
      let emoji = "";

      if (await checkSpell(word)) {
        emoji = "✅";
      } else {
        emoji = "❌";
      }

      await bot.rest.addReaction(result.channelId, result.id, emoji);
    } catch (error) {
      logger.error(error);
    }
  },
};

export default handler;
