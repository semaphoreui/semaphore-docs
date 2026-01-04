/**
 * Minimal Algolia index smoke-test.
 *
 * Required env vars:
 * - ALGOLIA_APP_ID
 * - ALGOLIA_API_KEY      (Search-only key is OK for searching; admin key needed for settings/index existence checks)
 * - ALGOLIA_INDEX_NAME
 *
 * Optional:
 * - ALGOLIA_QUERY        (default: "test")
 * - ALGOLIA_HITS_PER_PAGE (default: 5)
 */

const { algoliasearch } = require("algoliasearch");

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required env var ${name}`);
  }
  return val;
}

function toInt(val, fallback) {
  if (val == null || val === "") return fallback;
  const n = Number.parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  const appId = requireEnv("ALGOLIA_APP_ID");
  const apiKey = requireEnv("ALGOLIA_API_KEY");
  const indexName = requireEnv("ALGOLIA_INDEX_NAME");

  const query = process.env.ALGOLIA_QUERY ?? "test";
  const hitsPerPage = toInt(process.env.ALGOLIA_HITS_PER_PAGE, 5);

  const client = algoliasearch(appId, apiKey);

  // 1) Best-effort check that the index exists.
  // Note: `indexExists` calls `getSettings`, which requires browse/settings perms (often not available on search-only keys).
  try {
    const exists = await client.indexExists({ indexName });
    if (!exists) {
      console.error(`[FAIL] Index does not exist (404): ${indexName}`);
      process.exitCode = 2;
      return;
    }
    console.log(`[OK] Index exists: ${indexName}`);
  } catch (err) {
    const status = err?.status ?? err?.statusCode;
    if (status === 403) {
      console.warn(
        `[WARN] Cannot check index existence with this API key (403). Continuing with search-only test...`
      );
    } else {
      console.warn(
        `[WARN] Index existence check failed (${status ?? "unknown status"}). Continuing with search test...`
      );
    }
  }

  // 2) Search test (works with search-only key)
  const res = await client.search([
    {
      indexName,
      query,
      params: { hitsPerPage }
    }
  ]);

  const first = res?.results?.[0];
  if (!first) {
    console.error("[FAIL] Unexpected response shape from Algolia (missing results[0])");
    process.exitCode = 3;
    return;
  }

  console.log(
    `[OK] Search succeeded: query="${query}", nbHits=${first.nbHits}, returned=${first.hits?.length ?? 0}`
  );

  const hits = Array.isArray(first.hits) ? first.hits : [];
  if (hits.length) {
    console.log("[INFO] Sample hits:");
    for (const hit of hits.slice(0, Math.min(hitsPerPage, 5))) {
      const objectID = hit.objectID ?? "(no objectID)";
      const title =
        hit.title ??
        hit.name ??
        hit.heading ??
        hit.url ??
        hit.path ??
        hit.slug ??
        "";
      console.log(`- ${objectID}${title ? ` — ${title}` : ""}`);
    }
  } else {
    console.log("[INFO] No hits returned (index may be empty, query may not match, or filters may apply).");
  }
}

main().catch((err) => {
  console.error("[FAIL] Algolia test errored:");
  console.error(err);
  process.exitCode = 1;
});


