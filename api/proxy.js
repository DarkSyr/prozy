import fetch from "node-fetch";

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Node.js Proxy"
      }
    });

    const contentType = response.headers.get("content-type") || "text/html";
    res.setHeader("Content-Type", contentType);

    const body = await response.text();

    // Simple rewrite so links stay proxied
    const rewritten = body.replace(/href="(http[^"]+)"/g, 'href="/api/proxy?url=$1"');
    res.send(rewritten);

  } catch (e) {
    res.status(502).send("Proxy error: " + e.message);
  }
}
