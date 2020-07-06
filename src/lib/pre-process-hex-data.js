const { RAW_DATA_FIELD } = require("./constants");
const { removeSpace } = require("./utils");
const _ = require("lodash");

module.exports = (data, type) => {
  // TODO: pre-process raw telemetry data
  let hexData = {};
  let decData = {};
  if (type === "IAQ") {
    const fields = RAW_DATA_FIELD.IAQ;
    for (field of fields) {
      let processElement = data[field];
      processElement = removeSpace(processElement);
      processDecimalElement = parseInt(processElement, 16);

      if (field === "temperature") {
        processDecimalElement = (processDecimalElement / 2 ** 16) * 165 - 43.8;
      }

      if (field === "humidity") {
        processDecimalElement = (processDecimalElement / 2 ** 16) * 100;
      }

      hexData[field] = processElement;
      decData[field] = processDecimalElement;
    }

    return [hexData, decData, true];
  } else if (type === "EM") {
    const fields = RAW_DATA_FIELD.EM;
    for (field of fields) {
      let processElement = data[field];
      processElement = removeSpace(processElement);
      processDecimalElement = parseFloat(processElement);

      hexData[field] = processElement;
      decData[field] = processDecimalElement;
    }

    return [hexData, decData, true];
  } else {
    return [null, null, false];
  }
};
