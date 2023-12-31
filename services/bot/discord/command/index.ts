import chain_word from "@/services/bot/discord/command/chain_word";
import check_spelling from "@/services/bot/discord/command/check_spelling";
import help from "@/services/bot/discord/command/help";
import ping from "@/services/bot/discord/command/ping";
import refresh from "@/services/bot/discord/command/refresh";
import start from "@/services/bot/discord/command/start";
import stop from "@/services/bot/discord/command/stop";
import { DiscordInteraction } from "@discordeno/bot";
import { CreateApplicationCommand } from "@discordeno/types";

export type Command = CreateApplicationCommand & {
  execute(
    interaction: DiscordInteraction,
    args?: Record<string, any>,
  ): Promise<void>;
};

export const commands = new Map<string, Command>(
  [chain_word, check_spelling, ping, help, refresh, start, stop].map((cmd) => [
    cmd.name,
    cmd,
  ]),
);

export default commands;
