import componentInteractionCreate from "@/services/bot/discord/events/componentInteractionCreate";
import interactionCreate from "@/services/bot/discord/events/interactionCreate";
import modalSubmit from "@/services/bot/discord/events/modalSubmit";
import type { EventHandlers } from "@discordeno/bot";

type DiscordEventHandlers = EventHandlers & {
  modalSubmit: typeof modalSubmit;
  componentInteractionCreate: typeof componentInteractionCreate;
};

export const events = {
  interactionCreate,
  modalSubmit,
  componentInteractionCreate,
} satisfies Partial<DiscordEventHandlers>;
