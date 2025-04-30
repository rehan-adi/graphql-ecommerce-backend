import jwt from "jsonwebtoken";

export function GenerateToken(id: number, email: string, role: string) {
  const payload = {
    id,
    email,
    role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "72h" });
}

export function VerifyToken(token: string) {
  if (!token) {
    return null;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);

  return decoded as { id: number; email: string, role: string };
}
