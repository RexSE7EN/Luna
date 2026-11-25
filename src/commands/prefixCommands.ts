import type { Message } from "discord.js";
import type { Manager } from "moonlink.js";
import { playTrack, skipTrack, stopPlayback } from "@/playback/playerControls.js";

const botPrefix = process.env.BOT_PREFIX ?? "l!";

type PrefixHandler = (message: Message, args: string[], moonlink: Manager) => Promise<void>;

const handlers: Record<string, PrefixHandler> = {
  p: handlePlay,
  play: handlePlay,
  s: handleSkip,
  stop: handleStop,
  skip: handleSkip,
};

async function handlePlay(message: Message, args: string[], moonlink: Manager): Promise<void> {
  if (!message.guild || !message.channelId) return;

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    await message.reply("Join a voice channel first.");
    return;
  }

  const query = args.join(" ").trim();
  if (!query) {
    await message.reply("Provide a song name or URL—for example: `>p blinding lights`.");
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
}

async function handleStop(message: Message, _args: string[], moonlink: Manager): Promise<void> {
  if (!message.guild) return;
  const status = await stopPlayback(moonlink, message.guild.id);
  await message.reply(status);
}

async function handleSkip(message: Message, _args: string[], moonlink: Manager): Promise<void> {
  if (!message.guild) return;
  const status = await skipTrack(moonlink, message.guild.id);
  await message.reply(status);
}

export async function handlePrefixMessage(message: Message, moonlink: Manager): Promise<boolean> {
  if (message.author.bot || !message.guild || !message.content.startsWith(botPrefix)) {
    return false;
  }

  const body = message.content.slice(botPrefix.length).trim();
  if (!body) return false;

  const [rawName, ...args] = body.split(/\s+/);
  const name = rawName?.toLowerCase();
  if (!name) return false;

  const handler = handlers[name];
  if (!handler) return false;

  await handler(message, args, moonlink);
  return true;
}