const sql = require("mssql");
const config = require("../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Function to get a table from the database
exports.getTable = async (req, res) => {
  try {
    const nameTable = req.params.nameTable;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("startDate", sql.Date, startDate)
      .input("endDate", sql.Date, endDate)
      .query(
        `
        SELECT * FROM ${nameTable}
        WHERE [DatePiece] >= @startDate AND [DatePiece] <= @endDate
        `
      );

    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to get a function result from the database
exports.getFunc = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("startDate", sql.Date, startDate)
      .input("endDate", sql.Date, endDate).query(`
        SELECT * FROM [dbo].[ObtenirTableauErreur]()
        WHERE [DatePiece] BETWEEN @startDate AND @endDate;
      `);

    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to register a user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .query(
        "INSERT INTO Users (username, email, password) VALUES (@username, @email, @password)"
      );

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Function to handle user login
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE username = @username");

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // Generate and send a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      "your_secret_key",
      { expiresIn: "1h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
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
