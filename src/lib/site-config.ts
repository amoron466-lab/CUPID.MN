import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_SITE_CONFIG, type SiteConfig } from "./site-config-defaults";

export type { SiteConfig };
export { DEFAULT_SITE_CONFIG };

const CONFIG_PATH = path.join(process.cwd(), "content", "site-config.json");

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
