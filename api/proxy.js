import fetch from "node-fetch";

function encode(url) {
  return Buffer.from(url).toString("base64");
}

function decode(b64) {
  return Buffer.from(b64, "base64").toString("utf-8");
}

export default async function handler(req, res) {
  try {
    if (!req.query.u) {
      return res.status(400).send("Missing parameter");
    }

    const targetUrl = decode(req.query.u);
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let body = await response.text();

    // 🔁 Rewrite ALL absolute URLs to stay proxied
    body = body.replace(
      /(href|src)=["'](https?:\/\/[^"']+)["']/gi,
      (m, attr, url) => {
        return `${attr}="/api/proxy?u=${encode(url)}"`;
      }
    );

    res.setHeader("Content-Type", response.headers.get("content-type") || "text/html");
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");

    res.send(body);
  } catch (e) {
    res.status(502).send("Proxy error");
  }
}
