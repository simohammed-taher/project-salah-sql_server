const fs = require("fs");

async function logErrorToFile(error) {
  try {
    const timestamp = new Date().toLocaleString();

    const errorMessage = `${timestamp}: ${error}\n`;

    const filePath = "errorLog.txt";

    await fs.appendFile(filePath, errorMessage);

    console.log("Error logged to", filePath);
  } catch (err) {
    console.error("Error writing to error log file:", err);
  }
}

async function main() {
  try {
    throw new Error("This is a test error");
  } catch (error) {
    await logErrorToFile(error.message);
  }
}

main();
