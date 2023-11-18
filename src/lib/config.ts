import { readFileSync, writeFileSync } from "fs";
import path from "path";

export interface Config {
  lastFetchedFeedCursor: string | null;
}
const configFilePath = path.resolve(process.cwd(), "src/storage/config.json");

export function getConfig() {
  const configFile = JSON.parse(
    readFileSync(configFilePath, "utf-8")
  ) as Config;

  return configFile;
}

export function updateLastFetchedFeedCursor(cursor: string) {
  const config = getConfig();

  config.lastFetchedFeedCursor = cursor;

  writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}
