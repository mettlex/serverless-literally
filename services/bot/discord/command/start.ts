import { games } from "@/games";
import { Command } from "@/services/bot/discord/command/index";
import bot from "@/services/bot/discord/index";
import wcUnlimitedModal from "@/services/bot/discord/modal/wc_unlimited";
import { sleep } from "@/utils";
import { ApplicationCommandOptionTypes, logger } from "@discordeno/bot";

const gameOptions: any[] = [];

for (const key in games) {
  const game = games[key as keyof typeof games];
  gameOptions.push({
    name: game.name,
    value: game.key,
    description: game.description,
    type: ApplicationCommandOptionTypes.String,
  });
}

export const command: Command = {
  name: "start",
  description: "Start a game!",
  options: [
    {
      name: "game",
      description: "Choose a game",
      type: ApplicationCommandOptionTypes.String,
      choices: gameOptions,
      required: true,
    },
  ],
  execute: async (interaction) => {
    await sleep(200);

    switch (interaction.data?.options?.[0].value) {
      case games.wordChainUnlimited.key:
        try {
          await bot.rest.sendInteractionResponse(
            interaction.id,
            interaction.token,
            wcUnlimitedModal.modal,
          );
        } catch (error) {
          logger.error(error);
        }

        break;

      default:
        throw new Error("Invalid game");
    }
  },
};

export default command;
