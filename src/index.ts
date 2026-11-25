import { Client, Events, GatewayIntentBits } from "discord.js";
import { initializeMoonlink, moonlink } from "@/api/moonlink.js";
import { config } from "@/config.js";

import { handlePrefixMessage } from "@/commands/commandHandler.js";

console.log(`Starting bot with prefix: ${config.prefix}`);

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("Missing DISCORD_TOKEN in environment variables.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

initializeMoonlink(client);

moonlink.on("nodeReady", (node) => {
  console.log(`NodeLink ready: ${node.host}:${node.port}`);
});

moonlink.on("nodeError", (node, error) => {
  console.error(`NodeLink error on ${node.host}:${node.port}:`, error);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await handlePrefixMessage(message);
  } catch (err) {
    console.error("Error handling prefix command:", err);
    if (!message.author.bot && message.guild) {
      await message.reply("Something went wrong running that command.").catch(() => {});
    }
  }
});

await client.login(token);