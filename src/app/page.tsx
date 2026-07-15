import HomeClient from "@/components/HomeClient";
import { getSiteConfig } from "@/lib/site-config";

// Config is edited at runtime via /admin and written to a JSON file on disk,
// so this route must not be statically cached at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const config = await getSiteConfig();
  return <HomeClient config={config} />;
}
