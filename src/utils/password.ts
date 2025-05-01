import bcrypt from "bcryptjs";

export function HashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function ComparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
