import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Manager } from "moonlink.js";
import { skipTrack } from "@/playback/playerControls.js";

export function createSkipCommand(moonlink: Manager) {
  return {
    data: new SlashCommandBuilder()
      .setName("skip")
      .setDescription("Skip the currently playing track."),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: "This command can only be used inside a server.",
          ephemeral: true,
        });
        return;
      }

      const status = await skipTrack(moonlink, interaction.guildId);
      await interaction.reply(status);
    },
  };
}