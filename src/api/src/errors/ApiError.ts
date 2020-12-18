import ErrorModel from "./ErrorModel";

export interface ApiErrorArgs {
  message?: string;
  error?: ErrorModel;
  errors?: ErrorModel[];
}

class ApiError extends ErrorModel {
  public getModelName = (): string => 'ApiError';
  public getModelVersionNumber = (): number => 1;

  public errors: ErrorModel[] | undefined;

  public constructor({ message, error, errors }: ApiErrorArgs) {
    super();

    // @TODO should test ApiError a bit

    /** Whether at least 1 error has been provided */
    const anyErrorsProvided: boolean = error !== undefined || (errors !== undefined && errors.length > 0);

    // Validation
    if (error !== undefined && errors !== undefined) {
      // Ensure not both `error` and `errors` provided
      throw new Error("Failed to construct ApiError. You may provide either `error` or `errors` - not both");
    } else if (message === undefined && !anyErrorsProvided) {
      // Ensure at least 1 of
      throw new Error("Failed to construct ApiError. You must provide at least one of: message, error/errors");
    }

    this.message = message;

    if (error !== undefined) {
      // Convert single error to array
      this.errors = [error];
    } else if (errors !== undefined) {
      // Use provided array
      this.errors = errors;
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

export default ApiError;
