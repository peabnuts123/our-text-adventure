export default class Command {
  public readonly id: string;
  public readonly command: string;
  public readonly targetScreenId: string;

  public constructor(id: string, command: string, targetScreenId: string) {
    this.id = id;
    this.command = command;
    this.targetScreenId = targetScreenId;
  }

  public static fromRaw(attributes: Record<string, any>): Command {
    // Attributes
    const id: string | unknown = attributes['id'];
    const command: string | unknown = attributes['command'];
    const targetScreenId: string | unknown = attributes['targetScreenId'];

    // Validation
    if (id === undefined) throw new Error("Cannot parse attribute map. Field `id` is empty");
    if (typeof id !== 'string') throw new Error("Cannot parse attribute map. Field `id` must be a string (type 'S')");

    if (command === undefined) throw new Error("Cannot parse attribute map. Field `command` is empty");
    if (typeof command !== 'string') throw new Error("Cannot parse attribute map. Field `command` must be a string (type 'S')");

    if (targetScreenId === undefined) throw new Error("Cannot parse attribute map. Field `targetScreenId` is empty");
    if (typeof targetScreenId !== 'string') throw new Error("Cannot parse attribute map. Field `targetScreenId` must be a string (type 'S')");

    // Construct object
    return new Command(
      id,
      command,
      targetScreenId,
    );
  }
}
