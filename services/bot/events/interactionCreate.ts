import commands from "@/services/bot/command";
import { EventHandlers, InteractionTypes } from "@discordeno/bot";

export const interactionCreate: EventHandlers["interactionCreate"] =
  async function (interaction) {
    if (interaction.type === InteractionTypes.ApplicationCommand) {
      if (!interaction.data) return;

      const command = commands.get(interaction.data.name);
      if (!command) return;

      await command.execute(interaction);
    }
  };

export default interactionCreate;
