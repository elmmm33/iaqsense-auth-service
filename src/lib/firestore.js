const Firestore = require("@google-cloud/firestore");
const Path = require("path");
const config = require("../config");

module.exports = new Firestore({
  projectId: config.projectId,
  keyFilename: Path.resolve("key/", config.keyFileName)
});
