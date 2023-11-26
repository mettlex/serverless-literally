import {
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

    await bot.rest.sendInteractionResponse(interaction.id, interaction.token, {
      type: 5,
    });

    await sleep(200);

    const word = (
      interaction.data?.components?.[0]
        .components?.[0] as DiscordInputTextComponent
    ).value;

    if (!word) return;

    const playerName =
      interaction.member?.nick ||
      interaction.member?.user.global_name ||
      interaction.user?.global_name ||
      interaction.user?.username;

    try {
      const result = await bot.rest.sendFollowupMessage(interaction.token, {
        content: `### ${playerName}: ${word}`,
      });

      const correctSpelling = await checkSpell(word);

      let emoji = "";

      if (correctSpelling) {
        emoji = "✅";
      } else {
        emoji = "❌";
        await bot.rest.addReaction(result.channelId, result.id, emoji);
        return;
      }

      if (!correctSpelling) return;

      const game = await getGameByChannelId(interaction.channel_id);

      logger.info({ game });

      if (!game) {
        const extra = new WordChainUnlimitedExtra();

        const newGame: WordChainUnlimited = {
          id: Math.floor(Math.random() * 1000000000),
          count: 0,
          starterUserId: interaction.member.user.id,
          discordChannelId: interaction.channel_id,
          discordGuildId: interaction.guild_id,
          createdAt: new Date(),
          ruleFlags: WordChainUnlimitedExtra.fromGameRuleFlagsToBitField(
            WordChainUnlimitedExtra.defaultGameRuleFlags,
          ),
          endedAt: null,
          ...extra,
        };

        await setGameByChannelId(interaction.channel_id, newGame);

        await bot.rest.addReaction(result.channelId, result.id, emoji);
      } else if (game.endedAt === null) {
        await bot.rest.sendFollowupMessage(interaction.token, {
          content: `### There is already a game running in this channel. You may use \`/stop\` command if you have "Manage Channels" permission.`,
        });
      }
    } catch (error) {
      logger.error(error);
    }
  },
};

export default handler;
