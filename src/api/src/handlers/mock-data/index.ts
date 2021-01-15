import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import Config from '../../config';

import Db from '../../db';
import IDatabase from '../../db/IDatabase';
import GameScreen from '../../db/models/GameScreen';
import Command from '../../db/models/Command';

import Logger, { LogLevel } from '../../util/Logger';
import errorResponse from '../../util/response/error';
import okResponse from '../../util/response/ok';
import ApiError from '../../errors/ApiError';
import ErrorModel from '../../errors/ErrorModel';
import UnknownError from '../../errors/UnknownError';

const MOCK_DATA = [
  new GameScreen({
    id: '0290922a-59ce-458b-8dbc-1c33f646580a',
    body: [
      "+---------------+",
      "| This is a     |",
      "| sample dialog |",
      "| showing       |",
      "| something.    |",
      "+---------------+",
    ],
    commands: [
      new Command({
        id: '51e5db90-0587-471f-a281-0b37b7eccb8c',
        command: `look bone`,
        targetScreenId: '9bdd1cdb-d7c9-4c34-9eac-6775fa94d087',
        itemsTaken: [],
        itemsGiven: [],
        itemsRequired: [],
      }),
    ],
  }),
  new GameScreen({
    id: '9bdd1cdb-d7c9-4c34-9eac-6775fa94d087',
    body: [
      "This is a second",
      "screen.",
    ],
    commands: [],
  }),
];

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // Save all mock records to DB "in parallel"
    await Promise.all(MOCK_DATA.map((mockItem) => db.saveScreen(mockItem)));

    Logger.log(`Successfully inserted ${MOCK_DATA.length} items into table.`);

    return okResponse({
      message: `Successfully inserted ${MOCK_DATA.length} items into table.`,
    });
  } catch (err) {
    let error: ErrorModel;
    if (err instanceof ErrorModel) {
      error = err;
    } else {
      error = new UnknownError(err as (string | Error));
    }

    return errorResponse(new ApiError({
      message: "An error occurred while processing.",
      error,
    }));
  }
};
