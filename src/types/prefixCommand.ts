import type { Message } from "discord.js";

export interface PrefixCommandContext {
  message: Message;
}

export interface PrefixCommand<Context extends PrefixCommandContext = PrefixCommandContext> {
	name: string;
	description?: string;
	aliases?: string[];
	execute(context: Context, args: string[]): void | Promise<void>;
}
