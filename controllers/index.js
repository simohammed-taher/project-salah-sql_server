const sql = require("mssql");
const config = require("../config");
exports.getTable = async (req, res) => {
  try {
    const nameTable = req.params.nameTable;
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT * FROM ${nameTable} 
    `);

    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getFunc = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
     SELECT * FROM [dbo].[ObtenirTableauErreur] ()
    `);

    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//create table
// exports.createTable = async (req, res) => {
//   const { tableName, columns } = req.body;
//   try {
//     await sql.connect(config);
//     const createTableQuery = `
//       CREATE TABLE ${tableName} (
//         ${columns.map((column) => `${column.name} ${column.type}`).join(", ")}
//       )
//     `;
//     await sql.query(createTableQuery);
//     // console.log(createTableQuery);
//     res.status(201).json({ message: "Table created successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
// add table
// exports.addTable = async (req, res) => {
//   console.log(req.body);
//   const { name } = req.body;
//   try {
//     await sql.connect(config);
//     const result =
//       await sql.query`INSERT INTO sys.tables (name) VALUES (${name})`;

//     res.status(201).json({ message: "Table added successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
