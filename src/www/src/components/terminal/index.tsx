import React, { FunctionComponent, MouseEventHandler, useEffect, useRef, useState } from "react";
import { v4 as uuid } from 'uuid';

import Logger from "@app/util/Logger";
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

// @TODO version numbers
const PREAMBLE = heredocToStringArray(`
  Our Text Adventure
  Collaborative interactive
  fiction
  by Really Dangerous Games
  Version 1.0.2 - 2021/01/02
`);

interface TerminalItemState {
  terminalItems: TerminalItemDetails[];
  terminalItemBuffer: TerminalItemDetails[];
  isDrawing: boolean;
}

const Terminal: FunctionComponent = () => {
  // Stores
  const { CommandStore, StateStore, ScreenStore } = useStores();

  // State
  const [terminalItemState, setTerminalItemState] = useState<TerminalItemState>({
    terminalItems: [],
    terminalItemBuffer: [],
    isDrawing: false,
  });
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState<boolean>(false);
  const [isCreatingNewPath, setIsCreatingNewPath] = useState<boolean>(false);

  // Derived state
  const { terminalItems, isDrawing } = terminalItemState;
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

        // Print preamble to terminal
        appendItemToTerminal(TerminalItemType.Response, PREAMBLE);

        // Print initial screen to terminal
        appendItemToTerminal(TerminalItemType.Response, initialScreen.body);

        setHasLoaded(true);
      } catch (err) {
        // @TODO not sure how to handle this just yet
        // @TODO some kind of `setHasError` or something
        setHasLoaded(true);

        Logger.logError(`Could not load initial screen with id: ${StateStore.currentScreenId}.`, err);
        appendItemToTerminal(TerminalItemType.Error, heredocToStringArray(`
          An error occurred.
          Could not load initial screen.
          Please try reloading or
          clearing out the URL
        `), true);
      }
    };

    void loadInitialScreen();
  }, []);

  // Functions
  /**
   * Write lines to terminal buffer.
   * This does not affect the terminal until you call `flushTerminalBuffer()`
   */
  const appendItemToTerminal = (type: TerminalItemType, newLines: string[], immediate: boolean = false): void => {
    const newTerminalItem: TerminalItemDetails = {
      id: uuid(), // for react key only
      lines: newLines,
      immediate,
      type,
    };

    setTerminalItemState((oldState) => {
      if (oldState.isDrawing) {
        // Currently drawing - append item to buffer, it will be added when the current
        //  item has finished drawing
        return {
          ...oldState,
          terminalItemBuffer: oldState.terminalItemBuffer.concat(newTerminalItem),
        };
      } else {
        // Not drawing anything - add this item and mark it as drawing
        // The next item will be processed when this item has finished drawing
        return {
          ...oldState,
          terminalItems: oldState.terminalItems.concat(newTerminalItem),
          isDrawing: true,
        };
      }
    });
  };

  /** Callback for submitting a command in the prompt */
  const onSubmitCommand = async (rawCommand: string): Promise<void> => {
    const command: string = rawCommand.trim();

    appendItemToTerminal(TerminalItemType.Prompt, [`> ${command}`], true);

    if (command === '') {
      // Empty input - do nothing
      /* No-op */
    } else if (command[0] === '/') {
      // Slash commands
      switch (command.substring(1)) {
        // HELP
        case '?':
        case 'help':
          appendItemToTerminal(TerminalItemType.Response, heredocToStringArray(
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
          appendItemToTerminal(TerminalItemType.Response, ['Creating a new pathway...']);
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
          appendItemToTerminal(TerminalItemType.Response, response);
          break;

        // SCREEN
        case 'screen':
        case 'screen-id':
          appendItemToTerminal(TerminalItemType.Response, [
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
            appendItemToTerminal(TerminalItemType.Response, StateStore.currentScreen.body);
          }
          break;

        // UNKNOWN
        default:
          appendItemToTerminal(TerminalItemType.Response, [`Unrecognised command.`]);
          break;
      }
    } else {
      // Regular commands

      // Flag as loading
      setIsProcessingCommand(true);

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

        appendItemToTerminal(TerminalItemType.Response, terminalResponse);
      } else if (response.success === false) {
        // Failed request
        appendItemToTerminal(TerminalItemType.Response, [response.message]);
      }
    }
  };

  const onTerminalItemProgressDrawing = (_progress: number): void => {
    // Scroll terminal to bottom
    if (terminalCodeRef.current !== null) {
      terminalCodeRef.current.scrollTop = terminalCodeRef.current.scrollHeight;
    }
  };
  const onTerminalItemFinishedDrawing = (): void => {
    // Terminal item finished drawing
    setTerminalItemState((oldState) => {
      // If there are more items waiting to draw, add the next one
      if (oldState.terminalItemBuffer.length > 0) {
        return {
          ...oldState,
          // Remove the next item from the buffer
          terminalItemBuffer: oldState.terminalItemBuffer.slice(1),
          // Add this item to the terminal
          terminalItems: oldState.terminalItems.concat(oldState.terminalItemBuffer[0]),
        };
      } else {
        // Nothing left in item buffer
        return {
          ...oldState,
          isDrawing: false,
        };
      }
    });

    // Focus the command input field (if the field is present)
    setTimeout(() => {
      // Scroll terminal to bottom
      if (terminalCodeRef.current !== null) {
        terminalCodeRef.current.scrollTop = terminalCodeRef.current.scrollHeight;
      }

      // Focus command input
      if (!window.getSelection()?.toString() && commandInputRef.current !== null) {
        commandInputRef.current.focus();
      }
    });
  };

  const handleCancelCreatePath = (): void => {
    setIsCreatingNewPath(false);

    appendItemToTerminal(TerminalItemType.Response, ['Cancelled creating path.']);
  };

  const handleSuccessfulCreatePath = (payload: CreatePathSubmitPayload): void => {
    setIsCreatingNewPath(false);

    appendItemToTerminal(TerminalItemType.Response, [`Successfully created new path!`, `To go there now, type:`, '  ' + payload.command]);
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
                onProgressDrawing={onTerminalItemProgressDrawing}
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
