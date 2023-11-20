import interactionCreate from "@/services/bot/events/interactionCreate";
import type { EventHandlers } from "@discordeno/bot";

export const events = {
  interactionCreate,
} satisfies Partial<EventHandlers>;
