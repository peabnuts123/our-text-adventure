import Logger, { LogLevel } from "@app/util/Logger";
import React, { FormEventHandler, FunctionComponent, useState } from "react";

interface Props {
  onSubmit: (command: string) => Promise<void>;
}

const CommandInput: FunctionComponent<Props> = ({ onSubmit }) => {
  const [inputCommand, setInputCommand] = useState<string>("");

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

  return (
    <div className="command-input">
      <form action="#" onSubmit={handleSubmit} className="command-input__form">
        <div className="command-input__input-container">
          <div className="command-input__input-prompt" />
          <input className="command-input__input input" type="text" value={inputCommand} onChange={(e) => setInputCommand(e.target.value)} />
        </div>
        <button className="command-input__submit button" type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CommandInput;
