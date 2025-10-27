import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getMetricsCollector } from "@/lib/memory/metrics";
import { RAGManager } from "@/lib/memory/rag-manager";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}) as any);
  const { query, hints } = body ?? {};

  if (!query) {
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  }

  try {
    const ragManager = new RAGManager();
    const metrics = getMetricsCollector();

    metrics.increment("rag_trigger_count");
    const startTime = Date.now();

    const result = await ragManager.retrieve(query, hints);

    metrics.recordLatency("rag_latency_ms", startTime);

    if (result.degraded) {
      metrics.increment("rag_fallback_count");
    }

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    const metrics = getMetricsCollector();
    metrics.increment("rag_error_count");
    return NextResponse.json(
      { error: "rag_failed", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
