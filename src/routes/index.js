const Router = require("koa-router");

const router = new Router();
const ctrl = require("../controller").session;

router.post("/session", ctrl.login);
router.post("/session/guest", ctrl.guestLogin);
router.get("/session", ctrl.verify);


module.exports = router;
