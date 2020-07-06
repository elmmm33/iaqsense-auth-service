/******************************************************
 *  EVQSense
 *  Logger
 *  Last Update 2019-07-18
 ***************************************************** */
const moment = require('moment');
const { createLogger, format, transports } = require('winston');
const { combine, printf } = format;

const localTimestamp = format(info => {
  info.timestamp = moment().format();
  return info;
});

const logFormat = printf(info => {
  const { stack, message } = info;
  let log = '';
  if (stack) {
    log = stack;
  } else if (typeof message === 'string') {
    log = message;
  } else {
    log = JSON.stringify(message);
  }
  return `[${info.timestamp}][${info.level}] ${log}`;
});

const logger = createLogger({
  format: combine(localTimestamp(), logFormat),
  transports: [new transports.Console()]
});

module.exports = logger;
