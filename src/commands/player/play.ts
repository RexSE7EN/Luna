import { SlashCommandBuilder, type ChatInputCommandInteraction, type GuildMember } from "discord.js";
import type { Manager } from "moonlink.js";
import { playTrack } from "@/playback/playerControls.js";

export function createPlayCommand(moonlink: Manager) {
  return {
    data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("Search and play a track or playlist in your voice channel.")
      .addStringOption((opt) =>
        opt.setName("query").setDescription("Song name or URL").setRequired(true)
      ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const member = interaction.member as GuildMember | null;
      const voiceChannel = member?.voice.channel;

      if (!interaction.guildId || !interaction.channelId) {
        await interaction.reply({ content: "Use this inside a server.", ephemeral: true });
        return;
      }
      if (!voiceChannel) {
        await interaction.reply({ content: "Join a voice channel first.", ephemeral: true });
        return;
      }

      const query = interaction.options.getString("query", true);
      await interaction.deferReply();

      const status = await playTrack(moonlink, {
        guildId: interaction.guildId,
        voiceChannelId: voiceChannel.id,
        textChannelId: interaction.channelId,
        query,
        requester: interaction.user,
      });

      await interaction.editReply(status);
    },
  };
}