import { CommandActionType } from "../constants/CommandActionType";
import { PathDestinationType } from "../constants/PathDestinationType";

import Command from "./models/Command";
import GameScreen from "./models/GameScreen";

export interface AddPathArgs {
  sourceScreen: GameScreen;
  command: string;

  itemsTaken: string[];
  itemsGiven: string[];
  limitItemsGiven: boolean | undefined;
  itemsRequired: string[];

  actionType: CommandActionType;

  destinationType: PathDestinationType | undefined;
  newScreenBody: string[] | undefined;
  existingScreen: GameScreen | undefined;

  printMessage: string[] | undefined;
}

interface IDatabase {
  getAllScreens(): Promise<GameScreen[]>;
  getScreenById(id: string): Promise<GameScreen | undefined>;
  saveScreen(screen: GameScreen): Promise<GameScreen>;
  addPath(args: AddPathArgs): Promise<Command>;
}

export default IDatabase;
