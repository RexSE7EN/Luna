import {
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Manager, Node } from "moonlink.js";

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    `${minutes}m`,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function createStatsCommand(moonlink: Manager) {
  return {
    data: new SlashCommandBuilder()
      .setName("stats")
      .setDescription("Check Moonlink node readiness, latency, and resource stats."),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const { hasOnlineNodes, hasReady, nodes, ready, onlineNodes } = moonlink.nodes;

      const embed = new EmbedBuilder()
        .setTitle("Audio Node Status")
        .setColor(hasReady ? 0x57f287 : hasOnlineNodes ? 0xfee75c : 0xed4245)
        .addFields({
          name: "Overview",
          value: [
            `**Online Nodes:** ${onlineNodes.length}/${nodes.size} (${hasOnlineNodes ? "Yes" : "No"})`,
            `**Ready for Playback:** ${ready.length}/${nodes.size} (${hasReady ? "Yes" : "No"})`,
            `**Gateway Ping:** ${interaction.client.ws.ping}ms`,
          ].join("\n"),
        })
        .setTimestamp();

      if (nodes.size === 0) {
        embed.setDescription("No audio nodes are currently configured.");
      } else {
        var cNode = 1;
        for (const [id, node] of nodes) {
          const isReady = ready.some((n: Node) => n.identifier === id);
          const statusLabel = isReady
            ? "Ready"
            : node.connected
              ? "Connected (Not Ready)"
              : "Disconnected";

          const stats = node.stats;
          const details = stats
            ? [
                `**State:** ${statusLabel}`,
                `**Ping:** ${node.latency >= 0 ? `${node.latency}ms` : "N/A"}`,
                `**Players:** ${stats.playingPlayers} playing / ${stats.players} total`,
                `**Memory:** ${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.allocated)}`,
                `**CPU Load:** ${(stats.cpu.systemLoad * 100).toFixed(1)}% system | ${(stats.cpu.lavalinkLoad * 100).toFixed(1)}% node`,
                `**Uptime:** ${formatUptime(stats.uptime)}`,
              ].join("\n")
            : `**State:** ${statusLabel}\n**Stats:** Waiting for first telemetry payload...`;

          embed.addFields({
            name: `Node: ${cNode}`,
            value: details,
          });
          cNode++;
        }
      }

      await interaction.reply({ embeds: [embed] });
    },
  };
}