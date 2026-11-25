import "dotenv/config";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { Connectors, Manager } from "moonlink.js";

// Bot commands imports
import { handlePrefixMessage } from "@/commands/prefixCommands.js";
import { createPlayCommand } from "@/commands/player/play.js";
import { createStopCommand } from "@/commands/player/stop.js";
import { createSkipCommand } from "@/commands/player/skip.js";
import { createStatsCommand } from "@/commands/utility/stats.js";

export type SlashCommandData =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export interface BotCommand {
  data: SlashCommandData;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("Missing DISCORD_TOKEN in environment variables.");
}

const nodeHost = process.env.NODELINK_HOST ?? "127.0.0.1";
const nodePort = Number(process.env.NODELINK_PORT ?? 2333);
const nodePassword = process.env.NODELINK_PASSWORD ?? "youshallnotpass";
const nodeSecure = process.env.NODELINK_SECURE === "true";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
}) as Client & { commands?: Collection<string, BotCommand> };

client.commands = new Collection<string, BotCommand>();

const moonlink = new Manager({
  nodes: [
    {
      host: nodeHost,
      port: nodePort,
      password: nodePassword,
      secure: nodeSecure,
    },
  ],
});

// Register commands
const commands = [
  createStatsCommand(moonlink),
  createPlayCommand(moonlink),
  createStopCommand(moonlink),
  createSkipCommand(moonlink),
];

for (const command of commands) {
  client.commands.set(command.data.name, command);
}

moonlink.use(new Connectors.DiscordJs(), client);

moonlink.on("nodeReady", (node) => {
  console.log(`NodeLink ready: ${node.host}:${node.port}`);
});

moonlink.on("nodeError", (node, error) => {
  console.error(`NodeLink error on ${node.host}:${node.port}:`, error);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`Received /${interaction.commandName} in guild ${interaction.guildId}`);
  const command = client.commands?.get(interaction.commandName);
  if (!command) {
    console.warn(`No handler registered for /${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing /${interaction.commandName}:`, error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Something went wrong while running that command.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Something went wrong while running that command.",
        ephemeral: true,
      });
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await handlePrefixMessage(message, moonlink);
  } catch (err) {
    console.error("Error handling prefix command:", err);
    if (!message.author.bot && message.guild) {
      await message.reply("Something went wrong running that command.").catch(() => {});
    }
  }
});

await client.login(token);