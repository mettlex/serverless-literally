import { events } from "@/services/bot/events";
import { createBot } from "@discordeno/bot";

export const bot = createBot({
  token: process.env.TOKEN as string,
  events,
});

export default bot;
