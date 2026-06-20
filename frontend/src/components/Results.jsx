import { useEffect, useState } from "react";
import MathText from "./MathText.jsx";
import Pipeline from "./Pipeline.jsx";

const LOADING_MESSAGES = [
  "Waking engine...",
  "Initializing AI...",
  "Reading your pdf...",
  "Detecting questions...",
  "Cropping and rendering...",
  "Almost there...",
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch (caught) {
      void caught;
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className={copied ? "copy-btn copied" : "copy-btn"} onClick={copy} type="button">
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          copy
        </>
      )}
    </button>
  );
}

function Empty() {
  return (
    <div className="results-empty">
      <Pipeline active={1} />
    </div>
  );
}

function Loading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="results-empty">
      <div className="spinner" />
      <p className="results-empty-title wake-msg" key={index}>
        {LOADING_MESSAGES[index]}
      </p>
      <p className="results-empty-sub">this can take a moment on the first run</p>
    </div>
  );
}

export default function Results({ data, busy }) {
  if (busy) {
    return (
      <section className="panel results">
        <Loading />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="panel results">
        <Empty />
      </section>
    );
  }

  return (
    <section className="panel results">
      <div className="results-head">
        <div>
          <h2 className="panel-title">results</h2>
          <p className="panel-sub">
            {data.returned} of {data.requested} · {data.format} · {data.source}
          </p>
        </div>
        <span className="badge">{data.name}</span>
      </div>

      {data.returned === 0 ? (
        <p className="muted">No questions were detected in this document.</p>
      ) : null}

      {data.format === "image" ? (
        <div className="image-grid">
          {data.questions.map((question, index) => (
            <figure className="qcard" key={index}>
              <figcaption className="qcap">
                <span className="qnum">Q{question.number}</span>
                <span className="qmeta">page {question.page}</span>
              </figcaption>
              <img className="qthumb" src={question.image} alt={`Question ${question.number}`} />
              <span className="qbackdrop" />
              <div className="qzoom">
                <span className="qzoom-tag">Q{question.number} · page {question.page}</span>
                <img src={question.image} alt={`Question ${question.number} enlarged`} />
              </div>
            </figure>
          ))}
        </div>
      ) : (
        <div className="text-list">
          {data.questions.map((question, index) => (
            <article className="qtext" key={index}>
              <header className="qtext-head">
                <span className="qnum">Q{question.number}</span>
                <div className="qtext-actions">
                  <span className="qmeta">page {question.page}</span>
                  <CopyButton text={question.text} />
                </div>
              </header>
              <MathText text={question.text} />
              {question.figures && question.figures.length > 0 ? (
                <div className="figures">
                  {question.figures.map((figure, figureIndex) => (
                    <img key={figureIndex} src={figure} alt="figure" />
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
