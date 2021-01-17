import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import Logger from "@app/util/Logger";
import heredocToStringArray from "@app/util/heredoc-to-string-array";
import { useStores } from "@app/stores";

import CommandInput from "../command-input";
import Spinner from "../spinner";
import CreatePath, { CreatePathSubmitPayload } from "../create-path";

const Terminal: FunctionComponent = () => {
  // Stores
  const { CommandStore, StateStore, ScreenStore } = useStores();

  // State
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState<boolean>(false);
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

  useEffect(() => {
    // Initialise the state store. This will sync it with the URL
    //  and load any default values
    StateStore.init();

    const loadInitialScreen = async (): Promise<void> => {
      setHasLoaded(false);

      try {
        const initialScreen = await ScreenStore.getScreenById(StateStore.currentScreenId);
        StateStore.setCurrentScreen(initialScreen);

        // Print initial screen to terminal
        appendTerminalLinesToBuffer(initialScreen.body);
        flushTerminalBuffer();

        setHasLoaded(true);
      } catch (err) {
        // @TODO not sure how to handle this just yet
        // @TODO some kind of `setHasError` or something
        setHasLoaded(true);

        Logger.logError(`Could not load initial screen with id: ${StateStore.currentScreenId}.`, err);
        appendTerminalLinesToBuffer([
          `An error occurred.`,
          `Could not load initial screen.`,
          `Please try reloading or`,
          `clearing out the URL`,
        ]);
        flushTerminalBuffer();
      }
    };

    void loadInitialScreen();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } else if (command[0] === '/') {
      // Slash commands
      switch (command.substring(1)) {
        // HELP
        case '?':
        case 'help':
          appendTerminalLinesToBuffer(heredocToStringArray(
            // -- 30 chars --------------|
            `
            List of commands:
            /create-path
            (alias: /path)
              Create a new pathway in the
              universe

            /inventory
              List your inventory

            /screen-id
            (alias: /screen)
              Print the current screen's
              id (useful when creating a
              new screen)

            /whereami
            (alias: /where)
            (alias: /repeat)
            (alias: /again)
              Print the current screen
              again


            /help
            (alias: /?)
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

        // SCREEN
        case 'screen':
        case 'screen-id':
          appendTerminalLinesToBuffer([
            `Current screen ID:`,
            StateStore.currentScreenId,
          ]);
          break;

        // REPEAT / WHERE / AGAIN
        case 'repeat':
        case 'again':
        case 'where':
        case 'whereami':
          if (StateStore.currentScreen !== undefined) {
            appendTerminalLinesToBuffer(StateStore.currentScreen.body);
          }
          break;

        // UNKNOWN
        default:
          appendTerminalLinesToBuffer([`Unrecognised command.`]);
          break;
      }
      flushTerminalBuffer();
    } else {
      // Regular commands

      // Flag as loading (flush whatever is printed so far)
      setIsProcessingCommand(true);
      flushTerminalBuffer();

      // Send command to the API
      const response = await CommandStore.submitCommand(StateStore.currentScreenId, command, StateStore.getStateAsString());

      setIsProcessingCommand(false);

      if (response.success === true) {
        // Successful request
        // Store new screen ID and state string into State Store
        StateStore.setCurrentScreen(response.screen);
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
    }
  };

  const handleCancelCreatePath = (): void => {
    setIsCreatingNewPath(false);

    appendTerminalLinesToBuffer(['Cancelled creating path.']);
    flushTerminalBuffer();
  };

  const handleSuccessfulCreatePath = (payload: CreatePathSubmitPayload): void => {
    setIsCreatingNewPath(false);

    appendTerminalLinesToBuffer([`Successfully created new path!`, `To go there now, type:`, '  ' + payload.command]);
    flushTerminalBuffer();
  };

  return (
    <>
      <div className="terminal">
        <div className="terminal__code" ref={terminalCodeRef}>
          {hasLoaded ?
            (
              terminalLines.join('\n')
            ) :
            (
              <>
                <Spinner /> Accessing system&hellip;
              </>
            )
          }&nbsp;
        </div>

        {isProcessingCommand && (
          <Spinner />
        )}

        {hasLoaded && !isProcessingCommand && isNotCreatingNewPath && (
          <CommandInput onSubmit={onSubmitCommand} />
        )}
      </div>

      {isCreatingNewPath && (
        <CreatePath onCancel={handleCancelCreatePath} onSuccessfulCreate={handleSuccessfulCreatePath} />
      )}
    </>
  );
};

export default Terminal;
