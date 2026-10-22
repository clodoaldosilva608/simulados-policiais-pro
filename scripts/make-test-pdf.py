"""Gera um PDF de teste com conteúdo de estudo para testar o fluxo de upload."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

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
    "público somente atue conforme a lei, sendo-lhe vedado agir por vontade própria, diferentemente do "
    "particular, que pode fazer tudo o que a lei não veda.",

    "Os atos administrativos são declarações do Estado no exercício de suas funções administrativas. "
    "Seus requisitos ou elementos são: competência, finalidade, forma, motivo e objeto. A competência "
    "decorre da lei e é vinculada; a finalidade pode ser geral, prevista em lei, ou específica, "
    "delimitada para cada ato.",

    "Quanto aos atributos dos atos administrativos, destacam-se a presunção de legitimidade e a "
    "imperatividade. A presunção de legitimidade permite que o ato seja executado imediatamente, "
    "presumindo-se verídico e conforme o direito, até prova em contrário, cabendo ao particular "
    "o ônus de demonstrar a ilegalidade.",

    "O poder de polícia é a faculdade de que dispõe a Administração Pública para condicionar e restringir "
    "o uso e gozo de bens e atividades individuais em prol do interesse coletivo. Seus atributos são a "
    "discricionariedade na apreciação, a autoexecutoriedade e a coercibilidade das medidas adotadas.",

    "Os poderes administrativos classificam-se em vinculados, discricionários, hierárquicos, "
    "disciplinar, regulamentar e de polícia. O poder hierárquico decorre da escalonamento vertical da "
    "estrutura administrativa e permite ao superior coordenar, fiscalizar, avocar e delegar atribuições, "
    "além de aplicar sanções aos subordinados.",

    "A licitação é o procedimento administrativo mediante o qual a Administração Pública seleciona a "
    "proposta mais vantajosa para o contrato de interesse público. A Lei 14.133 de 2021 disciplinou as "
    "modalidades de concorrência, concurso, leilão, pregão e diálogo competitivo, além do procedimento "
    "auxiliar de credenciamento.",

    "Os contratos administrativos regem-se por normas de direito público e possuem cláusulas "
    "exorbitantes, como a alteração unilateral do contrato, a rescisão unilateral, a fiscalização da "
    "execução e a aplicação de sanções. O equilíbrio econômico-financeiro deve ser mantido como garantia "
    "ao particular contratado.",

    "A improbidade administrativa, tratada pela Lei 8.429 de 1992 com alterações da Lei 14.230 de 2021, "
    "configura o enriquecimento ilícito, o prejuízo ao erário e a violação aos princípios. A ação de "
    "improbidade exige dolo do agente e prescreve em oito anos, contados da entrada em vigor da lei "
    "ou do fato respectivo, o que for mais recente.",

    "O controle da Administração Pública pode ser exercido internamente, pelo Poder Legislativo e pelo "
    "Poder Judiciário. O Tribunal de Contas auxilia o Legislativo na fiscalização financeira, orçamentária "
    "e patrimonial, apreciando a legalidade e a legitimidade das despesas e avaliando os resultados.",
]

doc = SimpleDocTemplate("/home/z/my-project/scripts/teste-direito-administrativo.pdf", pagesize=A4,
                        title="Noções de Direito Administrativo", author="Simulados Interativos")
story = []
story.append(Paragraph("Resumo de Noções de Direito Administrativo", styles["Title"]))
story.append(Spacer(1, 14))
for p in paragrafos:
    story.append(Paragraph(p, normal))
    story.append(Spacer(1, 10))
doc.build(story)
print("PDF criado com sucesso")
