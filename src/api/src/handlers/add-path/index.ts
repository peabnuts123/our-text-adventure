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
import { ITEM_NAME_MAX_LENGTH, TERMINAL_MAX_LINE_LENGTH } from "../../constants";
import { CommandActionType } from "../../constants/CommandActionType";
import Command from "../../db/models/Command";
import { areItemsEquivalent } from "../../util/client-state";

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
    let command: string = dto.command as string;
    if (typeof command !== 'string' || command.trim() === '') {
      // - ensure `command` is correct type / defined / not empty
      validationErrors.push(new RequestValidationError('command', "Field must be a non-empty string"));
    } else if (sourceScreen! !== undefined && sourceScreen.lookupCommand(command)) {
      validationErrors.push(new GenericError(ErrorId.AddPath_CommandAlreadyExistsForScreen, `A command already exists on this screen with name: '${command}'`));
    } else {
      command = command.trim();
    }

    // Validate `itemsTaken`
    let itemsTaken: string[] = dto.itemsTaken || [];
    if (!isArray<string>(itemsTaken, (item) => typeof item === 'string')) {
      validationErrors.push(new RequestValidationError('itemsTaken', "Field must be an array of strings"));
    } else {
      // Remove blank / empty items
      itemsTaken = itemsTaken.map((item) => item.trim()).filter((item) => !!item);

      // Ensure item names are not longer than `ITEM_NAME_MAX_LENGTH`
      const itemsWithLengthValidationErrors = itemsTaken.filter((item) => item.length > ITEM_NAME_MAX_LENGTH);
      if (itemsWithLengthValidationErrors.length > 0) {
        validationErrors.push(new RequestValidationError('itemsTaken', `Item names cannot be longer than ${ITEM_NAME_MAX_LENGTH} characters. Invalid item names: ${itemsWithLengthValidationErrors.join(', ')}`));
      }

      // Ensure item names do not contain any invalid characters
      const invalidItemNameCharacters: string[] = ',\r\n'.split('');
      const itemsWithInvalidCharacters = itemsTaken.filter((item) => {
        return invalidItemNameCharacters.some((invalidCharacter) => item.indexOf(invalidCharacter) !== -1);
      });
      if (itemsWithInvalidCharacters.length > 0) {
        validationErrors.push(new RequestValidationError('itemsTaken', `Item names cannot contain any of the following characters: ${invalidItemNameCharacters.join('')}. Invalid item names: ${itemsWithInvalidCharacters.join(', ')}`));
      }
    }

    // Validate `itemsGiven`
    let itemsGiven: string[] = dto.itemsGiven || [];
    if (!isArray<string>(itemsGiven, (item) => typeof item === 'string')) {
      validationErrors.push(new RequestValidationError('itemsGiven', "Field must be an array of strings"));
    } else {
      // Remove blank / empty items
      itemsGiven = itemsGiven.map((item) => item.trim()).filter((item) => !!item);

      // Ensure no items are duplicates if `limitItemsGiven` is true
      if (dto.limitItemsGiven === true) {
        const duplicateItems: string[] = [];

        // Check that each item is unique
        // 1. Loop through each item
        // 2. Check if there is an item later in the array that is equivalent
        // 3. Record any duplicate items
        // 4. Show a message listing any duplicate items
        for (let i = 0; i < itemsGiven.length; i++) {
          const currentItem = itemsGiven[i];
          for (let j = i + 1; j < itemsGiven.length; j++) {
            const comparisonItem = itemsGiven[j];
            if (areItemsEquivalent(currentItem, comparisonItem)) {
              duplicateItems.push(currentItem);
              break;
            }
          }
        }

        if (duplicateItems.length > 0) {
          validationErrors.push(new RequestValidationError('itemsGiven', `Cannot contain duplicate items when \`limitItemsGiven\` is \`true\`. Duplicate ${duplicateItems.length > 1 ? 'items' : 'item'}: ${duplicateItems.join(', ')}`));
        }
      }

      // Ensure item names are not longer than `ITEM_NAME_MAX_LENGTH`
      const itemsWithLengthValidationErrors = itemsGiven.filter((item) => item.length > ITEM_NAME_MAX_LENGTH);
      if (itemsWithLengthValidationErrors.length > 0) {
        validationErrors.push(new RequestValidationError('itemsGiven', `Item names cannot be longer than ${ITEM_NAME_MAX_LENGTH} characters. Invalid item names: ${itemsWithLengthValidationErrors.join(', ')}`));
      }

      // Ensure item names do not contain any invalid characters
      const invalidItemNameCharacters: string[] = ',\r\n'.split('');
      const itemsWithInvalidCharacters = itemsGiven.filter((item) => {
        return invalidItemNameCharacters.some((invalidCharacter) => item.indexOf(invalidCharacter) !== -1);
      });
      if (itemsWithInvalidCharacters.length > 0) {
        validationErrors.push(new RequestValidationError('itemsGiven', `Item names cannot contain any of the following characters: ${invalidItemNameCharacters.join('')}. Invalid item names: ${itemsWithInvalidCharacters.join(', ')}`));
      }
    }

    // Validate `limitItemsGiven`
    const limitItemsGiven: boolean | undefined = dto.limitItemsGiven;
    if (itemsGiven.length === 0) {
      // `itemsGiven` is not specified - make sure that `limitItemsGiven` is not specified either
      if (limitItemsGiven !== undefined) {
        validationErrors.push(new RequestValidationError('limitItemsGiven', "Field can only be provided if `itemsGiven` is not empty"));
      }
    } else {
      // `itemsGiven` is specified - make sure its valid
      if (limitItemsGiven === undefined || typeof limitItemsGiven !== 'boolean') {
        validationErrors.push(new RequestValidationError('limitItemsGiven', "Field must be a boolean"));
      }
    }

    // Validate `itemsRequired`
    let itemsRequired: string[] = dto.itemsRequired || [];
    if (!isArray<string>(itemsRequired, (item) => typeof item === 'string')) {
      validationErrors.push(new RequestValidationError('itemsRequired', "Field must be an array of strings"));
    } else {
      // Remove blank / empty items
      itemsRequired = itemsRequired.map((item) => item.trim()).filter((item) => !!item);

      // Ensure item names are not longer than `ITEM_NAME_MAX_LENGTH`
      const itemsWithLengthValidationErrors = itemsRequired.filter((item) => item.length > ITEM_NAME_MAX_LENGTH);
      if (itemsWithLengthValidationErrors.length > 0) {
        validationErrors.push(new RequestValidationError('itemsRequired', `Item names cannot be longer than ${ITEM_NAME_MAX_LENGTH} characters. Invalid item names: ${itemsWithLengthValidationErrors.join(', ')}`));
      }

      // Ensure item names do not contain any invalid characters
      const invalidItemNameCharacters: string[] = ',\r\n'.split('');
      const itemsWithInvalidCharacters = itemsRequired.filter((item) => {
        return invalidItemNameCharacters.some((invalidCharacter) => item.indexOf(invalidCharacter) !== -1);
      });
      if (itemsWithInvalidCharacters.length > 0) {
        validationErrors.push(new RequestValidationError('itemsRequired', `Item names cannot contain any of the following characters: ${invalidItemNameCharacters.join('')}. Invalid item names: ${itemsWithInvalidCharacters.join(', ')}`));
      }
    }

    // Validate `actionType`
    let actionType: CommandActionType = dto.actionType as CommandActionType;
    if (typeof actionType !== 'string' || !(
      actionType.trim().toLocaleLowerCase() === CommandActionType.Navigate ||
      actionType.trim().toLocaleLowerCase() === CommandActionType.PrintMessage)
    ) {
      validationErrors.push(new RequestValidationError('actionType', `Field must be a non-empty string with value either '${CommandActionType.Navigate}' or '${CommandActionType.PrintMessage}'`));
    } else {
      actionType = actionType.trim().toLocaleLowerCase() as CommandActionType;
    }

    /* NAVIGATE ACTIONS */
    // Validate `destinationType`
    let destinationType: PathDestinationType = dto.destinationType as PathDestinationType;
    if (actionType !== CommandActionType.Navigate) {
      // actionType is NOT 'navigate' so ensure `destinationType` is not provided
      if (destinationType !== undefined) {
        validationErrors.push(new RequestValidationError('destinationType', `Field can only be provided when \`actionType === '${CommandActionType.Navigate}'\``));
      }
      // else, `destinationType` is neither needed nor provided
    } else {
      // actionType is 'navigate' so `destinationType` is a required field
      if (typeof destinationType !== 'string' || !(
        destinationType.trim().toLocaleLowerCase() === PathDestinationType.New ||
        destinationType.trim().toLocaleLowerCase() === PathDestinationType.Existing)
      ) {
        // `destinationType` is needed, but either it is not provided or it does not contain the right value
        validationErrors.push(new RequestValidationError('destinationType', `Field must be a string with value either '${PathDestinationType.New}' or '${PathDestinationType.Existing}' when \`actionType === '${CommandActionType.Navigate}'\``));
      } else {
        // `destinationType` is needed, provided, and valid
        destinationType = destinationType.trim().toLocaleLowerCase() as PathDestinationType;
      }
    }

    // Validate `newScreenBody`
    const newScreenBody: string[] = dto.newScreenBody as string[];
    if (actionType !== CommandActionType.Navigate || destinationType !== PathDestinationType.New) {
      // Either `actionType` is NOT 'navigate' OR `destinationType` is not 'new' so ensure `newScreenBody` is not provided
      if (newScreenBody !== undefined) {
        validationErrors.push(new RequestValidationError('newScreenBody', `Field can only be provided when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``));
      }
      // else, `newScreenBody` is neither needed nor provided
    } else {
      // `actionType` is 'navigate' AND `destinationType` is 'new', so `newScreenBody` is a required field
      if (
        !isArray<string>(newScreenBody, (screenBodyItem) => typeof screenBodyItem === 'string') ||
        newScreenBody.length === 0 ||
        newScreenBody.every((line) => line.trim().length === 0)
      ) {
        // `newScreenBody` is needed but either:
        //  - Not an array of strings
        //  - An empty array
        //  - An array of empty strings
        validationErrors.push(new RequestValidationError('newScreenBody', `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``));
      } else if (newScreenBody.some((line) => line.length > TERMINAL_MAX_LINE_LENGTH)) {
        // `newScreenBody` is needed but at least one of its lines is too long
        validationErrors.push(new RequestValidationError('newScreenBody', `Maximum line length of ${TERMINAL_MAX_LINE_LENGTH} exceeded`));
      }
      // else, `newScreenBody` is needed, provided, and valid
    }

    // Validate `existingScreenId`
    let existingScreenId: string = dto.existingScreenId as string;
    let existingScreen: GameScreen | undefined;

    if (actionType !== CommandActionType.Navigate || destinationType !== PathDestinationType.Existing) {
      // Either `actionType` is NOT 'navigate' OR `destinationType` is not 'existing' so ensure `existingScreenId` is not provided
      if (existingScreenId !== undefined) {
        validationErrors.push(new RequestValidationError('existingScreenId', `Field can only be provided when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.Existing}'\``));
      }
      // else, `existingScreenId` is neither needed nor provided
    } else {
      // `actionType` is 'navigate' AND `destinationType` is 'existing', so `existingScreenId` is a required field
      if (typeof existingScreenId !== 'string' || existingScreenId.trim() === '') {
        // `existingScreenId` is needed but either:
        //  - Not provided or not a string
        //  - An empty string
        validationErrors.push(new RequestValidationError('existingScreenId', "Field must be a non-empty string"));
      } else if (sourceScreenId && existingScreenId.trim() === sourceScreenId.trim()) {
        // `existingScreenId` is needed and provided but is the same as `sourceScreenId`
        validationErrors.push(new RequestValidationError('existingScreenId', "Field cannot have the same value as `sourceScreenId`"));
      } else {
        // `existingScreenId` is needed and provided but may not reference an existing screen (valid otherwise)
        existingScreenId = existingScreenId.trim();
        existingScreen = await db.getScreenById(existingScreenId.trim()) as GameScreen;

        if (existingScreen === undefined) {
          // `existingScreenId` is needed and provided but does NOT reference an existing screen
          validationErrors.push(new GenericError(ErrorId.AddPath_NoDestinationScreenExistsWithId, `No existing destination screen exists with id: ${existingScreenId}`));
        }
        // else, `existingScreenId` is needed, provided, and valid
      }
    }

    /* PRINT ACTIONS */
    // Validate `printMessage`
    const printMessage: string[] = dto.printMessage as string[];
    if (actionType !== CommandActionType.PrintMessage) {
      // `actionType` is NOT 'print', so ensure `printMessage` is not provided
      if (printMessage !== undefined) {
        validationErrors.push(new RequestValidationError('printMessage', `Field can only be provided when \`actionType === '${CommandActionType.PrintMessage}'\``));
      }
      // else, `printMessage` is neither needed nor provided
    } else {
      // `actionType` is 'print', so `printMessage` is a required field
      if (
        !isArray<string>(printMessage, (printMessageItem) => typeof printMessageItem === 'string') ||
        printMessage.length === 0 ||
        printMessage.every((line) => line.trim().length === 0)
      ) {
        // `printMessage` is needed but either:
        //  - Not an array of strings
        //  - An empty array
        //  - An array of empty strings
        validationErrors.push(new RequestValidationError('printMessage', `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.PrintMessage}'\``));
      } else if (printMessage.some((line) => line.length > TERMINAL_MAX_LINE_LENGTH)) {
        // `printMessage` is needed but at least one of its lines is too long
        validationErrors.push(new RequestValidationError('printMessage', `Maximum line length of ${TERMINAL_MAX_LINE_LENGTH} exceeded`));
      }
      // else, `printMessage` is needed, provided, and valid
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    const newCommand: Command = await db.addPath({
      sourceScreen: sourceScreen!,
      command,
      itemsTaken,
      itemsGiven,
      limitItemsGiven,
      itemsRequired,
      actionType,
      destinationType,
      newScreenBody,
      existingScreen,
      printMessage,
    });

    if (actionType === CommandActionType.Navigate) {
      Logger.log(`Successfully added new 'navigation' pathway. GameScreen(${sourceScreen!.id})["${command}"] => GameScreen(${newCommand.targetScreenId})`);
    } else if (actionType === CommandActionType.PrintMessage) {
      Logger.log(`Successfully added new 'print message' pathway. GameScreen(${sourceScreen!.id})["${command}"]`);
    }

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
