import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import Config from '../../config';
import Db from '../../db';
import IDatabase from '../../db/IDatabase';
import GameScreen from '../../db/models/GameScreen';
import Command from '../../db/models/Command';
import Logger from '../../util/Logger';
import errorResponse from '../../util/response/error';
import okResponse from '../../util/response/ok';
import ApiError from '../../errors/ApiError';
import ErrorModel from '../../errors/ErrorModel';
import UnknownError from '../../errors/UnknownError';
import { CommandActionType } from '../../constants/CommandActionType';

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
        itemsTaken: [],
        itemsGiven: [],
        itemsRequired: [],
        type: CommandActionType.Navigate,
        targetScreenId: '9bdd1cdb-d7c9-4c34-9eac-6775fa94d087',
      }),
      new Command({
        id: '9ecdc558-5e27-4a78-b68b-ab3c2f7c63d9',
        command: `pull lever`,
        itemsTaken: [],
        itemsGiven: ['Broken Lever'],
        limitItemsGiven: true,
        itemsRequired: [],
        type: CommandActionType.PrintMessage,
        printMessage: [
          // ----30 chars --------------|
          'You attempt to pull the lever,',
          'but it is old and rusted. As',
          'you pull down, it snaps off.',
          'You decide to take it with you',
          'anyway.',
        ],
      }),
      new Command({
        id: '071cc05e-b266-40d6-a18d-acbea55803a3',
        command: 'fold origami',
        itemsTaken: [],
        itemsGiven: ['Paper Crane'],
        itemsRequired: [],
        type: CommandActionType.PrintMessage,
        printMessage: [
          // ----30 chars --------------|
          'You spend a minute carefully',
          'folding a paper crane. If only',
          'you could fold a thousand, you',
          'think to yourself...',
        ],
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
