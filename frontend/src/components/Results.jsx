import MathText from "./MathText.jsx";
import Pipeline from "./Pipeline.jsx";

function Empty() {
  return (
    <div className="results-empty">
      <Pipeline active={1} />
    </div>
  );
}

function Loading() {
  return (
    <div className="results-empty">
      <div className="spinner" />
      <p className="results-empty-title">processing pdf</p>
      <p className="results-empty-sub">detecting and extracting questions</p>
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
                <span className="qmeta">page {question.page}</span>
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
