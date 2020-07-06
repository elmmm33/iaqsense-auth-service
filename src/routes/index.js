const Router = require("koa-router");

const router = new Router();
const authCtrl = require("../controller").session;

router.post("/session", authCtrl.login);
router.post("/session/guest", authCtrl.guestLogin);
router.get("/session", authCtrl.verify);

module.exports = router.routes();
