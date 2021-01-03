import React, { FunctionComponent, useRef, useState } from "react";

import Logger, { LogLevel } from "@app/util/Logger";
import GameScreen from "@app/models/GameScreen";

import CommandInput from "../command-input";
import CreatePath from "../create-path";

interface Props {
  initialScreen: GameScreen | undefined;
}

const Terminal: FunctionComponent<Props> = ({ initialScreen }) => {
  // State
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [isCreatingNewPath, setIsCreatingNewPath] = useState<boolean>(true);

  // Computed state
  const isNotCreatingNewPath = !isCreatingNewPath;

  // Refs
  const terminalCodeRef = useRef<HTMLDivElement>(null);

  // Functions
  /** Append lines to the terminal */
  const appendTerminalLines = (newLines: string[]): void => {
    setTerminalLines(terminalLines.concat(newLines));
  };

  /** Callback for submitting a command in the prompt */
  const onSubmitCommand = (command: string): Promise<void> => {
    Logger.log(LogLevel.debug, "Submitting command: ", command);
    appendTerminalLines([`> ${command}`]
      // @TODO remove eslint override
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      .concat(`
Lorem ipsum dolor sit amet,
consectetuer adipiscing elit.
Donec odio. Quisque volutpat
mattis eros. Nullam malesuada
erat ut turpis.
Lorem ipsum dolor sit amet,
consectetuer adipiscing elit.
Donec odio. Quisque volutpat
mattis eros. Nullam malesuada
erat ut turpis.
    `.trimLeft().split('\n')));

    // Scroll terminal to bottom
    setTimeout(() => {
      if (terminalCodeRef.current !== null) {
        terminalCodeRef.current.scrollTop = terminalCodeRef.current.scrollHeight;
      }
    });

    return Promise.resolve();
  };

  // Detect when initialScreen has loaded
  if (!hasLoaded && initialScreen !== undefined) {
    setHasLoaded(true);
    appendTerminalLines(initialScreen.body);
  }

  return (
    <>
      <div className="terminal">
        <div className="terminal__code" ref={terminalCodeRef}>
          {hasLoaded ?
            (
              terminalLines.join('\n')
            ) :
            (
              <span>Loading&hellip;</span>
            )
          }
        </div>

        {isNotCreatingNewPath && (
          <CommandInput onSubmit={onSubmitCommand} />
        )}
      </div>

      {isCreatingNewPath && (
        <CreatePath />
      )}
    </>
  );
};

export default Terminal;
