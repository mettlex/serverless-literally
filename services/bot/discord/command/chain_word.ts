import { getGameByChannelId } from "@/db/games/wc-unlimited";
import { games } from "@/games";
import { Command } from "@/services/bot/discord/command/index";
import bot from "@/services/bot/discord/index";
import chainWordModal from "@/services/bot/discord/modal/chain_word";
import { sleep } from "@/utils";
import { ApplicationCommandOptionTypes, logger } from "@discordeno/bot";

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
  name: "chain_word",
  description: "Chain word!",
  options: [
    {
      name: "word",
      description: "Enter a word",
      type: ApplicationCommandOptionTypes.String,
      required: true,
    },
  ],
  execute: async (interaction) => {
    if (!interaction.channel_id) {
      return;
    }

    try {
      const game = await getGameByChannelId(interaction.channel_id);

      switch (true) {
        case !!game && game.endedAt === null:
          try {
            await chainWordModal.handle(interaction);
          } catch (error) {
            logger.error(error);
          }

          break;

        default:
          await bot.rest.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
              type: 5,
            },
          );
          await sleep(200);
          await bot.rest.sendFollowupMessage(interaction.token, {
            content: `### There is no game running currently in this channel.`,
          });
          break;
      }
    } catch (error) {
      console.error(error);
    }
  },
};

export default command;
