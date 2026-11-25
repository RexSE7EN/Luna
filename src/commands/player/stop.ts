import { moonlink } from "@/api/moonlink.js";
import { stopPlayback } from "@/playback/playerControls.js";
import type { PrefixCommand } from "@/types/prefixCommand.js";

export const stopCommand: PrefixCommand = {
  name: "stop",
  description: "Stop playback and disconnect Luna from the voice channel.",

  async execute({ message }): Promise<void> {
    if (!message.guild) {
      await message.reply("This command can only be used inside a server.");
      return;
    }

    const status = await stopPlayback(moonlink, message.guild.id);
    await message.reply(status);
  },
};