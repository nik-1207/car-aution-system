import { HttpError } from "http-errors";
import type { Request, Response, NextFunction } from "express";

// eslint-disable-next-line max-params
export function errorHandler(
  err: unknown,
  _request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const status = err instanceof HttpError && typeof err.status === "number" ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  response.status(status).send({
    status: "error",
    message,
  });
}