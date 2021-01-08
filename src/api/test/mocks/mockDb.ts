import { v4 as uuid } from 'uuid';

import IDatabase, { AddPathArgs } from '@app/db/IDatabase';
import GameScreen from '@app/db/models/GameScreen';
import Command from '@app/db/models/Command';
import { PathDestinationType } from '@app/constants/DestinationType';

export default class MockDb implements IDatabase {
  public static screens: GameScreen[] = [];

  public getAllScreens(): Promise<GameScreen[]> {
    return Promise.resolve(MockDb.screens);
  }

  public getScreenById(id: string): Promise<GameScreen | undefined> {
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

  public async addPath({
    sourceScreen,
    command,
    itemsTaken,
    itemsGiven,
    itemsRequired,
    destinationType,
    newScreenBody,
    existingScreen,
  }: AddPathArgs): Promise<GameScreen> {
    let targetScreen: GameScreen;
    if (destinationType === PathDestinationType.New) {
      // Create new screen
      targetScreen = new GameScreen({ id: uuid(), body: newScreenBody!, commands: [] });
    } else {
      // Use supplied existing screen
      targetScreen = existingScreen as GameScreen;
    }

    // Create command that points to new screen
    const newCommand = new Command({ id: uuid(), command, targetScreenId: targetScreen.id, itemsTaken, itemsGiven, itemsRequired });
    // Add command to existing screen
    sourceScreen.commands.push(newCommand);

    // Save all these changes to the database
    // @TODO transaction?
    await this.saveScreen(targetScreen);
    await this.saveScreen(sourceScreen);

    return targetScreen;
  }

  public static reset(): void {
    this.screens = [];
  }
}
