import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PASSWORD } from "@/lib/admin-auth";

// Verifies the admin password server-side so it never has to ship inside
// the client JS bundle for the /admin page.
export async function POST(request: NextRequest) {
  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
