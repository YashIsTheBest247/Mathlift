import re

MARKER = re.compile(
    r"^\s*(?:Q(?:uestion)?\s*)?(\d{1,3})\s*[\.\)\:]\s+",
    re.IGNORECASE,
)


def _line_text(line):
    return "".join(span["text"] for span in line.get("spans", []))


def detect_questions_on_page(page, zoom):
    data = page.get_text("dict")
    page_height = page.rect.height
    page_width = page.rect.width

    markers = []
    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            text = _line_text(line).strip()
            if not text:
                continue
            match = MARKER.match(text)
            if match:
                bbox = line["bbox"]
                markers.append(
                    {
                        "number": int(match.group(1)),
                        "top": bbox[1],
                        "text": text,
                    }
                )

    if not markers:
        return []

    markers.sort(key=lambda m: m["top"])
    figures = _figure_rects(page)

    questions = []
    for index, marker in enumerate(markers):
        top = max(marker["top"] - 4, 0)
        if index + 1 < len(markers):
            bottom = markers[index + 1]["top"] - 2
        else:
            bottom = page_height
        bottom = min(bottom, page_height)
        if bottom - top < 8:
            continue

        full_text = _collect_text(data, top, bottom)
        figure_bbox = _figure_in_range(figures, top, bottom)
        questions.append(
            {
                "number": marker["number"],
                "bbox_px": [0, top * zoom, page_width * zoom, bottom * zoom],
                "text": full_text,
                "has_figure": figure_bbox is not None,
                "figure_bbox_px": (
                    [value * zoom for value in figure_bbox]
                    if figure_bbox is not None
                    else None
                ),
                "source": "heuristic",
            }
        )

    return questions


def _figure_rects(page):
    rects = []
    try:
        for info in page.get_image_info():
            bbox = info.get("bbox")
            if bbox:
                rects.append(tuple(bbox))
    except Exception:
        return rects
    return rects


def _figure_in_range(figures, top, bottom):
    for left, ftop, right, fbottom in figures:
        center = (ftop + fbottom) / 2
        if top - 4 <= center <= bottom + 4 and (fbottom - ftop) > 12:
            return [left, ftop, right, fbottom]
    return None


def _collect_text(data, top, bottom):
    parts = []
    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            line_top = line["bbox"][1]
            if top - 2 <= line_top < bottom:
                text = _line_text(line).strip()
                if text:
                    parts.append(text)
    return "\n".join(parts)
