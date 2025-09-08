const bcrypt = require("bcrypt");

async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function comparePasswords(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function encryptSensitiveData(data) {
  if (data.includes("@")) {
    const [user, domain] = data.split("@");
    return `${user.substring(0, 2)}***@${domain}`;
  }
  return data;
}

module.exports = {
  hashPassword,
  comparePasswords,
  encryptSensitiveData,
};
