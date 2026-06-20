import base64
import io
import os

import fitz
from PIL import Image

import gemini_client
import heuristic


def _zoom():
    try:
        return float(os.getenv("RENDER_ZOOM", "2.0"))
    except ValueError:
        return 2.0


def _max_pages():
    try:
        return int(os.getenv("MAX_PAGES", "40"))
    except ValueError:
        return 40


def _render_page(page, zoom):
    matrix = fitz.Matrix(zoom, zoom)
    pixmap = page.get_pixmap(matrix=matrix, alpha=False)
    image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
    return image


def _image_to_data_url(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def _crop(image, bbox):
    left, top, right, bottom = bbox
    left = max(int(left) - 6, 0)
    top = max(int(top) - 6, 0)
    right = min(int(right) + 6, image.width)
    bottom = min(int(bottom) + 6, image.height)
    if right <= left or bottom <= top:
        return None
    return image.crop((left, top, right, bottom))


def extract(pdf_bytes, num_questions, output_format):
    zoom = _zoom()
    max_pages = _max_pages()
    document = fitz.open(stream=pdf_bytes, filetype="pdf")

    collected = []
    pipeline_source = "heuristic"
    page_count = min(len(document), max_pages)

    for page_index in range(page_count):
        if len(collected) >= num_questions:
            break

        page = document[page_index]
        rendered = _render_page(page, zoom)

        detections = None
        if gemini_client.is_enabled():
            png_bytes = _png_bytes(rendered)
            detections = gemini_client.detect_questions_on_page(
                png_bytes, zoom, page.rect.width, page.rect.height
            )
            if detections:
                pipeline_source = "gemini"

        if not detections:
            detections = heuristic.detect_questions_on_page(page, zoom)

        for detection in detections:
            built = _build_question(rendered, detection, output_format, page_index + 1)
            if built is not None:
                collected.append(built)
            if len(collected) >= num_questions:
                break

    document.close()

    trimmed = collected[:num_questions]
    for index, question in enumerate(trimmed, start=1):
        if question.get("number") is None:
            question["number"] = index

    return {"source": pipeline_source, "questions": trimmed}


def _png_bytes(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _build_question(rendered, detection, output_format, page_number):
    if output_format == "image":
        crop = _crop(rendered, detection["bbox_px"])
        if crop is None:
            return None
        return {
            "number": detection.get("number"),
            "page": page_number,
            "source": detection.get("source"),
            "image": _image_to_data_url(crop),
        }

    text = detection.get("text", "").strip()
    if not text:
        return None

    figures = []
    if detection.get("has_figure") and detection.get("figure_bbox_px"):
        figure_crop = _crop(rendered, detection["figure_bbox_px"])
        if figure_crop is not None:
            figures.append(_image_to_data_url(figure_crop))

    return {
        "number": detection.get("number"),
        "page": page_number,
        "source": detection.get("source"),
        "text": text,
        "figures": figures,
    }
