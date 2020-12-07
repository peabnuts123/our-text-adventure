import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import Config from '../config';

import Db from '../db';
import IDatabase from '../db/IDatabase';
import GameScreen from '../db/models/GameScreen';
import Command from '../db/models/Command';

import Logger, { LogLevel } from '../util/Logger';
import errorResponse from '../util/error-response';

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    const INSERT_MOCK_DATA = false;
    if (INSERT_MOCK_DATA) {
      Logger.log("Inserting mock data");
      await debug_insertMockData();
    }

    Logger.log(`Fetching all data from table: '${Config.screensTableName}'`);

    const allScreenData = await db.getAllScreens();

    Logger.log("Successfully finished processing.", allScreenData);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screens: allScreenData,
      }),
    };

  } catch (err) {
    Logger.logError("An error occurred while processing.", err);
    return errorResponse("An error occurred while processing.", err);
  }
};

async function debug_insertMockData(): Promise<void> {
  const MOCK_DATA = [
    new GameScreen(
      '0290922a-59ce-458b-8dbc-1c33f646580a',
      [
        "+---------------+",
        "| This is a     |",
        "| sample dialog |",
        "| showing       |",
        "| something.    |",
        "+---------------+",
      ],
      [
        new Command(
          '51e5db90-0587-471f-a281-0b37b7eccb8c',
          `look bone`,
          '9bdd1cdb-d7c9-4c34-9eac-6775fa94d087',
        ),
      ],
    ),
    new GameScreen(
      '9bdd1cdb-d7c9-4c34-9eac-6775fa94d087',
      [
        "This is a second",
        "screen.",
      ],
      [],
    ),
  ];

  // Insert all records ("in parallel")
  await Promise.all(MOCK_DATA.map((mockItem) => db.addScreen(mockItem)));

  Logger.log(LogLevel.debug, `Successfully inserted ${MOCK_DATA.length} items into table.`);
}
