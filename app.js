require("dotenv").config();
const express = require("express");
const app = express();
const v1 = require("./routes");
const cors = require("cors");
app.use(express.json());
app.use(cors());

app.use("/v1", v1);
const port = process.env.PORT ?? 8000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
