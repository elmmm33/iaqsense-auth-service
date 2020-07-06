const User = require("../../models").User;
const GuestSession = require("../../models").GuestSession;
const crypto = require("crypto");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const {
  jwtSecret,
  hashToSha256,
  sessionExpireDate
} = require("../../utils/user-help-function");
moment.tz.setDefault("Asia/Hong_Kong");
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS");
};

const guestLogin = async (req, res) => {
  try {
    const payload = {
      role: 0 // 0: guest
    };
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: "1h"
    });

    // let expiredAt = sessionExpireDate(1);
    // await GuestSession.create({
    //   token,
    //   expiredAt
    // }).catch(err => {
    //   console.log(err);
    //   throw new Error("create guest token failed");
    // });

    res.json({
      success: true,
      msg: "Successfully Login",
      result: {
        token,
        ...payload
      },
      moment: moment().format()
    });
  } catch (e) {
    res.json({
      success: false,
      msg: e.message.toString() || "Login failed",
      result: null,
      moment: moment().format()
    });
  }
};

module.exports = guestLogin;
