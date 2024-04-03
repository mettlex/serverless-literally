import { createRestManager } from "@discordeno/rest";

export const AUTHORIZATION = process.env.DISCORD_AUTHORIZATION;

export const REST = createRestManager({
  token: process.env.DISCORD_TOKEN,
});
