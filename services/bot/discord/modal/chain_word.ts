import bot from "@/services/bot/discord/index";
import { Modal } from "@/services/bot/discord/modal/index";
import { sleep } from "@/utils";
import {
  DiscordInputTextComponent,
  InputTextComponent,
  InteractionResponse,
  InteractionResponseTypes,
  MessageComponentTypes,
} from "@discordeno/bot";
import { handleGame } from "../games/wc-unlimited/handler";

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

    let word: string | undefined =
      (
        interaction.data?.components?.[0]
          .components?.[0] as DiscordInputTextComponent
      )?.value ||
      (interaction.data?.options?.[0]?.value as string);

    word = word?.trim()?.toLowerCase()?.split(" ").at(-1);

    if (!word) {
      await bot.rest.sendInteractionResponse(
        interaction.id,
        interaction.token,
        this.modal,
      );

      return;
    }

    await bot.rest.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: 5,
      },
    );

    await handleGame({ interaction, word });
  },
};

export default handler;
