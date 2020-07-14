let defaultConfig = {
  port: process.env.PORT,
  projectId: "evq-sense-development",
  keyFileName: "EVQ Sense Development-cf5e8a21fddc.json"
};

if (process.env.NODE_ENV == "development") {
  module.exports = {
    ...defaultConfig
  };
} else if (process.env.NODE_ENV == "production") {
  module.exports = {
    ...defaultConfig,
    projectId: "evq-sense",
    keyFileName: "EVQ Sense-53d6e61efc31.json"
  };
} else {
  module.exports = { ...defaultConfig };
}
