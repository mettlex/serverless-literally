import { Command } from "@/services/bot/command/index";
import bot from "@/services/bot/index";
import { sleep } from "@/services/bot/utils";
import { logger } from "@discordeno/bot";

export const command: Command = {
  name: "help",
  description: "Show help message for Literally bot",
  options: [],
  execute: async (interaction) => {
    logger.info(typeof interaction);
    logger.info({ interaction });

    await sleep(200);

    try {
      const result = await bot.rest.sendFollowupMessage(interaction.token, {
        content:
          "The bot is under active development. A huge rewrite is in progress. Please be patient while we work on the bot. You can join our Discord server at <https://discord.gg/nTHbTxtb5p> for updates on the bot's development.",
      });
      logger.info(result);
    } catch (error) {
      logger.error(error);
    }
  },
};

export default command;
