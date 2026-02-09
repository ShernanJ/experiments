import { NextResponse } from "next/server";
import { listDocsets } from "@/lib/docsets";

// route handlers run on server - nodejs runtime keeps this lightweight
export const runtime = "nodejs";

/**
 * GET /api/docsets
 * 
 * returns a list of available docsets
 * this is "capability discovery" - agents need to know what they can ask for
 * 
 */

export async function GET() {
  const docsets = await listDocsets();

  return NextResponse.json({
    docsets,
  });
}