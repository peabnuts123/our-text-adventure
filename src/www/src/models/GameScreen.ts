import ApiModel from "./base/ApiModel";

export interface GameScreenDto {
  id: string;
  body: string[];
}

class GameScreen implements ApiModel<GameScreenDto> {
  public readonly id: string;
  public readonly body: string[];

  public constructor(dto: GameScreenDto) {
    this.id = dto.id;
    this.body = dto.body;
  }

  public toDto(): GameScreenDto {
    return {
      id: this.id,
      body: this.body,
    };
  }
}

export default GameScreen;
