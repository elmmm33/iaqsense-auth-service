const User = require("../../models").User;
const Session = require("../../models").Session;
const {
  jwtSecret,
  jwtVerify,
  sessionExpireDate
} = require("../../utils/user-help-function");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
moment.tz.setDefault("Asia/Hong_Kong");
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS");
};

const verify = async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      const jwtRes = await jwtVerify(token, jwtSecret).catch(err => {
        logger.error(err);
        throw new Error("Invalid token.");
      });
      if (jwtRes) {
        const { id } = jwtRes;
        let reply = await Session.findOne({
          where: {
            userId: id,
            expiredAt: {
              [Op.gte]: moment().format()
            }
          }
        });
        if (reply) {
          // update expired date
          let expiredAt = sessionExpireDate(12);
          await reply.update({ expiredAt }).catch(err => {
            console.log(err);
            throw new Error("update Session Expired Date Failed");
          });

          res.json({
            success: true,
            msg: null,
            result: jwtRes,
            moment: moment().format()
          });
        } else {
          throw new Error("Token expired.");
        }
      } else {
        throw new Error("Invalid token.");
      }
    } else {
      throw new Error("No token provided.");
    }
  } catch (e) {
    res.json({
      success: false,
      msg: e.message.toString(),
      result: null,
      moment: moment().format()
    });
  }
};

module.exports = verify;
