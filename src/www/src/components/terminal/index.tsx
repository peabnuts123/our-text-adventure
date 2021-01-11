import React, { FunctionComponent, useRef, useState } from "react";

import Logger, { LogLevel } from "@app/util/Logger";
import GameScreen from "@app/models/GameScreen";
import heredocToStringArray from "@app/util/heredoc-to-string-array";
import { useStores } from "@app/stores";

import CommandInput from "../command-input";
import CreatePath, { CreatePathSubmitPayload } from "../create-path";

interface Props {
  initialScreen: GameScreen | undefined;
}

const Terminal: FunctionComponent<Props> = ({ initialScreen }) => {
  // Stores
  const { CommandStore, StateStore } = useStores();

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
    setTerminalLines(terminalLines.concat(terminalBuffer, ''));

    // Scroll terminal to bottom
    setTimeout(() => {
      if (terminalCodeRef.current !== null) {
        terminalCodeRef.current.scrollTop = terminalCodeRef.current.scrollHeight;
      }
    });
  };

  /** Callback for submitting a command in the prompt */
  const onSubmitCommand = async (rawCommand: string): Promise<void> => {
    const command: string = rawCommand.trim();
    // @TODO spinner / - \ |

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
          appendTerminalLinesToBuffer(['Creating a new pathway...']);
          setIsCreatingNewPath(true);
          break;

        // LIST INVENTORY
        case 'inventory':
          appendTerminalLinesToBuffer([
            `Inventory:`,
          ]);
          if (StateStore.currentState.inventory.length === 0) {
            appendTerminalLinesToBuffer([
              `Your inventory is empty!`,
            ]);
          } else {
            appendTerminalLinesToBuffer(
              StateStore.currentState.inventory.map((item) => `- ${item}`),
            );
          }
          break;

        default:
          appendTerminalLinesToBuffer([`Unrecognised command.`]);
          break;
      }
      flushTerminalBuffer();
      return Promise.resolve();
    } else {
      // Regular commands
      Logger.log(LogLevel.debug, "Regular command: ", command);

      // Send command to the API
      const response = await CommandStore.submitCommand(StateStore.currentScreenId!, command, StateStore.getStateAsString());

      if (response.success === true) {
        // Successful request
        // Store new screen ID and state string into State Store
        StateStore.setCurrentScreenId(response.screen.id);
        StateStore.setStateFromString(response.state);

        // Write response screen to terminal
        appendTerminalLinesToBuffer(response.screen.body);

        // Print items removed to terminal
        if (response.itemsRemoved && response.itemsRemoved.length > 0) {
          appendTerminalLinesToBuffer([
            '',
            'Items removed:',
            ...response.itemsRemoved.map((item) => `- ${item}`),
          ]);
        }

        // Print items added to terminal
        if (response.itemsAdded && response.itemsAdded.length > 0) {
          appendTerminalLinesToBuffer([
            '',
            'Items added:',
            ...response.itemsAdded.map((item) => `+ ${item}`),
          ]);
        }

        flushTerminalBuffer();
      } else if (response.success === false) {
        // Failed request
        appendTerminalLinesToBuffer([response.message]);
        flushTerminalBuffer();
      }

      return Promise.resolve();
    }
  };

  const handleCancelCreatePath = (): void => {
    setIsCreatingNewPath(false);

    appendTerminalLinesToBuffer(['Cancelled creating path.']);
    flushTerminalBuffer();
  };

  const handleSubmitCreatePath = async (payload: CreatePathSubmitPayload): Promise<void> => {
    await CommandStore.createPath({
      sourceScreenId: StateStore.currentScreenId!,
      ...payload,
    });

    setIsCreatingNewPath(false);

    appendTerminalLinesToBuffer([`Successfully created new path!`, `To go there now, type:`, '  ' + payload.command]);
    flushTerminalBuffer();
  };

  // Detect when initialScreen has loaded
  if (!hasLoaded && initialScreen !== undefined) {
    setHasLoaded(true);

    // Initialise state store
    StateStore.init(initialScreen.id);

    // Print initial screen to terminal
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
          }&nbsp;
        </div>

        {isNotCreatingNewPath && (
          <CommandInput onSubmit={onSubmitCommand} />
        )}
      </div>

      {isCreatingNewPath && (
        <CreatePath onCancel={handleCancelCreatePath} onSubmit={handleSubmitCreatePath} />
      )}
    </>
  );
};

export default Terminal;
