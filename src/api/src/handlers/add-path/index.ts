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
import { PathDestinationType } from "../../constants/PathDestinationType";
import { GAME_SCREEN_MAX_LINE_LENGTH } from "../../constants";

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

    // Validate `sourceScreenId`
    let sourceScreenId: string = dto.sourceScreenId as string;
    let sourceScreen: GameScreen;
    if (typeof sourceScreenId !== 'string' || sourceScreenId.trim() === '') {
      // - ensure `sourceScreenId` is correct type / defined / not empty
      validationErrors.push(new RequestValidationError('sourceScreenId', "Field must be a non-empty string"));
    } else {
      // - ensure `sourceScreenId` is a real screen that exists
      sourceScreenId = sourceScreenId.trim();
      sourceScreen = await db.getScreenById(sourceScreenId.trim()) as GameScreen;
      if (sourceScreen === undefined) validationErrors.push(new GenericError(ErrorId.AddPath_NoSourceScreenExistsWithId, `No source screen exists with id: ${sourceScreenId}`));
    }

    // Validate `command`
    const command: string = dto.command as string;
    if (typeof command !== 'string' || command.trim() === '') {
      // - ensure `command` is correct type / defined / not empty
      validationErrors.push(new RequestValidationError('command', "Field must be a non-empty string"));
    } else if (sourceScreen! !== undefined && sourceScreen.lookupCommand(command)) {
      validationErrors.push(new GenericError(ErrorId.AddPath_CommandAlreadyExistsForScreen, `A command already exists on this screen with name: '${command}'`));
    }
    // @TODO validate command does not already exist for screen

    // Validate `itemsTaken`
    let itemsTaken: string[] = dto.itemsTaken || [];
    if (!isArray<string>(itemsTaken, (item) => typeof item === 'string')) {
      validationErrors.push(new RequestValidationError('itemsTaken', "Field must be an array of strings"));
    } else {
      // Remove blank / empty items
      itemsTaken = itemsTaken.filter((item) => !!item);
    }

    // Validate `itemsGiven`
    let itemsGiven: string[] = dto.itemsGiven || [];
    if (!isArray<string>(itemsGiven, (item) => typeof item === 'string')) {
      validationErrors.push(new RequestValidationError('itemsGiven', "Field must be an array of strings"));
    } else {
      // Remove blank / empty items
      itemsGiven = itemsGiven.filter((item) => !!item);
    }

    // Validate `itemsRequired`
    let itemsRequired: string[] = dto.itemsRequired || [];
    if (!isArray<string>(itemsRequired, (item) => typeof item === 'string')) {
      validationErrors.push(new RequestValidationError('itemsRequired', "Field must be an array of strings"));
    } else {
      // Remove blank / empty items
      itemsRequired = itemsRequired.filter((item) => !!item);
    }

    // Validate `destinationType`
    let destinationType: PathDestinationType = dto.destinationType as PathDestinationType;
    if (typeof destinationType !== 'string' || !(
      destinationType.trim().toLocaleLowerCase() === PathDestinationType.New ||
      destinationType.trim().toLocaleLowerCase() === PathDestinationType.Existing)
    ) {
      validationErrors.push(new RequestValidationError('destinationType', "Field must be a non-empty string with value either 'new' or 'existing'"));
    } else {
      destinationType = destinationType.trim().toLocaleLowerCase() as PathDestinationType;
    }

    // Validate `newScreenBody`
    const newScreenBody: string[] = dto.newScreenBody as string[];
    if (destinationType !== PathDestinationType.New && newScreenBody !== undefined) {
      // - ensure `newScreenBody` is only defined when `destinationType === 'new'`
      validationErrors.push(new RequestValidationError('newScreenBody', "Field can only be specified when `destinationType === 'new'`"));
    } else if (destinationType === PathDestinationType.New) {
      if (!isArray<string>(newScreenBody, (screenBodyItem) => typeof screenBodyItem === 'string') ||
        newScreenBody.length === 0 ||
        newScreenBody.every((line) => line.trim().length === 0)
      ) {
        // - ensure `newScreenBody` is correct type / defined / not empty
        //    and only specified when `destinationType === 'new'`
        validationErrors.push(new RequestValidationError('newScreenBody', "Field must be a non-empty array of strings when `destinationType === 'new'`"));
      } else if (newScreenBody.some((line) => line.length > GAME_SCREEN_MAX_LINE_LENGTH)) {
        // - ensure no line in `newScreenBody` is longer than `GAME_SCREEN_MAX_LINE_LENGTH`
        validationErrors.push(new RequestValidationError('newScreenBody', `Maximum line length of ${GAME_SCREEN_MAX_LINE_LENGTH} exceeded`));
      }
    }

    // Validate `existingScreenId`
    let existingScreenId: string = dto.existingScreenId as string;
    let existingScreen: GameScreen | undefined;
    if (destinationType !== PathDestinationType.Existing && existingScreenId !== undefined) {
      // - ensure `existingScreenId` is only defined when `destinationType === 'existing'`
      validationErrors.push(new RequestValidationError('existingScreenId', "Field can only be specified when `destinationType === 'existing'`"));
    } else if (destinationType === PathDestinationType.Existing) {
      if (typeof existingScreenId !== 'string' || existingScreenId.trim() === '') {
        // - ensure `existingScreenId` is correct type / defined / not empty
        //    and only specified when `destinationType === 'existing'`
        validationErrors.push(new RequestValidationError('existingScreenId', "Field must be a non-empty string"));
      } else if (sourceScreenId && existingScreenId.trim() === sourceScreenId.trim()) {
        // - ensure `existingScreenId` and `sourceScreenId` do not have the same value
        validationErrors.push(new RequestValidationError('existingScreenId', "Field cannot have the same value as `sourceScreenId`"));
      } else {
        // - ensure `existingScreenId` is a real screen that exists
        existingScreenId = existingScreenId.trim();
        existingScreen = await db.getScreenById(existingScreenId.trim()) as GameScreen;
        if (existingScreen === undefined) validationErrors.push(new GenericError(ErrorId.AddPath_NoDestinationScreenExistsWithId, `No existing destination screen exists with id: ${existingScreenId}`));
      }
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    const targetScreen = await db.addPath({
      sourceScreen: sourceScreen!,
      command,
      itemsTaken,
      itemsGiven,
      itemsRequired,
      destinationType,
      newScreenBody,
      existingScreen,
    });

    Logger.log(`Successfully added new path. GameScreen(${sourceScreen!.id})["${command}"] => GameScreen(${targetScreen.id})`);

    return {
      statusCode: 201,
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
