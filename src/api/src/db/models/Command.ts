import { AttributeMap } from "aws-sdk/clients/dynamodb";

export default class Command {
  public readonly id: string;
  public readonly command: string;
  public readonly targetScreenId: string;

  public constructor(id: string, command: string, targetScreenId: string) {
    this.id = id;
    this.command = command;
    this.targetScreenId = targetScreenId;
  }

  public static fromAttributeMap(attributes: AttributeMap): Command {
    // Attributes
    const id = attributes['id'].S;
    const command = attributes['command'].S;
    const targetScreenId = attributes['targetScreenId'].S!;

    // Validation
    if (id === undefined) throw new Error("Cannot parse attribute map. Field `id` is empty");
    if (command === undefined) throw new Error("Cannot parse attribute map. Field `command` is empty");
    if (targetScreenId === undefined) throw new Error("Cannot parse attribute map. Field `targetScreenId` is empty");

    // Construct object
    return new Command(
      id,
      command,
      targetScreenId,
    );
  }
}
