import { v4 as uuid } from 'uuid';

import IDatabase, { AddPathArgs } from '@app/db/IDatabase';
import GameScreen from '@app/db/models/GameScreen';
import Command from '@app/db/models/Command';
import { PathDestinationType } from '@app/constants/PathDestinationType';
import { CommandActionType } from '@app/constants/CommandActionType';

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
    limitItemsGiven,
    itemsRequired,
    actionType,
    destinationType,
    newScreenBody,
    existingScreen,
    printMessage,
  }: AddPathArgs): Promise<Command> {
    let targetScreenId: string | undefined;
    if (actionType === CommandActionType.Navigate) {
      if (destinationType === PathDestinationType.New) {
        // Create a new screen
        const newScreen = new GameScreen({ id: uuid(), body: newScreenBody!, commands: [] });
        await this.saveScreen(newScreen);

        targetScreenId = newScreen.id;
      } else {
        // Use id of supplied existing screen
        targetScreenId = existingScreen!.id;
      }
    } // else, no targetScreenId needed (leave undefined)

    // Create command that points to new screen
    const newCommand = new Command({
      id: uuid(),
      command,
      itemsTaken,
      itemsGiven,
      limitItemsGiven,
      itemsRequired,
      type: actionType,
      targetScreenId,
      printMessage,
    });
    // Add command to existing screen
    sourceScreen.commands.push(newCommand);

    // Save these changes to the database
    await this.saveScreen(sourceScreen);

    return newCommand;
  }

  public static reset(): void {
    this.screens = [];
  }
}
