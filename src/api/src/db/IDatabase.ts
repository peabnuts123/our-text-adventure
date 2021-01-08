import { PathDestinationType } from "../constants/PathDestinationType";

import GameScreen from "./models/GameScreen";

export interface AddPathArgs {
  sourceScreen: GameScreen;
  command: string;

  itemsTaken: string[];
  itemsGiven: string[];
  itemsRequired: string[];

  destinationType: PathDestinationType;

  newScreenBody?: string[];
  existingScreen?: GameScreen;
}

interface IDatabase {
  getAllScreens(): Promise<GameScreen[]>;
  getScreenById(id: string): Promise<GameScreen | undefined>;
  saveScreen(screen: GameScreen): Promise<GameScreen>;
  addPath(args: AddPathArgs): Promise<GameScreen>;
}

export default IDatabase;
