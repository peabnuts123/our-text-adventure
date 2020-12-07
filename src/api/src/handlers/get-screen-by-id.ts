import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../config';

import Db from '../db';
import IDatabase from '../db/IDatabase';

import Logger from '../util/Logger';
import errorResponse from '../util/error-response';
import badRequestResponse from '../util/bad-request-response';
import ScreenNotFoundError from "../errors/screen-not-found-error";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {

    if (event.pathParameters === undefined || event.pathParameters['id'] === undefined) {
      return badRequestResponse("Missing path parameter: id");
    }

    const screenId = event.pathParameters['id'];
    const screen = await db.getScreenById(screenId);

    Logger.log("Successfully looked up screen with id", screenId);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(screen),
    };
  } catch (err) {
    if (err instanceof ScreenNotFoundError) {
      return badRequestResponse(err.message);
    } else {
    return errorResponse("An error occurred while processing.", err);
    }
  }
};
