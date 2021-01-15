import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import GameScreen from '@app/models/GameScreen';
import Logger, { LogLevel } from '@app/util/Logger';

export interface GameState {
  inventory: string[];
}

const STATE_URL_PARAM_NAME = 'state';
const SCREEN_ID_URL_PARAM_NAME = 'screenId';
const DEFAULT_INITIAL_SCREEN_ID: string = '0290922a-59ce-458b-8dbc-1c33f646580a';

export default class StateStore {
  private _currentScreenId!: string;
  private _currentScreenInstance: GameScreen | undefined;
  private _currentState!: GameState;
  public terminalHistory: string[];

  public constructor() {
    if (typeof window !== 'undefined') {
      // @NOTE debug functions
      /** Inspect current state contents */
      (window as any).debug_printState = (): void => {
        Logger.log(LogLevel.debug, this._currentState);
      };
      /** Compress / encode a string */
      (window as any).debug_encodeString = compressToEncodedURIComponent;
      /** Decode / decompress a string */
      (window as any).debug_decodeString = decompressFromEncodedURIComponent;
    }

    this.terminalHistory = [];
  }


  public init(): void {
    // Default states
    this._currentState = {
      inventory: [],
    };
    this._currentScreenId = DEFAULT_INITIAL_SCREEN_ID;
    this._currentScreenInstance = undefined;

    // Overwrite defaults from URL
    this.hydrateFromCurrentUrl();

    // Ensure URL is up-to-date
    this.updateUrlState();
  }

  /**
   * Convert the current state object to a compressed, base64 encoded string
   */
  public getStateAsString(): string {
    return compressToEncodedURIComponent(JSON.stringify(this._currentState));
  }

  /**
   * Decompress an encoded string and set the current state from the resultant JSON
   * @param compressedEncodedStateString Compressed, base64 encoded string
   */
  public setStateFromString(compressedEncodedStateString: string): void {
    const json = decompressFromEncodedURIComponent(compressedEncodedStateString) as string;
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
    const maybeScreenId: string | undefined = urlParams.get(SCREEN_ID_URL_PARAM_NAME) || undefined;
    if (maybeScreenId) {
      this._currentScreenId = maybeScreenId;
      this._currentScreenInstance = undefined;
      this.updateUrlState();
    }

    // Read state from URL (might not exist)
    const maybeStateString: string | undefined = urlParams.get(STATE_URL_PARAM_NAME) || undefined;
    if (maybeStateString !== undefined) {
      this.setStateFromString(maybeStateString);
    }
  }

  public setCurrentScreen(screen: GameScreen): void {
    this._currentScreenInstance = screen;
    this._currentScreenId = screen.id;
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

  public get currentScreenId(): string {
    return this._currentScreenId;
  }

  public get currentScreen(): GameScreen | undefined {
    return this._currentScreenInstance;
  }
}
