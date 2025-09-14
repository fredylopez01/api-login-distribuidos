const fs = require("fs").promises;
const dbConfig = require("../config/database");

async function readUsers() {
  try {
    const data = await fs.readFile(
      dbConfig.users.path,
      dbConfig.users.encoding
    );
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await fs.writeFile(dbConfig.users.path, JSON.stringify(users, null, 2));
}

async function readResetTokens() {
  try {
    const data = await fs.readFile(
      dbConfig.resetTokens.path,
      dbConfig.resetTokens.encoding
    );
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeResetTokens(tokens) {
  await fs.writeFile(
    dbConfig.resetTokens.path,
    JSON.stringify(tokens, null, 2)
  );
}

async function writeAppLog(log) {
  const line = `[${new Date().toISOString()}] ${log.type.toUpperCase()} - ${
    log.method || ""
  } ${log.url || ""} ${log.action || ""} ${log.userId || ""} ${
    log.details || ""
  }`.trim();
  await fs.appendFile(dbConfig.appLogs.path, line + "\n");
}

async function writeErrorLog(log) {
  const line = `[${new Date().toISOString()}] ERROR - ${log.message}\nSTACK: ${
    log.stack || "N/A"
  }`;
  await fs.appendFile(dbConfig.erroLogs.path, line + "\n");
}

module.exports = {
  readUsers,
  writeUsers,
  readResetTokens,
  writeResetTokens,
  writeAppLog,
  writeErrorLog,
};
