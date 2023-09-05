require("dotenv").config();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const DB_CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    instanceName: process.env.DB_INSTANCE,
    trustServerCertificate: true,
    requestTimeout: 0,
  },
};
console.log(DB_CONFIG);
module.exports = DB_CONFIG;
