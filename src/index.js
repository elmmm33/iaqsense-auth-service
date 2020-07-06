require("dotenv").config();
const config = require("./config");

const app = require("./startups/koa")({
  port: config.port,
  useLogger: true
});

process.once("SIGINT", () => app.shutDown());
process.once("SIGTERM", () => app.shutDown());
