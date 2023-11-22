import { checkSpell } from "@/games/wordchain/lib/api/wiktionary";
import { Command } from "@/services/bot/discord/command/index";
import bot from "@/services/bot/discord/index";
import { sleep } from "@/utils";
import { logger } from "@discordeno/bot";

export const command: Command = {
  name: "check_spelling",
  description: "Check spelling of a word from Wiktionary",
  options: [
    {
      name: "word",
      description: "Word to check",
      type: 3,
      required: true,
    },
  ],
  execute: async (interaction) => {
    await bot.rest.sendInteractionResponse(interaction.id, interaction.token, {
      type: 5,
    });

    await sleep(200);

    try {
      const word = interaction.data?.options?.[0].value;

      if (typeof word !== "string") {
        throw new Error("Word is undefined");
      }

      const correct = await checkSpell(word);

      const result = await bot.rest.sendFollowupMessage(interaction.token, {
        content: correct
          ? `✅ ${word} is correct according to Wiktionary.`
          : `❌ ${word} is wrong according to Wiktionary.`,
      });

      logger.info(result);
    } catch (error) {
      logger.error(error);
    }
  },
};

export default command;
