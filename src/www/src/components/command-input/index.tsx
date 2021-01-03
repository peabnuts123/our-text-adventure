import Logger, { LogLevel } from "@app/util/Logger";
import React, { FormEventHandler, FunctionComponent, useEffect, useRef, useState } from "react";

interface Props {
  onSubmit: (command: string) => Promise<void>;
}

const CommandInput: FunctionComponent<Props> = ({ onSubmit }) => {
  const [inputCommand, setInputCommand] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit: FormEventHandler<Element> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const command = inputCommand && inputCommand.trim();

    if (command === undefined || command.length === 0) {
      // @TODO what to do here?
      Logger.logError(LogLevel.debug, "Cannot submit. Command is empty");
    } else {
      void onSubmit(command);
      setInputCommand("");
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
            ref={inputRef}
          />
        </div>
        <button className="button u-screen-reader-only" type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CommandInput;
