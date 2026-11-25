import type { Message } from "discord.js";
import { config } from "@/config.js";
import { commandRegistry } from "@/commands/commandRegistry.js";

const botPrefix = config.prefix?.trim() || "ln?";

type RegisteredCommand = (typeof commandRegistry)[number];
const handlers = new Map<string, RegisteredCommand>();

for (const command of commandRegistry) {
  for (const name of [command.name, ...(command.aliases ?? [])]) {
    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName) {
      throw new Error(`Command "${command.name}" has an empty name or alias.`);
    }
    if (handlers.has(normalizedName)) {
      throw new Error(`Duplicate prefix command name or alias: "${normalizedName}".`);
    }
    handlers.set(normalizedName, command);
  }
}

export async function handlePrefixMessage(message: Message): Promise<boolean> {
  if (message.author.bot || !message.guild || !message.content.startsWith(botPrefix)) {
    return false;
  }

  const body = message.content.slice(botPrefix.length).trim();
  if (!body) return false;

  const [rawName, ...args] = body.split(/\s+/);
  const name = rawName?.toLowerCase();
  if (!name) return false;

  const command = handlers.get(name);
  if (!command) return false;

  await command.execute({ message }, args);
  return true;
}