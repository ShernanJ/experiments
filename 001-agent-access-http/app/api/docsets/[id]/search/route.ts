import { NextResponse } from "next/server";
import { searchDocset } from "@/lib/docsets";

export const runtime = "nodejs";

/**
 * GET /api/docsets/:id/search?q=...
 *
 * agent POV:
 * - "i have a question"
 * - "give me the best chunks + citations"
 *
 * keep response small + structured so an agent can plug it into a prompt.
 */

type Ctx = { params: { id: string } | Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  // Next can hand params as a plain object OR a promise (depending on version).
  // Promise.resolve() normalizes both cases.
  const { id } = await Promise.resolve(ctx.params);

  // (optional) one-time debug while you’re fixing this
  // console.log("DEBUG id =", id);

  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json(
      { error: "Missing query param `q`" },
      { status: 400 }
    );
  }

  const found = await searchDocset(id, q);

  if (!found) {
    return NextResponse.json({ error: `Unknown docset: ${id}` }, { status: 404 });
  }

  return NextResponse.json({
    docsetId: found.docset.docsetId,
    version: found.docset.version,
    query: q,
    results: found.results,
  });
}
