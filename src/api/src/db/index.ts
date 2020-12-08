import AWS from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

import Config from '../config';
import Logger, { LogLevel } from '../util/Logger';

import IDatabase from './IDatabase';
import GameScreen from './models/GameScreen';


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

    if (Config.useLocalstack) {
      options.endpoint = `http://localhost:4566`;
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

}

export default Db;
