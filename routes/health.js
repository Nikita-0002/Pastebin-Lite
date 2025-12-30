const express = require("express");
const fs = require("fs");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    fs.accessSync("./data/pastes.json");
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
