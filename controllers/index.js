const sql = require("mssql");
const config = require("../config");
exports.getAllTables = async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM sys.tables`;
    res.status(201).json(result["recordsets"][0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "err" });
  }
};
//create table
exports.createTable = async (req, res) => {
  const { tableName, columns } = req.body;
  try {
    await sql.connect(config);
    const createTableQuery = `
      CREATE TABLE ${tableName} (
        ${columns.map((column) => `${column.name} ${column.type}`).join(", ")}
      )
    `;
    await sql.query(createTableQuery);
    // console.log(createTableQuery);
    res.status(201).json({ message: "Table created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
// add table
exports.addTable = async (req, res) => {
  console.log(req.body);
  const { name } = req.body;
  try {
    await sql.connect(config);
    const result =
      await sql.query`INSERT INTO sys.tables (name) VALUES (${name})`;

    res.status(201).json({ message: "Table added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
