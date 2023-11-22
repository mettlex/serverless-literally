import { Command } from "@/services/bot/discord/command/index";
import bot from "@/services/bot/discord/index";
import { sleep } from "@/utils";
import { logger } from "@discordeno/bot";

export const command: Command = {
  name: "ping",
  description: "Check the bot's ping",
  options: [],
  execute: async (interaction) => {
    await bot.rest.sendInteractionResponse(interaction.id, interaction.token, {
      type: 5,
    });

    await sleep(200);

    try {
      const result = await bot.rest.sendFollowupMessage(interaction.token, {
        content: "Pong!",
      });
      logger.info(result);
    } catch (error) {
      logger.error(error);
    }
  },
};

export default command;
