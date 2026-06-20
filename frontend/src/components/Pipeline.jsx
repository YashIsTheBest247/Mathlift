const stages = [
  {
    key: "upload",
    label: "upload",
    glyph: (
      <>
        <path d="M12 16V4" />
        <path d="M8 8l4-4 4 4" />
        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </>
    ),
  },
  {
    key: "detect",
    label: "detect",
    glyph: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M11 8v6M8 11h6" />
        <path d="M20 20l-4.5-4.5" />
      </>
    ),
  },
  {
    key: "render",
    label: "render",
    glyph: (
      <>
        <path d="M6 3v15a1 1 0 0 0 1 1h15" />
        <path d="M3 6h12a1 1 0 0 1 1 1v14" />
      </>
    ),
  },
  {
    key: "display",
    label: "display",
    glyph: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 9h16M9 9v11" />
      </>
    ),
  },
];

export default function Pipeline({ active = 1 }) {
  return (
    <div className="pipeline">
      <div className="pipeline-track">
        <span className="flow-dot" />
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={index === active ? "pipeline-step step-active" : "pipeline-step"}
          >
            <span className="pipeline-icon">
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {stage.glyph}
              </svg>
            </span>
            <span className="pipeline-label">{stage.label}</span>
            {index < stages.length - 1 ? <span className="pipeline-line" /> : null}
          </div>
        ))}
      </div>
      <p className="pipeline-title">live pipeline</p>
      <p className="pipeline-caption">upload · detect · render · display</p>
    </div>
  );
}
