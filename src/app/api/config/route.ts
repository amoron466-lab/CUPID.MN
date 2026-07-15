import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, saveSiteConfig, DEFAULT_SITE_CONFIG, type SiteConfig } from "@/lib/site-config";
import { ADMIN_PASSWORD } from "@/lib/admin-auth";

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const config: SiteConfig = { ...DEFAULT_SITE_CONFIG };
  for (const key of Object.keys(DEFAULT_SITE_CONFIG) as (keyof SiteConfig)[]) {
    const value = body[key];
    if (typeof value === "string" && value.trim() !== "") {
      config[key] = value;
    }
  }

  try {
    await saveSiteConfig(config);
  } catch {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
