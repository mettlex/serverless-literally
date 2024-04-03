import commands from "@/services/bot/discord/command/index";
import bot from "@/services/bot/discord/index";
import { CreateSlashApplicationCommand } from "@discordeno/bot";
import { SlashCommand, SlashCreator } from "slash-create";

async function main() {
  const creator = new SlashCreator({
    applicationID: process.env.DISCORD_APP_ID as string,
    publicKey: process.env.DISCORD_PUBLIC_KEY as string,
    token: process.env.DISCORD_TOKEN as string,
  });

  creator.on("debug", (message) => {
    console.log(message);
  });

  creator.on("error", (message) => {
    console.error(message);
  });

  creator.registerCommands(
    [...(commands.values() as Iterable<CreateSlashApplicationCommand>)].map(
      (c) => {
        class SC extends SlashCommand {
          constructor(creator: any) {
            super(creator, {
              name: c.name,
              description: c.description,
              options: c.options as any,
            });
          }
        }

        const command = new SC(creator);

        return command;
      },
    ),
    false,
  );

  await creator.syncCommands({
    deleteCommands: true,
    syncGuilds: true,
    skipGuildErrors: true,
  });
}

async function oldMain() {
  let guildIds: string[] = [];

  try {
    const response = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
      },
    );

    guildIds = guildIds.concat((await response.json()).map((g: any) => g.id));

    console.log(`Found ${guildIds.length} guilds`);

    for (const guildId of guildIds) {
      try {
        await bot.rest.upsertGuildApplicationCommands(guildId, [
          ...commands.values(),
        ]);

        console.log(`Registered commands for guild ${guildId}`);
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }

  while (guildIds.length) {
    try {
      const response: Response = await fetch(
        `https://discord.com/api/v10/users/@me/guilds?after=${
          guildIds[guildIds.length - 1]
        }`,
        {
          method: "GET",
          headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          },
        },
      );

      const newGuildIds = (await response.json()).map((g: any) => g.id);

      for (const guildId of newGuildIds) {
        try {
          await bot.rest.upsertGuildApplicationCommands(guildId, [
            ...commands.values(),
          ]);

          console.log(`Registered commands for guild ${guildId}`);
        } catch (error) {
          console.error(error);
        }
      }

      guildIds = guildIds.concat(newGuildIds);

      console.log(`Found ${guildIds.length} guilds`);
    } catch (_error) {
      break;
    }
  }
}

main()
  .then(() => {
    console.log("Registered all commands successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
