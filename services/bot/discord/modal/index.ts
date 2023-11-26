import chainWorldModal from "@/services/bot/discord/modal/chain_word";
import wcUnlimitedModal from "@/services/bot/discord/modal/wc_unlimited";
import { DiscordInteraction, InteractionResponse } from "@discordeno/bot";

export type Modal = {
  name: string;
  modal: InteractionResponse;
  handle(
    interaction: DiscordInteraction,
    args?: Record<string, any>,
  ): Promise<void>;
};

export const handlers = new Map<string, Modal>(
  [wcUnlimitedModal, chainWorldModal].map((cmd) => [cmd.name, cmd]),
);

export default handlers;
