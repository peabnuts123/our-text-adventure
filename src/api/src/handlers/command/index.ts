import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import Config from '../../config';

import Db from '../../db';
import IDatabase from '../../db/IDatabase';

import Logger from '../../util/Logger';
import errorResponse from '../../util/response/error';
import okResponse from '../../util/response/ok';
import ApiError from '../../errors/ApiError';
import ErrorModel from '../../errors/ErrorModel';
import UnknownError from '../../errors/UnknownError';
import badRequestResponse from '../../util/response/bad-request';
import RequestValidationError from '../../errors/RequestValidationError';
import GameScreen from '../../db/models/GameScreen';
import { applyCommandToClientState, ClientStateHandlingError } from '../../util/client-state';
import ErrorId from '../../errors/ErrorId';
import GenericError from '../../errors/GenericError';
import Messaging from '../../constants/Messaging';

import { SubmitCommandDto, SubmitCommandSuccessDto, SubmitCommandFailureDto } from './dto';

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // @TODO extract shared validation code into a function or two
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
    let dto: SubmitCommandDto;
    try {
      dto = JSON.parse(event.body) as SubmitCommandDto;
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

    // @TODO validation helpers
    // Validate `contextScreenId`
    let contextScreenId: string = dto.contextScreenId as string;
    let contextScreen: GameScreen;
    if (typeof contextScreenId !== 'string' || contextScreenId.trim() === '') {
      // - ensure `contextScreenId` is correct type / defined / not empty
      validationErrors.push(new RequestValidationError('contextScreenId', "Field must be a non-empty string"));
    } else {
      // - ensure `contextScreenId` is a real screen that exists
      contextScreenId = contextScreenId.trim();
      contextScreen = await db.getScreenById(contextScreenId.trim()) as GameScreen;
      if (contextScreen === undefined) validationErrors.push(new GenericError(ErrorId.Command_NoContextScreenExistsWithId, `No source screen exists with id: ${contextScreenId}`));
    }

    // Validate `rawCommand`
    let rawCommand: string = dto.command as string;
    if (typeof rawCommand !== 'string' || rawCommand.trim() === '') {
      // - ensure `rawCommand` is correct type / defined / not empty
      validationErrors.push(new RequestValidationError('rawCommand', "Field must be a non-empty string"));
    } else {
      rawCommand = rawCommand.trim();
    }

    // Validate `state`
    let clientStateString: string = dto.state as string;
    if (typeof clientStateString !== 'string') {
      // - ensure `clientStateString` is correct type / defined
      validationErrors.push(new RequestValidationError('clientStateString', "Field must be a string"));
    } else {
      clientStateString = clientStateString.trim();
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    // Attempt to look up the command and apply it to the given state
    const command = contextScreen!.lookupCommand(rawCommand);
    if (command === undefined) {
      // Failure - command not found
      const response: SubmitCommandFailureDto = {
        success: false,
        message: Messaging.NoCommandFound,
      };
      return okResponse(response);
    }

    // Command exists (but we are not yet out of the woods)
    let updatedState: string;
    try {
      // Attempt to mutate the provided state based on the command
      updatedState = applyCommandToClientState(clientStateString, command);

      // State mutation was successful / valid. Look up the new target screen to return
      const targetScreen: GameScreen = await db.getScreenById(command.targetScreenId) as GameScreen;

      // Serve response
      const response: SubmitCommandSuccessDto = {
        success: true,
        screen: targetScreen,
        state: updatedState,
      };
      return okResponse(response);
    } catch (err) {
      // An error occurred while attempting to mutate state.
      if (err instanceof ClientStateHandlingError) {
        // Expected error, flagged to be presented to the player
        const response: SubmitCommandFailureDto = {
          success: false,
          message: err.message,
        };

        return okResponse(response);
      } else {
        // Wild unknown error, continue throwing
        // Will be caught by top-level error handling
        throw err;
      }
    }

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