import { Command } from "@/services/bot/discord/command/index";
import bot from "@/services/bot/discord/index";
import { sleep } from "@/utils";
import { logger } from "@discordeno/bot";

export const command: Command = {
  name: "help",
  description: "Show help message for Literally bot",
  options: [],
  execute: async (interaction) => {
    await bot.rest.sendInteractionResponse(interaction.id, interaction.token, {
      type: 5,
    });

    await sleep(200);

    try {
      const result = await bot.rest.sendFollowupMessage(interaction.token, {
        content:
          "The bot is under active development. A huge rewrite is in progress. Please be patient while we work on the bot. You can join our Discord server at <https://discord.gg/nTHbTxtb5p> for updates on the bot's development.",
      });
      // logger.info(result);
    } catch (error) {
      logger.error(error);
    }
  },
};

export default command;
