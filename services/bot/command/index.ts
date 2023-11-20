import help from "@/services/bot/command/help";
import ping from "@/services/bot/command/ping";
import { Interaction } from "@discordeno/bot";
import { CreateApplicationCommand } from "@discordeno/types";

export type Command = CreateApplicationCommand & {
  execute(interaction: Interaction, args?: Record<string, any>): Promise<void>;
};

export const commands = new Map<string, Command>(
  [ping, help].map((cmd) => [cmd.name, cmd]),
);

export default commands;
