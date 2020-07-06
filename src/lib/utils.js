const moment = require("moment-timezone");
const CommonError = require("./CommonError");
const { HTTP_STATUS, TIME_ZONE } = require("./constants");
const logger = require("./logger");

const removeSpace = value => (value ? value.replace(/ /g, "") : null);

const currentTime = () =>
  moment()
    .tz(TIME_ZONE)
    .format("YYYY-MM-DD HH:mm:ss.SSS");

module.exports = {
  removeSpace,
  currentTime
};
