import fetch from "node-fetch";

const enc = s => Buffer.from(s).toString("base64");
const dec = s => Buffer.from(s, "base64").toString("utf-8");

export default async function handler(req, res) {
  try {
    if (!req.query.u) {
      return res.status(400).send("Missing parameter");
    }

    const target = dec(req.query.u);
    const r = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let body = await r.text();

    // Rewrite links to stay INSIDE iframe proxy
    body = body.replace(
      /(href|src)=["'](https?:\/\/[^"']+)["']/gi,
      (_, attr, url) =>
        `${attr}="/api/proxy?u=${enc(url)}"`
    );

    res.setHeader(
      "Content-Type",
      r.headers.get("content-type") || "text/html"
    );

    // Best-effort iframe allowance
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors *"
    );

    res.send(body);
  } catch {
    res.status(502).send("Proxy error");
  }
}
