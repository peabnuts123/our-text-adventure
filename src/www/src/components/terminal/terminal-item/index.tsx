import React, { FunctionComponent, useEffect, useRef } from "react";

interface Props {
  lines: string[];
  immediate: boolean;
  onFinishedDrawing: () => void;
  onProgressDrawing: (progress: number) => void;
  type: TerminalItemType;
}

export enum TerminalItemType {
  Prompt,
  Response,
  Error,
}

const CLASS_NAME_LOOKUP_TABLE = {
  [TerminalItemType.Prompt]: 'terminal-item--prompt',
  [TerminalItemType.Response]: 'terminal-item--response',
  [TerminalItemType.Error]: 'terminal-item--error',
};

const PRINTED_CHARACTERS_PER_SECOND = 500;
const PRINT_FRAMERATE = 30;
const CHARACTERS_PER_FRAME = PRINTED_CHARACTERS_PER_SECOND / PRINT_FRAMERATE;
const PRINT_SPEED_VARIANCE = 0.3;

const Index: FunctionComponent<Props> = ({ type, immediate, lines, onFinishedDrawing, onProgressDrawing }) => {
  // State
  const terminalItemRef = useRef<HTMLDivElement>(null);

  // Computed
  const fullTextToDraw = lines.join('\n');

  useEffect(() => {
    if (!immediate) {
      let terminalBuffer = fullTextToDraw;
      let currentTerminalContents = '';

      // Begin processing if non-immediate
      // @NOTE hacking react - using our own interval to update the page
      //  mostly for performance reasons. Don't want to call render() like 30 times a second
      const intervalKey = setInterval(() => {

        /** `CHARACTERS_PER_FRAME +/- PRINT_FRAMERATE% */
        const numCharactersToWrite = Math.floor(CHARACTERS_PER_FRAME * ((1 - PRINT_SPEED_VARIANCE) + (Math.random() * PRINT_SPEED_VARIANCE * 2)));

        // Remove characters that will be written from buffer
        const charactersToWrite = terminalBuffer.substring(0, numCharactersToWrite);
        const updatedTerminalBuffer = terminalBuffer.substring(numCharactersToWrite);
        terminalBuffer = updatedTerminalBuffer;

        // Add removed characters from buffer to output
        currentTerminalContents += charactersToWrite;
        if (terminalItemRef.current !== null) {
          terminalItemRef.current.innerText = currentTerminalContents + (terminalBuffer.length > 0 ? '█' : '');
        }

        const percentDrawn = (fullTextToDraw.length - terminalBuffer.length) / fullTextToDraw.length;
        onProgressDrawing(percentDrawn);

        // Detect when finished writing
        if (updatedTerminalBuffer.length === 0) {
          clearInterval(intervalKey);

          onFinishedDrawing();
        }
      }, (1000 / PRINT_FRAMERATE));
    } else {
      onFinishedDrawing();
    }
  }, []);
  return (
    <div className={`terminal-item ${CLASS_NAME_LOOKUP_TABLE[type]}`} ref={terminalItemRef}>
      {/* If immediate, just show the output */}
      {immediate === true && (
        fullTextToDraw
      )}
    </div>
  );
};

export default Index;
