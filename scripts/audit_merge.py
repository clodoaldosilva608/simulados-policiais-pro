# -*- coding: utf-8 -*-
"""Merge capa + corpo -> PDF final normalizado em A4."""
from pypdf import PdfReader, PdfWriter

A4_W, A4_H = 595.28, 841.89

def normalize(page):
    b = page.mediabox
    w, h = float(b.width), float(b.height)
    if abs(w - A4_W) > 0.1 or abs(h - A4_H) > 0.1:
        page.scale_to(A4_W, A4_H)
    return page

writer = PdfWriter()
writer.add_page(normalize(PdfReader('/home/z/my-project/scripts/audit_cover.pdf').pages[0]))
for p in PdfReader('/home/z/my-project/scripts/audit_body.pdf').pages:
    writer.add_page(normalize(p))
writer.add_metadata({
    '/Title': 'Auditoria Tecnica de Engenharia — Simulados Policiais Pro',
    '/Author': 'Z.ai',
    '/Creator': 'Z.ai',
    '/Subject': 'Code & Architecture Review — prontidao para 100.000 usuarios ativos',
})
out = '/home/z/my-project/download/auditoria-simulados-policiais-pro.pdf'
with open(out, 'wb') as f:
    writer.write(f)
print('OK final:', out)
