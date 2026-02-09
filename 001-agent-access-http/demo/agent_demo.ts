/**
 * agent_demo.ts
 *
 * this file pretends to be an autonomous agent integrating with docforge.
 *
 * important mental shift:
 * - this is NOT a test
 * - this is NOT a script for humans
 * - this is a stand-in for how an LLM tool / agent would call your system
 *
 * if this file is easy to write and reason about,
 * then your agent contract is probably good.
 */

/**
 * base url of the agent gateway.
 *
 * agents usually get this injected via tool config,
 * env vars, or platform metadata.
 */
const BASE = process.env.DOCFORGE_BASE_URL ?? "http://localhost:3000";

/**
 * small helper that:
 * - performs an HTTP GET
 * - enforces JSON responses
 * - throws loud errors on non-200 responses
 *
 * agents need VERY explicit failure modes.
 * silent failures are dangerous.
 */
async function getJson(path: string) {
  const res = await fetch(`${BASE}${path}`);

  // if the gateway responds with anything non-OK,
  // the agent should stop and handle the error explicitly
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `request failed\n` +
      `path: ${path}\n` +
      `status: ${res.status}\n` +
      `body: ${body}`
    );
  }

  // agents expect predictable JSON
  return res.json();
}

/**
 * main agent flow.
 *
 * this models the exact sequence an agent would follow:
 * 1. confirm the service exists
 * 2. discover what docs are available
 * 3. query a specific docset
 * 4. extract a small amount of context to answer a question
 */
async function main() {
  /**
   * step 1: health check
   *
   * agents should never assume a service is up.
   * this is a cheap sanity check before doing real work.
   */
  console.log("agent → health check");
  const health = await getJson("/api/health");
  console.log(health);

  /**
   * step 2: discover docsets
   *
   * agents should NOT hardcode docset ids.
   * discovery allows:
   * - dynamic capabilities
   * - versioning
   * - multiple doc sources
   */
  console.log("\nagent → discover docsets");
  const docsets = await getJson("/api/docsets");
  console.log(docsets);

  /**
   * step 3: search inside a docset
   *
   * the agent forms a natural-language query.
   * this is the core "give me context" operation.
   */
  console.log("\nagent → search docset");

  const query = "useEffect cleanup strict mode";
  const search = await getJson(
    `/api/docsets/react-19/search?q=${encodeURIComponent(query)}`
  );

  /**
   * agents usually:
   * - pick the top result
   * - or select a few highest-ranked chunks
   *
   * for this experiment, we take the top one.
   */
  const top = search.results?.[0];

  console.log("query:", search.query);
  console.log("top:", top ? `${top.title} | ${top.url}` : "no results");

  /**
   * step 4: extract context
   *
   * this is the exact text an agent would insert
   * into its prompt before answering the user.
   *
   * note:
   * - content is small
   * - citation is included
   * - token cost is visible
   */
  if (top) {
    console.log("\ncontext chunk:");
    console.log(top.content);
    console.log("\n(tokensApprox:", top.tokensApprox + ")");
  }
}

/**
 * bootstrap the agent.
 *
 * any uncaught error here should halt execution.
 * agents should fail loudly and deterministically.
 */
main().catch((err) => {
  console.error("\nagent demo failed");
  console.error(err);
  process.exit(1);
});
