const express = require("express");
const router = express.Router();
const controllers = require("../controllers");

router.get("/table/function", controllers.getFunc);
router.get("/table/:nameTable", controllers.getTable);
router.post("/register", controllers.registerUser);
router.post("/login", controllers.loginUser);
// router.post("/create-table", controllers.createTable);
// router.post("/add-table", controllers.addTable);
module.exports = router;
