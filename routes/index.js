var express = require("express");
var router = express.Router();
const controllers = require("../controllers");
router.get("/tables", controllers.getAllTables);
router.post("/create-table", controllers.createTable);
router.post("/add-table", controllers.addTable);
module.exports = router;
