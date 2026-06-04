const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const root = __dirname;
const port = Number(process.env.PORT || 4174);
const GSI = {
  g2011: "https://vldb.gsi.go.jp/sokuchi/surveycalc/geoid/calcgh2011/cgi/geoidcalc.pl",
  g2024: "https://vldb.gsi.go.jp/sokuchi/surveycalc/geoid/calcgh/cgi/geoidcalc.pl"
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/geoid") return geoid(url, res);
  const file = path.resolve(root, "." + (url.pathname === "/" ? "/index.html" : url.pathname));
  if (!file.startsWith(root)) return res.writeHead(403).end("Forbidden");
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end("Not found");
    res.end(data);
  });
}).listen(port, "0.0.0.0", () => console.log(`http://localhost:${port}`));

async function geoid(url, res) {
  const model = url.searchParams.get("model");
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  if (!GSI[model]) return res.writeHead(400).end('{"error":"invalid model"}');
  const qs = new URLSearchParams({ outputType: "json", latitude, longitude });
  const r = await fetch(`${GSI[model]}?${qs}`);
  res.writeHead(r.status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
  res.end(await r.text());
}
