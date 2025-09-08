function generateTemporaryPassword() {
  const chars = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    special: "@$!%*?&",
  };

  // Asegurar al menos un carácter de cada tipo
  let password = "";
  password +=
    chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)];
  password +=
    chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)];
  password += chars.numbers[Math.floor(Math.random() * chars.numbers.length)];
  password += chars.special[Math.floor(Math.random() * chars.special.length)];

  // Completar hasta 12 caracteres con caracteres aleatorios
  const allChars =
    chars.uppercase + chars.lowercase + chars.numbers + chars.special;
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar los caracteres para que no sigan un patrón predecible
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

module.exports = {
  generateTemporaryPassword,
};
