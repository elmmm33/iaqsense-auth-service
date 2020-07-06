const moment = require("moment");
const jwt = require("jsonwebtoken");
const {
  jwtSecret
} = require("../../utils/user-help-function");
const { HTTP_STATUS } = require('../../lib/constants');
moment.tz.setDefault("Asia/Hong_Kong");


const guestLogin = async ctx => {
  try {
    const payload = {
      role: 0 // 0: guest
    };
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: "1h"
    });

    ctx.status = HTTP_STATUS.OK;
    ctx.body={
      success: true,
      msg: "Successfully Login",
      result: {
        token,
        ...payload
      },
      moment: moment().format()
    };
  } catch (e) {
    ctx.status = HTTP_STATUS.UNAUTHORIZED;
    ctx.body={
      success: false,
      msg: e.message.toString() || "Login failed",
      result: null,
      moment: moment().format()
    };
  }
};

module.exports = guestLogin;
