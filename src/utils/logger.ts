import winston from "winston";

const { combine, timestamp, printf, errors, splat } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), errors({ stack: true }), splat(), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});