import { WordChainUnlimitedInDatabase } from "@/db/schema/word-chain-unlimited-schema";

export type WordChainUnlimited = WordChainUnlimitedInDatabase &
  WordChainUnlimitedExtra;

export class WordChainUnlimitedExtra {
  static defaultGameRuleFlags = {
    differentPlayerInEachTurn: { order: 1, enabled: true },
    wrongWordBreaksChain: { order: 2, enabled: true },
    totalWordCount: { order: 3, enabled: true },
    perPlayerWordCount: { order: 4, enabled: true },
    recordLongestChainPlayers: { order: 5, enabled: true },
    recordLongestWord: { order: 6, enabled: true },
    recordShortestWord: { order: 7, enabled: true },
  };

  gameRuleFlags: WordChainUnlimitedGameRuleFlags =
    WordChainUnlimitedExtra.defaultGameRuleFlags;

  static fromBitFieldToGameRuleFlags(bitfield: bigint) {
    const flags = {
      ...WordChainUnlimitedExtra.defaultGameRuleFlags,
    };

    for (const [name, rule] of Object.entries(
      WordChainUnlimitedExtra.defaultGameRuleFlags,
    )) {
      const bit = bitfield & 1n;

      flags[name as keyof WordChainUnlimitedGameRuleFlags] = {
        ...rule,
        enabled: bit === 1n,
      };

      bitfield >>= 1n;
    }

    return flags;
  }

  static fromGameRuleFlagsToBitField(
    flags: WordChainUnlimitedGameRuleFlags,
  ): bigint {
    let bitfield = 0n;

    const sortedRules = Object.values(flags).sort((a, b) => a.order - b.order);

    for (const rule of sortedRules) {
      bitfield <<= 1n;

      if (rule.enabled) {
        bitfield |= 1n;
      }
    }

    return bitfield;
  }

  static overwriteGameRuleFlags(bitmask: bigint): bigint {
    return (
      WordChainUnlimitedExtra.fromGameRuleFlagsToBitField(
        WordChainUnlimitedExtra.defaultGameRuleFlags,
      ) ^ bitmask
    );
  }
}

export type WordChainUnlimitedGameRuleFlags =
  typeof WordChainUnlimitedExtra.defaultGameRuleFlags;
