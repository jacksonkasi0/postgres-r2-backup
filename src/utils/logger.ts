// ** Import packages
import winston from "winston";

const { format, transports, createLogger } = winston;

// Define custom log levels and colors
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    success: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "red",
    warn: "yellow",
    info: "blue",
    success: "green",
    debug: "magenta",
  },
};

// Add custom colors to winston
winston.addColors(customLevels.colors);

// Create a custom logger with the defined levels and formats
export const logger = createLogger({
  levels: customLevels.levels,
  level: "debug", // Set the minimum level to log
  format: format.combine(
    format.colorize(), // Enable colors for logs
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamps
    format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Log to the console
  ],
});

// Shortcuts for different log levels
export const log = {
  fatal: (...args: unknown[]) => logger.log("fatal", args.map(String).join(" ")),
  error: (...args: unknown[]) => logger.log("error", args.map(String).join(" ")),
  warn: (...args: unknown[]) => logger.log("warn", args.map(String).join(" ")),
  info: (...args: unknown[]) => logger.log("info", args.map(String).join(" ")),
  success: (...args: unknown[]) => logger.log("success", args.map(String).join(" ")),
  debug: (...args: unknown[]) => logger.log("debug", args.map(String).join(" ")),
};
