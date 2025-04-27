import { Request, Response } from "express";

export type Context = {
  token?: string | string[];
  req: Request;
  res: Response;
};
