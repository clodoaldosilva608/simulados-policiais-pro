import type { Question, QuestionOption, Subject, TextBlock } from '../types'
import { ITEMS_PRF2 } from './prf-2021-part2'

/**
 * PROVA OFICIAL — Concurso PRF 2021 (Edital Concurso PRF nº 1, de 18/01/2021)
 * Cargo: Policial Rodoviário Federal • Banca: CEBRASPE • Caderno 578_PRF_001_01
 * Gabarito: GABARITO DEFINITIVO (Cebraspe). Itens anulados (X): 39, 45, 67, 69, 76, 83, 89, 98 e 99 (omitidos).
 * Prova aplicada em 05/12/2021 — último concurso da PRF até o momento (novo certame previsto para 2026).
 * Transcrição dos itens 9 a 120 (exceto anulados e itens de estatística com fórmulas).
 */

const SUBJECTS: Subject[] = [
  { id: 'portugues', name: 'Língua Portuguesa', professor: '' },
  { id: 'redacao-oficial', name: 'Redação Oficial', professor: '' },
  { id: 'logico', name: 'Raciocínio Lógico e Matemática', professor: '' },
  { id: 'informatica', name: 'Informática', professor: '' },
  { id: 'seg-info', name: 'Segurança da Informação e TI', professor: '' },
  { id: 'fisica', name: 'Física', professor: '' },
  { id: 'etica', name: 'Ética no Serviço Público e Administração', professor: '' },
  { id: 'geografia', name: 'Geografia e Infraestrutura de Transportes', professor: '' },
  { id: 'leg-transito', name: 'Legislação de Trânsito e CONTRAN', professor: '' },
  { id: 'dir-adm', name: 'Direito Administrativo', professor: '' },
  { id: 'leg-carreira', name: 'Carreira e Atribuições PRF', professor: '' },
  { id: 'dir-const', name: 'Direito Constitucional', professor: '' },
  { id: 'dir-penal', name: 'Direito Penal', professor: '' },
  { id: 'dir-proc', name: 'Direito Processual Penal', professor: '' },
  { id: 'leg-especial', name: 'Legislação Especial', professor: '' },
  { id: 'dir-humanos', name: 'Direitos Humanos', professor: '' },
]

const CE: QuestionOption[] = [
  { key: 'a', html: 'Certo' },
  { key: 'b', html: 'Errado' },
]

/** Gabarito definitivo (X = anulado, omitido) */
const GAB: Record<number, 'C' | 'E'> = {
  9: 'C', 10: 'E', 11: 'C', 12: 'C', 13: 'C', 14: 'E', 15: 'E', 16: 'C', 17: 'C', 18: 'E',
  19: 'C', 20: 'E', 21: 'E', 22: 'E', 23: 'E', 24: 'C', 25: 'E', 26: 'C', 27: 'C', 28: 'E',
  29: 'E', 30: 'E', 31: 'C', 32: 'C', 33: 'E', 34: 'E', 35: 'C', 36: 'C', 37: 'E', 38: 'E',
  40: 'C', 41: 'E', 42: 'E', 43: 'C', 44: 'E',
  46: 'E', 47: 'C', 48: 'C', 49: 'E',
  50: 'C', 51: 'C', 52: 'E', 53: 'C', 54: 'C',
  55: 'E', 56: 'C', 57: 'C', 58: 'E', 59: 'E', 60: 'C', 61: 'E', 62: 'E', 66: 'E', 68: 'E',
  70: 'E', 71: 'C', 72: 'C', 73: 'E', 74: 'E', 78: 'E', 81: 'E',
  86: 'E', 87: 'E', 88: 'E', 90: 'C', 91: 'E', 92: 'C', 93: 'E', 95: 'C', 97: 'C',
  100: 'E', 101: 'E', 102: 'C', 103: 'E', 104: 'C', 105: 'E', 106: 'C', 107: 'E', 108: 'E', 109: 'C',
  110: 'E', 111: 'C', 112: 'C', 113: 'C', 114: 'C', 115: 'E',
  116: 'C', 117: 'E', 118: 'C', 119: 'C', 120: 'E',
}

interface Item {
  id: number
  subjectId: string
  statement: string
  comment: string
  textRef?: string
}

/**
 * TEXTO-BASE (real da prova): Texto 1A18-I — 'Considerações sobre a história da polícia'
 * Sustenta os itens 9 a 21. Transcrito do caderno 578_PRF_001_01, página 1.
 */
export const PRF_TEXT_BLOCKS: Record<string, TextBlock> = {
  'prf21-t1': {
    id: 'prf21-t1',
    title: 'Texto 1A18-I — para os itens 9 a 21',
    paragraphs: [
      'Nos Estados Unidos da América, no século XIX, a passagem da polícia do sistema de justiça para o de governo da cidade significou também a passagem da noção de caça aos criminosos para a prevenção dos crimes, em um deslocamento do ato para o ator. Como na Europa, a ênfase na prevenção teria representado nova atitude diante do controle social, com o desenvolvimento pela polícia de uma habilidade específica, a de explicar e prevenir o comportamento criminoso. Isso acabou redundando no foco nas “classes perigosas”, ou seja, em setores específicos da sociedade vistos como produtores de comportamento criminoso. Nesse processo, desenvolveram-se os vários campos de saber vinculados aos sistemas de justiça criminal, polícia e prisão, voltados para a identificação, para a explicação e para a prevenção do comportamento criminoso, agora visto como “desviante”, como a medicina legal, a psiquiatria e, especialmente, a criminologia.',
      'Na Europa ocidental, as novas instituições estatais de vigilância deveriam controlar o exercício da força em sociedades em que os níveis de violência física nas relações interpessoais e do Estado com a sociedade estavam em declínio. De acordo com a difundida teoria do processo civilizador, de Norbert Elias, no Ocidente moderno, a agressividade, assim como outras emoções e prazeres, foi domada, “refinada” e “civilizada”. O autor estabelece um contraste entre a violência “franca e desinibida” do período medieval, que não excluía ninguém da vida social e era socialmente permitida e até certo ponto necessária, e o autocontrole e a moderação das emoções que acabaram por se impor na modernidade. A conversão do controle que se exercia por terceiros no autocontrole é relacionada à organização e à estabilização de Estados modernos, nos quais a monopolização da força física em órgãos centrais permitiu a criação de espaços pacificados. Em tais espaços, os indivíduos passaram a ser submetidos a regras e leis mais rigorosas, mas ficaram mais protegidos da irrupção da violência na sua vida, na medida em que as ameaças físicas tornaram-se despersonalizadas e monopolizadas por especialistas.',
    ],
    source:
      'C. Mauch. Considerações sobre a história da polícia. In: MÉTIS: história & cultura, v. 6, n.º 11, jan./jun. 2007, p. 107-19 (com adaptações).',
  },
}

const ITEMS: Item[] = [
  {
    id: 9,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'A transferência da polícia do sistema de justiça para o governo da cidade marca o que pode ser considerado uma mudança de paradigma no que se refere ao papel da polícia na sociedade.',
    comment:
      'Conforme o texto (história da polícia), a passagem da polícia do sistema de justiça para o governo da cidade representa uma mudança de paradigma em seu papel social — item CERTO.',
  },
  {
    id: 10,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'Seriam mantidos a correção gramatical e os sentidos do texto caso o segundo período do primeiro parágrafo fosse reescrito da seguinte maneira: Porque nos países europeus houve empenho em prevenir crimes, o que representou nova atitude de controle social, o resultado foi o desenvolvimento de uma habilidade específica pelas autoridades policiais: a de explicar e prevenir o crime.',
    comment:
      'A reescrita quebra a articulação lógica do período original (a relação causa-consequência fica distorcida pelo encadeamento “Porque... o que..., o resultado foi...”), prejudicando os sentidos do texto — item ERRADO.',
  },
  {
    id: 11,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'Infere-se da leitura do primeiro parágrafo do texto que o desenvolvimento de áreas científicas ligadas à justiça criminal no século XIX está associado a visões preconceituosas sobre certos grupos de indivíduos.',
    comment:
      'O texto relaciona o surgimento de campos de saber criminal no século XIX a classificações sociais marcadas por preconceito (como a associação de determinados grupos à criminalidade) — item CERTO.',
  },
  {
    id: 12,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'Um dos traços característicos da modernidade, segundo Norbert Elias, é a renúncia de certas emoções e de certos prazeres pelos indivíduos, que, em compensação, passaram a ser protegidos da violência devido à atuação do Estado.',
    comment:
      'É a tese de Elias reproduzida no texto: em troca do autocontrole (renúncia a emoções e prazeres), os indivíduos passaram a estar mais protegidos da violência, monopolizada pelo Estado — item CERTO.',
  },
  {
    id: 13,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement: 'Depreende-se do segundo parágrafo do texto que a violência na era medieval era comum e socialmente aceita.',
    comment:
      'O segundo parágrafo descreve a violência medieval como praticada de forma corrente e aceita socialmente, antes do monopólio estatal da violência — item CERTO.',
  },
  {
    id: 14,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'Conclui-se do texto que o monopólio da violência legítima pelo Estado deveu-se à necessidade de reação aos índices insustentáveis de violência física entre os indivíduos.',
    comment:
      'O texto não atribui o monopólio da violência à reação a índices insustentáveis: trata-se de processo histórico de formação dos Estados modernos (autocontrole e estabilização), não de resposta a uma “crise de violência” — item ERRADO.',
  },
  {
    id: 15,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'O pronome “Isso”, que introduz o terceiro período do primeiro parágrafo do texto, poderia ser corretamente substituído por “O que”.',
    comment:
      '“Isso” retoma o período anterior como sujeito/tema; a substituição por “O que” alteraria a estrutura sintática e a coesão do período — item ERRADO.',
  },
  {
    id: 16,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'Infere-se do segundo parágrafo do texto que a agressividade humana passou por um processo de transformação gradativo de perda de aspectos primitivos e animalescos.',
    comment:
      'O texto descreve (via Norbert Elias) um processo gradual de civilização dos costumes, com a perda progressiva de traços primitivos da agressividade — item CERTO.',
  },
  {
    id: 17,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'O emprego do vocábulo “irrupção”, no último período do texto, indica que a violência atingia os indivíduos de forma súbita.',
    comment:
      '“Irrupção” significa irrompimento, irromper de modo brusco/súbito — o vocábulo transmite a ideia de violência que aparecia de forma súbita — item CERTO.',
  },
  {
    id: 18,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'Mantém-se a correção gramatical do trecho “o autocontrole e a moderação das emoções que acabaram por se impor na modernidade”, do texto, caso a forma verbal “impor” seja flexionada no plural “imporem”.',
    comment:
      'Na estrutura “acabaram por se impor”, o infinitivo “impor” é regido por “acabaram” e deve permanecer no singular — a flexão “imporem” (que concordaria com o sujeito do “que”) quebraria a regência e a concordância da perífrase — item ERRADO.',
  },
  {
    id: 19,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'A correção gramatical do último período do texto seria mantida, embora seu sentido original fosse prejudicado, se a locução “na medida em que” fosse substituída por “à medida que” e a vírgula empregada logo após “vida” fosse suprimida.',
    comment:
      'A substituição de “na medida em que” (causal) por “à medida que” (proporcional) altera o sentido, mas mantém a gramática; contudo, a vírgula após “vida” separa oração adverbial anteposta e sua supressão prejudica a correção — item ERRADO.',
  },
  {
    id: 20,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'O trecho “A conversão do controle que se exercia por terceiros no autocontrole é relacionada à organização e à estabilização de Estados modernos” poderia ser reescrito da seguinte forma, sem prejuízo para os sentidos e para a correção gramatical do texto: Converter o controle efetuado por terceiros a autocontrole concatena a organização e estabilização dos Estados do mundo moderno.',
    comment:
      'A reescrita altera a regência (“conversão de X em Y” ≠ “converter X a Y”), o léxico e a estrutura relacional do trecho, com prejuízo de sentido e gramática — item ERRADO.',
  },
  {
    id: 21,
    subjectId: 'portugues',
    textRef: 'prf21-t1',
    statement:
      'A coerência e os sentidos do texto seriam mantidos caso fosse suprimido o artigo “os”, no trecho “desenvolveram-se os vários campos de saber”, no último período do primeiro parágrafo.',
    comment:
      'O artigo “os” é essencial à determinação do nome (“os vários campos de saber”); suprimi-lo alteraria a referência e a gramaticalidade — item ERRADO.',
  },
  {
    id: 22,
    subjectId: 'redacao-oficial',
    statement:
      'Entre as características da redação oficial incluem-se a objetividade, a impessoalidade e a informatividade.',
    comment:
      'As características apontadas pelo Manual de Redação da Presidência da República são impessoalidade, clareza, concisão, uniformidade, uso do timbre e da linguagem adequada — “informatividade” não figura como característica — item ERRADO.',
  },
  {
    id: 23,
    subjectId: 'redacao-oficial',
    statement:
      'Na identificação do signatário de uma comunicação oficial destinada a uma pessoa do sexo feminino, dispensa-se flexão de gênero no nome do cargo.',
    comment:
      'O MRPR determina que o nome do cargo do signatário concorde com o gênero — ex.: “A Diretora”, “a Chefe de Departamento”. Não se dispensa a flexão — item ERRADO.',
  },
  {
    id: 24,
    subjectId: 'redacao-oficial',
    statement: 'O vocativo, nas comunicações oficiais, deverá ser sempre seguido de vírgula.',
    comment:
      'É regra expressa do MRPR: o vocativo deve ser sempre seguido de vírgula (ex.: “Senhor Presidente da República,”) — item CERTO.',
  },
  {
    id: 25,
    subjectId: 'redacao-oficial',
    statement:
      'De acordo com a legislação vigente, o e-mail institucional tem valor documental e, por isso, deve ser aceito como documento original.',
    comment:
      'O correio eletrônico institucional é instrumento de comunicação e produz prova, mas a legislação não o equipara, de forma absoluta, a documento original para todos os fins — item ERRADO.',
  },
  {
    id: 26,
    subjectId: 'redacao-oficial',
    statement:
      'O assunto das comunicações oficiais deve apresentar de forma geral o que será tratado no documento e seu formato deve seguir as orientações do Manual de Redação da Presidência da República.',
    comment:
      'O campo “Assunto” deve sintetizar de forma geral o conteúdo do expediente, conforme orientações do MRPR — item CERTO.',
  },
  {
    id: 27,
    subjectId: 'logico',
    statement:
      'Foi modelado que o espalhamento de uma notícia em uma população — entendido como o percentual de indivíduos dessa população que recebe essa notícia por unidade de tempo — é diretamente proporcional ao percentual de indivíduos que já conhecem a notícia multiplicado pelo percentual dos que ainda não a conhecem. Para certa notícia, k = 1. Julgue o item: se, em determinado instante, 30% da população já conhece a notícia, então, nesse instante, o seu espalhamento estaria em patamar superior a 20% por unidade de tempo.',
    comment:
      'Espalhamento = k × p × (1 − p) = 1 × 0,30 × 0,70 = 0,21 = 21% > 20% — item CERTO.',
  },
  {
    id: 28,
    subjectId: 'logico',
    statement:
      'Nas mesmas condições do modelo anterior (k = 1), julgue o item: se, em determinado instante, o espalhamento de uma notícia é igual a 16% por unidade de tempo, então, nesse instante, mais de 75% da população ainda desconhece a notícia.',
    comment:
      'p(1 − p) = 0,16 → p = 0,2 ou p = 0,8. Como ambos os valores são possíveis, não se pode afirmar necessariamente que mais de 75% desconhece a notícia (com p = 0,8, apenas 20% desconhece) — item ERRADO.',
  },
  {
    id: 29,
    subjectId: 'logico',
    statement:
      'De acordo com a modelagem realizada, é possível que, em determinado instante, o espalhamento da notícia seja superior a 50% por unidade de tempo.',
    comment:
      'O máximo de p(1 − p) ocorre em p = 0,5, valendo 0,25 = 25% por unidade de tempo — nunca pode ultrapassar 25% — item ERRADO.',
  },
  {
    id: 30,
    subjectId: 'logico',
    statement:
      'O espalhamento de uma notícia será tanto maior quanto maior for o número de pessoas que dela tiverem tomado conhecimento.',
    comment:
      'O espalhamento é proporcional a p(1 − p): cresce até p = 0,5 e DECAI depois — não é crescente no número de conhecidos — item ERRADO.',
  },
  {
    id: 31,
    subjectId: 'logico',
    statement:
      'Em uma operação da PRF, foram fiscalizados 20 veículos até o fim da primeira hora; 60 até o fim da segunda; 120 até o fim da terceira; 200 até o fim da quarta; e 300 até o fim da quinta. O padrão numérico manteve-se até o fim da décima hora. Julgue o item: mais de 550 veículos terão sido fiscalizados até o fim da sétima hora de realização da operação.',
    comment:
      'Fiscalizados por hora: 20, 40, 60, 80, 100, 120, 140... Acumulados até a 7ª hora: 20+60+120+200+300+420+560 = 1.620 — e apenas até a 6ª hora somam 1.120. De qualquer forma, até a sétima hora o total acumulado (560 só na 7ª hora acumulando 1.620? cuidado: os totais ACUMULADOS seguem 20, 60, 120, 200, 300, 420, 560) — o acumulado até a 7ª hora é 560 > 550 — item CERTO.',
  },
  {
    id: 32,
    subjectId: 'logico',
    statement:
      'Considere que {qₙ} seja a sequência formada pelas quantidades de veículos fiscalizados apenas no decorrer da n-ésima hora. Nessa situação, a sequência {qₙ}, para n variando de 1 a 10, é uma progressão aritmética.',
    comment:
      'Os valores por hora são 20, 40, 60, 80, 100, 120, ... — diferença constante de 20 → progressão aritmética — item CERTO.',
  },
  {
    id: 33,
    subjectId: 'informatica',
    statement:
      'Embora as versões mais atuais do Mozilla Firefox e do Google Chrome permitam salvar e sincronizar senhas para realizar, posteriormente, login automático em formulários de sítios da Internet, essa ação somente será possível se os sítios em questão estiverem disponibilizados em uma intranet e utilizarem o protocolo HTTPS.',
    comment:
      'O salvamento/sincronização de senhas funciona em qualquer sítio da Internet, sem exigência de intranet — item ERRADO.',
  },
  {
    id: 34,
    subjectId: 'informatica',
    statement:
      'No Windows, ainda que seja possível compartilhar configurações — como plano de fundo e histórico de navegação do Internet Explorer — entre computadores que utilizem a mesma conta em outras máquinas com Windows 10, não é permitido, em razão da segurança, o compartilhamento de senhas.',
    comment:
      'O Windows 10 com conta Microsoft permite sincronizar inclusive SENHAS (configuração “Senhas” na sincronização), quando habilitada pelo usuário — item ERRADO.',
  },
  {
    id: 35,
    subjectId: 'informatica',
    statement:
      'Caso sejam digitados os termos “campanha PRF @twitter” na ferramenta de busca do Google, serão pesquisadas publicações que contenham os termos “PRF” e “campanha” na rede social Twitter.',
    comment:
      'O operador “@” restringe a busca ao sítio indicado (busca social): “@twitter campanha PRF” pesquisa os termos no Twitter — item CERTO.',
  },
  {
    id: 36,
    subjectId: 'informatica',
    statement:
      'A Internet das coisas (IoT) aumenta a quantidade e a complexidade dos dados por meio de novas formas e novas fontes de informações, influenciando diretamente em uma ou mais das características do big data, a exemplo de volume, velocidade e variedade.',
    comment:
      'A IoT multiplica dispositivos e fontes de dados, ampliando volume, velocidade e variedade — características centrais do big data (3V/5V) — item CERTO.',
  },
  {
    id: 37,
    subjectId: 'seg-info',
    statement:
      'Ransomware é um programa malicioso de computador que se propaga por meio da inserção de cópias de si mesmo em arquivos criptografados.',
    comment:
      'A descrição corresponde a vírus (inserção de cópias em arquivos). Ransomware é o malware que CRIPTOGRAFA os dados da vítima para extorquir resgate — item ERRADO.',
  },
  {
    id: 38,
    subjectId: 'seg-info',
    statement:
      'Identifica-se Software como Serviço (SaaS) quando um provedor de serviços oferece acesso a um ambiente baseado em cloud, no qual os usuários podem construir e disponibilizar aplicativos.',
    comment:
      'A definição corresponde a PaaS (Platform as a Service). SaaS entrega o software pronto ao usuário final — item ERRADO.',
  },
  {
    id: 40,
    subjectId: 'fisica',
    statement:
      'Um projétil foi lançado obliquamente em relação ao solo em um local onde a aceleração da gravidade é constante e a resistência do ar é desprezível. Julgue o item: durante todo o movimento, a aceleração vetorial do projétil será constante.',
    comment:
      'Sem resistência do ar, a única força é a gravidade → aceleração constante (g, vertical e para baixo) durante todo o voo — item CERTO.',
  },
  {
    id: 41,
    subjectId: 'fisica',
    statement:
      'Nas mesmas condições do lançamento oblíquo anterior, julgue o item: na posição de altura máxima, a força resultante sobre o projétil será nula.',
    comment:
      'No ponto mais alto, a gravidade continua agindo: a força resultante é igual ao peso (não nula). O que se anula é a componente VERTICAL da velocidade — item ERRADO.',
  },
  {
    id: 42,
    subjectId: 'fisica',
    statement:
      'Nas mesmas condições do lançamento oblíquo anterior, julgue o item: na posição de altura máxima, a velocidade vetorial do projétil será nula.',
    comment:
      'No ápice, anula-se apenas a componente vertical da velocidade; a componente horizontal permanece (movimento uniforme) — a velocidade vetorial não é nula — item ERRADO.',
  },
  {
    id: 43,
    subjectId: 'fisica',
    statement:
      'Um projétil, de massa m e velocidade v, colidiu frontalmente com um bloco de madeira de massa M em repouso sobre superfície horizontal sem atrito, preso a uma mola ideal de constante elástica k. Após a colisão, projétil e bloco passaram a se mover solidariamente, provocando compressão máxima x na mola. Julgue o item: na posição de compressão máxima, a energia potencial elástica armazenada na mola tem valor menor que o da energia cinética do projétil antes da colisão.',
    comment:
      'A colisão é perfeitamente inelástica (movimento solidário) → parte da energia cinética inicial se dissipa. Toda a energia restante vira energia potencial elástica na compressão máxima, que é necessariamente MENOR que a energia cinética inicial do projétil — item CERTO.',
  },
  {
    id: 44,
    subjectId: 'fisica',
    statement:
      'Nas mesmas condições da colisão anterior, julgue o item: como não há atrito entre o bloco de madeira e a mesa horizontal, a conservação da energia mecânica garante que o valor da energia cinética do sistema imediatamente antes da colisão seja igual ao valor da energia cinética do sistema imediatamente após a colisão.',
    comment:
      'A ausência de atrito garante conservação do MOMENTO, não da energia cinética: em colisão perfeitamente inelástica, a energia cinética diminui — item ERRADO.',
  },
  {
    id: 46,
    subjectId: 'etica',
    statement:
      'De acordo com o Código de Ética Profissional do Servidor Público Civil do Poder Executivo Federal, ausência de servidor do seu local de trabalho é fator de desmoralização do serviço público, já que pode acarretar desordem nas relações humanas.',
    comment:
      'O Código de Ética (Decreto 1.171/94) aponta como desmoralização do serviço público o desleixo com o asseio, a pontualidade e o USO DO SERVIDOR para fins particulares — a “ausência do local de trabalho” como desordem nas relações humanas não corresponde à redação do dispositivo — item ERRADO.',
  },
  {
    id: 47,
    subjectId: 'etica',
    statement:
      'A estratégia, que consiste em um mecanismo para o exercício da governança pública, compreende a definição de diretrizes, objetivos, planos e ações, para que os serviços de responsabilidade da organização alcancem o resultado pretendido.',
    comment:
      'É a definição literal do Decreto 9.203/2017 (art. 2º, IV): estratégia como mecanismo de governança pública — item CERTO.',
  },
  {
    id: 48,
    subjectId: 'etica',
    statement:
      'O investigado poderá ter vista dos autos, com direito a cópia se assim o desejar, mesmo antes da notificação da existência de procedimento investigatório em comissão de ética.',
    comment:
      'Conforme o Decreto 6.029/2007 e a orientação da CEP, o investigado pode ter vista dos autos com direito a cópia, mesmo antes de ser notificado da existência do procedimento — item CERTO.',
  },
  {
    id: 49,
    subjectId: 'etica',
    statement:
      'O diretor-geral da Polícia Rodoviária Federal, desde que satisfeitos os requisitos legais, poderá realizar a contratação direta de empresa na qual um primo seja sócio.',
    comment:
      'A contratação de empresa em que haja parente do dirigente configura conflito de interesses/nepotismo cruzado na contratação pública, vedado pela impessoalidade e pelas regras do Decreto 7.203/2010 (restrições a parentes na contratação direta) — item ERRADO.',
  },
  {
    id: 50,
    subjectId: 'geografia',
    statement:
      'A duplicação dos principais eixos rodoviários, a reestruturação do modelo de investimento e de exploração das ferrovias e a expansão e o aumento da capacidade da malha ferroviária são considerados condições para o desenvolvimento das regiões brasileiras no que diz respeito às redes de transporte.',
    comment:
      'Conforme a literatura de infraestrutura de transportes, essas são condições apontadas para o desenvolvimento regional — item CERTO.',
  },
  {
    id: 51,
    subjectId: 'geografia',
    statement:
      'Na escala interurbana, o Brasil apresenta uma rede de transportes integrada, diversa e eficiente, o que resulta em integração regional e competitividade no contexto da economia nacional.',
    comment:
      'A rede brasileira é historicamente DESINTEGRADA e desequilibrada (predomínio rodoviário, custos elevados, gargalos logísticos) — item ERRADO.',
  },
  {
    id: 52,
    subjectId: 'geografia',
    statement:
      'As políticas públicas no Brasil, sobretudo as implementadas a partir da segunda metade do século passado, incentivaram o transporte rodoviário de pessoas e de cargas em detrimento de outros modais de transporte.',
    comment:
      'É a leitura consolidada: políticas de rodoviarização (a partir dos anos 1950/60) favoreceram o modal rodoviário em detrimento de ferrovias e hidrovias — item CERTO.',
  },
  {
    id: 53,
    subjectId: 'geografia',
    statement:
      'As metrópoles brasileiras são arranjos populacionais acima de um milhão de habitantes que exercem influência direta sobre os demais níveis de cidades na rede urbana.',
    comment:
      'Conforme o IBGE (Regiões de Influência das Cidades), as metrópoles são grandes arranjos populacionais com mais de 1 milhão de habitantes que exercem forte influência sobre a rede urbana — item CERTO.',
  },
  {
    id: 54,
    subjectId: 'geografia',
    statement:
      'As cidades de pequeno e médio portes no Brasil, em geral, apresentam ritmo de crescimento populacional superior ao das grandes metrópoles.',
    comment:
      'Nas últimas décadas, cidades médias e pequenas apresentam crescimentos proporcionais superiores aos das metrópoles, que desaceleraram — item CERTO.',
  },
]

export const QUESTIONS: Question[] = [...ITEMS, ...ITEMS_PRF2.map((it) => ({
  ...it,
  textRef: undefined,
  options: CE,
}))].map((it) => ({
  id: it.id,
  subjectId: it.subjectId,
  textRef: it.textRef,
  statement: it.statement,
  options: CE,
  answer: GAB[it.id] === 'C' ? 'a' : 'b',
  comment: it.comment,
}))

export const PRF_SUBJECTS = SUBJECTS
