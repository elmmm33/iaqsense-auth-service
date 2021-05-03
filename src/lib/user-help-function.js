const crypto = require("crypto");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const sg = require("@sendgrid/mail");

sg.setApiKey(
  "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"
);

const jwtSecret = "JWT_SECRET_ENV_SENSE_DEVLOPMENT";

const jwtVerify = (token, jwtSecret) => {
  const promise = new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });

  return promise;
};

const sessionExpireDate = period => {
  return moment()
    .add(period, "M")
    .valueOf();
  // .format("YYYY-MM-DD HH:mm:ss");
};

const verifyPassword = (pw, hashPw) => {
  return pw == hashToSha256(hashPw);
};

const hashPassword = pw => {
  return hashToSha256(pw);
};

const hashToSha256 = value => {
  const hash = crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
  return hash;
};

const generateRandomPassword = length => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const sendVerificationEmail = (to, hosturl, token, email, password) => {
  const msg = {
    to: to,
    from: "evqsense@gmail.com",
    subject: "Verify Your Email",
    text:
      "Hello,\n\n" +
      "Please verify your IAQ Smart Device account by clicking the link: \nhttp://" +
      hosturl +
      "/verification?token=" +
      token +
      "&email=" +
      email +
      "\n\n" +
      "Your Password is: \n" +
      password
  };
  // console.log(msg);
  sg.send(msg);
};

module.exports = {
  jwtSecret,
  jwtVerify,
  sessionExpireDate,
  verifyPassword,
  hashPassword,
  generateRandomPassword,
  hashToSha256,
  sendVerificationEmail
};
