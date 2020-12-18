import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../../config';
import Db from '../../db';
import IDatabase from '../../db/IDatabase';
import GameScreen from "../../db/models/GameScreen";
import Logger from '../../util/Logger';
import errorResponse from '../../util/response/error';
import badRequestResponse from "../../util/response/bad-request";
import isArray from "../../util/is-array";
import ApiError from "../../errors/ApiError";
import RequestValidationError from "../../errors/RequestValidationError";
import UnknownError from "../../errors/UnknownError";
import ErrorModel from "../../errors/ErrorModel";
import ErrorId from "../../errors/ErrorId";
import GenericError from "../../errors/GenericError";

import { AddPathDto } from "./dto";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // Validating body exists
    if (event.body === undefined || event.body.trim() === '') {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('body', "Missing or empty body"),
      }));
    }

    // Validate content-type header (extremely safely)
    // 1. Case-insensitive header lookup (AWS might provide an object that does this, but mocks won't)
    const contentTypeHeaderKey = Object.keys(event.headers).find((headerName) => headerName.toLocaleLowerCase() === 'content-type');
    // 2. Case-insensitive, whitespace insensitive, encoding-insensitive test for 'application/json'
    if (contentTypeHeaderKey === undefined || !event.headers[contentTypeHeaderKey].trim().toLocaleLowerCase().startsWith('application/json')) {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('headers', "Requests must be JSON with header 'Content-Type: application/json'"),
      }));
    }

    // Parse body as JSON (knowing the request must HAVE a header specifying the content-type as JSON)
    //  Any parsing errors will be caught and a BadRequest response served
    let dto: AddPathDto;
    try {
      dto = JSON.parse(event.body) as AddPathDto;
    } catch (err) {
      if (err instanceof SyntaxError) {
        // Invalid JSON
        return badRequestResponse(new ApiError({
          error: new RequestValidationError('body', "Could not parse body - likely invalid JSON"),
        }));
      } else {
        // Unknown error (likely impossible)
        return errorResponse(new ApiError({
          message: "An error occurred while parsing JSON body",
          error: new UnknownError(err as string | Error),
        }));
      }
    }

    // VALIDATION
    const validationErrors: ErrorModel[] = [];

    // Validate `command`
    const command: string = dto.command as string;
    if (typeof command !== 'string' || command.trim() === '') validationErrors.push(new RequestValidationError('command', "Field must be a non-empty string"));
    // @TODO validate command does not already exist for screen

    // Validate `screenBody`
    const screenBody: string[] = dto.screenBody as string[];
    if (!isArray<string>(screenBody, (screenBodyItem) => typeof screenBodyItem === 'string')) validationErrors.push(new RequestValidationError('screenBody', "Field must be a non-empty array of strings"));

    // Validate `sourceScreenId`
    const sourceScreenId: string = dto.sourceScreenId as string;
    let sourceScreen: GameScreen | undefined;
    // - ensure `sourceScreenId` is correct type / defined / not empty
    if (typeof sourceScreenId !== 'string' || sourceScreenId.trim() === '') {
      validationErrors.push(new RequestValidationError('sourceScreenId', "Field must be a non-empty string"));
    } else {
      // - ensure `sourceScreenId` is a real screen that exists
      sourceScreen = await db.getScreenById(sourceScreenId) as GameScreen;
      if (sourceScreen === undefined) validationErrors.push(new GenericError(ErrorId.AddPath_NoScreenExistsWithId, `No screen exists with id: ${sourceScreenId}`));
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    const newScreen = await db.addPath(sourceScreen!, command, screenBody);

    Logger.log(`Successfully added new path. GameScreen(${sourceScreen!.id})["${command}"] => GameScreen(${newScreen.id})`);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newScreen),
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
