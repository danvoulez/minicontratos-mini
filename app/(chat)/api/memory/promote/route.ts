import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { MemoryManager } from "@/lib/memory/manager";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}) as any);
  const { ownerId, key, force, merge, reason, requestId } = body ?? {};

  if (!ownerId || ownerId !== session.user.id) {
    return NextResponse.json({ error: "forbidden_owner" }, { status: 403 });
  }

  if (!key) {
    return NextResponse.json({ error: "missing_key" }, { status: 400 });
  }

  const conn = process.env.POSTGRES_URL;
  if (!conn) {
    return NextResponse.json({ error: "missing_db" }, { status: 500 });
  }

  try {
    const mgr = new MemoryManager(conn);
    const result = await mgr.promote({
      ownerId,
      key,
      force,
      merge,
      reason,
      requestId,
      actorId: session.user.id,
      actorRole: "user", // Could be determined from session
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "promote_failed", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
