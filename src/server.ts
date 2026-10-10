import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  setDatabase,
  setRequestCountry,
  type D1DatabaseLike,
} from "./lib/database.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

const FAIRY_PARTS = 6;
const FAIRY_CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, HEAD, OPTIONS",
  "access-control-allow-headers": "*",
  "access-control-expose-headers": "Content-Length",
  "cross-origin-resource-policy": "cross-origin",
};

// El .glb supera el lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­mite de 25 MB por asset, asÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ que se guarda en partes y se une al servir.
async function serveFairyModel(request: Request, env: unknown): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: FAIRY_CORS });
  }
  const cfEnv = ((await import("cloudflare:workers")) as unknown as { env: { ASSETS: { fetch: (r: Request) => Promise<Response> } } }).env;
  const assets = cfEnv.ASSETS;
  const origin = new URL(request.url).origin;
  const parts = await Promise.all(
    Array.from({ length: FAIRY_PARTS }, (_, i) =>
      assets.fetch(new Request(`${origin}/model-parts/fairy-costume.${i}.bin`)),
    ),
  );
  if (parts.some((p) => !p.ok || !p.body)) {
    return new Response("Not found", { status: 404, headers: FAIRY_CORS });
  }
  const headers: Record<string, string> = {
    ...FAIRY_CORS,
    "content-type": "model/gltf-binary",
    "cache-control": "public, max-age=31536000, immutable",
  };
  if (request.method === "HEAD") return new Response(null, { headers });

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  (async () => {
    try {
      for (const p of parts) await p.body!.pipeTo(writable, { preventClose: true });
      await writable.close();
    } catch (e) {
      await writable.abort(e);
    }
  })();
  return new Response(readable, { headers });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      if (new URL(request.url).pathname === "/models/fairy-costume.glb") {
        try { return await serveFairyModel(request, env); } catch (e) { return new Response(String((e as Error)?.stack ?? e), { status: 500 }); }
      }
      setDatabase((env as { DB?: D1DatabaseLike } | undefined)?.DB);
      setRequestCountry((request as Request & { cf?: { country?: string } }).cf?.country);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
