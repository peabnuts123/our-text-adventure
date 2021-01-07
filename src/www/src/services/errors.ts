export class ApiErrorModel {
  public readonly modelVersion: number;
  public readonly message?: string;

  public constructor(raw: any) {
    // Validation
    if (raw.modelVersion === undefined) {
      throw new Error("Cannot construct ErrorModel. No `modelVersion` field is present");
    }

    this.modelVersion = raw.modelVersion as number;
    this.message = raw.message as string;
  }
}

export class ApiError extends ApiErrorModel {
  public readonly errors: ApiErrorModel[];

  public constructor(raw: any) {
    super(raw);

    // Validation
    if (raw.errors === undefined) {
      throw new Error("Cannot construct ApiError. No `errors` field is present");
    }

    const rawErrors: any[] = raw.errors as any[];
    this.errors = rawErrors.map((rawError) => parseApiErrorModel(rawError));
  }
}

export class GenericApiError extends ApiErrorModel {
  public readonly id: string;

  public constructor(raw: any) {
    super(raw);

    // Validation
    if (raw.id === undefined) {
      throw new Error("Cannot construct GenericError. No `id` field is present");
    }

    this.id = raw.id as string;
  }
}

export class RequestValidationApiError extends ApiErrorModel {
  public readonly field: string;

  public constructor(raw: any) {
    super(raw);

    // Validation
    if (raw.field === undefined) {
      throw new Error("Cannot construct RequestValidationError. No `field` field is present");
    }

    this.field = raw.field as string;
  }
}

export class UnknownApiError extends ApiErrorModel {
  public constructor(raw: any) {
    super(raw);
  }
}

export function parseApiErrorModel(raw: any): ApiErrorModel {
  const modelName: string = raw.model as string;
  if (modelName === undefined) {
    throw new Error("Cannot parse raw error model. No `model` property is present");
  }

  switch (modelName) {
    case 'ApiError':
      return new ApiError(raw);
    case 'GenericError':
      return new GenericApiError(raw);
    case 'RequestValidationError':
      return new RequestValidationApiError(raw);
    case 'UnknownError':
      return new UnknownApiError(raw);
    default:
      throw new Error("Cannot parse raw error model. Unknown model: " + modelName);
  }
}
