import winston, { createLogger, format, transports } from "winston";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, "../logs");
const errorLogDir = path.resolve(logDir, "error");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
if (!fs.existsSync(errorLogDir)) {
  fs.mkdirSync(errorLogDir, { recursive: true });
}

const customFormat = format.printf((info) => {
  const metaStr = info.meta ? ` | ${typeof info.meta === "object" ? JSON.stringify(info.meta) : info.meta}` : "";
  const methodStr = info.method ? ` [${info.method}]` : "";
  const urlStr = info.url ? ` ${info.url}` : "";
  const statusStr = info.status ? ` (Status: ${info.status})` : "";
  return `${info.timestamp} [${info.level}]${methodStr}${urlStr}${statusStr}: ${info.message}${metaStr}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
      ),
    }),
    new transports.File({
      filename: path.join(errorLogDir, "error.log"),
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logDir, "combinedlog.log"),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
    }),
  ],
});

export default logger;
