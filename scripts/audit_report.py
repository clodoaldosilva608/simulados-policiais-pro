# -*- coding: utf-8 -*-
"""Motor do relatorio de auditoria (ReportLab) — pipeline Report do skill pdf."""
import os, sys, hashlib

PDF_SKILL_DIR = '/home/z/my-project/skills/pdf'
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, 'scripts'))
sys.path.insert(0, '/home/z/my-project/scripts')

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                                Table, TableStyle, Image, KeepTogether, CondPageBreak)
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage

FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                   italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

from pdf import install_font_fallback
install_font_fallback()

# ━━ Palette fixa do Template 07 (Crystal Blue) — corpo claro na mesma familia ━━
PAGE_BG      = colors.HexColor('#f5f8fc')
SECTION_BG   = colors.HexColor('#edf2f9')
CARD_BG      = colors.HexColor('#e4ecf5')
TABLE_STRIPE = colors.HexColor('#eef3fa')
HEADER_FILL  = colors.HexColor('#1a4a7a')
BORDER       = colors.HexColor('#c0d0e2')
ACCENT       = colors.HexColor('#2d7ab3')
TEXT_PRIMARY = colors.HexColor('#142840')
TEXT_MUTED   = colors.HexColor('#5a7a96')

MARGIN = 0.95 * inch
PAGE_W, PAGE_H = A4
AVAIL_W = PAGE_W - 2 * MARGIN
AVAIL_H = PAGE_H - 2 * MARGIN
OUT_BODY = '/home/z/my-project/scripts/audit_body.pdf'

# ━━ Estilos ━━
st_body = ParagraphStyle('Body', fontName='FreeSerif', fontSize=10.5, leading=16.5,
                         alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY, spaceAfter=10)
st_quote = ParagraphStyle('Quote', parent=st_body, fontName='FreeSerif-Italic',
                          leftIndent=24, textColor=TEXT_PRIMARY, borderPadding=0,
                          spaceBefore=6, spaceAfter=12, alignment=TA_JUSTIFY)
st_h1 = ParagraphStyle('H1x', fontName='FreeSerif-Bold', fontSize=18, leading=23,
                       textColor=HEADER_FILL, spaceBefore=18, spaceAfter=10)
st_h2 = ParagraphStyle('H2x', fontName='FreeSerif-Bold', fontSize=13.5, leading=18,
                       textColor=HEADER_FILL, spaceBefore=14, spaceAfter=8)
st_h3 = ParagraphStyle('H3x', fontName='FreeSerif-Bold', fontSize=11.5, leading=16,
                       textColor=TEXT_PRIMARY, spaceBefore=12, spaceAfter=6)
st_bullet = ParagraphStyle('Bul', parent=st_body, alignment=TA_LEFT, leftIndent=16,
                           firstLineIndent=-10, spaceAfter=6)
st_num = ParagraphStyle('Num', parent=st_body, alignment=TA_LEFT, leftIndent=18,
                        firstLineIndent=-12, spaceAfter=6)
st_caption = ParagraphStyle('Cap', fontName='FreeSerif', fontSize=8.5, leading=12,
                            alignment=TA_CENTER, textColor=TEXT_MUTED,
                            spaceBefore=3, spaceAfter=6)
st_stat = ParagraphStyle('Stat', fontName='FreeSerif-Bold', fontSize=19, leading=23,
                         textColor=ACCENT, alignment=TA_CENTER)
st_stat_l = ParagraphStyle('StatL', fontName='FreeSerif', fontSize=8, leading=11,
                           textColor=TEXT_MUTED, alignment=TA_CENTER)
st_toc_title = ParagraphStyle('TocT', fontName='FreeSerif-Bold', fontSize=20, leading=26,
                              textColor=HEADER_FILL, spaceAfter=14)


def th(text, fs=8.8):
    return Paragraph(f'<b>{text}</b>',
                     ParagraphStyle('TH', fontName='FreeSerif-Bold', fontSize=fs, leading=fs + 3,
                                    textColor=colors.white, alignment=TA_CENTER))


def td(text, fs=8.5, center=False):
    stl = ParagraphStyle('TD', fontName='FreeSerif', fontSize=fs, leading=fs + 3.2,
                         textColor=TEXT_PRIMARY, alignment=TA_CENTER if center else TA_LEFT,
                         wordWrap='CJK')
    return Paragraph(text, stl)


def make_table(spec):
    fs = spec.get('fs', 8.5)
    ratios = spec['ratios']
    col_w = [r * AVAIL_W for r in ratios]
    assert abs(sum(ratios) - 1.0) < 0.01, f'ratios somam {sum(ratios)}'
    assert sum(col_w) <= AVAIL_W + 0.5
    data = [[th(h, fs + 0.3) for h in spec['headers']]]
    for row in spec['rows']:
        data.append([td(c, fs) for c in row])
    t = Table(data, colWidths=col_w, repeatRows=1, hAlign='CENTER')
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]
    for i in range(1, len(data)):
        style.append(('BACKGROUND', (0, i), (-1, i),
                      TABLE_STRIPE if i % 2 == 0 else colors.white))
    t.setStyle(TableStyle(style))
    return t


def make_callouts(items):
    n = len(items)
    w = (AVAIL_W - (n - 1) * 10) / n
    row_v = [Paragraph(f'<b>{v}</b>', st_stat) for v, _ in items]
    row_l = [Paragraph(l, st_stat_l) for _, l in items]
    t = Table([row_v, row_l], colWidths=[w] * n, hAlign='CENTER')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (0, -1), 1, ACCENT),
        ('BOX', (1, 0), (1, -1), 1, ACCENT),
        ('BOX', (2, 0), (2, -1), 1, ACCENT),
        ('BOX', (3, 0), (3, -1), 1, ACCENT),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t


def embed_image(path, max_w=None, max_h=None):
    if max_w is None:
        max_w = AVAIL_W
    if max_h is None:
        max_h = A4[1] * 0.35
    pil = PILImage.open(path)
    ow, oh = pil.size
    ratio = min(max_w / ow if ow > max_w else 1.0, max_h / oh if oh > max_h else 1.0)
    return Image(path, width=ow * ratio, height=oh * ratio)


MAX_KEEP = A4[1] * 0.4

def safe_keep(elements):
    total = 0
    for el in elements:
        try:
            _, h = el.wrap(AVAIL_W, AVAIL_H)
        except Exception:
            h = 40
        total += h
    if total <= MAX_KEEP:
        return [KeepTogether(elements)]
    if len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)


class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            # -1: o rodapé rotula a página do corpo como doc.page-1 (sumário = i)
            self.notify('TOCEntry', (level, text, self.page - 1, key))


def heading(text, style, level=0):
    key = 'h_' + hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text.replace('<b>', '').replace('</b>', '')
    p.bookmark_key = key
    return p


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAGE_BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # header
    canvas.setFont('FreeSerif', 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, PAGE_H - 0.55 * inch, 'Auditoria Técnica de Engenharia — Simulados Policiais Pro')
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.2)
    canvas.line(MARGIN, PAGE_H - 0.62 * inch, PAGE_W - MARGIN, PAGE_H - 0.62 * inch)
    # footer
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 0.62 * inch, PAGE_W - MARGIN, 0.62 * inch)
    canvas.setFont('FreeSerif', 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, 0.44 * inch, 'Z.ai · Code & Architecture Review · outubro de 2026')
    page_label = 'i' if doc.page == 1 else str(doc.page - 1)
    canvas.drawRightString(PAGE_W - MARGIN, 0.44 * inch, page_label)
    canvas.restoreState()


def fix_dash(t):
    """Impede travessão em início de linha: liga o em dash à palavra anterior."""
    return t.replace(' — ', '\u00A0— ')


def build_story():
    from audit_content import PART1
    from audit_content2 import PART2
    blocks = list(PART1) + list(PART2)

    story = []
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle('TOC0', fontName='FreeSerif', fontSize=10.5, leading=17.5,
                       leftIndent=6, textColor=TEXT_PRIMARY),
    ]
    story.append(Paragraph('Sumário', st_toc_title))
    story.append(toc)
    story.append(PageBreak())

    pending = []          # headings aguardando o primeiro flowable seguinte
    threshold = AVAIL_H * 0.25

    def emit(flowables):
        nonlocal pending
        if pending:
            story.extend(safe_keep(pending + flowables))
            pending = []
        else:
            story.extend(flowables)

    for kind, payload in blocks:
        if kind == 'h1':
            if pending:
                story.extend(pending)
                pending = []
            story.append(CondPageBreak(threshold))
            pending = [heading(payload, st_h1, level=0)]
        elif kind == 'h2':
            if pending:
                story.extend(pending)
                pending = []
            story.append(CondPageBreak(AVAIL_H * 0.12))
            pending = [Paragraph(payload, st_h2)]
        elif kind == 'h3':
            if pending:
                story.extend(pending)
                pending = []
            pending = [Paragraph(payload, st_h3)]
        elif kind == 'body':
            emit([Paragraph(fix_dash(payload), st_body)])
        elif kind == 'quote':
            emit([Paragraph(fix_dash(payload), st_quote)])
        elif kind == 'bullet':
            items = [Paragraph('•\u00A0' + fix_dash(it), st_bullet) for it in payload]
            emit(items[:1])
            story.extend(items[1:])
        elif kind == 'num':
            items = [Paragraph(f'{i}.\u00A0' + fix_dash(it), st_num) for i, it in enumerate(payload, 1)]
            emit(items[:1])
            story.extend(items[1:])
        elif kind == 'table':
            t = make_table(payload)
            emit([Spacer(1, 8), t, Spacer(1, 12)])
        elif kind == 'callouts':
            emit([Spacer(1, 6), make_callouts(payload), Spacer(1, 12)])
        elif kind == 'img':
            path, caption, max_h = payload
            img = embed_image(path, max_h=max_h)
            emit([Spacer(1, 10)] + safe_keep([img, Paragraph(caption, st_caption)]) + [Spacer(1, 10)])
        elif kind == 'spacer':
            emit([Spacer(1, payload)])
    if pending:
        story.extend(pending)
    return story


def main():
    doc = TocDocTemplate(
        OUT_BODY, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title='Auditoria Técnica de Engenharia — Simulados Policiais Pro',
        author='Z.ai', creator='Z.ai',
        subject='Code & Architecture Review — prontidão para 100.000 usuários ativos',
    )
    doc.multiBuild(build_story(), onFirstPage=on_page, onLaterPages=on_page)
    print('OK body:', OUT_BODY)


if __name__ == '__main__':
    main()
