import React, { ChangeEventHandler, FunctionComponent, TextareaHTMLAttributes, useEffect, useRef } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  id: string;
  minRows?: number;
}

const AutoSizeTextarea: FunctionComponent<Props> = ({
  name,
  id,
  minRows,
  ...props
}) => {
  // Default parameters
  minRows = minRows || props.rows || 3;

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Functions
  const updateTextareaSize = (): void => {
    const textareaEl = textareaRef.current!;
    // Pretty hacky but it works
    // 1. Collapse the textarea to automatic size / reflow text
    textareaEl.style['height'] = ``;
    // 2. Update height of textarea to fit content. `rows` attribute will beat this
    textareaEl.style['height'] = `${textareaEl.scrollHeight}px`;
  };

  /** Update height of textarea to fit content */
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e): void => {
    updateTextareaSize();

    if (props.onChange) {
      props.onChange(e);
    }
  };

  useEffect(() => {
    // Update size on first render
    setTimeout(updateTextareaSize);
  }, []);

  return (
    <textarea
      {...props}
      id={id}
      name={name}
      rows={minRows}
      className={`textarea auto-size-textarea ${props.className || ''}`}
      ref={textareaRef}
      onChange={handleChange}
    />
  );
};

export default AutoSizeTextarea;
