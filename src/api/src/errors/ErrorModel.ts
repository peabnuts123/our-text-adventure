abstract class ErrorModel {
  /**
   * Optional human-readable message to include in the error payload, describing what the issue is.
   * This message may (or may not) be displayed in client apps.
   */
  public message: string | undefined;

  /**
   * Unique name for this model. Used in conjunction with `GetModelVersionNumber`
   *     by client apps to bind the payload to a concrete type / know what fields to expect
   * @NOTE That if this value ever changes, client code will need to update too.
   */
  public abstract getModelName(): string;
  /**
   * Version number for the fields in this model.
   * @NOTE DO NOT CHANGE THE PROPERTIES ON THIS MODEL WITHOUT INCREASING THE VERSION NUMBER.
   * Used by client apps in conjunction with `GetModelName` to bind the payload
   *     to a concrete type / know what fields to expect
   */
  public abstract getModelVersionNumber(): number;

  public toJSON(): Record<string, unknown> {
    return {
      model: this.getModelName(),
      modelVersion: this.getModelVersionNumber(),
      message: this.message,
    };
  }
}

export default ErrorModel;
