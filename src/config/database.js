const path = require("path");

const dbConfig = {
  users: {
    path: path.join(__dirname, "../../data/users.json"),
    encoding: "utf8",
  },
  resetTokens: {
    path: path.join(__dirname, "../../data/reset_tokens.json"),
    encoding: "utf8",
  },
  appLogs: {
    path: path.join(__dirname, "../../data/app.log"),
    encoding: "utf8",
  },
  erroLogs: {
    path: path.join(__dirname, "../../data/error.log"),
    encoding: "utf8",
  },
};

module.exports = dbConfig;
