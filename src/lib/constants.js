const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  SERVER_ERROR: 500
};

const TIME_ZONE = "Asia/Hong_Kong";

const RAW_DATA_FIELD = {
  INFO: [
    "device_id",
    "location",
    "timestamp",
    "sleep",
    "startup",
    "warmup",
    "sumCheck"
  ],
  IAQ: [
    "temperature",
    "humidity",
    "pm25",
    "pm10",
    "co",
    "co2",
    "voc",
    "hcn",
    "seq"
  ],
  EM: ["time", "irin", "irout", "seq"]
};

module.exports = {
  HTTP_STATUS,
  TIME_ZONE,
  RAW_DATA_FIELD
};
