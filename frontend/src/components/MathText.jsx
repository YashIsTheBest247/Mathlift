import katex from "katex";

function renderSegment(segment, index) {
  if (segment.type === "math") {
    const html = katex.renderToString(segment.value, {
      throwOnError: false,
      displayMode: segment.display,
    });
    return (
      <span
        key={index}
        className={segment.display ? "math-block" : "math-inline"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <span key={index}>{segment.value}</span>;
}

function tokenize(text) {
  const segments = [];
  let cursor = 0;
  const pattern = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      segments.push({ type: "text", value: text.slice(cursor, match.index) });
    }
    const display = match[1] !== undefined || match[3] !== undefined;
    const value = match[1] ?? match[2] ?? match[3] ?? match[4] ?? "";
    segments.push({ type: "math", value: value.trim(), display });
    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    segments.push({ type: "text", value: text.slice(cursor) });
  }
  return segments;
}

export default function MathText({ text }) {
  const lines = text.split("\n");
  return (
    <div className="math-text">
      {lines.map((line, lineIndex) => (
        <p key={lineIndex} className="math-line">
          {tokenize(line).map(renderSegment)}
        </p>
      ))}
    </div>
  );
}
