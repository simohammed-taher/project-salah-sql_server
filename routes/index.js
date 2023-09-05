var express = require("express");
var router = express.Router();
const controllers = require("../controllers");

router.get("/table/function", controllers.getFunc);
router.get("/table/:nameTable", controllers.getTable);

// router.post("/create-table", controllers.createTable);
// router.post("/add-table", controllers.addTable);
module.exports = router;
