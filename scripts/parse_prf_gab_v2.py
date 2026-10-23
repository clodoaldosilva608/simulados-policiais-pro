"""Parseia gabarito PRF 2021 (prf21-gab.pdf): alinha números (linha de cima) com letras (linha de baixo) por x0."""
import re
from collections import defaultdict

import pdfplumber

PDF = "/home/z/my-project/provas-pdf/prf21-gab.pdf"

with pdfplumber.open(PDF) as pdf:
    page = pdf.pages[0]
    words = page.extract_words()

# agrupar palavras por linha (top)
lines = defaultdict(list)
for w in words:
    key = round(w["top"] / 8) * 8
    lines[key].append(w)

ordered = []
for key in sorted(lines):
    ws = sorted(lines[key], key=lambda w: w["x0"])
    texts = [(w["x0"], w["text"]) for w in ws]
    ordered.append(texts)

result = {}
i = 0
while i < len(ordered) - 1:
    nums_line = ordered[i]
    nums = [(x, int(t)) for x, t in nums_line if t.isdigit() and 1 <= int(t) <= 120]
    if len(nums) >= 5:
        # procurar linha de letras imediatamente abaixo
        for j in range(i + 1, min(i + 3, len(ordered))):
            letters_line = ordered[j]
            letters = [(x, t) for x, t in letters_line if t in ("C", "E", "X")]
            if len(letters) >= len(nums) - 2:
                for x, n in nums:
                    best = min(letters, key=lambda l: abs(l[0] - x), default=None)
                    if best and abs(best[0] - x) < 12:
                        result[n] = best[1]
                i = j
                break
    i += 1

for n in sorted(result):
    print(f"{n}:{result[n]}", end=" ")
print()
print("total:", len(result))
