import { events } from "@/services/bot/discord/events";
import { createBot } from "@discordeno/bot";

export const bot = createBot({
  token: process.env.DISCORD_TOKEN as string,
  events,
});

export default bot;
