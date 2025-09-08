const { writeAppLog, writeErrorLog } = require("../services/fileService");

const logRequest = async (req, res, next) => {
  await writeAppLog({
    type: "request",
    method: req.method,
    url: req.originalUrl,
  });
  next();
};

const logError = async (err, req, res, next) => {
  await writeErrorLog({
    message: err.message,
    stack: err.stack,
  });
  next(err);
};

const logUserAction = async (action, userId, details) => {
  await writeAppLog({
    type: "user_action",
    action,
    userId,
    details,
  });
};

module.exports = {
  logRequest,
  logError,
  logUserAction,
};
