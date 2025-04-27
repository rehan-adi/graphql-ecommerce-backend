import bcrypt from "bcrypt";

export function HashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function CompirePassword(hash: string, password: string) {
  return bcrypt.compare(hash, password);
}
