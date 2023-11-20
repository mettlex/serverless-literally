import { Command } from "@/services/bot/command/index";
import bot from "@/services/bot/index";
import { sleep } from "@/services/bot/utils";
import { logger } from "@discordeno/bot";

export const command: Command = {
  name: "ping",
  description: "Check the bot's ping",
  options: [],
  execute: async (interaction) => {
    logger.info(typeof interaction);
    logger.info({ interaction });

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
