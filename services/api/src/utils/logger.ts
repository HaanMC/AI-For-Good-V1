export type LogContext = Record<string, string | number | boolean | null | undefined>;

export const logInfo = (message: string, context: LogContext = {}) => {
  const payload = {
    level: "info",
    message,
    ...context,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify(payload));
};

export const logError = (message: string, context: LogContext = {}) => {
  const payload = {
    level: "error",
    message,
    ...context,
    timestamp: new Date().toISOString(),
  };
  console.error(JSON.stringify(payload));
};
