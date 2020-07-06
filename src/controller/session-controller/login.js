// const User = require("../../models").User;
// const Session = require("../../models").Session;
const crypto = require("crypto");
const moment = require("moment");
const jwt = require("jsonwebtoken");

const {
  jwtSecret,
  hashToSha256,
  sessionExpireDate
} = require("../../utils/user-help-function");
moment.tz.setDefault("Asia/Hong_Kong");
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS");
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashPassword = hashToSha256(password);
    const user = await User.findOne({
      where: { email }
    });
    if (user) {
      if (user.password === hashPassword) {
        const payload = {
          id: user.id,
          email,
          role: user.role,
          isVerified: user.isVerified
        };

        const token = jwt.sign(payload, jwtSecret, {
          expiresIn: "5d"
        });

        let expiredAt = sessionExpireDate(12);
        console.log(expiredAt);
        let session = await Session.findOne({
          where: { userId: user.id }
        });
        if (session) {
          // update session expired date
          await session.update({ expiredAt }).catch(err => {
            console.log(err);
            throw new Error("update Session Expired Date Failed");
          });
        } else {
          await Session.create({
            userId: user.id,
            token,
            expiredAt
          }).catch(err => {
            console.log(err);
            throw new Error("create new user token failed");
          });
        }

        res.json({
          success: true,
          msg: "Successfully Login",
          result: {
            token,
            ...payload
          },
          moment: moment().format()
        });
      } else {
        throw new Error("Invalid password."); //invalid password
      }
    } else {
      throw new Error("Invalid email."); //invalid email
    }
  } catch (e) {
    res.json({
      success: false,
      msg: e.message.toString() || "Login failed",
      result: null,
      moment: moment().format()
    });
  }
};

module.exports = login;
