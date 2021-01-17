import isArray from "../../util/is-array";

export interface CommandArgs {
  id: string;
  command: string;
  targetScreenId: string;
  itemsTaken: string[];
  itemsGiven: string[];
  itemsRequired: string[];
}

function tokeniseRawCommand(command: string): string[] {
  return command.toLocaleLowerCase().trim().split(/\s+/g);
}

function normaliseToken(token: string): string {
  // Compatibility Decomposition, followed by Canonical Composition
  // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
  return token.normalize('NFKC');
}

export default class Command {
  public readonly id: string;
  public readonly command: string;
  public readonly targetScreenId: string;
  public readonly itemsTaken: string[];
  public readonly itemsGiven: string[];
  public readonly itemsRequired: string[];

  public constructor({ id, command, targetScreenId, itemsTaken, itemsGiven, itemsRequired }: CommandArgs) {
    this.id = id;
    this.command = command;
    this.targetScreenId = targetScreenId;
    this.itemsTaken = itemsTaken;
    this.itemsGiven = itemsGiven;
    this.itemsRequired = itemsRequired;
  }

  public static fromRaw(attributes: Record<string, any>): Command {
    // Attributes
    const id: string | unknown = attributes['id'];
    const command: string | unknown = attributes['command'];
    const targetScreenId: string | unknown = attributes['targetScreenId'];
    const itemsTaken: string[] | unknown = attributes['itemsTaken'];
    const itemsGiven: string[] | unknown = attributes['itemsGiven'];
    const itemsRequired: string[] | unknown = attributes['itemsRequired'];

    // Validation
    if (id === undefined) throw new Error("Cannot parse attribute map. Field `id` is empty");
    if (typeof id !== 'string') throw new Error("Cannot parse attribute map. Field `id` must be a string (type 'S')");

    if (command === undefined) throw new Error("Cannot parse attribute map. Field `command` is empty");
    if (typeof command !== 'string') throw new Error("Cannot parse attribute map. Field `command` must be a string (type 'S')");

    if (targetScreenId === undefined) throw new Error("Cannot parse attribute map. Field `targetScreenId` is empty");
    if (typeof targetScreenId !== 'string') throw new Error("Cannot parse attribute map. Field `targetScreenId` must be a string (type 'S')");

    if (itemsTaken === undefined) throw new Error("Cannot parse attribute map. Field `itemsTaken` is empty");
    if (!isArray<string>(itemsTaken, (item) => typeof item === 'string')) throw new Error("Cannot parse attribute map. Field `itemsTaken` must be an array of all strings (type 'L')");

    if (itemsGiven === undefined) throw new Error("Cannot parse attribute map. Field `itemsGiven` is empty");
    if (!isArray<string>(itemsGiven, (item) => typeof item === 'string')) throw new Error("Cannot parse attribute map. Field `itemsGiven` must be an array of all strings (type 'L')");

    if (itemsRequired === undefined) throw new Error("Cannot parse attribute map. Field `itemsRequired` is empty");
    if (!isArray<string>(itemsRequired, (item) => typeof item === 'string')) throw new Error("Cannot parse attribute map. Field `itemsRequired` must be an array of all strings (type 'L')");

    // Construct object
    return new Command({
      id,
      command,
      targetScreenId,
      itemsTaken,
      itemsGiven,
      itemsRequired,
    });
  }

  /**
   * Test whether a string is equivalent to this command.
   * This will perform a relatively tolerant match. Spacing between
   *  words and casing of letters is not considered. Also, strings are
   *  normalised so equivalent unicode representations are considered equal.
   * @param rawOther The string to test
   */
  public isEquivalentTo(rawOther: string): boolean {
    const thisTokens = tokeniseRawCommand(this.command);
    const otherTokens = tokeniseRawCommand(rawOther);

    if (otherTokens.length !== thisTokens.length) {
      return false;
    }

    for (let index = 0; index < otherTokens.length; index++) {
      if (normaliseToken(thisTokens[index]).localeCompare(normaliseToken(otherTokens[index]), undefined, { usage: 'search' }) !== 0) {
        return false;
      }
    }

    return true;
  }
}
