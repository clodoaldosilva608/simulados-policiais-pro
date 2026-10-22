"""Extrai gabarito PRF 2021 com posições x/y via pdfplumber para mapear item -> letra."""
try:
    import pdfplumber
except ImportError:
    import subprocess, sys
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "pdfplumber"])
    import pdfplumber

from collections import defaultdict

PDF = "/home/z/my-project/provas-pdf/prf21-gab.pdf"

rows = defaultdict(list)  # y -> [(x, text)]

with pdfplumber.open(PDF) as pdf:
    page = pdf.pages[0]
    for ch in page.chars:
        y = round(ch["top"] / 6) * 6  # agrupa linhas
        rows[y].append((ch["x0"], ch["text"]))

lines = []
for y in sorted(rows):
    cells = sorted(rows[y], key=lambda t: t[0])
    line = "".join(t[1] for t in cells)
    lines.append((y, line))

for y, line in lines:
    print(f"y={y}: {line}")
