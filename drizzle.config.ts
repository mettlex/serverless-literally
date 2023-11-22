import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema/*",
  out: "./db/migrations/",
  strict: true,
} satisfies Config;
