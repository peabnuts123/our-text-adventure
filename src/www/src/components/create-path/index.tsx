import React, { ChangeEventHandler, FormEventHandler, FunctionComponent, useState } from "react";
import classnames from 'classnames';

import { TERMINAL_CHARACTER_WIDTH } from '@app/constants';
import { useStores } from "@app/stores";
import { ApiError, GenericApiError } from "@app/services/errors";
import ErrorId from "@app/constants/ErrorId";
import { DestinationType } from "@app/stores/command";

import AutoSizeTextarea from "../auto-size-textarea";

export interface CreatePathSubmitPayload {
  command: string;
  itemsTaken?: string[];
  itemsGiven?: string[];
  itemsRequired?: string[];
  destinationType: DestinationType;
  existingScreenId?: string;
  newScreenBody?: string[];
}

interface Props {
  onCancel: () => void;
  onSubmit: (payload: CreatePathSubmitPayload) => void;
}

const CreatePath: FunctionComponent<Props> = ({ onCancel, onSubmit }) => {
  // Stores
  const { ScreenStore } = useStores();

  // State
  const [commandInput, setCommandInput] = useState<string>("");
  const [itemsTakenInput, setItemsTakenInput] = useState<string>("");
  const [itemsGivenInput, setItemsGivenInput] = useState<string>("");
  const [itemsRequiredInput, setItemsRequiredInput] = useState<string>("");
  const [destinationTypeInput, setDestinationTypeInput] = useState<DestinationType | undefined>(undefined);
  const [existingDestinationIdInput, setExistingDestinationIdInput] = useState<string>("");
  const [newScreenBodyInput, setNewScreenBodyInput] = useState<string>("");

  // Validation state
  const [isLoadingValidationState, setIsLoadingValidationState] = useState<boolean>(false);
  const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false);
  const [commandInputError, setCommandInputError] = useState<string | undefined>(undefined);
  const [destinationTypeInputError, setDestinationTypeInputError] = useState<string | undefined>(undefined);
  const [existingDestinationIdInputError, setExistingDestinationIdInputError] = useState<string | undefined>(undefined);
  const [newScreenBodyError, setNewScreenBodyError] = useState<string | undefined>(undefined);


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

  // - Destination type
  const validateDestinationTypeInput = (newValue: DestinationType | undefined): boolean => {
    if (newValue == undefined) {
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
    if (destinationTypeInput === DestinationType.New && newValue.trim() === '') {
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
    if (destinationTypeInput === DestinationType.Existing && newValue.trim() === '') {
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


  // Functions
  const transformNewScreenBodyToLines = (body: string): string[] => {
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
      setIsLoadingValidationState(true);

      // Validation
      const isCommandInputValid = validateCommandInput(commandInput);
      const isExistingDestinationIdValid = validateExistingDestinationIdInput(existingDestinationIdInput);
      const isNewScreenBodyValid = validateNewScreenBody(newScreenBodyInput);
      const isDestinationTypeValid = validateDestinationTypeInput(destinationTypeInput);
      let hasValidationErrors: boolean = !isCommandInputValid ||
        !isExistingDestinationIdValid ||
        !isNewScreenBodyValid ||
        !isDestinationTypeValid;

      // Only validate `existingDestinationId` if we're picking `DestinationType.Existing`
      if (destinationTypeInput === DestinationType.Existing && isExistingDestinationIdValid) {
        // @NOTE Extra validation for `existingDestinationId`
        // This is because it makes a call to the API to verify that it is
        //  a valid (i.e. existant) ID. We can't do this every time you press a
        //  character, so we only validate it when you submit.
        try {
          // Try get the screen by provided ID
          await ScreenStore.getScreenById(existingDestinationIdInput.trim());
        } catch (err) {
          // If an error occurs, either it is because a screen does not exist
          //  with that ID, or some random error occurred while processing
          if (
            err instanceof ApiError &&
            err.errors.some((error) =>
              error instanceof GenericApiError &&
              error.id === ErrorId.GetScreenById_NoScreenExistsWithId)
          ) {
            // API response is "Screen not found"
            setExistingDestinationIdInputError("No screen exists with ID: " + existingDestinationIdInput);
            hasValidationErrors = true;
          } else {
            // Unknown, continue throwing
            throw err;
          }
        }
      }

      // Finished validating (async)
      // Hide spinners and show errors
      setIsLoadingValidationState(false);
      setShowValidationErrors(true);

      // Do nothing if there are validation errors
      if (hasValidationErrors) {
        return;
      }

      // Parse input fields
      // - Command
      const command: string = commandInput.trim();

      // - Items taken
      let itemsTaken: string[] | undefined = undefined;
      if (itemsTakenInput.trim() !== '') {
        itemsTaken = itemsTakenInput.split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '');
      }

      // - Items given
      let itemsGiven: string[] | undefined = undefined;
      if (itemsGivenInput.trim() !== '') {
        itemsGiven = itemsGivenInput.split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '');
      }

      // - Items required
      let itemsRequired: string[] | undefined = undefined;
      if (itemsRequiredInput.trim() !== '') {
        itemsRequired = itemsRequiredInput.split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '');
      }

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
        newScreenBody = transformNewScreenBodyToLines(newScreenBodyInput);
      }

      // Submit form
      onSubmit({
        command,
        itemsTaken,
        itemsGiven,
        itemsRequired,
        destinationType,
        existingScreenId,
        newScreenBody,
      });
    })();
  };

  const handleNewScreenChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const textareaEl = e.target;
    const trimmedLines = transformNewScreenBodyToLines(textareaEl.value);

    // Re-join text back into text
    validateAndSetNewScreenBody(trimmedLines.join('\n'));
  };

  return (
    <div className="create-path">
      <h2 className="create-path__title">Create a new path</h2>
      <p className="create-path__description">Create a new pathway in the narrative. When the user is on this screen ($CURRENT_SCREEN_ID) and types this command{commandInput && <>
        &ensp;(<span>{commandInput}</span>)
      </>}, they will be taken to the target screen ($TARGET_SCREEN_ID). You can create a new screen or link to an existing one. Leave your mark on Our Text Adventure!</p>
      <form action="#" onSubmit={handleSubmit} className="create-path__form form">
        {/* Command */}
        <div className="form__input">
          {/* label */}
          <label htmlFor="command" className="form__input-label">Command <span className="create-path__form__specifier">(required)</span></label>
          {/* help text */}
          <p className="create-path__form__description">The command that the user must type when on this screen. Commands are not case or space sensitive.</p>
          {/* input */}
          <input type="text" name="command" id="command"
            className={classnames("input input--text", { 'has-error': showValidationErrors && commandInputError })}
            placeholder="look bone"
            onChange={(e) => validateAndSetCommandInput(e.target.value)}
            value={commandInput}
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
          <input type="text" name="items-taken" id="items-taken"
            className="input input--text"
            placeholder="green key, golden idol"
            onChange={(e) => setItemsTakenInput(e.target.value)}
            value={itemsTakenInput}
          />
        </div>

        {/* Items given */}
        <div className="form__input">
          {/* label */}
          <label htmlFor="items-given" className="form__input-label">Items to give <span className="create-path__form__specifier">(optional)</span></label>
          {/* help text */}
          <p className="create-path__form__description">Items that will be given to the player upon successfully issuing this command.</p>
          {/* input */}
          <input type="text" name="items-given" id="items-given"
            className="input input--text"
            placeholder="red key, crystal skull"
            onChange={(e) => setItemsGivenInput(e.target.value)}
            value={itemsGivenInput}
          />
        </div>

        {/* Items required */}
        <div className="form__input">
          {/* label */}
          <label htmlFor="items-required" className="form__input-label">Required items <span className="create-path__form__specifier">(optional)</span></label>
          {/* help text */}
          <p className="create-path__form__description">Items that the player is required to have in their inventory in order to issue this command. These items will not be removed from the player&apos;s inventory when doing this. If the player does not have these items, they will be shown a generic error message (the player will not be shown what items they are missing). The names of items are not case or space sensitive.</p>
          {/* input */}
          <input type="text" name="items-required" id="items-required"
            className="input input--text"
            placeholder="blue key, amulet of rambotan"
            onChange={(e) => setItemsRequiredInput(e.target.value)}
            value={itemsRequiredInput}
          />
        </div>

        {/* Destination */}
        <div className="form__input">
          {/* Destination type */}
          <label className="form__input-label">Destination <span className="create-path__form__specifier">(required)</span></label>
          <p className="create-path__form__description">Where will this command take the player?</p>

          <div className="radio">
            <input type="radio" name="destination-type"
              className="radio__input u-screen-reader-only"
              id={DestinationType.New}
              value={DestinationType.New}
              onChange={(e) => validateAndSetDestinationTypeInput(e.target.value as DestinationType)}
            />
            <span className="radio__indicator"></span>
            <label htmlFor={DestinationType.New} className="radio__label">A new screen</label>
          </div>

          <div className="radio">
            <input type="radio" name="destination-type"
              className="radio__input u-screen-reader-only"
              id={DestinationType.Existing}
              value={DestinationType.Existing}
              onChange={(e) => validateAndSetDestinationTypeInput(e.target.value as DestinationType)}
            />
            <span className="radio__indicator"></span>
            <label htmlFor={DestinationType.Existing} className="radio__label">An existing screen</label>
          </div>

          {/* error */}
          {showValidationErrors && destinationTypeInputError && (
            <span className="form__input__error">{destinationTypeInputError}</span>
          )}

          {destinationTypeInput === DestinationType.New && (
            <>
              {/* New screen body */}
              <div className="form__input">
                {/* label */}
                <label htmlFor="existing-destination-screen-id" className="form__input-label">New screen body <span className="create-path__form__specifier">(required)</span></label>
                {/* help text */}
                <p className="create-path__form__description">@TODO write the body of a new screen</p>
                {/* input */}
                <AutoSizeTextarea
                  id="new-destination-screen-body"
                  name="new-destination-screen-body"
                  className={classnames({ 'has-error': showValidationErrors && newScreenBodyError })}
                  minRows={10}
                  placeholder="You enter a dark room."
                  onChange={handleNewScreenChange}
                  value={newScreenBodyInput}
                />
                {/* error */}
                {showValidationErrors && newScreenBodyError && (
                  <span className="form__input__error">{newScreenBodyError}</span>
                )}
              </div>
            </>
          )}

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
                  className={classnames("input input--text", { 'has-error': showValidationErrors && existingDestinationIdInputError })}
                  placeholder="a0674659-3f17-4f71-9ec1-447d9b7f4ddd"
                  onChange={(e) => validateAndSetExistingDestinationIdInput(e.target.value)}
                  value={existingDestinationIdInput}
                />
                {/* error */}
                {showValidationErrors && existingDestinationIdInputError && (
                  <span className="form__input__error">{existingDestinationIdInputError}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* @TODO REMOVE debug visualising form state */}
        {/* <ul>
          <li>
            commandInput: {commandInput}
          </li>
          <li>
            itemsTakenInput: {itemsTakenInput}
          </li>
          <li>
            itemsGivenInput: {itemsGivenInput}
          </li>
          <li>
            itemsRequiredInput: {itemsRequiredInput}
          </li>
          <li>
            destinationTypeInput: {destinationTypeInput}
          </li>
          <li>
            existingDestinationIdInput: {existingDestinationIdInput}
          </li>
          <li>
            newScreenBody: {newScreenBody}
          </li>
        </ul> */}

        <button type="submit" className="button form__button u-margin-top-md">Create pathway</button>
        <button type="button" className="button form__button u-md-margin-left-md u-margin-top-md" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
};

export default CreatePath;
