import bot from "@/services/bot";
import { validateRequest, verifySignature } from "@/services/bot/discord/utils";
import { logger } from "@discordeno/bot";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { error } = validateRequest(req, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });

  logger.info({ error });

  if (error) {
    return res.status(error.status).json({ error: error.message });
  }

  // verifySignature() verifies if the request is coming from Discord.
  // When the request's signature is not valid, we return a 401 and this is
  // important as Discord sends invalid requests to test our verification.
  const { valid, body } = await verifySignature(req);

  logger.info(`Valid request: ${valid}`);

  if (!valid) {
    return res.status(401).json({ error: "Invalid request" });
  }

  const interaction = JSON.parse(body) as {
    type: number;
  };

  const { type = 0 } = interaction;

  // Discord performs Ping interactions to test our application.
  // Type 1 in a request implies a Ping interaction.
  if (type === 1) {
    return res.status(200).json({ type: 1 });
  }

  // Discord sends a POST request to our application when a user interacts
  if (type === 2) {
    try {
      bot.events.interactionCreate?.(req.body);
    } catch (error) {
      logger.error(error);
    }

    return res.status(200).json({
      type: 5,
    });
  }

  // We will return a bad request error as a valid Discord request
  // shouldn't reach here.
  return res.status(400).json({ error: "bad request" });
}
