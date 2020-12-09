import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../../config';

import Db from '../../db';
import IDatabase from '../../db/IDatabase';

import Logger from '../../util/Logger';
import errorResponse from '../../util/error-response';
import badRequestResponse from '../../util/bad-request-response';

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {

    // Validate path parameter exists
    const screenId: string | unknown = event.pathParameters?.id;
    if (typeof screenId !== 'string' || screenId.trim() === '') {
      return badRequestResponse("Missing path parameter: id");
    }

    // Look up screen by id
    const screen = await db.getScreenById(screenId);

    // Validate screen exists with this id
    if (screen === undefined) {
      Logger.log("No screen exists with id: ", screenId);

      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "message": `No screen exists with id: ${screenId}`,
        }),
      };
    }

    Logger.log("Successfully looked up screen with id", screenId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(screen),
    };
  } catch (err) {
    return errorResponse("An error occurred while processing.", err);
  }
};
