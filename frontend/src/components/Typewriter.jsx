import { useEffect, useState } from "react";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Typewriter({ words }) {
  const [text, setText] = useState(words[0]);
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      return undefined;
    }
    const word = words[index % words.length];
    let delay = deleting ? 55 : 105;
    if (!deleting && text === word) {
      delay = 1600;
    } else if (deleting && text === "") {
      delay = 320;
    }
    const timer = window.setTimeout(() => {
      if (!deleting && text === word) {
        setDeleting(true);
        return;
      }
      if (deleting && text === "") {
        setDeleting(false);
        setIndex((value) => (value + 1) % words.length);
        return;
      }
      const next = deleting
        ? word.slice(0, text.length - 1)
        : word.slice(0, text.length + 1);
      setText(next);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [text, deleting, index, words]);

  return (
    <span className="type-word">
      {text}
      <span className="type-caret" aria-hidden="true" />
    </span>
  );
}
