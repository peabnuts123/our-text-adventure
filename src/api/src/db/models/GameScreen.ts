import Command from "./Command";
import isArray from '../../util/is-array';

export interface GameScreenArgs {
  id: string;
  body: string[];
  commands: Command[];
}

export default class GameScreen {
  public readonly id: string;
  public readonly body: string[];
  public readonly commands: Command[];

  public constructor({ id, body, commands }: GameScreenArgs) {
    this.id = id;
    this.body = body;
    this.commands = commands;
  }

  public static fromRaw(attributes: Record<string, any>): GameScreen {
    // Attributes
    const id: string | unknown = attributes['id'];
    const body: string[] | unknown = attributes['body'];
    const commands: Record<string, unknown>[] | unknown = attributes['commands'];

    // Validation
    if (id === undefined) throw new Error("Cannot parse attribute map. Field `id` is empty");
    if (typeof id !== 'string') throw new Error("Cannot parse attribute map. Field `id` must be a string (type 'S')");

    if (body === undefined) throw new Error("Cannot parse attribute map. Field `body` is empty");
    if (!isArray<string>(body, (item) => typeof item === 'string')) throw new Error("Cannot parse attribute map. Field `body` must be an array of all strings (type 'L')");

    if (commands === undefined) throw new Error("Cannot parse attribute map. Field `commands` is empty");
    if (!isArray<Record<string, unknown>>(commands, (command) => typeof command === 'object' && !Array.isArray(command))) throw new Error("Cannot parse attribute map. Field `commands` must be an object (type 'M')");

    // Construct object
    return new GameScreen({
      id,
      body: body.map((item, index) => {
        if (item === undefined) throw new Error(`Cannot parse attribute map. Field 'body' has invalid member: index [${index}] is empty`);

        return item;
      }),
      commands: commands.map((item, index) => {
        if (item === undefined) throw new Error(`Cannot parse attribute map. Field 'commands' has invalid member: index [${index}] is empty`);

        return Command.fromRaw(item);
      }),
    });
  }
}
