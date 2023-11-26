import commands from "@/services/bot/discord/command";
import { DiscordInteraction, InteractionTypes } from "@discordeno/bot";

export const componentInteractionCreate = async function (
  interaction: DiscordInteraction,
) {
  if (interaction.type === InteractionTypes.MessageComponent) {
    if (!interaction.data) return;

    const command = commands.get(interaction.data.custom_id || "");

    if (!command) return;

    await command.execute(interaction as unknown as DiscordInteraction);
  }
};

export default componentInteractionCreate;
