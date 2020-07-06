const path = require("path");
const fs = require("fs-extra");

const Firestore = require("@google-cloud/firestore");
const db = require("../../lib/firestore");

module.exports = async ctx => {
  const { email, token } = ctx.query;

  ctx.type = "html";
  try {
    const users = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    // update user status
    let user, userId;
    users.forEach(doc => {
      userId = doc.id;
      user = doc.data();
    });
    if (user) {
      if (user.isVerified === 1) {
        ctx.body = fs.createReadStream(
          path.join(__dirname + "/verify-ok.html")
        );
      } else {
        const tokens = await db
          .collection("verificationtoken")
          .where("token", "==", token)
          .get();
        if (!tokens.empty) {
          await db
            .collection("users")
            .doc(userId)
            .update({ isVerified: 1, updateTime: Firestore.Timestamp.now() });

          ctx.body = fs.createReadStream(
            path.join(__dirname + "/verify-success.html")
          );
        } else {
          ctx.body = fs.createReadStream(
            path.join(__dirname + "/verify-error.html")
          );
        }
      }
    } else {
      ctx.body = fs.createReadStream(
        path.join(__dirname + "/verify-error-not-found.html")
      );
    }
  } catch (e) {
    ctx.body = fs.createReadStream(path.join(__dirname + "/verify-error.html"));
  }
};
