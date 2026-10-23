"""Gera PDFs de teste para validar o novo limite de 50MB do upload.

- /tmp/teste-35mb.pdf  (~30-40 MB, DEVE ser aceito)  — texto real + imagem de ruído
- /tmp/teste-55mb.pdf  (>50 MB, DEVE ser rejeitado)  — idem, maior

O ruído binário é incompressível, então o PNG/PDF fica ~ do tamanho bruto.
A extração de texto (unpdf/pdf.js) só lê a página de texto — rápida.
"""
import random
from PIL import Image as PILImage
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image


def noise_png(path: str, size_px: int) -> None:
    import os
    img = PILImage.new("L", (size_px, size_px))
    img.frombytes(os.urandom(size_px * size_px))
    img.save(path, format="PNG", optimize=False)


def build_pdf(out_path: str, png_path: str, titulo: str) -> None:
    styles = getSampleStyleSheet()
    normal = styles["Normal"]
    normal.fontName = "Helvetica"
    normal.fontSize = 11
    normal.leading = 16

    paragrafos = [
        "Noções de Direito Administrativo. O regime jurídico administrativo é caracterizado pela supremacia "
        "do interesse público e pela indisponibilidade do interesse público pelo agente administrativo. "
        "Esses dois princípios fundamentais explicam a maior parte das prerrogativas da Administração Pública.",
        "Os princípios expressos no artigo 37 da Constituição Federal são: legalidade, impessoalidade, "
        "moralidade, publicidade e eficiência, conhecidos pela sigla LIMPE. A legalidade exige que o agente "
        "público somente atue conforme a lei, sendo-lhe vedado agir por vontade própria.",
        "Os atos administrativos são declarações do Estado no exercício de suas funções administrativas. "
        "Seus requisitos ou elementos são: competência, finalidade, forma, motivo e objeto. A competência "
        "decorre da lei e é vinculada; a finalidade pode ser geral, prevista em lei, ou específica.",
        "O poder de polícia é a faculdade de que dispõe a Administração Pública para condicionar e restringir "
        "o uso e gozo de bens e atividades individuais em prol do interesse coletivo. Seus atributos são a "
        "discricionariedade na apreciação, a autoexecutoriedade e a coercibilidade das medidas adotadas.",
        "A licitação é o procedimento administrativo mediante o qual a Administração Pública seleciona a "
        "proposta mais vantajosa para o contrato de interesse público. A Lei 14.133 de 2021 disciplinou as "
        "modalidades de concorrência, concurso, leilão, pregão e diálogo competitivo.",
        "A improbidade administrativa, tratada pela Lei 8.429 de 1992 com alterações da Lei 14.230 de 2021, "
        "configura o enriquecimento ilícito, o prejuízo ao erário e a violação aos princípios. A ação de "
        "improbidade exige dolo do agente e prescreve em oito anos, contados da entrada em vigor da lei.",
    ]

    doc = SimpleDocTemplate(out_path, pagesize=A4, title=titulo, author="Simulados Policiais Pro")
    story = [Paragraph(titulo, styles["Title"]), Spacer(1, 14)]
    for p in paragrafos:
        story.append(Paragraph(p, normal))
        story.append(Spacer(1, 10))
    story.append(Spacer(1, 20))
    story.append(Image(png_path, width=2 * cm, height=2 * cm))  # carrega o ruído (infla o arquivo)
    doc.build(story)


if __name__ == "__main__":
    noise_png("/tmp/noise-36.png", 6000)   # ~36 MB brutos
    noise_png("/tmp/noise-58.png", 7700)   # ~59 MB brutos
    build_pdf("/tmp/teste-35mb.pdf", "/tmp/noise-36.png", "Apostila de Direito Administrativo — volume único")
    build_pdf("/tmp/teste-55mb.pdf", "/tmp/noise-58.png", "Apostila de Direito Constitucional — volume único")
    import os
    for f in ("/tmp/teste-35mb.pdf", "/tmp/teste-55mb.pdf"):
        print(f, round(os.path.getsize(f) / 1024 / 1024, 2), "MB")
