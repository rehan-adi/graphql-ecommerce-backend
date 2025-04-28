import jwt from "jsonwebtoken";

export function GenerateToken(id: number, email: string) {
  const payload = {
    id,
    email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "72h" });
}