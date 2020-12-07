import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../config';

// import Db from '../db';
// import IDatabase from '../db/IDatabase';

import Logger from '../util/Logger';
import errorResponse from '../util/error-response';

Logger.setLogLevel(Config.logLevel);

// const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // @TODO remove hacks to shut up linter/compiler
    await Promise.resolve();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "AddPath handler working",
      }),
    };
  } catch (err) {
    return errorResponse("An error occurred while processing.", err);
  }
};
