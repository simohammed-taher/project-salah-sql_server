const express = require("express");
const router = express.Router();
const controllers = require("../controllers");

router.get("/table/function", controllers.getFunc);
router.post("/table/users", controllers.getUsers);
router.get("/table/:nameTable", controllers.getTable);
router.post("/login", controllers.loginUser);

module.exports = router;
