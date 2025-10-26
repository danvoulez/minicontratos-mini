import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { MemoryManager } from "@/lib/memory/manager";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as any));
  const { ownerId, ids, keys, requestId } = body ?? {};

  if (!ownerId || ownerId !== session.user.id) {
    return NextResponse.json({ error: "forbidden_owner" }, { status: 403 });
  }

  const conn = process.env.POSTGRES_URL;
  if (!conn) {
    return NextResponse.json({ error: "missing_db" }, { status: 500 });
  }

  try {
    const mgr = new MemoryManager(conn);
    const result = await mgr.deleteByIdsOrKeys({ ownerId, ids, keys, requestId, actorId: session.user.id });
    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "delete_failed", message: String(e?.message || e) }, { status: 500 });
  }
}
