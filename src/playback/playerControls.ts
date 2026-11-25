import type { Manager } from "moonlink.js";

export interface PlayTrackInput {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  query: string;
  requester: unknown;
}

export async function playTrack(
  moonlink: Manager,
  { guildId, voiceChannelId, textChannelId, query, requester }: PlayTrackInput
): Promise<string> {
  const formattedQuery = query.trim();
  
  if (!formattedQuery) {
    return "Please provide a search query.";
  }

  const result = await moonlink.search({
    query: formattedQuery,
    requester,
  });

  if (!result || result.loadType === "empty" || result.loadType === "error" || !result.tracks?.length) {
    return `No results found for **${query}**.`;
  }

  const player =
    moonlink.players.get(guildId) ??
    moonlink.players.create({
      guildId,
      voiceChannelId,
      textChannelId,
    });

  if (!player.connected) {
    player.connect({ selfDeaf: true, selfMute: false });
  }

  if (result.loadType === "playlist") {
    for (const track of result.tracks) {
      player.queue.add(track);
    }
    if (!player.playing) {
      await player.play();
    }
    return `Queued **${result.tracks.length}** tracks from **${result.playlistInfo?.name ?? "Playlist"}**.`;
  }

  const track = result.tracks[0];
  if (!track) {
    return "Could not load that track.";
  }

  player.queue.add(track);
  if (!player.playing) {
    await player.play();
  }

  return `Queued **${track.title}**.`;
}

export async function stopPlayback(moonlink: Manager, guildId: string): Promise<string> {
  const player = moonlink.players.get(guildId);
  if (!player) {
    return "There is no active player in this server.";
  }

  await Promise.resolve(player.destroy());
  return "Stopped playback and disconnected from the voice channel.";
}

export async function skipTrack(moonlink: Manager, guildId: string): Promise<string> {
  const player = moonlink.players.get(guildId);
  if (!player || (!player.playing && !player.paused)) {
    return "Nothing is currently playing.";
  }

  try {
    await Promise.resolve(player.skip());
    return "Skipped the current track.";
  } catch (err) {
    console.error(`Failed to skip track in guild ${guildId}:`, err);
    return "Could not skip the current track.";
  }
}