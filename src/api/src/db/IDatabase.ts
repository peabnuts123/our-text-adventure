import GameScreen from "./models/GameScreen";

interface IDatabase {
  getAllScreens(): Promise<GameScreen[]>;
  getScreenById(id: string): Promise<GameScreen>;
  addScreen(screen: GameScreen): Promise<void>;
}

export default IDatabase;
