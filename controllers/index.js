const sql = require("mssql");
const config = require("../config");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
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

// Function to handle user login
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log({ password });
    const pool = await sql.connect(config);
    let query =
      "SELECT * FROM Users WHERE username = @username AND password = @password";
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .query(query);
    console.log({ result });
    const user = result.recordsets[0];
    const user1 = result.recordset[0];
    console.log({ user, user1 });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to get a table Users result from the database
exports.getUsers = async (req, res) => {
  try {
    const { username } = req.body;
    console.log(req.body);
    console.log({ username });
    const pool = await sql.connect(config);
    let query = `
      SELECT [username]
      ,[Caption]
      ,[Disabled]
  FROM [DB_Integration].[dbo].[Users] 
    `;
    if (username !== "admin") {
      query += " WHERE [username] = @username";
    }
    console.log({ query });
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(query);

    console.log({ result });
    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
