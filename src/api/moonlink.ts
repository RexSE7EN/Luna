import "dotenv/config";
import type { Client } from "discord.js";
import { Connectors, Manager } from "moonlink.js";

export const moonlink = new Manager({
  nodes: [
    {
      host: process.env.NODELINK_HOST ?? "127.0.0.1",
      port: Number(process.env.NODELINK_PORT ?? 2333),
      password: process.env.NODELINK_PASSWORD ?? "youshallnotpass",
      secure: process.env.NODELINK_SECURE === "true",
    },
  ],
});

export function initializeMoonlink(client: Client): void {
  moonlink.use(new Connectors.DiscordJs(), client);
}
