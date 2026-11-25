import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Manager } from "moonlink.js";
import { stopPlayback } from "@/playback/playerControls.js";

export function createStopCommand(moonlink: Manager) {
  return {
    data: new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Stop playback and disconnect Luna from the voice channel."),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: "This command can only be used inside a server.",
          ephemeral: true,
        });
        return;
      }

      const status = await stopPlayback(moonlink, interaction.guildId);
      await interaction.reply(status);
    },
  };
}