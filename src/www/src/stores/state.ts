import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import GameScreen from '@app/models/GameScreen';
import Logger, { LogLevel } from '@app/util/Logger';

export interface GameState {
  inventory: string[];
}

/**
 * When no screen ID can be loaded, this is the root screen
 * of the game that is to be loaded. It is hard-coded here
 * into the client app for performance reasons.
 */
const DEFAULT_INITIAL_SCREEN_ID: string = '0290922a-59ce-458b-8dbc-1c33f646580a';

// Keys for URL storage
const STATE_URL_PARAM_NAME = 'state';
const SCREEN_ID_URL_PARAM_NAME = 'screenId';

// Keys for session/local storage
const SCREEN_ID_STORAGE_KEY = 'OTA_SCREEN_ID';
const STATE_STORAGE_KEY = 'OTA_STATE';

/**
 * Stores and manipulates state within the game.
 * e.g. Which "screen" you are on, what items you have, etc.
 * It's assumed there's only one instance of this in the website
 */
export default class StateStore {
  private _currentScreenId!: string;
  private _currentScreenInstance: GameScreen | undefined;
  private _currentState!: GameState;
  /**
   * Whether the state store is reading from its various sources.
   * This is used to prevent writes from occurring while reading is
   * still in-process (i.e. setting default values while still
   * trying to read)
   */
  private _isReadingStoredState: boolean;

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
    this._isReadingStoredState = false;
  }


  public refresh(): void {
    // Load all state
    this.hydrateState();

    // Ensure State sources are up-to-date
    this.storeState();
  }

  /**
   * Write defaults and store state to all sources
   */
  public resetState(): void {
    this._currentScreenId = DEFAULT_INITIAL_SCREEN_ID;
    this._currentScreenInstance = undefined;

    this._currentState = {
      inventory: [],
    };

    this.storeState();
  }

  /**
   * Update the state in this store from various sources in priority order:
   * 1. The URL
   * 2. (If a field is not present in the URL) Session Storage
   * 3. (If a field is not present in the URL or Session Storage) Local Storage
   * 4. Otherwise, set to defaults
   */
  public hydrateState(): void {
    // Safeguard for server-side rendering
    if (typeof window === 'undefined') {
      return;
    }

    // Processing state
    let hasSetScreenId = false;
    let hasSetState = false;

    // Prevent writes from happening
    this._isReadingStoredState = true;

    // Common functions
    /** Given a possible stored screen id string, validate and read it, then store it */
    const maybeHydrateScreenId = (maybeScreenId: string | null, debug_sourceName: string): void => {
      // Ensure we have not already processed screen ID, and that screen ID is not null
      if (!hasSetScreenId && maybeScreenId !== null) {
        hasSetScreenId = true;
        Logger.log(LogLevel.debug, `Hydrating Screen ID from ${debug_sourceName}`);
        this._currentScreenId = maybeScreenId;
        this._currentScreenInstance = undefined;
      }
    };
    /** Given a possible stored state string, validate and read it, then store it */
    const maybeHydrateState = (maybeStateString: string | null, debug_sourceName: string): void => {
      // Ensure we have not already processed state, and that state string is not null
      if (!hasSetState && maybeStateString !== null) {
        hasSetState = true;
        Logger.log(LogLevel.debug, `Hydrating State from ${debug_sourceName}`);
        this.setStateFromString(maybeStateString);
      }
    };

    /* PREFERENCE 1: The URL */
    const urlParams = new URLSearchParams(window.location.search);
    if (!hasSetScreenId) {
      // Read screen ID from URL (might not exist)
      maybeHydrateScreenId(urlParams.get(SCREEN_ID_URL_PARAM_NAME), 'URL');
    }
    if (!hasSetState) {
      // Read state from URL (might not exist)
      maybeHydrateState(urlParams.get(STATE_URL_PARAM_NAME), 'URL');
    }

    /* PREFERENCE 2: Session Storage */
    if (!hasSetScreenId) {
      // Read screen ID from Session Storage (might not exist)
      maybeHydrateScreenId(window.sessionStorage.getItem(SCREEN_ID_STORAGE_KEY), 'Session Storage');
    }
    if (!hasSetState) {
      // Read state from Session Storage (might not exist)
      maybeHydrateState(window.sessionStorage.getItem(STATE_STORAGE_KEY), 'Session Storage');
    }

    /* PREFERENCE 3: Local Storage */
    if (!hasSetScreenId) {
      // Read screen ID from Local Storage (might not exist)
      maybeHydrateScreenId(window.localStorage.getItem(SCREEN_ID_STORAGE_KEY), 'Local Storage');
    }
    if (!hasSetState) {
      // Read state from Local Storage (might not exist)
      maybeHydrateState(window.localStorage.getItem(STATE_STORAGE_KEY), 'Local Storage');
    }

    /* PREFERENCE 4: Use defaults */
    if (!hasSetScreenId) {
      Logger.log(LogLevel.debug, "Using default Screen ID");
      this._currentScreenId = DEFAULT_INITIAL_SCREEN_ID;
      this._currentScreenInstance = undefined;
    }
    if (!hasSetState) {
      Logger.log(LogLevel.debug, "Using default state");
      this._currentState = {
        inventory: [],
      };
    }

    // Allow writes again
    this._isReadingStoredState = false;
  }

  /**
   * Store the state in this store to various sources:
   * 1. The URL (for sharing / bookmarking)
   * 2. Session Storage (for persistence within a tab)
   * 3. Local Storage (for persistence between sessions)
   */
  private storeState(): void {
    // Safeguard for server-side rendering
    if (typeof window === 'undefined') {
      return;
    }

    // Do not write state to sources while trying to read
    // Assume that it will be stored again after being read
    if (this._isReadingStoredState) {
      return;
    }

    /* PREFERENCE 1: The URL */
    const urlParams = new URLSearchParams(window.location.search);
    if (this.currentScreenId !== undefined) {
      urlParams.set(SCREEN_ID_URL_PARAM_NAME, this.currentScreenId);
    }
    urlParams.set(STATE_URL_PARAM_NAME, this.getStateAsString());
    window.history.replaceState(window.history.state, '', decodeURIComponent(`${window.location.pathname}?${urlParams}`));

    /* PREFERENCE 2: Session Storage */
    if (this.currentScreenId !== undefined) {
      window.sessionStorage.setItem(SCREEN_ID_STORAGE_KEY, this.currentScreenId);
    }
    window.sessionStorage.setItem(STATE_STORAGE_KEY, this.getStateAsString());

    /* PREFERENCE 3: Local Storage */
    if (this.currentScreenId !== undefined) {
      window.localStorage.setItem(SCREEN_ID_STORAGE_KEY, this.currentScreenId);
    }
    window.localStorage.setItem(STATE_STORAGE_KEY, this.getStateAsString());
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
    this.storeState();
  }

  /**
   * Convert the current state object to a compressed, base64 encoded string
   */
  public getStateAsString(): string {
    return compressToEncodedURIComponent(JSON.stringify(this._currentState));
  }

  public setCurrentScreen(screen: GameScreen): void {
    this._currentScreenInstance = screen;
    this._currentScreenId = screen.id;
    this.storeState();
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
