import React, { ChangeEventHandler, FormEventHandler, FunctionComponent, useState } from "react";
import classnames from 'classnames';

import { TERMINAL_CHARACTER_WIDTH } from '@app/constants';
import { useStores } from "@app/stores";
import { ApiError, GenericApiError } from "@app/services/errors";
import ErrorId from "@app/constants/ErrorId";
import { CommandActionType, DestinationType } from "@app/stores/command";

import AutoSizeTextarea from "../auto-size-textarea";
import Spinner from "../spinner";

export interface CreatePathSubmitPayload {
  command: string;
  itemsTaken?: string[];
  itemsGiven?: string[];
  limitItemsGiven?: boolean;
  itemsRequired?: string[];
  actionType: CommandActionType;
  destinationType?: DestinationType;
  existingScreenId?: string;
  newScreenBody?: string[];
  printMessage?: string[];
}

interface Props {
  onCancel: () => void;
  onSuccessfulCreate: (payload: CreatePathSubmitPayload) => void;
}

function parseItemString(itemString: string): string[] {
  return itemString.split(/[\n,]+/g)
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

// @NOTE: Must match the API
function areItemsEquivalent(itemA: string, itemB: string): boolean {
  return itemA.trim().localeCompare(itemB.trim(), undefined, { sensitivity: 'accent' }) === 0;
}

const CreatePath: FunctionComponent<Props> = ({ onCancel, onSuccessfulCreate }) => {
  // Stores
  const { CommandStore, StateStore } = useStores();

  // State
  const [commandInput, setCommandInput] = useState<string>("");
  const [itemsTakenInput, setItemsTakenInput] = useState<string>("");
  const [itemsGivenInput, setItemsGivenInput] = useState<string>("");
  const [limitItemsGivenInput, setLimitItemsGivenInput] = useState<boolean>(true);
  const [itemsRequiredInput, setItemsRequiredInput] = useState<string>("");
  const [actionTypeInput, setActionTypeInput] = useState<CommandActionType | undefined>(undefined);
  const [destinationTypeInput, setDestinationTypeInput] = useState<DestinationType | undefined>(undefined);
  const [existingDestinationIdInput, setExistingDestinationIdInput] = useState<string>("");
  const [newScreenBodyInput, setNewScreenBodyInput] = useState<string>("");
  const [printMessageInput, setPrintMessageInput] = useState<string>("");

  // Validation state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false);
  const [commandInputError, setCommandInputError] = useState<string | undefined>(undefined);
  const [itemsGivenInputError, setItemsGivenInputError] = useState<string | undefined>(undefined);
  const [actionTypeInputError, setActionTypeInputError] = useState<string | undefined>(undefined);
  const [destinationTypeInputError, setDestinationTypeInputError] = useState<string | undefined>(undefined);
  const [existingDestinationIdInputError, setExistingDestinationIdInputError] = useState<string | undefined>(undefined);
  const [newScreenBodyError, setNewScreenBodyError] = useState<string | undefined>(undefined);
  const [printMessageInputError, setPrintMessageInputError] = useState<string | undefined>(undefined);

  // Computed state
  const hasAnyGivenItems = parseItemString(itemsGivenInput).length > 0;

  // Validated set functions
  // - Command
  const validateCommandInput = (newValue: string): boolean => {
    if (newValue.trim() === '') {
      setCommandInputError('You must enter a command');
      return false;
    } else if (newValue[0] === '/') {
      setCommandInputError('Command cannot start with a /');
      return false;
    }
    // @TODO validate / enforce ASCII or something?
    else {
      setCommandInputError(undefined);
      return true;
    }
  };
  const validateAndSetCommandInput = (newValue: string): void => {
    validateCommandInput(newValue);
    setCommandInput(newValue);
  };

  // - Items given
  const validateItemsGiven = (newValue: string): boolean => {
    const itemsGiven = parseItemString(newValue);

    if (limitItemsGivenInput === true) {
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
        setItemsGivenInputError(`Cannot give duplicate items when Item Restriction is enabled. Remove ${duplicateItems.length > 1 ? 'duplicate items' : 'the duplicate item'} or uncheck the checkbox. Duplicate ${duplicateItems.length > 1 ? 'items' : 'item'}: ${duplicateItems.join(', ')}`);
        return false;
      }
    }

    setItemsGivenInputError(undefined);
    return true;
  };
  const validateAndSetItemsGiven = (newValue: string): void => {
    validateItemsGiven(newValue);
    setItemsGivenInput(newValue);
  };

  // - Action type
  const validationActionTypeInput = (newValue: CommandActionType | undefined): boolean => {
    if (newValue == undefined) {
      setActionTypeInputError("You must specify an action type");
      return false;
    } else {
      setActionTypeInputError(undefined);
      return true;
    }
  };
  const validateAndSetActionTypeInput = (newValue: CommandActionType): void => {
    validationActionTypeInput(newValue);
    setActionTypeInput(newValue);
  };

  // - Destination type
  const validateDestinationTypeInput = (newValue: DestinationType | undefined): boolean => {
    if (
      actionTypeInput === CommandActionType.Navigate &&
      newValue == undefined
    ) {
      setDestinationTypeInputError("You must specify a destination");
      return false;
    } else {
      setDestinationTypeInputError(undefined);
      return true;
    }
  };
  const validateAndSetDestinationTypeInput = (newValue: DestinationType): void => {
    validateDestinationTypeInput(newValue);
    setDestinationTypeInput(newValue);
  };

  // - New screen body
  const validateNewScreenBody = (newValue: string): boolean => {
    if (
      actionTypeInput === CommandActionType.Navigate &&
      destinationTypeInput === DestinationType.New &&
      newValue.trim() === ''
    ) {
      setNewScreenBodyError("You must provide content for the screen");
      return false;
    } else {
      setNewScreenBodyError(undefined);
      return true;
    }
  };
  const validateAndSetNewScreenBody = (newValue: string): void => {
    validateNewScreenBody(newValue);
    setNewScreenBodyInput(newValue);
  };

  // - Existing destination input
  const validateExistingDestinationIdInput = (newValue: string): boolean => {
    if (
      actionTypeInput === CommandActionType.Navigate &&
      destinationTypeInput === DestinationType.Existing &&
      newValue.trim() === ''
    ) {
      setExistingDestinationIdInputError('You must provide a screen ID');
      return false;
    } else {
      // Hide any validation errors (will check existence of screen with ID on submit)
      setExistingDestinationIdInputError(undefined);
      return true;
    }
  };
  const validateAndSetExistingDestinationIdInput = (newValue: string): void => {
    validateExistingDestinationIdInput(newValue);
    setExistingDestinationIdInput(newValue);
  };
  // - Print message
  const validatePrintMessage = (newValue: string): boolean => {
    if (
      actionTypeInput === CommandActionType.PrintMessage &&
      newValue.trim() === ''
    ) {
      setPrintMessageInputError("You must provide a message");
      return false;
    } else {
      setPrintMessageInputError(undefined);
      return true;
    }
  };
  const validateAndSetPrintMessage = (newValue: string): void => {
    validatePrintMessage(newValue);
    setPrintMessageInput(newValue);
  };


  // Functions
  const transformTerminalStringToLines = (body: string): string[] => {
    // Split text into lines
    const rawLines = body.split(/[\r\n]/g);

    // Restrict length of each line to `TERMINAL_CHARACTER_WIDTH`
    const trimmedLines = rawLines.map((line) => line.substring(0, TERMINAL_CHARACTER_WIDTH));

    return trimmedLines;
  };

  const handleSubmit: FormEventHandler<Element> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    void (async () => {
      // Validation
      const isCommandInputValid = validateCommandInput(commandInput);
      const isItemsGivenValid = validateItemsGiven(itemsGivenInput);
      const isExistingDestinationIdValid = validateExistingDestinationIdInput(existingDestinationIdInput);
      const isNewScreenBodyValid = validateNewScreenBody(newScreenBodyInput);
      const isActionTypeValid = validationActionTypeInput(actionTypeInput);
      const isDestinationTypeValid = validateDestinationTypeInput(destinationTypeInput);
      const isPrintMessageValid = validatePrintMessage(printMessageInput);
      const hasValidationErrors: boolean = !isCommandInputValid ||
        !isItemsGivenValid ||
        !isActionTypeValid ||
        !isDestinationTypeValid ||
        !isExistingDestinationIdValid ||
        !isNewScreenBodyValid ||
        !isPrintMessageValid;

      // Form has submitted at least once - show validation errors now
      setShowValidationErrors(true);

      // Do nothing if there are validation errors
      if (hasValidationErrors) {
        return;
      }

      setIsSubmitting(true);

      // Parse input fields
      // - Command
      const command: string = commandInput.trim();

      // - Items taken
      let itemsTaken: string[] | undefined = undefined;
      if (itemsTakenInput.trim() !== '') {
        itemsTaken = parseItemString(itemsTakenInput);
      }

      // - Items given
      let itemsGiven: string[] | undefined = undefined;
      if (itemsGivenInput.trim() !== '') {
        itemsGiven = parseItemString(itemsGivenInput);
      }

      // - Limit items given
      let limitItemsGiven: boolean | undefined = undefined;
      if (itemsGiven !== undefined) {
        limitItemsGiven = limitItemsGivenInput;
      }

      // - Items required
      let itemsRequired: string[] | undefined = undefined;
      if (itemsRequiredInput.trim() !== '') {
        itemsRequired = parseItemString(itemsRequiredInput);
      }

      // - Action type
      const actionType: CommandActionType = actionTypeInput!;

      // - Destination type
      const destinationType: DestinationType = destinationTypeInput!;

      // - Existing screen ID
      let existingScreenId: string | undefined = undefined;
      if (destinationType === DestinationType.Existing) {
        existingScreenId = existingDestinationIdInput.trim();
      }

      // - New screen body
      let newScreenBody: string[] | undefined = undefined;
      if (destinationType === DestinationType.New) {
        newScreenBody = transformTerminalStringToLines(newScreenBodyInput);
      }

      // - Print message
      let printMessage: string[] | undefined = undefined;
      if (actionType === CommandActionType.PrintMessage) {
        printMessage = transformTerminalStringToLines(printMessageInput);
      }

      // Submit form
      try {
        const payload: CreatePathSubmitPayload = {
          command,
          itemsTaken,
          itemsGiven,
          limitItemsGiven,
          itemsRequired,
          actionType,
          destinationType,
          existingScreenId,
          newScreenBody,
          printMessage,
        };

        await CommandStore.createPath({
          sourceScreenId: StateStore.currentScreenId,
          ...payload,
        });

        // Finished loading - hide spinners
        // Hidin' spinners, we hidin' spinners (they don't stop)
        setIsSubmitting(false);

        onSuccessfulCreate(payload);
      } catch (err) {
        // Finished loading (even through we got an error)
        setIsSubmitting(false);

        if (err instanceof ApiError) {
          // API returned well-formed, known error
          const response = err;
          const { errors } = response;

          let wasHandled = false;

          // Command already exists
          if (errors.some((error) =>
            error instanceof GenericApiError &&
            error.id === ErrorId.AddPath_CommandAlreadyExistsForScreen)
          ) {
            setCommandInputError("This command already exists for this screen");
            wasHandled = true;
          }

          // Existing screen ID does not exist
          if (errors.some((error) =>
            error instanceof GenericApiError &&
            error.id === ErrorId.AddPath_NoDestinationScreenExistsWithId)
          ) {
            setExistingDestinationIdInputError("No screen exists with ID: " + existingDestinationIdInput);
            wasHandled = true;
          }

          // Continue throwing if we don't know what happened
          if (wasHandled === false) {
            throw err;
          }
        } else {
          throw err;
        }
      }
    })();
  };

  const handleNewScreenChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const textareaEl = e.target;
    const trimmedLines = transformTerminalStringToLines(textareaEl.value);

    // Re-join text back into text
    validateAndSetNewScreenBody(trimmedLines.join('\n'));
  };

  const handlePrintMessageChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const textareaEl = e.target;
    const trimmedLines = transformTerminalStringToLines(textareaEl.value);

    // Re-join text back into text
    validateAndSetPrintMessage(trimmedLines.join('\n'));
  };

  return (
    <div className="create-path">
      <h2 className="create-path__title">Create a new path</h2>
      <p className="create-path__description">Create a new pathway in the narrative. When the user is on this screen and types this command, they will be taken to the specified target screen. You can create a new screen or link to an existing one. Leave your mark on Our Text Adventure!</p>
      <form action="#" onSubmit={handleSubmit} className="create-path__form form">
        {/* Command */}
        <div className="form__input">
          {/* label */}
          <label htmlFor="command" className="form__input-label">Command <span className="create-path__form__specifier">(required)</span></label>
          {/* help text */}
          <p className="create-path__form__description">The command that the user must type when on this screen. Commands are not case or space sensitive.</p>
          {/* input */}
          <input type="text" name="command" id="command"
            className={classnames("input input--text", {
              'has-error': showValidationErrors && commandInputError,
              'is-disabled': isSubmitting,
            })}
            placeholder="look bone"
            onChange={(e) => validateAndSetCommandInput(e.target.value)}
            value={commandInput}
            autoCapitalize="none"
            disabled={isSubmitting}
          />
          {/* error */}
          {showValidationErrors && commandInputError && (
            <span className="form__input__error">{commandInputError}</span>
          )}
        </div>

        {/* Items taken */}
        <div className="form__input">
          {/* label */}
          <label htmlFor="items-taken" className="form__input-label">Items to take <span className="create-path__form__specifier">(optional)</span></label>
          {/* help text */}
          <p className="create-path__form__description">Items that will be removed when the player issues this command. It is implied that the player must have these items in their inventory in order to do this, or else they will be shown a generic error message (the player will not be shown what items they are missing). The names of items are not case or space sensitive.</p>
          {/* input */}
          <AutoSizeTextarea
            id="items-taken"
            name="items-taken"
            minRows={1}
            className={classnames("input input--text", { 'is-disabled': isSubmitting })}
            placeholder="green key, golden idol"
            onChange={(e) => setItemsTakenInput(e.target.value)}
            value={itemsTakenInput}
            autoCapitalize="words"
            disabled={isSubmitting}
          />
        </div>

        {/* Items given */}
        <div className="form__input">
          {/* label */}
          <label htmlFor="items-given" className="form__input-label">Items to give <span className="create-path__form__specifier">(optional)</span></label>
          {/* help text */}
          <p className="create-path__form__description">Items that will be given to the player upon successfully issuing this command.</p>
          {/* input */}
          <AutoSizeTextarea
            id="items-given"
            name="items-given"
            minRows={1}
            className={classnames("input input--text", { 'is-disabled': isSubmitting })}
            placeholder="red key, crystal skull"
            onChange={(e) => validateAndSetItemsGiven(e.target.value)}
            value={itemsGivenInput}
            autoCapitalize="words"
            disabled={isSubmitting}
          />
          {/* error */}
          {showValidationErrors && itemsGivenInputError && (
            <span className="form__input__error">{itemsGivenInputError}</span>
          )}

          {/* Limit items given (only visible if anything is entered into `itemsGiven`) */}
          {hasAnyGivenItems && (
            <div className="checkbox u-margin-top-md">
              <input type="checkbox" name="limit-items-given"
                className="checkbox__input u-screen-reader-only"
                id="limit-items-given"
                checked={limitItemsGivenInput}
                onChange={(e) => setLimitItemsGivenInput(e.target.checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="limit-items-given" className={classnames("checkbox__label", { 'is-disabled': isSubmitting })}>
                <span className={classnames("checkbox__indicator", { 'is-disabled': isSubmitting })} />
                Item Restriction: Do not give these items to the player if they already have them
              </label>
            </div>
          )}
        </div>

        {/* Items required */}
        <div className="form__input">
          {/* label */}
          <label htmlFor="items-required" className="form__input-label">Required items <span className="create-path__form__specifier">(optional)</span></label>
          {/* help text */}
          <p className="create-path__form__description">Items that the player is required to have in their inventory in order to issue this command. These items will not be removed from the player&apos;s inventory when doing this. If the player does not have these items, they will be shown a generic error message (the player will not be shown what items they are missing). The names of items are not case or space sensitive.</p>
          {/* input */}
          <AutoSizeTextarea
            id="items-required"
            name="items-required"
            minRows={1}
            className={classnames("input input--text", { 'is-disabled': isSubmitting })}
            placeholder="blue key, amulet of rambotan"
            onChange={(e) => setItemsRequiredInput(e.target.value)}
            value={itemsRequiredInput}
            autoCapitalize="words"
            disabled={isSubmitting}
          />
        </div>

        {/* Action */}
        <div className="form__input">
          {/* Action type */}
          <label className="form__input-label">Action <span className="create-path__form__specifier">(required)</span></label>
          <p className="create-path__form__description">What happens when a player issues this command?</p>

          {/* Option: Navigate */}
          <div className="radio">
            <input type="radio" name="action-type"
              className="radio__input u-screen-reader-only"
              id={`action-type_${CommandActionType.Navigate}`}
              value={CommandActionType.Navigate}
              checked={actionTypeInput === CommandActionType.Navigate}
              onChange={(e) => validateAndSetActionTypeInput(e.target.value as CommandActionType)}
              disabled={isSubmitting}
            />
            <label htmlFor={`action-type_${CommandActionType.Navigate}`} className={classnames("radio__label", { 'is-disabled': isSubmitting })}>
              <span className={classnames("radio__indicator", { 'is-disabled': isSubmitting })} />
              Navigate to another screen
            </label>
          </div>

          {/* Option: Print */}
          <div className="radio">
            <input type="radio" name="action-type"
              className="radio__input u-screen-reader-only"
              id={`action-type_${CommandActionType.PrintMessage}`}
              value={CommandActionType.PrintMessage}
              checked={actionTypeInput === CommandActionType.PrintMessage}
              onChange={(e) => validateAndSetActionTypeInput(e.target.value as CommandActionType)}
              disabled={isSubmitting}
            />
            <label htmlFor={`action-type_${CommandActionType.PrintMessage}`} className={classnames("radio__label", { 'is-disabled': isSubmitting })}>
              <span className={classnames("radio__indicator", { 'is-disabled': isSubmitting })} />
              Print a message
            </label>
          </div>

          {/* error */}
          {showValidationErrors && actionTypeInputError && (
            <span className="form__input__error">{actionTypeInputError}</span>
          )}
        </div>


        {/* PRINT TYPE COMMANDS */}
        {actionTypeInput === CommandActionType.PrintMessage && (
          <>
            {/* Print a message */}
            <div className="form__input">
              {/* label */}
              <label htmlFor="print-message-contents" className="form__input-label">Message <span className="create-path__form__specifier">(required)</span></label>
              {/* help text */}
              <p className="create-path__form__description">@TODO What message to print?</p>
              {/* input */}
              <AutoSizeTextarea
                id="print-message-contents"
                name="print-message-contents"
                className={classnames({
                  'has-error': showValidationErrors && printMessageInputError,
                  'is-disabled': isSubmitting,
                })}
                minRows={10}
                placeholder={"You pick up the tattered\nenvelope and place it in\nyour pocket."}
                onChange={handlePrintMessageChange}
                value={printMessageInput}
                autoCapitalize="sentences"
                disabled={isSubmitting}
              />
              {/* error */}
              {showValidationErrors && printMessageInputError && (
                <span className="form__input__error">{printMessageInputError}</span>
              )}
            </div>
          </>
        )}

        {/* NAVIGATE TYPE COMMANDS */}
        {actionTypeInput === CommandActionType.Navigate && (
          <>
            {/* Destination */}
            <div className="form__input">
              {/* Destination type */}
              <label className="form__input-label">Destination <span className="create-path__form__specifier">(required)</span></label>
              <p className="create-path__form__description">Where will this command take the player?</p>

              {/* Option: New screen */}
              <div className="radio">
                <input type="radio" name="destination-type"
                  className="radio__input u-screen-reader-only"
                  id={`destination-type_${DestinationType.New}`}
                  value={DestinationType.New}
                  checked={destinationTypeInput === DestinationType.New}
                  onChange={(e) => validateAndSetDestinationTypeInput(e.target.value as DestinationType)}
                  disabled={isSubmitting}
                />
                <label htmlFor={`destination-type_${DestinationType.New}`} className={classnames("radio__label", { 'is-disabled': isSubmitting })}>
                  <span className={classnames("radio__indicator", { 'is-disabled': isSubmitting })} />
                    Create a new screen
                  </label>
              </div>

              {/* Option: Existing screen */}
              <div className="radio">
                <input type="radio" name="destination-type"
                  className="radio__input u-screen-reader-only"
                  id={`destination-type_${DestinationType.Existing}`}
                  value={DestinationType.Existing}
                  checked={destinationTypeInput === DestinationType.Existing}
                  onChange={(e) => validateAndSetDestinationTypeInput(e.target.value as DestinationType)}
                  disabled={isSubmitting}
                />
                <label htmlFor={`destination-type_${DestinationType.Existing}`} className={classnames("radio__label", { 'is-disabled': isSubmitting })}>
                  <span className={classnames("radio__indicator", { 'is-disabled': isSubmitting })} />
                    An existing screen
                  </label>
              </div>

              {/* error */}
              {showValidationErrors && destinationTypeInputError && (
                <span className="form__input__error">{destinationTypeInputError}</span>
              )}
            </div>


            {/* New screen */}
            {destinationTypeInput === DestinationType.New && (
              <>
                {/* New screen body */}
                <div className="form__input">
                  {/* label */}
                  <label htmlFor="new-destination-screen-body" className="form__input-label">New screen body <span className="create-path__form__specifier">(required)</span></label>
                  {/* help text */}
                  <p className="create-path__form__description">@TODO write the body of a new screen</p>
                  {/* input */}
                  <AutoSizeTextarea
                    id="new-destination-screen-body"
                    name="new-destination-screen-body"
                    className={classnames({
                      'has-error': showValidationErrors && newScreenBodyError,
                      'is-disabled': isSubmitting,
                    })}
                    minRows={10}
                    placeholder="You enter a dark room."
                    onChange={handleNewScreenChange}
                    value={newScreenBodyInput}
                    autoCapitalize="sentences"
                    disabled={isSubmitting}
                  />
                  {/* error */}
                  {showValidationErrors && newScreenBodyError && (
                    <span className="form__input__error">{newScreenBodyError}</span>
                  )}
                </div>
              </>
            )}

            {/* Existing screen */}
            {destinationTypeInput === DestinationType.Existing && (
              <>
                {/* Existing screen ID */}
                <div className="form__input">
                  {/* label */}
                  <label htmlFor="existing-destination-screen-id" className="form__input-label">Destination screen ID <span className="create-path__form__specifier">(required)</span></label>
                  {/* help text */}
                  <p className="create-path__form__description">Paste the ID of an existing screen as the destination. You can get the ID from the URL or something, I&apos;m not quite sure yet.</p>
                  {/* input */}
                  <input type="text" name="existing-destination-screen-id" id="existing-destination-screen-id"
                    className={classnames("input input--text", {
                      'has-error': showValidationErrors && existingDestinationIdInputError,
                      'is-disabled': isSubmitting,
                    })}
                    placeholder="a0674659-3f17-4f71-9ec1-447d9b7f4ddd"
                    onChange={(e) => validateAndSetExistingDestinationIdInput(e.target.value)}
                    value={existingDestinationIdInput}
                    autoCapitalize="off"
                    disabled={isSubmitting}
                  />
                  {/* error */}
                  {showValidationErrors && existingDestinationIdInputError && (
                    <span className="form__input__error">{existingDestinationIdInputError}</span>
                  )}
                </div>
              </>
            )}
          </>
        )}

        <div className="form__input">
          <button type="submit"
            className={classnames("button form__button u-margin-bottom-md u-md-margin-bottom-0", { 'is-disabled': isSubmitting })}
            disabled={isSubmitting}
          >Create pathway</button>
          <button type="button"
            className={classnames("button form__button u-md-margin-left-md", { 'is-disabled': isSubmitting })}
            onClick={onCancel}
            disabled={isSubmitting}
          >Cancel</button>

          {isSubmitting && (
            <span className="u-margin-left-md"><Spinner /></span>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreatePath;
