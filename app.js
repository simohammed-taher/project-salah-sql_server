require("dotenv").config();
const express = require("express");
const app = express();
const v1 = require("./routes");
const cors = require("cors");
app.use(express.json());
app.use(cors());
const fs = require("fs");

const requestLogger = (req, res, next) => {
  const logEntry = `${new Date().toISOString()}: ${req.method} ${req.url}\n`;
  fs.appendFile("requestLog.txt", logEntry, (err) => {
    if (err) {
      console.error("Error logging request:", err);
    }
  });
  next();
};
app.use(requestLogger);

app.use("/v1", v1);
const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
