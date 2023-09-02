var express = require("express");
var router = express.Router();
const controllers = require("../controllers");
router.get("/tables", controllers.getAllTables);
module.exports = router;
