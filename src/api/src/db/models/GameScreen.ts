import { AttributeMap } from "aws-sdk/clients/dynamodb";

import Command from "./Command";

export default class GameScreen {
  public readonly id: string;
  public readonly body: string[];
  public readonly commands: Command[];

  public constructor(id: string, body: string[], commands: Command[]) {
    this.id = id;
    this.body = body;
    this.commands = commands;
  }

  public static fromAttributeMap(attributes: AttributeMap): GameScreen {
    // Attributes
    const id = attributes['id'].S;
    const body = attributes['body'].L;
    const commands = attributes['commands'].L;

    // Validation
    if (id === undefined) throw new Error("Cannot parse attribute map. Field `id` is empty or invalid type");
    if (body === undefined) throw new Error("Cannot parse attribute map. Field `body` is empty or invalid type");
    if (commands === undefined) throw new Error("Cannot parse attribute map. Field `commands` is empty or invalid type");

    // Construct object
    return new GameScreen(
      id,
      body.map((rawItem, index) => {
        const item = rawItem.S;
        if (item === undefined) throw new Error(`Cannot parse attribute map. Field 'body' has invalid member: index [${index}] is empty or invalid type`);

        return item;
      }),
      commands.map((rawItem, index) => {
        const item = rawItem.M;
        if (item === undefined) throw new Error(`Cannot parse attribute map. Field 'commands' has invalid member: index [${index}] is empty or invalid type`);

        return Command.fromAttributeMap(item);
      }),
    );
  }
}
