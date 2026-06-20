import { useRef, useState } from "react";

export default function Form({ onSubmit, busy }) {
  const [name, setName] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [outputFormat, setOutputFormat] = useState("image");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function pickFile(selected) {
    if (!selected) {
      return;
    }
    const isPdf =
      selected.type === "application/pdf" ||
      selected.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please upload a PDF file");
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
  }

  function handleDrop(event) {
    event.preventDefault();
    pickFile(event.dataTransfer.files?.[0]);
  }

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!file) {
      setError("A PDF file is required");
      return;
    }
    setError("");
    onSubmit({ name: name.trim(), numQuestions: Number(numQuestions), outputFormat, file });
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <h2 className="panel-title">extract questions</h2>
      <p className="panel-sub">upload · detect · extract</p>

      <label className="field">
        <span className="field-label">name</span>
        <input
          className="input"
          type="text"
          value={name}
          placeholder="Enter name"
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">number of questions</span>
        <input
          className="input"
          type="number"
          min="1"
          max="200"
          value={numQuestions}
          onChange={(event) => setNumQuestions(event.target.value)}
        />
      </label>

      <fieldset className="field segmented-field">
        <legend className="field-label">output format</legend>
        <div className="segmented" role="radiogroup">
          <label className={outputFormat === "image" ? "seg seg-on" : "seg"}>
            <input
              type="radio"
              name="outputFormat"
              value="image"
              checked={outputFormat === "image"}
              onChange={() => setOutputFormat("image")}
            />
            image
          </label>
          <label className={outputFormat === "text" ? "seg seg-on" : "seg"}>
            <input
              type="radio"
              name="outputFormat"
              value="text"
              checked={outputFormat === "text"}
              onChange={() => setOutputFormat("text")}
            />
            text
          </label>
        </div>
      </fieldset>

      <div className="field">
        <span className="field-label">upload pdf</span>
        <div
          className={file ? "drop drop-filled" : "drop"}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={(event) => pickFile(event.target.files?.[0])}
          />
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2h9l3 3v17H6z" />
            <path d="M14 2v4h4" />
            <path d="M12 11v6M9 14l3-3 3 3" />
          </svg>
          <span className="drop-text">
            {file ? file.name : "drop a mathematics pdf or click to browse"}
          </span>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <button className="submit" type="submit" disabled={busy}>
        {busy ? "processing…" : "run pipeline"}
      </button>
    </form>
  );
}
