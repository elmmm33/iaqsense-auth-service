// const crypto = require("crypto");
const logger = require('../../lib/logger');
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { HTTP_STATUS } = require('../../lib/constants');

const {
  jwtSecret,
  hashToSha256,
  sessionExpireDate
} = require("../../lib/user-help-function");

const Firestore = require("@google-cloud/firestore");
const db = require("../../lib/firestore");

moment.tz.setDefault("Asia/Hong_Kong");

const login = async ctx => {
  const { email, password } = ctx.request.body;
  try {
    const hashPassword = hashToSha256(password);
    const users = await db.collection("users").where("email", "==", email).get();
    let user, userId;
    users.forEach(doc => {
      userId = doc.id;
      user = doc.data()
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

        let expiredTime = sessionExpireDate(12);
        logger.info(userId, user.email, expiredTime);

        const sessions = await db.collection('sessions').where("user", "==", db.doc(`users/${userId}`)).get();
        if (sessions) {
          // update session expired date
          let session, sessionId;
          sessions.forEach(doc => { sessionId = doc.id;; session = doc.data() });

          try{
            await db.collection('sessions').doc(sessionId).update({ expiredTime: Firestore.Timestamp.fromDate(expiredTime) })
          } catch(err){
            logger.error(err);
            throw new Error("update Session Expired Date Failed");
          };
        } else {
          try{
            await db.collection("sessions").add({
              user: db.doc(`users/${userId}`),
              token,
              expiredTime: Firestore.Timestamp.fromDate(expiredTime)
            });
          } catch(err) {
            logger.error(err);
            throw new Error("create new user token failed");
          }
        }

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
      } else {
        throw new Error("Invalid password."); //invalid password
      }
    } else {
      throw new Error("Invalid email."); //invalid email
    }
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

module.exports = login;
