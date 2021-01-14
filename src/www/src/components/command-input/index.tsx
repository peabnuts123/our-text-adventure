import React, { FormEventHandler, FunctionComponent, KeyboardEventHandler, useEffect, useRef, useState } from "react";

import { useStores } from "@app/stores";

interface Props {
  onSubmit: (command: string) => Promise<void>;
}

const CommandInput: FunctionComponent<Props> = ({ onSubmit }) => {
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Functions
  const handleSubmit: FormEventHandler<Element> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // History
    StateStore.terminalHistory.unshift(inputCommand);
    setHistoryIndex(undefined);
    setTemporaryHistoryItem('');

    // Callbacks
    void onSubmit(inputCommand);
    setInputCommand("");
  };

  const handleKeyDown: KeyboardEventHandler = (e) => {
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

  useEffect(() => {
    setTimeout(() => {
      inputRef.current!.focus();
    });
  }, []);

  return (
    <div className="command-input">
      <form action="#" onSubmit={handleSubmit} className="command-input__form">
        <div className="command-input__input-container">
          <span className="command-input__input-prompt">&gt;&nbsp;</span>
          <input className="command-input__input input"
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
        </div>
        <button className="button u-screen-reader-only" type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CommandInput;
