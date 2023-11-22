import interactionCreate from "@/services/bot/discord/events/interactionCreate";
import modalSubmit from "@/services/bot/discord/events/modalSubmit";
import type { EventHandlers } from "@discordeno/bot";

type DiscordEventHandlers = EventHandlers & {
  modalSubmit: typeof modalSubmit;
};

export const events = {
  interactionCreate,
  modalSubmit,
} satisfies Partial<DiscordEventHandlers>;
