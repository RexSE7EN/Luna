import "dotenv/config";
import { REST, Routes } from "discord.js";
import { Manager } from "moonlink.js";
import { createStatsCommand } from "@/commands/utility/stats.js";
import { createPlayCommand } from "@/commands/player/play.js";
import { createStopCommand } from "@/commands/player/stop.js";
import { createSkipCommand } from "@/commands/player/skip.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_DEV_GUILD_ID;

if (!token || !clientId) {
  throw new Error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment variables.");
}

// Lightweight placeholder manager just to construct the command definition
const moonlink = new Manager({
  nodes: [
    {
      host: process.env.NODELINK_HOST ?? "127.0.0.1",
      port: Number(process.env.NODELINK_PORT ?? 2333),
      password: process.env.NODELINK_PASSWORD ?? "youshallnotpass",
      secure: process.env.NODELINK_SECURE === "true",
    },
  ],
});

const commandFactories = [
  createStatsCommand,
  createStopCommand,
  createPlayCommand,
  createSkipCommand,
];

const commands = commandFactories.map((createCommand) =>
  createCommand(moonlink).data.toJSON()
);

const rest = new REST({ version: "10" }).setToken(token);

if (guildId) {
  const registered = await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
  );
  console.log(`Registered ${(registered as unknown[]).length} guild command(s) for guild ${guildId}.`);
} else {
  const registered = await rest.put(
    Routes.applicationCommands(clientId),
    { body: commands }
  );
  console.log(`Registered ${(registered as unknown[]).length} global command(s).`);
}