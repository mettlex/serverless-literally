export class WordChainUnlimited {
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
    WordChainUnlimited.defaultGameRuleFlags;

  getGameRuleFlagsBitField() {
    return WordChainUnlimited.fromGameRuleFlagsToBitField(this.gameRuleFlags);
  }

  setGameRuleFlagsBitField(bitfield: bigint) {
    this.gameRuleFlags =
      WordChainUnlimited.fromBitFieldToGameRuleFlags(bitfield);
  }

  static fromBitFieldToGameRuleFlags(bitfield: bigint) {
    const flags = {
      ...WordChainUnlimited.defaultGameRuleFlags,
    };

    for (const [name, rule] of Object.entries(
      WordChainUnlimited.defaultGameRuleFlags,
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
      WordChainUnlimited.fromGameRuleFlagsToBitField(
        WordChainUnlimited.defaultGameRuleFlags,
      ) ^ bitmask
    );
  }
}

export type WordChainUnlimitedGameRuleFlags =
  typeof WordChainUnlimited.defaultGameRuleFlags;
