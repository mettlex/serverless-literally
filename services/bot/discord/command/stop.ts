import { setGameByChannelId } from "@/db/games/wc-unlimited";
import { games } from "@/games";
import { Command } from "@/services/bot/discord/command/index";
import bot from "@/services/bot/discord/index";
import { sleep } from "@/utils";
import { ApplicationCommandOptionTypes } from "@discordeno/bot";

const gameOptions = [];

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
  name: "stop",
  description: "Stop a game.",
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
    await bot.rest.sendInteractionResponse(interaction.id, interaction.token, {
      type: 5,
    });

    await sleep(200);

    switch (interaction.data?.options?.[0].value) {
      case games.wordChainUnlimited.key:
        if (!interaction.channel_id) break;

        console.log({ perms: interaction.member?.permissions });

        try {
          await setGameByChannelId(interaction.channel_id, undefined);

          await bot.rest.sendFollowupMessage(interaction.token, {
            content: `### The game has been stopped.`,
          });
        } catch (error) {
          console.error(error);
        }

        break;

      default:
        throw new Error("Invalid game");
    }
  },
};

export default command;
