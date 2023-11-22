import modals from "@/services/bot/discord/modal";
import { DiscordInteraction, InteractionTypes } from "@discordeno/bot";

export const modalSubmit = async function (interaction: DiscordInteraction) {
  if (interaction.type === InteractionTypes.ModalSubmit) {
    if (!interaction.data) return;

    const command = modals.get(
      interaction.data.custom_id || interaction.data.name,
    );

    if (!command) return;

    await command.handle(interaction);
  }
};

export default modalSubmit;
