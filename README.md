# Mathlift

Extract questions from a mathematics PDF and return them as cropped **images** or structured **text** with rendered LaTeX equations and figures.

Full-stack assessment build:

- **Frontend** — hand-coded React (Vite), LaTeX for equation rendering
- **Backend** — FastAPI + PyMuPDF for page rendering and cropping.
- **Extraction** — Google Gemini vision for question detection / LaTeX transcription, with a local PyMuPDF text-layer heuristic as an automatic fallback (works fully offline).

## Architecture

```
PDF upload
   -> FastAPI /api/process
      -> render each page (PyMuPDF)
         -> Gemini vision: detect question bounding boxes + LaTeX  (if GEMINI_API_KEY set)
         -> heuristic: split on question markers via text layer     (fallback)
      -> image format: crop each question region -> PNG
      -> text format:  LaTeX text + cropped figures
   -> React renders images grid or KaTeX text list
```

## Prerequisites

- Python 3.10+
- Node 18+
- (Optional) A Google Gemini API key for AI extraction. Without it, the local heuristic is used.

## Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
copy .env.example .env         # then add GEMINI_API_KEY (optional)
python main.py
```

API runs on http://localhost:8000.

| Variable         | Default            | Purpose                                  |
| ---------------- | ------------------ | ---------------------------------------- |
| `GEMINI_API_KEY` | _(empty)_          | Enables Gemini vision extraction         |
| `GEMINI_MODEL`   | `gemini-2.5-flash` | Vision model used                        |
| `RENDER_ZOOM`    | `2.0`              | Page render scale (higher = sharper)     |
| `MAX_PAGES`      | `40`               | Page cap per document                    |

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:5173 and proxies `/api` to the backend.

## Form fields

- **Name** — text
- **Number of questions** — numeric
- **Output format** — image or text
- **Upload PDF** — PDF only (validated client and server side)

## API

`POST /api/process` (multipart): `name`, `num_questions`, `output_format`, `file`

Returns:

```json
{
  "name": "Jane Doe",
  "format": "text",
  "requested": 5,
  "returned": 5,
  "source": "gemini",
  "questions": [
    { "number": 1, "page": 1, "source": "gemini", "text": "Solve $x^2 - 4 = 0$.", "figures": [] }
  ]
}
```

In image mode each question carries an `image` data URL instead of `text`/`figures`.
