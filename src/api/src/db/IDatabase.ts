import GameScreen from "./models/GameScreen";

interface IDatabase {
  getAllScreens(): Promise<GameScreen[]>;
  getScreenById(id: string): Promise<GameScreen|undefined>;
  saveScreen(screen: GameScreen): Promise<GameScreen>;
}

export default IDatabase;
