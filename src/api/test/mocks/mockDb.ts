import { v4 as uuid } from 'uuid';

import IDatabase from '@app/db/IDatabase';
import GameScreen from '@app/db/models/GameScreen';
import Command from '@app/db/models/Command';

export default class MockDb implements IDatabase {
  public static screens: GameScreen[] = [];

  public getAllScreens(): Promise<GameScreen[]> {
    return Promise.resolve(MockDb.screens);
  }

  public getScreenById(id: string): Promise<GameScreen|undefined> {
    const screen = MockDb.screens.find((screen) => screen.id === id);
    if (screen === undefined) {
      return Promise.resolve(undefined);
    } else {
      return Promise.resolve(screen);
    }
  }

  public saveScreen(screen: GameScreen): Promise<GameScreen> {
    // MockDb.screens.push(screen);
    const existingScreenIndex = MockDb.screens.findIndex((existingScreen) => existingScreen.id === screen.id);

    if (existingScreenIndex !== -1) {
      // Update existing record
      MockDb.screens[existingScreenIndex] = screen;
    } else {
      // Add new record
      MockDb.screens.push(screen);
    }

    return Promise.resolve(screen);
  }

  public async addPath(sourceScreen: GameScreen, command: string, newScreenBody: string[]): Promise<GameScreen> {
    // Create new screen
    const newScreen = new GameScreen(uuid(), newScreenBody, []);
    // Create command that points to new screen
    const newCommand = new Command(uuid(), command, newScreen.id);
    // Add command to existing screen
    sourceScreen.commands.push(newCommand);

    // Save all these changes to the database
    await this.saveScreen(newScreen);
    await this.saveScreen(sourceScreen);

    return newScreen;
  }

  public static reset(): void {
    this.screens = [];
  }
}
