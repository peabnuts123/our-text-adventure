import React, { ChangeEventHandler, FormEventHandler, FunctionComponent, useState } from "react";
import classnames from 'classnames';

import { TERMINAL_CHARACTER_WIDTH } from '@app/constants';
import { useStores } from "@app/stores";
import { ApiError, GenericApiError } from "@app/services/errors";
import ErrorId from "@app/constants/ErrorId";
import { DestinationType } from "@app/stores/command";

import AutoSizeTextarea from "../auto-size-textarea";
import Spinner from "../spinner";

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
  onSuccessfulCreate: (payload: CreatePathSubmitPayload) => void;
}

const CreatePath: FunctionComponent<Props> = ({ onCancel, onSuccessfulCreate }) => {
  // Stores
  const { CommandStore, StateStore } = useStores();

  // State
  const [commandInput, setCommandInput] = useState<string>("");
  const [itemsTakenInput, setItemsTakenInput] = useState<string>("");
  const [itemsGivenInput, setItemsGivenInput] = useState<string>("");
  const [itemsRequiredInput, setItemsRequiredInput] = useState<string>("");
  const [destinationTypeInput, setDestinationTypeInput] = useState<DestinationType | undefined>(undefined);
  const [existingDestinationIdInput, setExistingDestinationIdInput] = useState<string>("");
  const [newScreenBodyInput, setNewScreenBodyInput] = useState<string>("");

  // Validation state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
      // Validation
      const isCommandInputValid = validateCommandInput(commandInput);
      const isExistingDestinationIdValid = validateExistingDestinationIdInput(existingDestinationIdInput);
      const isNewScreenBodyValid = validateNewScreenBody(newScreenBodyInput);
      const isDestinationTypeValid = validateDestinationTypeInput(destinationTypeInput);
      const hasValidationErrors: boolean = !isCommandInputValid ||
        !isExistingDestinationIdValid ||
        !isNewScreenBodyValid ||
        !isDestinationTypeValid;

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
      try {
        const payload: CreatePathSubmitPayload = {
          command,
          itemsTaken,
          itemsGiven,
          itemsRequired,
          destinationType,
          existingScreenId,
          newScreenBody,
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
    const trimmedLines = transformNewScreenBodyToLines(textareaEl.value);

    // Re-join text back into text
    validateAndSetNewScreenBody(trimmedLines.join('\n'));
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
          <input type="text" name="items-taken" id="items-taken"
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
          <input type="text" name="items-given" id="items-given"
            className={classnames("input input--text", { 'is-disabled': isSubmitting })}
            placeholder="red key, crystal skull"
            onChange={(e) => setItemsGivenInput(e.target.value)}
            value={itemsGivenInput}
            autoCapitalize="words"
            disabled={isSubmitting}
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
            className={classnames("input input--text", { 'is-disabled': isSubmitting })}
            placeholder="blue key, amulet of rambotan"
            onChange={(e) => setItemsRequiredInput(e.target.value)}
            value={itemsRequiredInput}
            autoCapitalize="words"
            disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <span className={classnames("radio__indicator", { 'is-disabled': isSubmitting })}></span>
            <label htmlFor={DestinationType.New} className={classnames("radio__label", { 'is-disabled': isSubmitting })}>A new screen</label>
          </div>

          <div className="radio">
            <input type="radio" name="destination-type"
              className="radio__input u-screen-reader-only"
              id={DestinationType.Existing}
              value={DestinationType.Existing}
              onChange={(e) => validateAndSetDestinationTypeInput(e.target.value as DestinationType)}
              disabled={isSubmitting}
            />
            {/*  @TODO onlick select radio button */}
            <span className={classnames("radio__indicator", { 'is-disabled': isSubmitting })}></span>
            <label htmlFor={DestinationType.Existing} className={classnames("radio__label", { 'is-disabled': isSubmitting })}>An existing screen</label>
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
        </div>

        <button type="submit"
          className={classnames("button form__button u-margin-top-md", { 'is-disabled': isSubmitting })}
          disabled={isSubmitting}
        >Create pathway</button>
        <button type="button"
          className={classnames("button form__button u-md-margin-left-md u-margin-top-md", { 'is-disabled': isSubmitting })}
          onClick={onCancel}
          disabled={isSubmitting}
        >Cancel</button>

        {isSubmitting && (
          <span className="u-margin-left-md"><Spinner /></span>
        )}
      </form>
    </div>
  );
};

export default CreatePath;
