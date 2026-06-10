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
      "Access-Control-Expose-Headers": "X-Upstream-Status, X-Final-Url",
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

    // Detect if this is a JSON API call (inventory endpoints)
    const isInventory = t.pathname.includes("/inventory/");
    const isOldInventory = t.pathname.includes("/inventory/json/");
    const isJsonApi = isInventory || isOldInventory;

    const reqHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": isJsonApi
        ? "application/json, text/javascript, */*; q=0.01"
        : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://steamcommunity.com/",
      "Origin": "https://steamcommunity.com",
    };
    if (isJsonApi) reqHeaders["X-Requested-With"] = "XMLHttpRequest";

    let upstream;
    try {
      upstream = await fetch(t.toString(), { headers: reqHeaders, redirect: "follow" });
    } catch (e) {
      return json({ error: "upstream fetch failed", detail: String(e) }, 502, cors);
    }

    const body = await upstream.text();
    const ct = upstream.headers.get("Content-Type") || "text/plain";
    const finalUrl = upstream.url || t.toString();

    // Sempre retorna 200 pro browser; status real da Steam vai no X-Upstream-Status
    return new Response(body, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": ct,
        "X-Upstream-Status": String(upstream.status),
        "X-Final-Url": finalUrl,
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
