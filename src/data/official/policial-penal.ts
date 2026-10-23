import type { Question, QuestionOption, Subject } from '../types'

/**
 * SIMULADO INÉDITO — Polícia Penal (estadual e federal — Agente/Policial Penal)
 * Questões inéditas elaboradas NO ESTILO da banca CEBRASPE (Certo/Errado),
 * com base na Lei de Execução Penal (Lei 7.210/1984), na CF/88 (art. 144, §1º),
 * na Lei 10.792/2003, na Lei 12.013/2009 e na jurisprudência consolidada.
 * NÃO são questões de prova oficial — servem para treinar o modelo C/E da carreira.
 */

const SUBJECTS: Subject[] = [
  { id: 'dir-const', name: 'Direito Constitucional — Segurança Pública', professor: '' },
  { id: 'lep', name: 'Lei de Execução Penal (7.210/1984)', professor: '' },
  { id: 'dir-penal', name: 'Direito Penal — Crimes Prisionais', professor: '' },
  { id: 'leg-especial', name: 'Legislação Especial Penitenciária', professor: '' },
]

const CE: QuestionOption[] = [
  { key: 'a', html: 'Certo' },
  { key: 'b', html: 'Errado' },
]

interface Item {
  id: number
  subjectId: string
  statement: string
  answer: 'C' | 'E'
  comment: string
}

const ITEMS: Item[] = [
  {
    id: 1,
    subjectId: 'dir-const',
    statement:
      'De acordo com a Constituição Federal de 1988, o patrimônio, os serviços e as penitenciárias não são considerados bens e serviços relevantes à segurança pública, não cabendo, portanto, à Polícia Federal, nos termos do art. 144, §1º, III, apurar infrações penais contra eles praticadas.',
    answer: 'E',
    comment:
      'O art. 144, §1º, III, da CF atribui à PF apurar infrações penais contra a ordem política e social ou em detrimento de bens, serviços e interesses da União OU DE SUAS ENTIDADES AUTÁRQUICAS E EMPRESAS PÚBLICAS, assim como de severas infrações penais cuja prática tenha repercussão interestadual ou internacional e exija repressão uniforme — e, expressamente, do patrimônio, serviços e penitenciárias. Logo, o item está ERRADO.',
  },
  {
    id: 2,
    subjectId: 'dir-const',
    statement:
      'O cargo de agente federal de execução penal integra a carreira de segurança pública federal, e a aprovação em concurso para esse cargo sujeita o candidato a verificação de idoneidade e de conduta ilibada, à avaliação psicológica e ao exame de aptidão física.',
    answer: 'C',
    comment:
      'Os concursos para Agente Federal de Execução Penal (DEPEN/SENAPPEN) seguem o padrão das carreiras policiais federais: idoneidade/conduta ilibada, avaliação psicológica, exame de aptidão física e curso de formação — item CERTO.',
  },
  {
    id: 3,
    subjectId: 'lep',
    statement:
      'A Lei de Execução Penal assegura ao condenado e ao internado todos os direitos não atingidos pela sentença ou pela lei, devendo o Estado responsabilizar-se pelos danos que a execução penal lhe causar.',
    answer: 'C',
    comment:
      'É a literalidade do art. 3º da Lei 7.210/1984: o condenado e o internado conservam todos os direitos não atingidos pela sentença/lei, e o Estado responsabiliza-se pelos danos causados pela execução — item CERTO.',
  },
  {
    id: 4,
    subjectId: 'lep',
    statement:
      'A assistência material, à saúde, jurídica, educacional, social e religiosa prestada ao preso é vedada ao recluso provisório, pois a execução penal somente se aperfeiçoa com a condenação definitiva.',
    answer: 'E',
    comment:
      'O art. 11 e o art. 10 da LEP alcançam também o preso provisório: a assistência é direito de condenados, internados e presos provisórios. A execução penal inclui as penas restritivas de direitos e a medida de segurança — item ERRADO.',
  },
  {
    id: 5,
    subjectId: 'lep',
    statement:
      'O exame criminológico, obrigatório para a individualização da execução em períodos anteriores à reforma de 2003, hoje somente é exigível, segundo a jurisprudência, quando houver necessidade concreta evidenciada no caso, não podendo ser usado como obstáculo automático à progressão de regime.',
    answer: 'C',
    comment:
      'Com a Lei 10.792/2003, o exame criminológico deixou de ser obrigatório (art. 112, §1º, LEP) e a jurisprudência exige que o exame tenha utilidade concreta, não podendo ser exigido automaticamente para a progressão — item CERTO.',
  },
  {
    id: 6,
    subjectId: 'lep',
    statement:
      'As faltas disciplinares gravíssimas correspondem, em linhas gerais, aos crimes dolosos; a prática de fato previsto como crime doloso constitui falta grave, quando resultar em prejuízo, desordem inquietação ou alarma, ou quando for scandalosa.',
    answer: 'C',
    comment:
      'É a regra do art. 50 e do art. 49, parágrafo único, da LEP: fato previsto como crime doloso constitui falta grave quando resultar prejuízo, desordem, inquietação ou alarma ou for escandalosa; correspondentemente, as faltas gravíssimas (art. 50) espelham os crimes dolosos — item CERTO.',
  },
  {
    id: 7,
    subjectId: 'lep',
    statement:
      'A sanção disciplinar de isolamento na própria cela ou em cela especial pode ser imposta ao preso provisório e ao condenado em regime aberto, desde que adotada por prazo superior a trinta dias.',
    answer: 'E',
    comment:
      'O art. 57 da LEP aplica o isolamento somente ao condenado em regime fechado ou semiaberto; e as sanções gravíssimas têm prazo limitado a 30 dias (art. 56). Não se aplica ao provisório nem ao regime aberto, nem por prazo superior a 30 dias — item ERRADO.',
  },
  {
    id: 8,
    subjectId: 'lep',
    statement:
      'O preso provisório, recolhido em estabelecimento prisional, deve ficar separado dos condenados definitivos e das pessoas submetidas a medida de segurança, sendo recolhido em estabelecimento distinto, conforme a natureza do delito.',
    answer: 'C',
    comment:
      'O art. 84 da LEP determina a separação do preso provisório dos condenados e das pessoas submetidas à medida de segurança, em estabelecimento distinto conforme a natureza do delito — item CERTO. (Regra também presente nas Regras de Mandela.)',
  },
  {
    id: 9,
    subjectId: 'lep',
    statement:
      'Conforme a jurisprudência consolidada do STF, a proibição de visita íntima para presidiárias e presidiários, inclusive nos regimes semiaberto e aberto, está prevista em lei federal, de modo que a autoridade prisional pode negá-la discricionariamente.',
    answer: 'E',
    comment:
      'O STF (HC 82.958) reconheceu que a visita íntima NÃO está prevista em lei federal, sendo garantia implícita de dignidade — a proibição generalizada é inconstitucional. A decisão protege presidiárias e presidiários nos regimes fechado, semiaberto e aberto — item ERRADO.',
  },
  {
    id: 10,
    subjectId: 'dir-penal',
    statement:
      'No crime de fuga (art. 352 do CP), constitui circunstância agravante o fato de a evasão ter sido efetuada mediante violência contra a pessoa; e incide, ainda, a agravante quando o agente comete o crime contra o emprego da força na vigilância.',
    answer: 'C',
    comment:
      'Art. 352, parágrafo único, do CP: no crime de fuga, incide a aggravante se a evasão é efetuada mediante violência contra a pessoa; e a agravante do emprego de força na vigilância também se aplica — item CERTO.',
  },
  {
    id: 11,
    subjectId: 'dir-penal',
    statement:
      'Configura-se o crime de motim de presos (art. 354 do CP) quando dois ou mais detentos se amotinam, perpetrando tumulto geral, ainda que não haja agressão a agentes nem dano patrimonial.',
    answer: 'C',
    comment:
      'O art. 354 do CP pune os amotinados que perpretam tumulto geral; o crime se consuma com o tumulto em si, sem necessidade de agressão ou dano — item CERTO.',
  },
  {
    id: 12,
    subjectId: 'dir-penal',
    statement:
      'O agente público que, fora dos casos legais, comunicar a alguém o teor de exame de corpo de delito ou documento confidencial integrante de autos de inquérito policial ainda não distribuído ao juízo comete violação de sigilo funcional, prevista no art. 325 do CP.',
    answer: 'C',
    comment:
      'O art. 325 do CP pune o funcionário que, sem autorização legal, revela fato de que tem ciência em razão do cargo e que deva permanecer em segredo, ou facilita sua revelação — item CERTO.',
  },
  {
    id: 13,
    subjectId: 'leg-especial',
    statement:
      'A Lei 10.792/2003 autorizou a realização de entrevistas do preso, prévia e expressamente autorizadas, com advogados e representantes de entidades de apoio, sem interferência do servo da segurança, de modo a preservar os direitos humanos.',
    answer: 'C',
    comment:
      'O art. 9º, §4º, da LEP (redação da Lei 10.792/2003) assegura entrevistas com advogados e representantes de entidades de apoio, prévia e expressamente autorizadas, sem interferência da segurança — item CERTO.',
  },
  {
    id: 14,
    subjectId: 'leg-especial',
    statement:
      'Nos termos da legislação vigente, a fiscalização da administração dos estabelecimentos prisionais estaduais cabe exclusivamente ao Poder Judiciário da respectiva jurisdição, sendo vedada a participação de entidades da sociedade civil.',
    answer: 'E',
    comment:
      'A fiscalização é compartilhada: o art. 6º da LEP determina a inspeção pelas autoridades judiciária, ministerial e administrativa; e o Conselho Nacional de Justiça e entidades da sociedade civil (mecanismo nacional de prevenção e combate à tortura) atuam na fiscalização — item ERRADO.',
  },
]

export const QUESTIONS: Question[] = ITEMS.map((it) => ({
  id: it.id,
  subjectId: it.subjectId,
  statement: it.statement,
  options: CE,
  answer: it.answer === 'C' ? 'a' : 'b',
  comment: it.comment,
}))

export const PP_SUBJECTS = SUBJECTS
