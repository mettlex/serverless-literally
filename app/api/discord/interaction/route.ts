import bot from "@/services/bot/discord";
import { events } from "@/services/bot/discord/events/index";
import { validateRequest, verifySignature } from "@/services/bot/discord/utils";
import { InteractionTypes, logger } from "@discordeno/bot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { error } = validateRequest(req, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });

  logger.info({ error });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  // verifySignature() verifies if the request is coming from Discord.
  // When the request's signature is not valid, we return a 401 and this is
  // important as Discord sends invalid requests to test our verification.
  const { valid, body } = await verifySignature(req);

  logger.info("Request body", body);
  logger.info(`Valid request: ${valid}`);

  if (!valid) {
    return NextResponse.json({ error: "Invalid request" }, { status: 401 });
  }

  const interaction = JSON.parse(body);

  console.log(interaction);

  const { type = 0 } = interaction;

  // Discord performs Ping interactions to test our application.
  // Type 1 in a request implies a Ping interaction.
  if (type === InteractionTypes.Ping) {
    return NextResponse.json({ type: 1 });
  }

  // Discord sends a POST request to our application when a user interacts
  if (type === InteractionTypes.ApplicationCommand) {
    try {
      await bot.events.interactionCreate?.(interaction);
    } catch (error) {
      logger.error(error);
    }

    return NextResponse.json({ type: 5 });
  }

  if (type === InteractionTypes.ModalSubmit) {
    try {
      await events.modalSubmit?.(interaction);
    } catch (error) {
      logger.error(error);
    }

    return NextResponse.json({ type: 5 });
  }

  if (type === InteractionTypes.MessageComponent) {
    try {
      await events.componentInteractionCreate?.(interaction);
    } catch (error) {
      logger.error(error);
    }

    return NextResponse.json({ type: 5 });
  }

  // We will return a bad request error as a valid Discord request
  // shouldn't reach here.
  return NextResponse.json({ error: "bad request" }, { status: 400 });
}
