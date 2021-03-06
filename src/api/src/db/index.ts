import AWS from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { v4 as uuid } from 'uuid';

import Config from '../config';
import Logger, { LogLevel } from '../util/Logger';
import { PathDestinationType } from '../constants/PathDestinationType';
import { CommandActionType } from '../constants/CommandActionType';

import IDatabase, { AddPathArgs } from './IDatabase';
import GameScreen from './models/GameScreen';
import Command from './models/Command';


class Db implements IDatabase {
  // private dbClient: AWS.DynamoDB;
  private docClient: AWS.DynamoDB.DocumentClient;

  public constructor() {
    // this.dbClient = new AWS.DynamoDB({
    //   ...this.baseOptions,
    // });
    this.docClient = new AWS.DynamoDB.DocumentClient({
      ...this.baseOptions,
    });
  }

  private get baseOptions(): ServiceConfigurationOptions {
    const options: ServiceConfigurationOptions = {
      region: 'us-east-1',
    };

    if (Config.awsEndpoint) {
      options.endpoint = Config.awsEndpoint;
      Logger.log(LogLevel.debug, "Setting AWS endpoint to localstack");
    }

    return options;
  }

  public async getAllScreens(): Promise<GameScreen[]> {
    const result = await this.docClient.scan({
      TableName: Config.screensTableName,
    }).promise();

    if (result.Items === undefined) {
      Logger.logError("Failed to fetch all screens, response was empty.", result.$response);
      throw new Error("Failed to fetch all screens, response was empty. See logs for more details.");
    }

    return result.Items.map((item) => GameScreen.fromRaw(item));
  }

  public async getScreenById(id: string): Promise<GameScreen | undefined> {
    const result = await this.docClient.get({
      TableName: Config.screensTableName,
      Key: { id },
    }).promise();

    if (result.Item === undefined) {
      return undefined;
    } else {
      return GameScreen.fromRaw(result.Item);
    }
  }

  public async saveScreen(screen: GameScreen): Promise<GameScreen> {
    await this.docClient.put({
      TableName: Config.screensTableName,
      Item: screen,
    }).promise();

    return screen;
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
}

export default Db;
