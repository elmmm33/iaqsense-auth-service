const Router = require("koa-router");

const router = new Router();
const ctrl = require("../controller").gateway;

router.get("", ctrl.serverTest);
router.post("", ctrl.dataIngest);

module.exports = router;
