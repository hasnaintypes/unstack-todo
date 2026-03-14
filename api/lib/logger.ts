import { Logtail } from "@logtail/node";

const token = process.env.BETTERSTACK_TOKEN;
const isProd = process.env.NODE_ENV === "production";
const logtail = isProd && token ? new Logtail(token) : null;

export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    if (logtail) logtail.error(message, context);
    console.error(message, context);
  },
  warn(message: string, context?: Record<string, unknown>) {
    if (logtail) logtail.warn(message, context);
    console.warn(message, context);
  },
  info(message: string, context?: Record<string, unknown>) {
    if (logtail) logtail.info(message, context);
    console.info(message, context);
  },
  debug(message: string, context?: Record<string, unknown>) {
    if (!isProd) console.debug(message, context);
  },
};
