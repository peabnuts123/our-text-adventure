import ErrorId from "./ErrorId";
import ErrorModel from "./ErrorModel";

class GenericError extends ErrorModel {
  public getModelName = (): string => 'GenericError';
  public getModelVersionNumber = (): number => 1;

  /**
   * Unique ErrorId for client apps to identify this error.
   * @NOTE That if you ever change the value of this (either by passing a different ErrorId or
   *     even by refactoring the name of the enum) you MUST also update any client apps to reflect this.
   * IDEALLY this would never change.
   */
  public id: ErrorId;

  public constructor(id: ErrorId, error?: string | Error) {
    super();
    this.id = id;

    if (error !== undefined) {
      if (error instanceof Error) {
        this.message = error.message;
      } else {
        this.message = error;
      }
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      id: this.id,
    };
  }
}

export default GenericError;
