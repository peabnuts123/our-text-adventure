import GameScreen from "./models/GameScreen";

interface IDatabase {
  getAllScreens(): Promise<GameScreen[]>;
  addScreen(screen: GameScreen): Promise<void>;
}

export default IDatabase;
