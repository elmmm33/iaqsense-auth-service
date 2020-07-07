const cryptoRandomString = require("crypto-random-string");
const {
  hashPassword,
  generateRandomPassword,
  sendVerificationEmail
} = require("../../lib/user-help-function");
const { HTTP_STATUS } = require("../../lib/constants");
const logger = require("../../lib/logger");
const Firestore = require("@google-cloud/firestore");
const db = require("../../lib/firestore");
const { doc } = require("prettier");

module.exports = async ctx => {
  const { email, firstName, lastName } = ctx.request.body;
  let randomPassword = generateRandomPassword(8);
  logger.info(`${email} ${randomPassword}`);
  const users = await db
    .collection("users")
    .where("email", "==", email)
    .get();

  if (!users.empty) {
    users.forEach(doc=>{ logger.info(`user found ${doc.id}`) });
    ctx.status = HTTP_STATUS.BAD_REQUEST;
    ctx.body = {
      success: false,
      msg: "User with email address already exists",
      result: null
    };
  } else {
    try {
      let user = await db.collection("users").add({
        email,
        firstName,
        lastName,
        isVerified: 0,
        password: hashPassword(randomPassword),
        role: 1,
        createTime: Firestore.Timestamp.now(),
        updateTime: Firestore.Timestamp.now()
      });
      console.log(user.id);
      const token = cryptoRandomString(16);
      let verificationToken = await db.collection("verificationtoken").add({
        user: db.doc(`users/${user.id}`),
        token
      });

      if (verificationToken) {
        try {
          sendVerificationEmail(
            email,
            ctx.request.headers.host,
            token,
            email,
            randomPassword
          );
          ctx.status = HTTP_STATUS.OK;
          ctx.body = {
            success: true,
            msg: `${email} account created successfully`,
            result: null
          };
        } catch (e) {
          ctx.status = HTTP_STATUS.BAD_REQUEST;
          ctx.body = {
            success: false,
            msg: "Failed to Send Verification Email",
            result: null
          };
        }
      }
    } catch (e) {
      ctx.status = HTTP_STATUS.BAD_REQUEST;
      ctx.body = {
        success: false,
        msg: "Failed Create User",
        result: null
      };
    }
  }
};
