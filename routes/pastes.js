const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const { now } = require("../utils/time");

const router = express.Router();
const DB = "./data/pastes.json";

function readDB() {
  return JSON.parse(fs.readFileSync(DB));
}

function writeDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

/* ---------------- CREATE PASTE ---------------- */
router.post("/", (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = crypto.randomUUID();
  const createdAt = now(req);

  const db = readDB();
  db[id] = {
    content,
    createdAt,
    ttl_seconds: ttl_seconds ?? null,
    max_views: max_views ?? null,
    views: 0
  };

  writeDB(db);

  res.status(201).json({
    id,
    url: `${req.protocol}://${req.get("host")}/p/${id}`
  });
});

/* ---------------- FETCH PASTE (API) ---------------- */
router.get("/api/:id", (req, res) => {
  const db = readDB();
  const paste = db[req.params.id];

  if (!paste) {
    return res.status(404).json({ error: "Not found" });
  }

  const currentTime = now(req);

  if (paste.ttl_seconds !== null) {
    if (currentTime >= paste.createdAt + paste.ttl_seconds * 1000) {
      return res.status(404).json({ error: "Expired" });
    }
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    return res.status(404).json({ error: "View limit exceeded" });
  }

  paste.views += 1;
  writeDB(db);

  res.json({
    content: paste.content,
    remaining_views:
      paste.max_views === null ? null : paste.max_views - paste.views,
    expires_at:
      paste.ttl_seconds === null
        ? null
        : new Date(paste.createdAt + paste.ttl_seconds * 1000).toISOString()
  });
});

/* ---------------- VIEW PASTE (HTML) ---------------- */
router.get("/:id", (req, res) => {
  const db = readDB();
  const paste = db[req.params.id];

  if (!paste) {
    return res.status(404).send("Not found");
  }

  const currentTime = now(req);

  if (paste.ttl_seconds !== null) {
    if (currentTime >= paste.createdAt + paste.ttl_seconds * 1000) {
      return res.status(404).send("Expired");
    }
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    return res.status(404).send("View limit exceeded");
  }

  res.send(`<pre>${paste.content.replace(/</g, "&lt;")}</pre>`);
});

module.exports = router;
