import commands from "@/services/bot/discord/command";
import {
  DiscordInteraction,
  EventHandlers,
  InteractionTypes,
} from "@discordeno/bot";

export const interactionCreate: EventHandlers["interactionCreate"] =
  async function (interaction) {
    if (interaction.type === InteractionTypes.ApplicationCommand) {
      if (!interaction.data) return;

      const command = commands.get(interaction.data.name);
      if (!command) return;

      await command.execute(interaction as unknown as DiscordInteraction);
    }
  };

export default interactionCreate;
