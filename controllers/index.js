const sql = require("mssql");
const config = require("../config");
const bcrypt = require("bcrypt");
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
    const pool = await sql.connect(config);

    const checkUserQuery = `
      SELECT * FROM [DB_Integration].[dbo].[Users]
      WHERE [username] = @username 
    `;
    const userResult = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(checkUserQuery);

    const user = userResult.recordset[0];

    if (!user) {
      return res.status(404).json({ error: "User or Password is incorrect" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "User or Password is incorrect" });
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
    // console.log(req.body);
    // console.log({ username });
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
    // console.log({ query });
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(query);

    // console.log({ result });
    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Function to reset a user's password
exports.resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const pool = await sql.connect(config);
    const newPasswordHashed = await bcrypt.hash(newPassword, 10);
    console.log({ newPasswordHashedAdmin: newPasswordHashed });
    const resetPasswordQuery = `
      UPDATE [DB_Integration].[dbo].[Users] 
      SET [password] = @newPasswordHashed
      WHERE [username] = @username
    `;
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("newPasswordHashed", sql.NVarChar, newPasswordHashed)
      .query(resetPasswordQuery);
    // console.log({ resetPasswordQuery });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Function to reset a user's oldpassword
exports.resetOldPassword = async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const pool = await sql.connect(config);
    const checkOldPasswordQuery = `
    SELECT * FROM [DB_Integration].[dbo].[Users]
      WHERE [username] = @username 
    `;
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(checkOldPasswordQuery);

    const user = result.recordset?.[0] ?? null;
    if (!user) {
      return res.status(404).json({ error: "User or Password is incorrect" });
    }

    let isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "User or Password is incorrect" });
    }

    let newPasswordHashed = await bcrypt.hash(newPassword, 10);
    const resetPasswordQuery = `
      UPDATE [DB_Integration].[dbo].[Users]
      SET [password] = @newPasswordHashed
      WHERE [username] = @username
    `;
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("newPasswordHashed", sql.NVarChar, newPasswordHashed)
      .query(resetPasswordQuery);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//
