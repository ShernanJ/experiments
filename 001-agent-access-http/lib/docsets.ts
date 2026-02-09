/**
 * docsets.ts
 *
 * this file simulates a tiny "documentation store".
 * in real docforge, this would be backed by:
 * - a database (postgres)
 * - object storage (for raw pages)
 * - indexes (fts / embeddings)
 *
 * for experiment 001:
 * - everything is local
 * - everything is synchronous + simple
 * - the goal is understanding agent access, not scale
 */

import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

/**
 * ----------------------------
 * schemas (runtime safety)
 * ----------------------------
 *
 * even though this is "just an experiment",
 * we validate the JSON we load so we:
 * - catch bad data early
 * - document expected shapes explicitly
 *
 * this mirrors how agents rely on stable contracts.
 */

const ChunkSchema = z.object({
  chunkId: z.string(),
  title: z.string(),
  url: z.string().url(),
  content: z.string(),
});

const DocsetSchema = z.object({
  docsetId: z.string(),
  name: z.string(),
  version: z.string(),
  updatedAt: z.string(),
  chunks: z.array(ChunkSchema),
});

export type Docset = z.infer<typeof DocsetSchema>;
export type Chunk = z.infer<typeof ChunkSchema>;

/**
 * ----------------------------
 * helpers
 * ----------------------------
 */

/**
 * very rough token estimate.
 *
 * agents care about token cost.
 * we don’t need accuracy here — just signal.
 */
function tokensApprox(text: string) {
  // ~4 characters per token is a common heuristic
  return Math.ceil(text.length / 4);
}

/**
 * ----------------------------
 * loading docsets
 * ----------------------------
 */

/**
 * load a docset from disk by id.
 *
 * this simulates:
 * - fetching a docset from storage
 * - validating its structure
 *
 * later this will be:
 * - a database query
 * - or an object store read
 */
export async function loadDocset(id: string): Promise<Docset | null> {
  const filePath = path.join(process.cwd(), "data", `${id}.json`);

  try {
    const raw = await fs.readFile(filePath, "utf-8");

    // parse + validate
    const parsed = DocsetSchema.parse(JSON.parse(raw));
    return parsed;
  } catch (err) {
    // missing file, invalid json, or schema mismatch
    return null;
  }
}

/**
 * list all available docsets.
 *
 * agents should NEVER guess what docs exist.
 * discovery is a first-class primitive.
 *
 * for now:
 * - this is hardcoded
 * - later this becomes a DB query
 */
export async function listDocsets() {
  const ids = ["react-19"];

  const docsets = [];

  for (const id of ids) {
    const ds = await loadDocset(id);
    if (!ds) continue;

    // return metadata only (not chunks)
    docsets.push({
      id: ds.docsetId,
      name: ds.name,
      version: ds.version,
      updatedAt: ds.updatedAt,
    });
  }

  return docsets;
}

/**
 * ----------------------------
 * searching docsets
 * ----------------------------
 */

/**
 * search within a docset.
 *
 * this is intentionally dumb.
 * the goal is NOT search quality.
 * the goal is understanding:
 * - response shape
 * - ranking
 * - chunk sizing
 */
export async function searchDocset(id: string, q: string) {
  const ds = await loadDocset(id);
  if (!ds) return null;

  const query = q.trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);

  /**
   * score each chunk by:
   * - how many query terms appear
   * - small boost if full query appears
   */
  const scored = ds.chunks
    .map((chunk) => {
      const haystack = `${chunk.title}\n${chunk.content}`.toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += 1;
      }

      if (query.length >= 3 && haystack.includes(query)) {
        score += 1;
      }

      return { chunk, score };
    })
    // drop irrelevant chunks
    .filter((x) => x.score > 0)
    // highest score first
    .sort((a, b) => b.score - a.score)
    // cap results so agents don’t get flooded
    .slice(0, 5)
    // shape final response
    .map((x) => ({
      chunkId: x.chunk.chunkId,
      title: x.chunk.title,
      url: x.chunk.url,
      score: Number((x.score / (terms.length + 1)).toFixed(2)),
      content: x.chunk.content,
      tokensApprox: tokensApprox(x.chunk.content),
    }));

  return {
    docset: ds,
    results: scored,
  };
}
