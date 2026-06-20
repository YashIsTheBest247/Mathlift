import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import pipeline

load_dotenv()

app = FastAPI(title="Mathlift Extraction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "ai": pipeline.gemini_client.is_enabled()}


@app.post("/api/process")
async def process(
    name: str = Form(...),
    num_questions: int = Form(...),
    output_format: str = Form(...),
    file: UploadFile = File(...),
):
    fmt = output_format.lower().strip()
    if fmt not in ("image", "text"):
        raise HTTPException(status_code=400, detail="output_format must be image or text")

    if num_questions < 1:
        raise HTTPException(status_code=400, detail="num_questions must be at least 1")

    is_pdf = (file.content_type == "application/pdf") or (
        file.filename or ""
    ).lower().endswith(".pdf")
    if not is_pdf:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        result = pipeline.extract(pdf_bytes, num_questions, fmt)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Processing failed: {error}")

    return {
        "name": name,
        "format": fmt,
        "requested": num_questions,
        "returned": len(result["questions"]),
        "source": result["source"],
        "questions": result["questions"],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
