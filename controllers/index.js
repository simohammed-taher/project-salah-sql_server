const sql = require("mssql");
const config = require("../config");
const bcrypt = require("bcrypt");
// Function to get a table from the database
exports.getTable = async (req, res) => {
  try {
    const nameTable = req.params.nameTable;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const username = req.query.username;

    const pool = await sql.connect(config);

    let query = `SELECT * FROM ${nameTable} WHERE [DatePiece] >= @startDate AND [DatePiece] <= @endDate `;

    if (username !== "admin") {
      query +=
        "AND [Etablissement] IN (SELECT [etablissement] FROM [dbo].[maping] WHERE username = @username)";
    }

    const result = await pool
      .request()
      .input("startDate", sql.Date, startDate)
      .input("endDate", sql.Date, endDate)
      .input("username", sql.NVarChar, username)
      .query(query);

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
// Function to get a table maping result from the database
exports.getMaping = async (req, res) => {
  try {
    const { username } = req.body;
    const pool = await sql.connect(config);
    let query = "";

    if (username === "admin") {
      query =
        "SELECT E.Caption, M.etablissement,U.username FROM [DB_Integration].[dbo].[ETABLISSEMENT] AS E JOIN [DB_Integration].[dbo].[maping] AS M ON E.code = M.etablissement JOIN [DB_Integration].[dbo].[Users] AS U ON M.username = U.username";
    } else {
      query = `
        SELECT E.Caption, M.etablissement
        FROM [DB_Integration].[dbo].[ETABLISSEMENT] AS E
        JOIN [DB_Integration].[dbo].[maping] AS M ON E.code = M.etablissement
        JOIN [DB_Integration].[dbo].[Users] AS U ON M.username = U.username
        WHERE U.username = @username;
      `;
    }

    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(query);

    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// function to insert a new etablissement on table maping
exports.insertEtablissement = async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const { code, username, etablissement } = req.body;

    const query = `
      SET IDENTITY_INSERT [maping] off
      INSERT INTO [dbo].[maping] ( [username], [etablissement])
      VALUES ( @username, @etablissement)
    `;

    const result = await pool
      .request()
      .input("code", sql.NVarChar, code)
      .input("username", sql.NVarChar, username)
      .input("etablissement", sql.NVarChar, etablissement)
      .query(query);

    if (result.rowsAffected.length > 0 && result.rowsAffected[0] === 1) {
      console.log("New etablissement inserted successfully.");
      res.status(200).json({
        success: true,
        message: "New etablissement inserted successfully.",
      });
    } else {
      console.error("Failed to insert new etablissement.");
      res.status(500).json({
        success: false,
        message: "Failed to insert new etablissement.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
};
// function to delete etablissement
exports.deleteEtablissement = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { etablissement } = req.body;

    const query = `
      DELETE FROM [dbo].[maping]
      WHERE [etablissement] = @etablissement
    `;

    const result = await pool
      .request()
      .input("etablissement", sql.NVarChar, etablissement)
      .query(query);

    if (result.rowsAffected.length > 0 && result.rowsAffected[0] === 1) {
      console.log("Etablissement deleted successfully.");
      res.status(200).json({
        success: true,
        message: "Etablissement deleted successfully.",
      });
    } else {
      console.error("Etablissement not found or could not be deleted.");
      res.status(404).json({
        success: false,
        message: "Etablissement not found or could not be deleted.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
};
// Function to exucute Procedure  database
exports.execprocedure = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    let query = "EXEc  [dbo].[UPDATE_INTEGRATION]";
    const result = await pool.request().query(query);
    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Function to getdbintegration
exports.getdbinte = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const username = req.query.username; // Assuming username is in the query parameters
    let query =
      "SELECT [DatePiece], [Etablissement], [Code_Journal], SUM([Debit]) as 'Debit', SUM([Credit]) as 'Credit' FROM [DB_Integration].[dbo].[DB_Integration] WHERE [DatePiece] >= @startDate AND [DatePiece] <= @endDate";

    if (username !== "admin") {
      query +=
        " AND [Etablissement] IN (SELECT [etablissement] FROM [dbo].[maping] WHERE username = @username)";
    }

    query +=
      " GROUP BY [DatePiece], [Etablissement], [Code_Journal] ORDER BY [DatePiece], [Etablissement], [Code_Journal];";

    const result = await pool
      .request()
      .input("startDate", sql.Date, startDate)
      .input("endDate", sql.Date, endDate)
      .input("username", sql.NVarChar, username)
      .query(query);

    res.status(200).json({
      result1: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Function to aficher username and etablisment
exports.user_etab = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    let query = "select username from Users select code from ETABLISSEMENT";
    let query1 = "select code from ETABLISSEMENT";
    const result = await pool.request().query(query);
    const result1 = await pool.request().query(query1);
    res.status(200).json({
      result: [result.recordset, result1.recordset],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
