import { Logtail } from "@logtail/browser";

const token = import.meta.env.VITE_BETTERSTACK_TOKEN;
const isProd = import.meta.env.PROD;
const logtail = isProd && token ? new Logtail(token) : null;

export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    if (logtail) logtail.error(message, context);
    if (!isProd) console.error(message, context);
  },
  warn(message: string, context?: Record<string, unknown>) {
    if (logtail) logtail.warn(message, context);
    if (!isProd) console.warn(message, context);
  },
  info(message: string, context?: Record<string, unknown>) {
    if (logtail) logtail.info(message, context);
    if (!isProd) console.info(message, context);
  },
  debug(message: string, context?: Record<string, unknown>) {
    if (!isProd) console.debug(message, context);
  },
};
