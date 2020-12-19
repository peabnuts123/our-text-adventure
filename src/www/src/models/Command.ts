import ApiModel from "./base/ApiModel";

export interface CommandDto {
  id: string;
  command: string;
  targetScreenId: string;
}

class Command extends ApiModel<CommandDto> {
  public readonly id: string;
  public readonly command: string;
  public readonly targetScreenId: string;

  public constructor(dto: CommandDto) {
    super();

    this.id = dto.id;
    this.command = dto.command;
    this.targetScreenId = dto.targetScreenId;
  }

  public toDto(): CommandDto {
    return {
      id: this.id,
      command: this.command,
      targetScreenId: this.targetScreenId,
    };
  }
}

export default Command;
