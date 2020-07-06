const { HTTP_STATUS } = require('./constants');
const logger = require('./logger');
const CommonError = require('./CommonError');

module.exports.assertBodyField = (ctx, fieldNames, code = 'BR-001', status = HTTP_STATUS.BAD_REQUEST) => {
  if (!ctx.request) throw new CommonError({ status, code, message: `${fieldNames.join(', ')} are required` });
  if (!ctx.request.body) throw new CommonError({ status, code, message: `${fieldNames.join(', ')} are required` });

  let givenFields = Object.getOwnPropertyNames(ctx.request.body);
  if (fieldNames.find(n => givenFields.indexOf(n) == -1)) {
    throw new CommonError({ status, code, message: `${fieldNames.join(', ')} are required` });
  }
};