require("dotenv").config();
const express = require("express");
const app = express();
const v1 = require("./routes");
app.use("/v1", v1);
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
