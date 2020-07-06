const moment = require("moment");
const axios = require("axios");
const FormData = require("form-data");
const Firestore = require("@google-cloud/firestore");
const { BigQuery } = require("@google-cloud/bigquery");
const config = require("../../config");
const logger = require("../../lib/logger");
const { HTTP_STATUS } = require("../../lib/constants");
const { assertBodyField } = require("../../lib/error");
const preProcessHexData = require("../../lib/pre-process-hex-data");

const db = require("../../lib/firestore");
const bigquery = require("../../lib/bigquery");

module.exports = async ctx => {
  // console.log(ctx.request.body);
  assertBodyField(ctx, ["device_id"]);
  const payload = ctx.request.body;

  const data = { ...payload };

  // set device type
  const type = data.irin ? "EM" : "IAQ";

  // set data receive timestamp
  const deviceId = data["device_id"];
  const timestamp = BigQuery.timestamp(new Date());

  let updateWarmup = false;

  // TODO: get device lastest config
  try {
    const devices = await db
      .collection("devices")
      .where("deviceId", "==", deviceId)
      .get();
    if (devices.empty) {
      logger.warn(`Deivce - ${deviceId} Not Found`);
    }

    let deviceObjectId;
    let device;
    devices.forEach(doc => {
      deviceObjectId = doc.id;
      device = doc.data();
    });

    // update warmup time
    const currentTs = moment(timestamp.value).toDate();
    const startUp = data["startup"];
    let warmUpStart, warmUpEnd;
    if (startUp === "1") {
      warmUpStart = currentTs;
      warmUpEnd = moment(warmUpStart)
        .add(5, "m")
        .toDate();
      updateWarmup = true;
    } else {
      warmUpStart = device.warmUpStart.toDate();
      warmUpEnd = device.warmUpEnd.toDate();
    }

    deviceName = device.name;
    let warmUp = warmUpStart <= currentTs && currentTs <= warmUpEnd ? 1 : 0;

    // ingest new data to bigquery
    const [hexData, decData, processed] = preProcessHexData(data, type);
    let ingestData = {
      deviceId,
      timestamp,
      location: device.location,
      name: device.name,
      sleep: parseInt(data.sleep),
      startUp: parseInt(data.startup),
      warmUp,
      sumCheck: data.sumCheck !== "" ? data.sumCheck : null
    };
    let ingestHexData = { ...ingestData, ...hexData };
    let ingestDecData = { ...ingestData, ...decData };

    // hex data
    const hexTableId = type === "IAQ" ? "iaqHex" : "emHex";
    const decTableId = type === "IAQ" ? "iaq" : "em";
    try {
      // Task 1: Ingestion new data into BigQuery
      let ingestHex = bigquery
        .dataset(config.bigqueryDataSetID)
        .table(hexTableId)
        .insert([ingestHexData]);
      let ingestDec = bigquery
        .dataset(config.bigqueryDataSetID)
        .table(decTableId)
        .insert({ ...ingestDecData });
      await Promise.all([ingestHex, ingestDec]);
      logger.info(`Device - ${deviceId} Data Ingestion At ${timestamp.value}`);
      // Task 2: Update device config
      let updateDeviceConfig = {
        lastIngestionTime: Firestore.Timestamp.fromDate(currentTs),
        updateTime: Firestore.Timestamp.now()
      };
      if (updateWarmup) {
        updateDeviceConfig.warmUpStart = Firestore.Timestamp.fromDate(
          warmUpStart
        );
        updateDeviceConfig.warmUpEnd = Firestore.Timestamp.fromDate(warmUpEnd);
      }
      if (device.instantOn === 1) {
        updateDeviceConfig.continueOn = 0;
        updateDeviceConfig.instantOn = 0;
      }

      // device config change log

      // update device config
      db.collection("devices")
        .doc(deviceObjectId)
        .update(updateDeviceConfig);

      // TODO: call calibration service
      lastIngestionMin = moment(device.lastIngestionTime.toDate())
        .seconds(0)
        .milliseconds(0);
      currentMin = moment(timestamp.value)
        .seconds(0)
        .milliseconds(0);
      if (!lastIngestionMin) {
        let calibrationTime = currentMin.utc().format();
        logger.info(`Device - ${deviceId} Calibration At ${calibrationTime}`);
        axios.post(`${config.calibrationServiceUrl}/mlservice`, {
          deviceId: deviceId,
          timestamp: calibrationTime,
          type: type
        });
      } else if(startUp === '0'){
        let duration = currentMin.diff(lastIngestionMin);
        let durationMin = duration / 60000;
        if (durationMin > 0) {
          if (durationMin > 5) durationMin = 5;
          for (let i = 0; i < durationMin; i++) {
            let calibrationTime = currentMin
              .subtract(i, "minutes")
              .utc()
              .format();
            logger.info(
              `Device - ${deviceId} Calibration At ${calibrationTime}`
            );
            axios.post(`${config.calibrationServiceUrl}/mlservice`, {
              deviceId: deviceId,
              timestamp: calibrationTime,
              type: type
            });
          }
        }
      }
      logger.info(
        `Device - ${deviceId} END At ${moment()
          .utc()
          .format()} `
      );
    } catch (e) {
      console.log(e);
    }

    ctx.status = HTTP_STATUS.OK;
    ctx.body = `timestamp=${moment(timestamp.value).valueOf()}&continueOn=${
      device.continueOn
    }&instantOn=${device.instantOn}&onTime=${device.onTime}&offTime=${
      device.offTime
    }&seq=${ingestDecData.seq}&sumCheck=${ingestDecData.sumCheck ||
      ""}.DataEnd`;
  } catch (err) {
    logger.error(err);
  }
};
