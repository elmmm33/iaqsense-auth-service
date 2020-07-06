const logger = require('../lib/logger');
const CommonError = require('../lib/CommonError');
const { HTTP_STATUS } = require('../lib/constants');

const getErrorResponse = ({ code, message }) => {
  return {
    ok: false,
    error: {
      code,
      message
    }
  };
};

module.exports = async (ctx, next) => {
  return next().catch(e => {
    logger.error(e);

    if (e instanceof CommonError) {
      const { status, message, code } = e;

      ctx.status = status;
      ctx.body = getErrorResponse({ code, message });
    } else {
      ctx.status = HTTP_STATUS.SERVER_ERROR;
      ctx.body = getErrorResponse({
        code: 'SE001',
        message: 'Server error'
      });
    }
  });
};
