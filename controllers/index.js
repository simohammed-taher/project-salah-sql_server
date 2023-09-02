const sql = require("mssql");
const config = require("../config");
exports.getAllTables = async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT name FROM sys.tables`;
    res.status(201).json(result["recordsets"][0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "err" });
  }
};
