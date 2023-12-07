import {
  addChainedWordByChannelId,
  getGameByChannelId,
  setGameByChannelId,
} from "@/db/games/wc-unlimited";
import { checkSpell } from "@/games/wordchain/lib/api/wiktionary";
import {
  WordChainUnlimited,
  WordChainUnlimitedExtra,
} from "@/games/wordchain/unlimited";
import bot from "@/services/bot/discord/index";
import { Modal } from "@/services/bot/discord/modal/index";
import { sleep } from "@/utils";
import {
  ButtonComponent,
  ButtonStyles,
  DiscordInputTextComponent,
  InputTextComponent,
  InteractionResponse,
  InteractionResponseTypes,
  MessageComponentTypes,
  logger,
} from "@discordeno/bot";

const name = "wc_unlimited";

const textInput: InputTextComponent = {
  type: MessageComponentTypes.InputText,
  customId: "word",
  label: "Word to start the chain",
  style: 1,
  minLength: 1,
  maxLength: 200,
  placeholder: "Enter a word here",
  required: true,
};

const counter = (count: number): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "counter",
  label: `${count}`,
  style: ButtonStyles.Secondary,
  emoji: { name: "✅" },
  disabled: true,
});

const resetCounter = (): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "counter",
  label: `0`,
  style: ButtonStyles.Secondary,
  emoji: { name: "❌" },
  disabled: true,
});

const chainWordBtn = (): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "chain_word",
  label: "word",
  style: ButtonStyles.Primary,
  emoji: { name: "⛓️" },
  disabled: false,
});

const player = (name: string): ButtonComponent => ({
  type: MessageComponentTypes.Button,
  customId: "player",
  label: name,
  style: ButtonStyles.Secondary,
  emoji: { name: "✍️" },
  disabled: true,
});

const modal: InteractionResponse = {
  type: InteractionResponseTypes.Modal,
  data: {
    title: "Start the game",
    customId: name,
    components: [
      {
        type: 1,
        components: [textInput],
      },
    ],
  },
};

export const handler: Modal = {
  name,
  modal,
  handle: async (interaction) => {
    if (
      !interaction.channel_id ||
      !interaction.guild_id ||
      !interaction.member?.user.id
    )
      return;

    await bot.rest.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: 5,
      },
    );

    await sleep(200);

    const word = (
      interaction.data?.components?.[0]
        .components?.[0] as DiscordInputTextComponent
    ).value
      ?.trim()
      ?.toLowerCase()
      ?.split(" ")
      .at(-1);

    if (!word) return;

    const playerName =
      interaction.member?.nick ||
      interaction.member?.user.global_name ||
      interaction.user?.global_name ||
      interaction.user?.username;

    if (!playerName) return;

    try {
      const correctSpelling = await checkSpell(word);

      if (!correctSpelling) {
        await bot.rest.sendFollowupMessage(
          interaction.token,
          {
            content: `> **${word}**\nThe word is incorrect according to Wiktionary.`,
            components: [
              {
                type: MessageComponentTypes.ActionRow,
                components: [
                  resetCounter(),
                  player(playerName),
                ],
              },
            ],
          },
        );

        return;
      }

      if (!correctSpelling) return;

      const game = await getGameByChannelId(
        interaction.channel_id,
      );

      logger.info({ game });

      if (!game) {
        const extra = new WordChainUnlimitedExtra();

        const newGame: WordChainUnlimited = {
          count: 1,

          lastCorrectWord: word,
          lastCorrectWordPlayerId:
            interaction.member.user.id,

          starterUserId: interaction.member.user.id,

          discordChannelId: interaction.channel_id,
          discordGuildId: interaction.guild_id,

          longestWord: word,

          ruleFlags:
            WordChainUnlimitedExtra.fromGameSettingsFlagsToBitField(
              WordChainUnlimitedExtra.defaultGameSettingsFlags,
            ),

          endedAt: null,

          ...extra,
        };

        await addChainedWordByChannelId(
          interaction.channel_id,
          word,
        );

        await setGameByChannelId(
          interaction.channel_id,
          newGame,
        );

        await bot.rest.sendFollowupMessage(
          interaction.token,
          {
            content: `> **${word}**`,
            components: [
              {
                type: MessageComponentTypes.ActionRow,
                components: [
                  counter(1),
                  player(playerName),
                  chainWordBtn(),
                ],
              },
            ],
          },
        );
      } else if (game.endedAt === null) {
        await bot.rest.sendFollowupMessage(
          interaction.token,
          {
            content: `### There is already a game running in this channel. You may use \`/stop\` command if you have "Manage Channels" permission.`,
          },
        );
      }
    } catch (error) {
      logger.error(error);
    }
  },
};

export default handler;
