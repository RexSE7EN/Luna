import { playCommand } from "@/commands/player/play.js";
import { skipCommand } from "@/commands/player/skip.js";
import { stopCommand } from "@/commands/player/stop.js";
import { statsCommand } from "@/commands/utility/stats.js";
import type { PrefixCommand } from "@/types/prefixCommand.js";

export const commandRegistry: PrefixCommand[] = [
  playCommand,
  skipCommand,
  stopCommand,
  statsCommand,
];
