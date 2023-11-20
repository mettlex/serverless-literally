import { createRestManager } from "@discordeno/rest";

export const AUTHORIZATION = process.env.AUTHORIZATION;

export const REST = createRestManager({
  token: process.env.TOKEN,
});
