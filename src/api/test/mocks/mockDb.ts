import IDatabase from '@app/db/IDatabase';
import GameScreen from '@app/db/models/GameScreen';
import ScreenNotFoundError from '@app/errors/screen-not-found-error';


export default class MockDb implements IDatabase {
  public static screens: GameScreen[] = [];

  public getAllScreens(): Promise<GameScreen[]> {
    return Promise.resolve(MockDb.screens);
  }

  public getScreenById(id: string): Promise<GameScreen> {
    const screen = MockDb.screens.find((screen) => screen.id === id);
    if (screen === undefined) {
      throw new ScreenNotFoundError(`No screen found with id: ${id}`);
    } else {
      return Promise.resolve(screen);
    }
  }

  public addScreen(screen: GameScreen): Promise<void> {
    MockDb.screens.push(screen);

    return Promise.resolve();
  }

  public static reset(): void {
    this.screens = [];
  }
}
