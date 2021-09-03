import React, { FunctionComponent, KeyboardEventHandler, MouseEventHandler, useState } from "react";
import classnames from "classnames";
import {
  HelpCircle as HelpIcon,
} from 'react-feather';

interface Props {
  onToggle: (isActive: boolean) => void;
}

const Index: FunctionComponent<Props> = ({ onToggle }) => {
  // State
  const [isActive, setIsActive] = useState<boolean>(false);

  // Functions
  function toggleActive(): void {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    onToggle(newIsActive);
  }

  // Callbacks
  const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (e): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      toggleActive();
    }
  };
  const handleClick: MouseEventHandler<HTMLSpanElement> = (): void => {
    toggleActive();
  };

  return (
    <span
      className={classnames("create-path__form__help-icon", {
        'is-active': isActive,
      })}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <HelpIcon size={24} />
    </span>
  );
};

export default Index;
