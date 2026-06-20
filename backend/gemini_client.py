import json
import os

_PROMPT = (
    "You are analysing one page of a mathematics question paper. "
    "Identify every distinct question on this page. "
    "Return a strict JSON array. Each element must have: "
    "number (the printed question number as an integer, or null if none), "
    "bbox (array of 4 integers [ymin, xmin, ymax, xmax] normalised to 0-1000 "
    "covering the full question including its sub-parts), "
    "text (the complete question content transcribed faithfully, with every "
    "mathematical expression written as inline LaTeX delimited by single dollar "
    "signs, e.g. $\\frac{a}{b}$), "
    "has_figure (true if the question contains a diagram, graph or figure), "
    "figure_bbox (array of 4 integers [ymin, xmin, ymax, xmax] normalised to "
    "0-1000 around the figure, or null). "
    "Return only the JSON array, no prose, no code fences."
)


def _client():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None
    from google import genai

    return genai.Client(api_key=api_key)


def is_enabled():
    return bool(os.getenv("GEMINI_API_KEY", "").strip())


def _strip_fences(raw):
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        if text.endswith("```"):
            text = text[: -3]
        if text.lstrip().startswith("json"):
            text = text.lstrip()[4:]
    return text.strip()


def detect_questions_on_page(image_bytes, zoom, page_width_pt, page_height_pt):
    client = _client()
    if client is None:
        return None

    from google.genai import types

    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    try:
        response = client.models.generate_content(
            model=model,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
                _PROMPT,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.0,
            ),
        )
    except Exception:
        return None

    payload = getattr(response, "text", None)
    if not payload:
        return None

    try:
        items = json.loads(_strip_fences(payload))
    except Exception:
        return None

    if not isinstance(items, list):
        return None

    width_px = page_width_pt * zoom
    height_px = page_height_pt * zoom
    results = []
    for item in items:
        if not isinstance(item, dict):
            continue
        bbox = _to_pixels(item.get("bbox"), width_px, height_px)
        if bbox is None:
            continue
        figure_bbox = _to_pixels(item.get("figure_bbox"), width_px, height_px)
        results.append(
            {
                "number": item.get("number"),
                "bbox_px": bbox,
                "text": (item.get("text") or "").strip(),
                "has_figure": bool(item.get("has_figure")) and figure_bbox is not None,
                "figure_bbox_px": figure_bbox,
                "source": "gemini",
            }
        )
    return results


def _to_pixels(bbox, width_px, height_px):
    if not isinstance(bbox, (list, tuple)) or len(bbox) != 4:
        return None
    try:
        ymin, xmin, ymax, xmax = (float(v) for v in bbox)
    except (TypeError, ValueError):
        return None
    left = (xmin / 1000.0) * width_px
    top = (ymin / 1000.0) * height_px
    right = (xmax / 1000.0) * width_px
    bottom = (ymax / 1000.0) * height_px
    if right <= left or bottom <= top:
        return None
    return [left, top, right, bottom]
