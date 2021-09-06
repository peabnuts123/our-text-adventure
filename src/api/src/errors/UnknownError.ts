import Logger from "@app/util/Logger";

import ErrorModel from "./ErrorModel";

class UnknownError extends ErrorModel {
  public getModelName = (): string => 'UnknownError';
  public getModelVersionNumber = (): number => 1;

  public constructor(error?: string | Error) {
    super();

    if (error !== undefined) {
      if (error instanceof Error) {
        Logger.logError("Unknown error: ", error);
        this.message = error.message;
      } else {
        this.message = error;
      }
    }
  }
}

export default UnknownError;
