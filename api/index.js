const express = require("express");
const healthRoute = require("../routes/health");
const pastesRoute = require("../routes/pastes");

const app = express();

app.use(express.json());

app.use("/api/healthz", healthRoute);
app.use("/api/pastes", pastesRoute);
app.use("/p", pastesRoute);

module.exports = app;
