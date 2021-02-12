import React, { FunctionComponent, useEffect } from "react";

interface Props {
  lines: string[];
  immediate: boolean;
  onFinishedDrawing: () => void;
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

const Index: FunctionComponent<Props> = ({ type, immediate, lines, onFinishedDrawing }) => {

  useEffect(() => {
    if (!immediate) {
      onFinishedDrawing();
    }
  }, []);
  return (
    <div className={`terminal-item ${CLASS_NAME_LOOKUP_TABLE[type]}`}>
      {lines.join('\n')}
    </div>
  );
};

export default Index;
