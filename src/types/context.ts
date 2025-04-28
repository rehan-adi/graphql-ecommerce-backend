import { Request, Response } from "express";

export type Context = {
  token?: string | string[];
  user?: { id: number; email: string } | null;
  req: Request;
  res: Response;
};
