import React, { FormEventHandler, FunctionComponent, KeyboardEventHandler, RefObject, useEffect, useRef, useState } from "react";

import { useStores } from "@app/stores";

import AutoSizeTextarea from "../auto-size-textarea";

interface Props {
  onSubmit: (command: string) => Promise<void>;
  refObject?: RefObject<HTMLTextAreaElement>;
}

const CommandInput: FunctionComponent<Props> = ({ onSubmit, refObject }) => {
  // Stores
  const { StateStore } = useStores();

  // State
  const [inputCommand, setInputCommand] = useState<string>("");
  /**
   * `undefined` - Not at a point in history (typing new command)
   * `0` - The last command that was submitted
   * `1..` - The second last command that was submitted, etc.
   */
  const [historyIndex, setHistoryIndex] = useState<number | undefined>(undefined);
  const [temporaryHistoryItem, setTemporaryHistoryItem] = useState<string>('');

  // Refs
  /**
   * Used if no ref is supplied. If a ref is provided through props, that one
   * is used instead.
   */
  const defaultRef = useRef<HTMLTextAreaElement>(null);

  // Prefer provided ref, otherwise, use defaultRef
  const inputRef: RefObject<HTMLTextAreaElement> = refObject || defaultRef;

  // Functions
  const submit = (): void => {
    // History
    StateStore.terminalHistory.unshift(inputCommand);
    setHistoryIndex(undefined);
    setTemporaryHistoryItem('');

    // Callbacks
    void onSubmit(inputCommand);
    setInputCommand("");
  };

  const handleSubmit: FormEventHandler<Element> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    submit();
  };

  const handleKeyDown: KeyboardEventHandler = (e) => {
    // Handle "Arrow Up" key press
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();

      // Do nothing if we have no history, or if we're already at the beginning of history
      if (StateStore.terminalHistory.length === 0 || historyIndex === (StateStore.terminalHistory.length - 1)) {
        return;
      }

      let newHistoryIndex: number;
      if (historyIndex === undefined) {
        // Begin scrolling through history
        newHistoryIndex = 0;
        // Store whatever we had typed
        setTemporaryHistoryItem(inputCommand);
      } else {
        // Already scrolling through history
        newHistoryIndex = historyIndex + 1;
      }

      setHistoryIndex(newHistoryIndex);
      setInputCommand(StateStore.terminalHistory[newHistoryIndex]);
    }

    // Handle "Arrow Down" key press
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();

      // Do nothing if we're already at the present
      if (historyIndex === undefined) {
        return;
      }

      if (historyIndex === 0) {
        // Scrolled back to the current command i.e. the present
        setHistoryIndex(undefined);
        setInputCommand(temporaryHistoryItem);
      } else if (historyIndex && historyIndex > 0) {
        // Scrolling through history
        const newHistoryIndex = historyIndex - 1;
        setHistoryIndex(newHistoryIndex);
        setInputCommand(StateStore.terminalHistory[newHistoryIndex]);
      }
    }
  };

  const handleKeyPress: KeyboardEventHandler = (e): void => {
    // Recreate default browser behavior for form submission in a text input
    // @NOTE don't feel super happy about this.
    // For example, there may be many other default ways of submitting
    //  a form. I need the form to submit as if it were <input type="text" ...>
    //  despite the fact that it's a textarea. The internet suggests that 'Enter'
    //  is basically all there is to reproduce, but then, when has trusting
    //  the internet ever been a good idea?
    // We'll likely receive bugs about this.
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      submit();
    }
  };

  return (
    <div className="command-input">
      <form action="#" onSubmit={handleSubmit} className="command-input__form">
        <div className="command-input__input-container">
          {/* @TODO address newlines being flex with gt symbol */}
          <span className="command-input__input-prompt">&gt;&nbsp;</span>
          <AutoSizeTextarea className="command-input__input input"
            value={inputCommand}
            minRows={1}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyPress={handleKeyPress}
            refObject={inputRef}
            autoCapitalize="none"
          />
        </div>
        <button className="button u-screen-reader-only" type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CommandInput;
