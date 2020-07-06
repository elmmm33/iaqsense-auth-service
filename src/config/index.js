/* *****************************************************
 *  EVQSense config
 *  Last Update 2020-03-12
 ***************************************************** */
let { constantCase } = require('change-case');
let fields = require('./fields');
let envars = require('./envars');

let config = {};

for (let f of fields) {
  let value = process.env[constantCase(f)] || envars[f];
  if (value === undefined) {
    console.error(`Missing config: ${f}`);
    process.exit(1);
  }
  config[f] = value;
}

module.exports = config;
