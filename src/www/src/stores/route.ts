
import Logger, { LogLevel } from '@app/util/Logger';
import { } from 'gatsby';

// @NOTE may not be accurate, just guessed based on
//  the data passed to onRouteUpdate.
// See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#onRouteUpdate
export interface RouterLocationObject {
  "pathname": string,
  "search": string,
  "hash": string,
  "href": string,
  "origin": string,
  "protocol": string,
  "host": string,
  "hostname": string,
  "port": string,
  "state": {
    "key": string,
  },
  "key": string,
  "action": string,
}

export interface RouterOnChangeArgs {
  previousLocation: RouterLocationObject;
  location: RouterLocationObject;
}

export type OnRouteChangeFunction = (args: RouterOnChangeArgs) => void;

export default class RouteStore {
  private _onRouteChangeCallbacks: OnRouteChangeFunction[];

  public constructor() {
    this._onRouteChangeCallbacks = [];
  }

  public addRouteChangeListener(listenerFunction: OnRouteChangeFunction): void {
    this._onRouteChangeCallbacks.push(listenerFunction);
  }

  public removeRouteChangeListener(listenerFunction: OnRouteChangeFunction): void {
    if (!this._onRouteChangeCallbacks.includes(listenerFunction)) {
      throw new Error("Failed to unsubscribe route change listener - listener function is not currently subscribed. Did you pass the same instance?");
    }

    this._onRouteChangeCallbacks = this._onRouteChangeCallbacks.filter((callback) => callback !== listenerFunction);
  }

  public onRouteChange(args: RouterOnChangeArgs): void {
    Logger.log(LogLevel.debug, "Firing router store onRouteChange", args);
    this._onRouteChangeCallbacks.forEach((callback) => callback(args));
  }
}
