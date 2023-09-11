const express = require("express");
const router = express.Router();
const controllers = require("../controllers");

router.get("/table/function", controllers.getFunc);
router.post("/table/users", controllers.getUsers);
router.post("/table/maping", controllers.getMaping);
router.post("/insertetablissement", controllers.insertEtablissement);
router.delete("/deleteEtablissement", controllers.deleteEtablissement);
router.get("/table/getdbinte", controllers.getdbinte);
router.get("/actualiser", controllers.execprocedure);
router.get("/user_etab", controllers.user_etab);
router.get("/afficheruserpass", controllers.afficheruserpass);
router.get("/table/:nameTable", controllers.getTable);
router.post("/login", controllers.loginUser);
router.post("/reset-password", controllers.resetPassword);
router.post("/reset-oldpassword", controllers.resetOldPassword);

module.exports = router;
