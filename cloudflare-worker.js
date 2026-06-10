/**
 * Steam-Trades — Proxy CORS para inventário da Steam
 * Cloudflare Worker (grátis, até 100.000 requisições/dia)
 *
 * A Steam não permite que um site estático leia o inventário direto do
 * navegador (sem CORS e sem JSONP). Este Worker faz a requisição do lado
 * do servidor e devolve a resposta com os cabeçalhos CORS corretos.
 *
 * Por segurança, só repassa requisições para steamcommunity.com.
 *
 * Deploy: veja PROXY_SETUP.md
 */
export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const reqUrl = new URL(request.url);
    const target = reqUrl.searchParams.get("url");

    if (!target) {
      return json({ error: "missing 'url' parameter" }, 400, cors);
    }

    let t;
    try {
      t = new URL(target);
    } catch (_) {
      return json({ error: "invalid url" }, 400, cors);
    }

    // Só permite o domínio da Steam — impede uso como proxy aberto
    if (t.hostname !== "steamcommunity.com") {
      return json({ error: "host not allowed" }, 403, cors);
    }

    let upstream;
    try {
      upstream = await fetch(t.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Steam-Trades/1.0)",
          "Accept": "application/json, text/xml, */*",
        },
        cf: { cacheTtl: 60, cacheEverything: true },
      });
    } catch (_) {
      return json({ error: "upstream fetch failed" }, 502, cors);
    }

    const body = await upstream.text();
    const ct = upstream.headers.get("Content-Type") || "application/json";

    return new Response(body, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": ct },
    });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
