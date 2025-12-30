const express = require("express");
const healthRoute = require("./routes/health");
const pastesRoute = require("./routes/pastes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/healthz", healthRoute);
app.use("/api/pastes", pastesRoute);

// HTML view
app.use("/p", pastesRoute);

app.listen(PORT, () => {
  console.log("Server running");
});
