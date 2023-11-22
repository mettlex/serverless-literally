import { refreshCommandsForGuild } from "@/services/bot/discord/utils";

async function main() {
  if (process.argv.length < 3) {
    console.error("Missing arguments");
    process.exit(1);
  }

  const guildId = process.argv[2];

  console.log(`Refreshing commands for guild ${guildId}`);

  await refreshCommandsForGuild(guildId);
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
