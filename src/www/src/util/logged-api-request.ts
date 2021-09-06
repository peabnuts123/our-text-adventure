import { ApiErrorResponse } from "@app/services/api";
import Logger, { LogLevel } from "./Logger";

export function loggedApiRequest<T>(func: () => T): T {
  try {
    return func();
  } catch (e) {
    if (e instanceof ApiErrorResponse) {
      Logger.logError(LogLevel.debug, `API returned error: `, e);
    }
    throw e;
  }
}
