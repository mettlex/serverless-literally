export type GameMetadata = {
  [key: string]: {
    name: string;
    description: string;
    key: string;
  };
};

export const games = {
  wordChainUnlimited: {
    key: "wordChainUnlimited",
    name: "Word Chain (Unlimited)",
    description: "It's an unlimited mode of the word chain game.",
  },
} as const satisfies GameMetadata;
