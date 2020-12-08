import GameScreen from "./models/GameScreen";

interface IDatabase {
  getAllScreens(): Promise<GameScreen[]>;
  getScreenById(id: string): Promise<GameScreen|undefined>;
  saveScreen(screen: GameScreen): Promise<GameScreen>;
  addPath(sourceScreen: GameScreen, command: string, newScreenBody: string[]): Promise<GameScreen>;
}

export default IDatabase;
