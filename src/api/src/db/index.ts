import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

import Config from '@app/config';
import Logger, { LogLevel } from '@app/util/Logger';
import { PathDestinationType } from '@app/constants/PathDestinationType';
import { CommandActionType } from '@app/constants/CommandActionType';

import IDatabase, { AddPathArgs } from './IDatabase';
import GameScreen from './models/GameScreen';
import Command from './models/Command';


class Db implements IDatabase {
  private docClient: DynamoDBDocumentClient;

  public constructor() {
    const dynamoDbClient = new DynamoDBClient(this.baseOptions);
    this.docClient = DynamoDBDocumentClient.from(dynamoDbClient, {
      marshallOptions: {
        convertClassInstanceToMap: true,
        removeUndefinedValues: true,
      },
    });
  }

  private get baseOptions(): DynamoDBClientConfig {
    const options: DynamoDBClientConfig = {
      region: 'us-east-1',
    };

    // @NOTE assumption: Any configuration for `Config.awsEndpoint` implies
    //  the use of Localstack
    if (Config.awsEndpoint) {
      options.endpoint = Config.awsEndpoint;
      Logger.log(LogLevel.debug, "Setting AWS endpoint to localstack");
    }

    return options;
  }

  public async getAllScreens(): Promise<GameScreen[]> {
    const result = await this.docClient.send(new ScanCommand({
      TableName: Config.screensTableName,
    }));

    if (result.Items === undefined) {
      Logger.logError("Failed to fetch all screens, response was empty.", result);
      throw new Error("Failed to fetch all screens, response was empty. See logs for more details.");
    }

    return result.Items.map((item) => GameScreen.fromRaw(item));
  }

  public async getScreenById(id: string): Promise<GameScreen | undefined> {
    const result = await this.docClient.send(new GetCommand({
      TableName: Config.screensTableName,
      Key: { id },
    }));

    if (result.Item === undefined) {
      return undefined;
    } else {
      return GameScreen.fromRaw(result.Item);
    }
  }

  public async saveScreen(screen: GameScreen): Promise<GameScreen> {
    Logger.log(LogLevel.debug, "Saving: ", JSON.stringify(screen));
    await this.docClient.send(new PutCommand({
      TableName: Config.screensTableName,
      Item: screen,
    }));

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
