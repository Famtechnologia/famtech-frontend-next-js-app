const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghjkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*";

export function generateStrongPassword(length = 14): string {
  const all = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;

  // Guarantee at least one of each required character class
  const required = [
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)],
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)],
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)],
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)],
    DIGITS[Math.floor(Math.random() * DIGITS.length)],
    DIGITS[Math.floor(Math.random() * DIGITS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];

  const rest = Array.from({ length: length - required.length }, () =>
    all[Math.floor(Math.random() * all.length)]
  );

  // Fisher-Yates shuffle
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
