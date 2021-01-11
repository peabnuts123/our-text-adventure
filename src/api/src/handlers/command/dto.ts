import GameScreen from "../../db/models/GameScreen";

export interface SubmitCommandDto {
  /** The screen the player is currently on */
  contextScreenId?: string;
  /** The command being submitted */
  command?: string;
  /** Current state in the frontend */
  state?: string;
}

export interface SubmitCommandSuccessDto {
  success: true;
  screen: GameScreen;
  state: string;
  itemsAdded: string[],
  itemsRemoved: string[],
}

export interface SubmitCommandFailureDto {
  success: false;
  message: string;
}
