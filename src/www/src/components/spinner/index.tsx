import React, { FunctionComponent, useEffect, useRef } from "react";

/** Number of milliseconds between animation frames */
const SPINNER_SPIN_INTERVAL_MS: number = 125;

/**
 * Ghetto-ass ASCII spinner
 */
const Spinner: FunctionComponent = () => {
  // Refs
  const spinnerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frameIndex = 0;
    const frames = ['/', '—', '\\', '|'];

    // Begin playing animation
    const intervalKey = setInterval(() => {
      spinnerRef.current!.innerText = frames[frameIndex];
      frameIndex = (frameIndex + 1) % frames.length;
    }, SPINNER_SPIN_INTERVAL_MS);

    return () => {
      // Stop playing animation
      clearInterval(intervalKey);
    };
  }, []);

  return (
    <span className="spinner" ref={spinnerRef} />
  );
};

export default Spinner;
