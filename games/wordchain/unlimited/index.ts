import { WordChainUnlimitedInDatabase } from "@/db/schema/word-chain-unlimited-schema";

export type WordChainUnlimited = WordChainUnlimitedInDatabase &
  WordChainUnlimitedExtra;

export class WordChainUnlimitedExtra {
  static defaultGameSettingsFlags = {
    differentPlayerInEachTurn: { order: 1, enabled: true },
    wrongWordBreaksChain: { order: 2, enabled: true },
    totalWordCount: { order: 3, enabled: true },
    perPlayerWordCount: { order: 4, enabled: true },
    recordLongestChainPlayers: { order: 5, enabled: true },
    recordLongestWord: { order: 6, enabled: true },
    recordShortestWord: { order: 7, enabled: true },
  };

  gameSettingsFlags: WordChainUnlimitedGameSettingsFlags =
    WordChainUnlimitedExtra.defaultGameSettingsFlags;

  static fromBitFieldToGameSettingsFlags(bitfield: bigint) {
    const flags = {
      ...WordChainUnlimitedExtra.defaultGameSettingsFlags,
    };

    for (const [name, setting] of Object.entries(
      WordChainUnlimitedExtra.defaultGameSettingsFlags,
    )) {
      const bit = bitfield & 1n;

      flags[name as keyof WordChainUnlimitedGameSettingsFlags] = {
        ...setting,
        enabled: bit === 1n,
      };

      bitfield >>= 1n;
    }

    return flags;
  }

  static fromGameSettingsFlagsToBitField(
    flags: WordChainUnlimitedGameSettingsFlags,
  ): bigint {
    let bitfield = 0n;

    const sortedSettings = Object.values(flags).sort(
      (a, b) => a.order - b.order,
    );

    for (const setting of sortedSettings) {
      bitfield <<= 1n;

      if (setting.enabled) {
        bitfield |= 1n;
      }
    }

    return bitfield;
  }

  static overwriteGameSettingsFlags(bitmask: bigint): bigint {
    return (
      WordChainUnlimitedExtra.fromGameSettingsFlagsToBitField(
        WordChainUnlimitedExtra.defaultGameSettingsFlags,
      ) ^ bitmask
    );
  }
}

export type WordChainUnlimitedGameSettingsFlags =
  typeof WordChainUnlimitedExtra.defaultGameSettingsFlags;
