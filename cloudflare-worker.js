/**
 * Steam-Trades — Proxy CORS para inventário da Steam
 * Cloudflare Worker (grátis, até 100.000 requisições/dia)
 */
export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Expose-Headers": "X-Upstream-Status",
    };

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
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/json, text/html, text/xml, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://steamcommunity.com/",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
        },
        redirect: "follow",
      });
    } catch (e) {
      return json({ error: "upstream fetch failed", detail: String(e) }, 502, cors);
    }

    const body = await upstream.text();
    const ct = upstream.headers.get("Content-Type") || "text/plain";

    // Sempre retorna 200 pro browser; o status real da Steam vai no header X-Upstream-Status
    return new Response(body, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": ct,
        "X-Upstream-Status": String(upstream.status),
      },
    });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
