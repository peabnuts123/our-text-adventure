import Logger, { LogLevel } from '@app/util/Logger';
import { compressToBase64, decompressFromBase64 } from 'lz-string';

export interface GameState {
  inventory: string[];
}

const STATE_URL_PARAM_NAME = 'state';
const SCREEN_ID_URL_PARAM_NAME = 'screenId';

export default class StateStore {
  private _currentScreenId: string | undefined;
  private _currentState: GameState;

  public constructor() {
    this._currentState = {
      inventory: [],
    };

    // @NOTE debug functions
    /** Inspect current state contents */
    (window as any).debug_printState = (): void => {
      Logger.log(LogLevel.debug, this._currentState);
    };
    /** Compress / encode a string */
    (window as any).debug_encodeString = (s: string) => {
      Logger.log(LogLevel.debug, compressToBase64(s));
    };
    /** Decode / decompress a string */
    (window as any).debug_decodeString = (base64String: string) => {
      Logger.log(LogLevel.debug, decompressFromBase64(base64String));
    };
  }

  public init(initialScreenId: string): void {
    this.setCurrentScreenId(initialScreenId);

    this._currentState = {
      inventory: [],
    };
  }

  /**
   * Convert the current state object to a compressed, base64 encoded string
   */
  public getStateAsString(): string {
    return compressToBase64(JSON.stringify(this._currentState));
  }

  /**
   * Decompress an encoded string and set the current state from the resultant JSON
   * @param compressedEncodedStateString Compressed, base64 encoded string
   */
  public setStateFromString(compressedEncodedStateString: string): void {
    const json = decompressFromBase64(compressedEncodedStateString) as string;
    if (typeof json !== 'string') {
      throw new Error("Cannot parse compressed state string");
    }

    const newState = JSON.parse(json) as GameState;
    if (newState.inventory === undefined) {
      throw new Error("Parsed state does not appear to be the right type");
    }

    this._currentState = newState;
    this.updateUrlState();
  }

  public hydrateFromCurrentUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);

    // Read screen ID from URL (might not exist)
    this._currentScreenId = urlParams.get(SCREEN_ID_URL_PARAM_NAME) || undefined;

    // Read state from URL (might not exist)
    const maybeStateString: string | undefined = urlParams.get(STATE_URL_PARAM_NAME) || undefined;
    if (maybeStateString !== undefined) {
      this.setStateFromString(maybeStateString);
    }
  }

  public setCurrentScreenId(screenId: string): void {
    this._currentScreenId = screenId;
    this.updateUrlState();
  }

  private updateUrlState(): void {
    const urlParams = new URLSearchParams(window.location.search);
    if (this.currentScreenId !== undefined) {
      urlParams.set(SCREEN_ID_URL_PARAM_NAME, this.currentScreenId);
    }
    urlParams.set(STATE_URL_PARAM_NAME, this.getStateAsString());
    window.history.replaceState(window.history.state, '', decodeURIComponent(`${window.location.pathname}?${urlParams}`));
  }

  // Properties
  public get currentState(): GameState {
    return this._currentState;
  }

  public get currentScreenId(): string | undefined {
    return this._currentScreenId;
  }
}
