import React, { ChangeEventHandler, FunctionComponent, KeyboardEventHandler, RefObject, TextareaHTMLAttributes, useEffect, useRef } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  refObject?: RefObject<HTMLTextAreaElement>;
}

const AutoSizeTextarea: FunctionComponent<Props> = ({
  minRows,
  refObject,
  ...props
}) => {
  // Default parameters
  minRows = minRows || props.rows || 3;

  // Refs
  /**
   * Used if no ref is supplied. If a ref is provided through props, that one
   * is used instead.
   */
  const defaultRef = useRef<HTMLTextAreaElement>(null);

  // Prefer provided ref, otherwise, use defaultRef
  const textareaRef: RefObject<HTMLTextAreaElement> = refObject || defaultRef;

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
      rows={minRows}
      className={`textarea auto-size-textarea ${props.className || ''}`}
      ref={textareaRef}
      onChange={handleChange}
    />
  );
};

export default AutoSizeTextarea;
