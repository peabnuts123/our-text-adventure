import IDatabase from '@app/db/IDatabase';
import GameScreen from '@app/db/models/GameScreen';


export default class MockDb implements IDatabase {
  public static screens: GameScreen[] = [];

  public getAllScreens(): Promise<GameScreen[]> {
    return Promise.resolve(MockDb.screens);
  }
  public addScreen(screen: GameScreen): Promise<void> {
    MockDb.screens.push(screen);

    return Promise.resolve();
  }

  public static reset(): void {
    this.screens = [];
  }
}
