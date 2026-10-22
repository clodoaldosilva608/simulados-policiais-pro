"""Extrai texto dos PDFs oficiais de provas policiais para gerar o banco de questões."""
import os
from pypdf import PdfReader

PDF_DIR = "/home/z/my-project/provas-pdf"
OUT_DIR = "/home/z/my-project/provas-pdf/txt"
os.makedirs(OUT_DIR, exist_ok=True)

for fname in os.listdir(PDF_DIR):
    if not fname.endswith(".pdf"):
        continue
    path = os.path.join(PDF_DIR, fname)
    out_path = os.path.join(OUT_DIR, fname.replace(".pdf", ".txt").replace(".PDF", ".txt"))
    try:
        reader = PdfReader(path)
        texts = []
        for i, page in enumerate(reader.pages):
            try:
                t = page.extract_text() or ""
            except Exception as e:
                t = f"[erro pagina {i}: {e}]"
            texts.append(f"--- PAGINA {i+1} ---\n{t}")
        full = "\n".join(texts)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(full)
        print(f"OK {fname}: {len(reader.pages)} paginas, {len(full)} chars -> {out_path}")
    except Exception as e:
        print(f"ERRO {fname}: {e}")
