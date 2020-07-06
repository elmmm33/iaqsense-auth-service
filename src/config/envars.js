let defaultConfig = {
  port: process.env.PORT,
  calibrationServiceUrl:
    "https://evqsense-calibration-service-dev-3togabxujq-an.a.run.app",
  projectId: "evq-sense-development",
  keyFileName: "EVQ Sense Development-cf5e8a21fddc.json",
  bigqueryDataSetID: "evqsense_iaq_dev"

  // mysqlHost: '104.199.199.24',
  // mysqlPort: '3306',
  // mysqlUser: 'root',
  // mysqlPassword: 'gMMPJGbMjs0yInJB7',
  // mysqlDatabase: 'evqsense',
  // mysqlSocketPath: '/cloudsql/evq-sense:asia-east1:evqsene-dev-mysql'
  // authServiceUrl: 'https://auth-service-dev-s44htm3y3q-an.a.run.app',
  // cloudStorageBucketName: 'tvb-ad-admin-cms-files',
  // cloudStorageBucketPath:
  //   'https://storage.googleapis.com/tvb-ad-admin-cms-files'
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
