import React, { ChangeEventHandler, FormEventHandler, FunctionComponent, useState } from "react";

import { TERMINAL_CHARACTER_WIDTH } from '@app/constants';

import AutoSizeTextarea from "../auto-size-textarea";
import Logger, { LogLevel } from "@app/util/Logger";

enum DestinationType {
  New = 'DestinationType_New',
  Existing = 'DestinationType_Existing',
}

interface Props {
  onCancel: () => void;
}

const CreatePath: FunctionComponent<Props> = ({ onCancel }) => {
  // State
  const [commandInput, setCommandInput] = useState<string>("");
  const [itemsTakenInput, setItemsTakenInput] = useState<string>("");
  const [itemsGivenInput, setItemsGivenInput] = useState<string>("");
  const [itemsRequiredInput, setItemsRequiredInput] = useState<string>("");
  const [destinationTypeInput, setDestinationTypeInput] = useState<DestinationType | undefined>(undefined);
  const [existingDestinationIdInput, setExistingDestinationIdInput] = useState<string>("");
  const [newScreenBody, setNewScreenBody] = useState<string>("");

  // Functions
  const handleSubmit: FormEventHandler<Element> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // @TODO validation
    if (destinationTypeInput === DestinationType.New) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      Logger.log(LogLevel.debug, `SAVING COMMAND\n` +
        `Command: ${commandInput}\n` +
        `Items taken: ${itemsTakenInput}\n` +
        `Items given: ${itemsGivenInput}\n` +
        `Items required: ${itemsRequiredInput}\n` +
        `Creating NEW screen with body:\n` + newScreenBody);
    } else if (destinationTypeInput === DestinationType.Existing)
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      Logger.log(LogLevel.debug, `SAVING COMMAND\n` +
        `Command: ${commandInput}\n` +
        `Items taken: ${itemsTakenInput}\n` +
        `Items given: ${itemsGivenInput}\n` +
        `Items required: ${itemsRequiredInput}\n` +
        `Referencing EXISTING screen with ID:\n` + existingDestinationIdInput);
  };

  const handleNewScreenChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const textareaEl = e.target;

    // Split text into lines
    const rawBody = textareaEl.value;
    const rawLines = rawBody.split(/[\r\n]/g);

    // Restrict length of each line to `TERMINAL_CHARACTER_WIDTH`
    const trimmedLines = rawLines.map((line) => line.substring(0, TERMINAL_CHARACTER_WIDTH));

    // Re-join text back into text
    setNewScreenBody(trimmedLines.join('\n'));
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
          <label htmlFor="command" className="form__input-label">Command <span className="create-path__form__specifier">(required)</span></label>
          <p className="create-path__form__description">The command that the user must type when on this screen. Commands are not case or space sensitive.</p>
          <input type="text" name="command" id="command"
            className="input input--text"
            placeholder="look bone"
            onChange={(e) => setCommandInput(e.target.value)}
            value={commandInput}
          />
        </div>

        {/* Items taken */}
        <div className="form__input">
          <label htmlFor="items-taken" className="form__input-label">Items to take <span className="create-path__form__specifier">(optional)</span></label>
          <p className="create-path__form__description">Items that will be removed when the player issues this command. It is implied that the player must have these items in their inventory in order to do this, or else they will be shown a generic error message (the player will not be shown what items they are missing). The names of items are not case or space sensitive.</p>
          <input type="text" name="items-taken" id="items-taken"
            className="input input--text"
            placeholder="green key, golden idol"
            onChange={(e) => setItemsTakenInput(e.target.value)}
            value={itemsTakenInput}
          />
        </div>

        {/* Items given */}
        <div className="form__input">
          <label htmlFor="items-given" className="form__input-label">Items to give <span className="create-path__form__specifier">(optional)</span></label>
          <p className="create-path__form__description">Items that will be given to the player upon successfully issuing this command.</p>
          <input type="text" name="items-given" id="items-given"
            className="input input--text"
            placeholder="red key, crystal skull"
            onChange={(e) => setItemsGivenInput(e.target.value)}
            value={itemsGivenInput}
          />
        </div>

        {/* Items required */}
        <div className="form__input">
          <label htmlFor="items-required" className="form__input-label">Required items <span className="create-path__form__specifier">(optional)</span></label>
          <p className="create-path__form__description">Items that the player is required to have in their inventory in order to issue this command. These items will not be removed from the player&apos;s inventory when doing this. If the player does not have these items, they will be shown a generic error message (the player will not be shown what items they are missing). The names of items are not case or space sensitive.</p>
          <input type="text" name="items-required" id="items-required"
            className="input input--text"
            placeholder="blue key, amulet of rambotan"
            onChange={(e) => setItemsRequiredInput(e.target.value)}
            value={itemsRequiredInput}
          />
        </div>

        {/* Target screen */}
        <div className="form__input">
          <label className="form__input-label">Destination <span className="create-path__form__specifier">(required)</span></label>
          <p className="create-path__form__description">Where will this command take the player?</p>

          <div className="radio">
            <input type="radio" name="destination-type"
              className="radio__input u-screen-reader-only"
              id={DestinationType.New}
              value={DestinationType.New}
              onChange={(e) => setDestinationTypeInput(e.target.value as DestinationType)}
            />
            <span className="radio__indicator"></span>
            <label htmlFor={DestinationType.New} className="radio__label">A new screen</label>
          </div>

          <div className="radio">
            <input type="radio" name="destination-type"
              className="radio__input u-screen-reader-only"
              id={DestinationType.Existing}
              value={DestinationType.Existing}
              onChange={(e) => setDestinationTypeInput(e.target.value as DestinationType)}
            />
            <span className="radio__indicator"></span>
            <label htmlFor={DestinationType.Existing} className="radio__label">An existing screen</label>
          </div>

          {destinationTypeInput === DestinationType.New && (
            <>
              {/* New screen body */}
              <div className="form__input">
                <label htmlFor="existing-destination-screen-id" className="form__input-label">New screen body <span className="create-path__form__specifier">(required)</span></label>
                <p className="create-path__form__description">@TODO write the body of a new screen</p>
                <AutoSizeTextarea
                  id="new-destination-screen-body"
                  name="new-destination-screen-body"
                  minRows={10}
                  placeholder="You enter a dark room."
                  onChange={handleNewScreenChange}
                  value={newScreenBody}
                />
              </div>
            </>
          )}

          {destinationTypeInput === DestinationType.Existing && (
            <>
              {/* Existing screen ID */}
              <div className="form__input">
                <label htmlFor="existing-destination-screen-id" className="form__input-label">Destination screen ID <span className="create-path__form__specifier">(required)</span></label>
                <p className="create-path__form__description">Paste the ID of an existing screen as the destination. You can get the ID from the URL or something, I&apos;m not quite sure yet.</p>
                <input type="text" name="existing-destination-screen-id" id="existing-destination-screen-id"
                  className="input input--text"
                  placeholder="a0674659-3f17-4f71-9ec1-447d9b7f4ddd"
                  onChange={(e) => setExistingDestinationIdInput(e.target.value)}
                  value={existingDestinationIdInput}
                />
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
