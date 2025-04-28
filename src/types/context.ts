import { Request, Response } from "express";

export type Context = {
  token?: string | string[];
  user?: { id: string; email: string } | null;
  req: Request;
  res: Response;
};
