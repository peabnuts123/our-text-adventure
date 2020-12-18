import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../../config';

import Db from '../../db';
import IDatabase from '../../db/IDatabase';

import Logger from '../../util/Logger';
import errorResponse from '../../util/response/error';
import badRequestResponse from '../../util/response/bad-request';
import notFoundResponse from "../../util/response/not-found";
import ApiError from "../../errors/ApiError";
import GenericError from "../../errors/GenericError";
import ErrorId from "../../errors/ErrorId";
import okResponse from "../../util/response/ok";
import ErrorModel from "../../errors/ErrorModel";
import UnknownError from "../../errors/UnknownError";
import RequestValidationError from "../../errors/RequestValidationError";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {

    // Validate path parameter exists
    const screenId: string | unknown = event.pathParameters?.id;
    if (typeof screenId !== 'string' || screenId.trim() === '') {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('id', "Missing path parameter"),
      }));
    }

    // Look up screen by id
    const screen = await db.getScreenById(screenId);

    // Validate screen exists with this id
    if (screen === undefined) {
      return notFoundResponse(new ApiError({
        error: new GenericError(ErrorId.GetScreenById_NoScreenExistsWithId, `No screen exists with id: ${screenId}`),
      }));
    }

    Logger.log("Successfully looked up screen with id", screenId);

    return okResponse(screen);
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
