export default class ScreenNotFoundError extends Error {

  public constructor(message: string) {
    // @NOTE obscene hacks required by TypeScript maintainers.
    // See: https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    const trueProto = new.target.prototype;
    super(message);
    Object.setPrototypeOf(this, trueProto);
  }
}
