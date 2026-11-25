import { readFile } from "node:fs/promises";

export interface AppConfig {
  prefix: string;
  version: string;
  sync_commands_globally: boolean;
  status_update_interval: number;
  statuses: { type: string; activity: string; text: string }[];
  owners: number[];
}

export const config: AppConfig = JSON.parse(
  await readFile(new URL("../config.json", import.meta.url), "utf8")
);