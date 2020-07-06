const Router = require("koa-router");

const router = new Router();
const authCtrl = require("../controller").session;
const signUpCtrl = require("../controller").signUp;

router.post("/session", authCtrl.login);
router.post("/session/guest", authCtrl.guestLogin);
router.get("/session", authCtrl.verify);

// authentication - sign up
router.post("/signup", signUpCtrl.signup);
router.use("/verification", signUpCtrl.verification);

module.exports = router;
