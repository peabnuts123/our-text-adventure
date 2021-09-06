import { CommandActionType } from "@app/constants/CommandActionType";
import { GameScreenDto } from "@app/db/models/GameScreen";

export interface SubmitCommandDto {
  /** The screen the player is currently on */
  contextScreenId?: string;
  /** The command being submitted */
  command?: string;
  /** Current state in the frontend */
  state?: string;
}

export interface SubmitCommandPrintMessageSuccessDto {
  success: true;
  type: CommandActionType.PrintMessage,
  printMessage: string[];
  state: string;
  itemsAdded: string[];
  itemsRemoved: string[];
}

export interface SubmitCommandNavigationSuccessDto {
  success: true;
  type: CommandActionType.Navigate;
  screen: GameScreenDto;
  state: string;
  itemsAdded: string[],
  itemsRemoved: string[],
}

export interface SubmitCommandFailureDto {
  success: false;
  message: string;
}
