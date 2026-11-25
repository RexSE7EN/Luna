import { moonlink } from "@/api/moonlink.js";
import { skipTrack } from "@/playback/playerControls.js";
import type { PrefixCommand } from "@/types/prefixCommand.js";

export const skipCommand: PrefixCommand = {
  name: "skip",
  description: "Skip the currently playing track.",
  aliases: ["s"],

  async execute({ message }): Promise<void> {
    if (!message.guild) {
      await message.reply("This command can only be used inside a server.");
      return;
    }

    const status = await skipTrack(moonlink, message.guild.id);
    await message.reply(status);
  },
};