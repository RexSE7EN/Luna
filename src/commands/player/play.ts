import { moonlink } from "@/api/moonlink.js";
import { playTrack } from "@/playback/playerControls.js";
import type { PrefixCommand } from "@/types/prefixCommand.js";

export const playCommand: PrefixCommand = {
  name: "play",
  description: "Search and play a track or playlist.",
  aliases: ["p"],

  async execute({ message }, args): Promise<void> {
    if (!message.guild || !message.channelId) return;

    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
      await message.reply("Join a voice channel first.");
      return;
    }

    const query = args.join(" ").trim();
    if (!query) {
      await message.reply("Provide a song name or URL.");
      return;
    }

    const status = await playTrack(moonlink, {
      guildId: message.guild.id,
      voiceChannelId: voiceChannel.id,
      textChannelId: message.channelId,
      query,
      requester: message.author,
    });

    await message.reply(status);
  },
};
