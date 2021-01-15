import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import Command from '../db/models/Command';
import Messaging from '../constants/Messaging';

export interface ClientGameState {
  inventory: string[];
}

export class ClientStateHandlingError extends Error {
  public constructor(message: string) {
    // @NOTE obscene hacks required by TypeScript maintainers.
    // See: https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    const trueProto = new.target.prototype;

    super(message);

    Object.setPrototypeOf(this, trueProto);
  }
}

export function parseClientStateFromString(stateString: string): ClientGameState {
  const json = decompressFromEncodedURIComponent(stateString) as string;

  if (typeof json !== 'string') {
    throw new Error("Cannot parse compressed and encoded state string");
  }

  const newState = JSON.parse(json) as ClientGameState;
  if (newState.inventory === undefined) {
    throw new Error("Parsed state does not appear to be the right type");
  }

  return newState;
}

export function encodeClientStateAsString(state: ClientGameState): string {
  return compressToEncodedURIComponent(JSON.stringify(state));
}

// @TODO write tests for this
export function areItemsEquivalent(itemA: string, itemB: string): boolean {
  return itemA.trim().localeCompare(itemB.trim(), undefined, { sensitivity: 'accent' }) === 0;
}

export function applyCommandToClientState(stateString: string, command: Command): string {
  // Decode string into an object
  const state = parseClientStateFromString(stateString);

  // Check state has required items
  command.itemsRequired.forEach((requiredItem) => {
    if (!state.inventory.some((inventoryItem) => areItemsEquivalent(inventoryItem, requiredItem))) {
      // Required item is not found, throw error
      throw new ClientStateHandlingError(Messaging.RequiredItemNotPresent);
    }
  });

  // Remove taken items and ensure state has them
  command.itemsTaken.forEach((takenItem) => {
    const inventoryIndex = state.inventory.findIndex((item) => areItemsEquivalent(item, takenItem));
    if (inventoryIndex === -1) {
      // Required item is not found, throw error
      throw new ClientStateHandlingError(Messaging.RequiredItemNotPresent);
    } else {
      // Remove item at index
      state.inventory.splice(inventoryIndex, 1);
    }
  });

  // Reward given items
  command.itemsGiven.forEach((givenItem) => {
    state.inventory.push(givenItem);
  });

  // Re-encode state as string
  return encodeClientStateAsString(state);
}
