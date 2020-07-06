const { BigQuery } = require("@google-cloud/bigquery");
const Path = require("path");
const config = require("../config");

module.exports = new BigQuery({
  projectId: config.projectId,
  keyFilename: Path.resolve("key/", config.keyFileName)
});
