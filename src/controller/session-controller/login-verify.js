const {
  jwtSecret,
  jwtVerify,
  sessionExpireDate
} = require("../../lib/user-help-function");
const { HTTP_STATUS } = require("../../lib/constants");
const Firestore = require("@google-cloud/firestore");
const db = require("../../lib/firestore");

const moment = require("moment");
moment.tz.setDefault("Asia/Hong_Kong");

module.exports = async ctx => {
  try {
    if (ctx.request.headers.authorization) {
      const token = ctx.request.headers.authorization.split(" ")[1];

      const jwtRes = await jwtVerify(token, jwtSecret).catch(err => {
        logger.error(err);
        throw new Error("Invalid token.");
      });
      if (jwtRes) {
        const { id } = jwtRes;
        const sessions = await db
          .collection("sessions")
          .where("user", "==", db.doc(`users/${id}`))
          .where("expireTime", ">=", Firestore.Timestamp.now())
          .get();
        if (sessions) {
          // update expired date
          let session, sessionId;
          sessions.forEach(doc => {
            sessionId = doc.id;
            session = doc.data();
          });

          try {
            await db
              .collection("sessions")
              .doc(sessionId)
              .update({
                expiredTime: Firestore.Timestamp.fromDate(expiredTime)
              });
          } catch (err) {
            logger.error(err);
            throw new Error("update Session Expired Date Failed");
          }

          ctx.status = HTTP_STATUS.OK;
          ctx.body = {
            success: true,
            msg: null,
            result: jwtRes,
            moment: moment().format()
          };
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
    ctx.status = HTTP_STATUS.UNAUTHORIZED;
    ctx.body = {
      success: false,
      msg: e.message.toString(),
      result: null,
      moment: moment().format()
    };
  }
};
