// Tiny read-only proxy: avoids browser CORS limits when reading Phygitals' public pack data.
// Only three fixed endpoints are allowed and the slug is strictly validated.
module.exports = async (req, res) => {
  const { kind, slug } = req.query || {};
  let path, input;
  if (kind === "list") {
    path = "vm/claw/list";
    input = { json: { includeRepacks: false, platform: "mainnet", excludeVariants: true } };
  } else if ((kind === "claw" || kind === "chase") && /^[a-z0-9-]{1,60}$/.test(slug || "")) {
    path = `vm/${kind}/get`;
    input = { json: { slug } };
  } else {
    return res.status(400).json({ error: "bad request" });
  }
  try {
    const r = await fetch(`https://api.phygitals.com/api/orpc/${path}?data=${encodeURIComponent(JSON.stringify(input))}`, { headers: { accept: "application/json" } });
    const text = await r.text();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(r.status).send(text);
  } catch (e) {
    res.status(502).json({ error: "upstream unavailable" });
  }
};
