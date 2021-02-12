import React, { FunctionComponent, MouseEventHandler, useEffect, useRef, useState } from "react";
import { v4 as uuid } from 'uuid';

import Logger, { LogLevel } from "@app/util/Logger";
import heredocToStringArray from "@app/util/heredoc-to-string-array";
import { useStores } from "@app/stores";
import { CommandActionType } from "@app/stores/command";

import CommandInput from "../command-input";
import Spinner from "../spinner";
import CreatePath, { CreatePathSubmitPayload } from "../create-path";

import TerminalItem, { TerminalItemType } from './terminal-item';

interface TerminalItemDetails {
  id: string;
  lines: string[];
  immediate: boolean;
  type: TerminalItemType,
}

const Terminal: FunctionComponent = () => {
  // Stores
  const { CommandStore, StateStore, ScreenStore } = useStores();

  // State
  // @TODO thoughts on a better useState implementation that uses proxy get/sets?
  // useState under the hood, maintain a local copy of the variable, write changes
  //  to both local copy and set___ callback, initialise from useState()
  const [terminalItems, setTerminalItems] = useState<TerminalItemDetails[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  // const [_numItemsDrawing, _setNumItemsDrawing] = useState<number>(0);
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
  let terminalItemBuffer: TerminalItemDetails[] = [];

  // Computed state
  const isNotCreatingNewPath = !isCreatingNewPath;

  // Refs
  const terminalCodeRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadInitialScreen = async (): Promise<void> => {
      setHasLoaded(false);

      try {
        const initialScreen = await ScreenStore.getScreenById(StateStore.currentScreenId);
        StateStore.setCurrentScreen(initialScreen);

        // Print initial screen to terminal
        appendTerminalLinesToBuffer(TerminalItemType.Response, initialScreen.body);
        flushTerminalBuffer();

        setHasLoaded(true);
      } catch (err) {
        // @TODO not sure how to handle this just yet
        // @TODO some kind of `setHasError` or something
        setHasLoaded(true);

        Logger.logError(`Could not load initial screen with id: ${StateStore.currentScreenId}.`, err);
        appendTerminalLinesToBuffer(TerminalItemType.Error, [
          `An error occurred.`,
          `Could not load initial screen.`,
          `Please try reloading or`,
          `clearing out the URL`,
        ], true);
        flushTerminalBuffer();
      }
    };

    void loadInitialScreen();
  }, []);

  // Functions
  /**
   * Write lines to terminal buffer.
   * This does not affect the terminal until you call `flushTerminalBuffer()`
   */
  const appendTerminalLinesToBuffer = (type: TerminalItemType, newLines: string[], immediate: boolean = false): void => {
    terminalItemBuffer = terminalItemBuffer.concat({
      id: uuid(), // for react key only
      lines: newLines,
      immediate,
      type,
    });
  };
  /**
   * Write the terminal buffer to the terminal.
   */
  const flushTerminalBuffer = (): void => {
    const nonImmediateTerminalItemsBeingFlushed = terminalItemBuffer.filter((item) => item.immediate === false);
    if (nonImmediateTerminalItemsBeingFlushed.length > 1) {
      Logger.logWarning(LogLevel.debug, `Flushing ${nonImmediateTerminalItemsBeingFlushed.length} non-immediate terminal items simultaneously. This is likely incorrect`);
      Logger.logWarning(LogLevel.debug, nonImmediateTerminalItemsBeingFlushed);
    }

    // non-immediate terminal item means terminal is drawing
    // @NOTE we are coding on the assumption that there can
    //  never be 2 non-immediate items drawing at the same time
    if (nonImmediateTerminalItemsBeingFlushed.length > 0) {
      setIsDrawing(true);
    }

    setTerminalItems(terminalItems.concat(terminalItemBuffer));

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

    appendTerminalLinesToBuffer(TerminalItemType.Prompt, [`> ${command}`], true);

    if (command === '') {
      // Empty input - do nothing
      flushTerminalBuffer();
    } else if (command[0] === '/') {
      // Slash commands
      switch (command.substring(1)) {
        // HELP
        case '?':
        case 'help':
          appendTerminalLinesToBuffer(TerminalItemType.Response, heredocToStringArray(
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

            /look
            (alias: /whereami)
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
          appendTerminalLinesToBuffer(TerminalItemType.Response, ['Creating a new pathway...']);
          setIsCreatingNewPath(true);
          break;

        // LIST INVENTORY
        case 'inventory':
          // eslint-disable-next-line no-case-declarations
          let response: string[] = [
            `Inventory:`,
          ];
          if (StateStore.currentState.inventory.length === 0) {
            response = response.concat([
              `Your inventory is empty!`,
            ]);
          } else {
            response = response.concat(
              StateStore.currentState.inventory.map((item) => `• ${item}`),
            );
          }
          appendTerminalLinesToBuffer(TerminalItemType.Response, response);
          break;

        // SCREEN
        case 'screen':
        case 'screen-id':
          appendTerminalLinesToBuffer(TerminalItemType.Response, [
            `Current screen ID:`,
            StateStore.currentScreenId,
          ]);
          break;

        // REPEAT / WHERE / AGAIN
        case 'repeat':
        case 'again':
        case 'where':
        case 'whereami':
        case 'look':
          if (StateStore.currentScreen !== undefined) {
            appendTerminalLinesToBuffer(TerminalItemType.Response, StateStore.currentScreen.body);
          }
          break;

        // UNKNOWN
        default:
          appendTerminalLinesToBuffer(TerminalItemType.Response, [`Unrecognised command.`]);
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

      let terminalResponse: string[] = [];
      if (response.success === true) {
        // Successful request

        if (response.type === CommandActionType.Navigate) {
          // Store new screen ID into State Store
          StateStore.setCurrentScreen(response.screen);

          // Write response screen to terminal
          terminalResponse = terminalResponse.concat(response.screen.body);
        } else if (response.type === CommandActionType.PrintMessage) {
          // Write message to terminal
          terminalResponse = terminalResponse.concat(response.printMessage);
        } else {
          throw new Error(`Unhandled command type (likely unimplemented): '${(response as any).type}'`);
        }

        // Store new state string into State Store
        StateStore.setStateFromString(response.state);

        // Print items removed to terminal
        if (response.itemsRemoved && response.itemsRemoved.length > 0) {
          terminalResponse = terminalResponse.concat([
            '',
            'Items removed:',
            ...response.itemsRemoved.map((item) => `- ${item}`),
          ]);
        }

        // Print items added to terminal
        if (response.itemsAdded && response.itemsAdded.length > 0) {
          terminalResponse = terminalResponse.concat([
            '',
            'Items added:',
            ...response.itemsAdded.map((item) => `+ ${item}`),
          ]);
        }

        appendTerminalLinesToBuffer(TerminalItemType.Response, terminalResponse);
        flushTerminalBuffer();
      } else if (response.success === false) {
        // Failed request
        appendTerminalLinesToBuffer(TerminalItemType.Response, [response.message]);
        flushTerminalBuffer();
      }
    }
  };

  const onTerminalItemFinishedDrawing = (): void => {
    setIsDrawing(false);

    // Focus the command input field
    setTimeout(() => {
      if (!window.getSelection()?.toString() && commandInputRef.current) {
        commandInputRef.current.focus();
      }
    });
  };

  const handleCancelCreatePath = (): void => {
    setIsCreatingNewPath(false);

    appendTerminalLinesToBuffer(TerminalItemType.Response, ['Cancelled creating path.']);
    flushTerminalBuffer();
  };

  const handleSuccessfulCreatePath = (payload: CreatePathSubmitPayload): void => {
    setIsCreatingNewPath(false);

    appendTerminalLinesToBuffer(TerminalItemType.Response, [`Successfully created new path!`, `To go there now, type:`, '  ' + payload.command]);
    flushTerminalBuffer();
  };

  const handleOnClickTerminal: MouseEventHandler = (_e): void => {
    // Focus the command input field
    if (!window.getSelection()?.toString() && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  };

  return (
    <>
      <div className="terminal" onClick={handleOnClickTerminal}>
        <div className="terminal__code" ref={terminalCodeRef}>
          {hasLoaded ?
            terminalItems.map((item) => (
              <TerminalItem key={item.id}
                type={item.type}
                immediate={item.immediate}
                lines={item.lines}
                onFinishedDrawing={onTerminalItemFinishedDrawing}
              />
            ))
            :
            (
              <>
                <Spinner /> Accessing system&hellip;
              </>
            )
          }
        </div>

        {isProcessingCommand && (
          <Spinner />
        )}

        {hasLoaded && !isProcessingCommand && isNotCreatingNewPath && !isDrawing && (
          <CommandInput onSubmit={onSubmitCommand} refObject={commandInputRef} />
        )}
      </div>

      {isCreatingNewPath && (
        <CreatePath onCancel={handleCancelCreatePath} onSuccessfulCreate={handleSuccessfulCreatePath} />
      )}
    </>
  );
};

export default Terminal;
