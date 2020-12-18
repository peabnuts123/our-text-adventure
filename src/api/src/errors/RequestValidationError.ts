import ErrorModel from "./ErrorModel";

class RequestValidationError extends ErrorModel {
  public getModelName = (): string => 'RequestValidationError';
  public getModelVersionNumber = (): number => 1;

  /**
   * The name of the field in the request that was not valid
   */
  public field: string;

  public constructor(field: string, message?: string) {
    super();
    this.field = field;
    this.message = message;
  }

  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
    };
  }
}

export default RequestValidationError;
