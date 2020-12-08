import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../../config';
import Db from '../../db';
import IDatabase from '../../db/IDatabase';
import GameScreen from "../../db/models/GameScreen";
import Logger from '../../util/Logger';
import errorResponse from '../../util/error-response';
import badRequestResponse from "../../util/bad-request-response";
import isArray from "../../util/is-array";

import { AddPathDto } from "./dto";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // Validating body exists
    if (event.body === undefined || event.body.trim() === '') {
      return badRequestResponse("Missing or empty body");
    }

    // Validate content-type header (extremely safely)
    // 1. Case-insensitive header lookup (AWS might provide an object that does this, but mocks won't)
    const contentTypeHeaderKey = Object.keys(event.headers).find((headerName) => headerName.toLocaleLowerCase() === 'content-type');
    // 2. Case-insensitive, whitespace insensitive, encoding-insensitive test for 'application/json'
    if (contentTypeHeaderKey === undefined || !event.headers[contentTypeHeaderKey].trim().toLocaleLowerCase().startsWith('application/json')) {
      return badRequestResponse("Requests must be JSON with header 'Content-Type: application/json'");
    }

    // Parse body as JSON (knowing the request must HAVE a header specifying the content-type as JSON)
    //  Any parsing errors will be caught and a BadRequest response served
    let dto: AddPathDto;
    try {
      dto = JSON.parse(event.body) as AddPathDto;
    } catch (err) {
      if (err instanceof SyntaxError) {
        return badRequestResponse("Could not parse body - likely invalid JSON");
      } else {
        throw err;
      }
    }

    // Validate body
    const command: unknown = dto.command;
    if (typeof command !== 'string' || command.trim() === '') return badRequestResponse("Validation error - Field `command` must be a non-empty string");
    // @TODO validate command does not already exist for screen

    const screenBody: unknown = dto.screenBody;
    if (!isArray<string>(screenBody, (screenBodyItem) => typeof screenBodyItem === 'string')) return badRequestResponse("Validation error - Field `screenBody` must be a non-empty array of strings");

    const sourceScreenId: unknown = dto.sourceScreenId;
    if (typeof sourceScreenId !== 'string' || sourceScreenId.trim() === '') return badRequestResponse("Validation error - Field `sourceScreenId` must be a non-empty string");

    const sourceScreen: GameScreen | undefined = await db.getScreenById(sourceScreenId);
    if (sourceScreen === undefined) return badRequestResponse(`Validation error - Field \`sourceScreenId\`: no screen exists with id: ${sourceScreenId}`);

    const newScreen = await db.addPath(sourceScreen, command, screenBody);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "Successfully created new path",
        screen: newScreen,
      }),
    };
  } catch (err) {
    return errorResponse("An error occurred while processing.", err);
  }
};
