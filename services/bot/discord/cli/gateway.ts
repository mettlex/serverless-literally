import { REST } from "@/services/rest/index";
import { createGatewayManager } from "@discordeno/gateway";

export const GATEWAY = createGatewayManager({
  token: process.env.TOKEN || "",
  events: {},
  shardsPerWorker: 10,
  totalWorkers: 5,
  connection: await REST.getSessionInfo(),
});

async function main() {
  try {
    await GATEWAY.spawnShards();
  } catch (error) {
    console.error(error);
  }
}

main();
