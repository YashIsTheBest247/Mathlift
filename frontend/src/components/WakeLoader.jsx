import { useEffect, useState } from "react";

const MESSAGES = [
  "Loading app...",
  "Waking engine...",
  "Initializing AI...",
  "Warming the pipeline...",
  "Connecting to extractor...",
  "Preparing your workspace...",
];

export default function WakeLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % MESSAGES.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="wake">
      <div className="wake-inner">
        <span className="wake-brand">mathlift<sup>®</sup></span>
        <div className="spinner" />
        <p className="wake-msg" key={index}>
          {MESSAGES[index]}
        </p>
        <p className="wake-note">
          First load can take a moment while the server wakes up.
        </p>
      </div>
    </div>
  );
}
