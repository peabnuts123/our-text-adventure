import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '@app/config';
import Db from '@app/db';
import IDatabase from '@app/db/IDatabase';
import Logger from '@app/util/Logger';
import errorResponse from '@app/util/response/error';
import ApiError from "@app/errors/ApiError";
import UnknownError from "@app/errors/UnknownError";
import ErrorModel from "@app/errors/ErrorModel";
import GameScreen from "@app/db/models/GameScreen";
import Command from "@app/db/models/Command";
import { CommandActionType } from "@app/constants/CommandActionType";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    await Promise.all(MOCK_DATA.map(async (mockScreen) => {
      await db.saveScreen(mockScreen);
    }));

    Logger.log(`Successfully seeded database with ${MOCK_DATA.length} mock screens`);

    return {
      statusCode: 204,
    };
  } catch (err) {
    // Error occurred while processing
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

const MOCK_DATA: GameScreen[] = [
  new GameScreen({
    id: '0290922a-59ce-458b-8dbc-1c33f646580a',
    body: [
      // ----30 chars --------------|
      "Welcome to Our Text Adventure!",
      "This project is still in",
      "development.",
      "",
      "Try typing 'pull lever' or",
      "'fold origami' to see some",
      "sample commands. Or add a new",
      "command of your own!",
      "",
      "For help, type /help. To",
      "create your own command",
      "type /create-path",
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
        limitItemsGiven: false,
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
