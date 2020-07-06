const { commonError } = require("../../lib/CommonError");
const { HTTP_STATUS } = require("../../lib/constants");

module.exports = async ctx => {
  ctx.status = HTTP_STATUS.OK;
  ctx.body = "OverOVer";
};
