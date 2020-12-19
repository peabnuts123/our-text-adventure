import ApiModel from "./base/ApiModel";
import Command, { CommandDto } from "./Command";

export interface GameScreenDto {
  id: string;
  body: string[];
  commands: CommandDto[];
}

class GameScreen extends ApiModel<GameScreenDto> {
  public readonly id: string;
  public readonly body: string[];
  public readonly commands: Command[];

  public constructor(dto: GameScreenDto) {
    super();
    this.id = dto.id;
    this.body = dto.body;
    this.commands = dto.commands.map((dto) => new Command(dto));
  }

  public toDto(): GameScreenDto {
    return {
      id: this.id,
      body: this.body,
      commands: this.commands.map((command) => command.toDto()),
    };
  }
}

export default GameScreen;
