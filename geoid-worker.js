const GSI = {
  g2011: "https://vldb.gsi.go.jp/sokuchi/surveycalc/geoid/calcgh2011/cgi/geoidcalc.pl",
  g2024: "https://vldb.gsi.go.jp/sokuchi/surveycalc/geoid/calcgh/cgi/geoidcalc.pl"
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));

    const model = url.searchParams.get("model");
    const latitude = url.searchParams.get("latitude");
    const longitude = url.searchParams.get("longitude");

    if (!GSI[model] || !valid(latitude, -90, 90) || !valid(longitude, -180, 180)) {
      return cors(json({ error: "invalid parameters" }, 400));
    }

    const params = new URLSearchParams({ outputType: "json", latitude, longitude });
    const upstream = await fetch(`${GSI[model]}?${params}`, {
      headers: { "user-agent": "survey-converter-pwa" }
    });
    return cors(new Response(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=86400" }
    }));
  }
};

function valid(value, min, max) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
