import React, { FunctionComponent, useRef, useState } from "react";

import Logger, { LogLevel } from "@app/util/Logger";
import GameScreen from "@app/models/GameScreen";
import heredocToStringArray from "@app/util/heredoc-to-string-array";

import CommandInput from "../command-input";
import CreatePath from "../create-path";

interface Props {
  initialScreen: GameScreen | undefined;
}

const Terminal: FunctionComponent<Props> = ({ initialScreen }) => {
  // State
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [isCreatingNewPath, setIsCreatingNewPath] = useState<boolean>(false);

  // Volatile state
  /**
   * Terminal buffer holds lines that are to be written to the terminal.
   * When flushed, they are all written to the terminal at once.
   * This is because React is stupid and won't mutate state until a component
   * re-renders, so when calling `set___()` consecutively, only the last call "wins"
   */
  let terminalBuffer: string[] = [];

  // Computed state
  const isNotCreatingNewPath = !isCreatingNewPath;

  // Refs
  const terminalCodeRef = useRef<HTMLDivElement>(null);

  // Functions
  /**
   * Write lines to terminal buffer.
   * This does not affect the terminal until you call `flushTerminalBuffer()`
   */
  const appendTerminalLinesToBuffer = (newLines: string[]): void => {
    terminalBuffer = terminalBuffer.concat(newLines);
  };
  /**
   * Write the terminal buffer to the terminal.
   */
  const flushTerminalBuffer = (): void => {
    setTerminalLines(terminalLines.concat(terminalBuffer, '\n'));
  };

  /** Callback for submitting a command in the prompt */
  const onSubmitCommand = (rawCommand: string): Promise<void> => {
    const command: string = rawCommand.trim();

    appendTerminalLinesToBuffer([`> ${command}`]);

    if (command === '') {
      // Empty input - do nothing
      flushTerminalBuffer();
      return Promise.resolve();
    } else if (command[0] === '/') {
      // Slash commands
      Logger.log(LogLevel.debug, "Slash command: ", command);
      switch (command.substring(1)) {
        // HELP
        case '?':
        case 'help':
          appendTerminalLinesToBuffer(heredocToStringArray(
            // -- 30 chars --------------|
            `
            List of commands:
            /create-path (alias: /path)
              Create a new pathway in the
              universe

            /help (alias: /?)
              Print this help message
          `));
          break;

        // CREATE PATH
        case 'path':
        case 'create-path':
          appendTerminalLinesToBuffer(['Creating a new pathway within the universe...']);
          setIsCreatingNewPath(true);
          break;
      }
      flushTerminalBuffer();
      return Promise.resolve();
    } else {
      // Regular commands
      Logger.log(LogLevel.debug, "Regular command: ", command);
      appendTerminalLinesToBuffer(
        // @TODO remove eslint override
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        `
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
      `.trim().split('\n'));

      flushTerminalBuffer();

      // Scroll terminal to bottom
      setTimeout(() => {
        if (terminalCodeRef.current !== null) {
          terminalCodeRef.current.scrollTop = terminalCodeRef.current.scrollHeight;
        }
      });

      return Promise.resolve();
    }
  };

  const handleCancelCreatePath = (): void => {
    setIsCreatingNewPath(false);

    appendTerminalLinesToBuffer(['Cancelled creating path.']);
    flushTerminalBuffer();
  };

  // Detect when initialScreen has loaded
  if (!hasLoaded && initialScreen !== undefined) {
    setHasLoaded(true);

    appendTerminalLinesToBuffer(initialScreen.body);
    flushTerminalBuffer();
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
        <CreatePath onCancel={handleCancelCreatePath} />
      )}
    </>
  );
};

export default Terminal;
