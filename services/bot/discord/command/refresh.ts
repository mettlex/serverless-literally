import { Command } from "@/services/bot/discord/command/index";
import bot from "@/services/bot/discord/index";
import { sleep } from "@/utils";
import { logger } from "@discordeno/bot";
import { refreshCommandsForGuild } from "../utils";

export const command: Command = {
  name: "refresh",
  description: "Refresh the bot's commands",
  options: [],
  execute: async (interaction) => {
    await bot.rest.sendInteractionResponse(interaction.id, interaction.token, {
      type: 5,
    });

    await sleep(200);

    try {
      await refreshCommandsForGuild(interaction.data?.guild_id as string);

      logger.info(
        `Registered commands for guild ${interaction.data?.guild_id}`,
      );

      const result = await bot.rest.sendFollowupMessage(interaction.token, {
        content: "Successfully refreshed commands.",
      });

      logger.info(JSON.stringify(result));
    } catch (error) {
      logger.error(error);
    }
  },
};

export default command;
