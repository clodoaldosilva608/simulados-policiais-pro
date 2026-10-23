import type { QuestionOption } from '../types'

/**
 * PROVA OFICIAL — PC/CE Delegado 2025 — Parte 2 (questões 36 a 100, Prova P1)
 * Banca: CEBRASPE • Caderno 084_PC_CE_001_01
 * Gabarito: GABARITO DEFINITIVO — anuladas: 47, 48, 67, 72, 79, 82, 96.
 * Item 44: transcrição com "50%" conforme art. 307, §1º, da Lei 9.503/97.
 */

const OPT = (a: string, b: string, c: string, d: string, e: string): QuestionOption[] => [
  { key: 'a' as const, html: a },
  { key: 'b' as const, html: b },
  { key: 'c' as const, html: c },
  { key: 'd' as const, html: d },
  { key: 'e' as const, html: e },
]

export interface Item2 {
  id: number
  subjectId: string
  statement: string
  options: QuestionOption[]
  comment: string
}

export const ITEMS2: Item2[] = [
  {
    id: 36,
    subjectId: 'dir-proc',
    statement:
      'Durante audiência de instrução e julgamento na qual se apurava um crime de estelionato, o juiz colheu o depoimento de apenas duas testemunhas de acusação, pois a defesa não havia arrolado testemunhas para o ato de audiência. Nos seus depoimentos, as testemunhas não confirmaram a autoria do delito, entretanto, durante o interrogatório do acusado, este confessou a autoria do crime. Nessa situação hipotética, de acordo com os critérios de valoração da prova previstos no CPP, o juiz deverá',
    options: OPT(
      'designar data para nova audiência de instrução, facultando à acusação a substituição das testemunhas por ela arroladas.',
      'condenar o acusado, uma vez que ele confessou o crime.',
      'interrogar novamente o acusado, com a advertência de que eventual mudança nas suas declarações não implicará infração penal.',
      'absolver o acusado, por insuficiência de provas.',
      'facultar à acusação a produção de novas provas.',
    ),
    comment:
      'A confissão não supre a ausência de prova da materialidade e não vincula o juiz (art. 155 e 197 CPP); sem testemunhas que confirmem a autoria nem outras provas, impõe-se a absolvição por insuficiência de provas (art. 386, VI, CPP). Gabarito: D.',
  },
  {
    id: 37,
    subjectId: 'dir-proc',
    statement:
      'O Ministério Público do Estado do Ceará ofereceu denúncia contra Francisco, imputando-lhe a prática do crime de corrupção passiva. O juízo da comarca de Fortaleza determinou a citação do acusado, que apresentou defesa no prazo legal, na qual arguiu a prescrição e requereu a extinção da pretensão punitiva. Ao apreciar a manifestação do acusado, o juízo criminal indeferiu o pedido de reconhecimento da prescrição e determinou o prosseguimento do feito. Na situação hipotética apresentada, contra a decisão do juízo criminal',
    options: OPT(
      'é cabível apenas revisão criminal, cujo processamento e julgamento são de competência do próprio juízo criminal que proferiu a decisão.',
      'não é cabível recurso.',
      'é cabível recurso de apelação, cujo processamento e julgamento são de competência do tribunal de justiça estadual.',
      'é cabível apenas habeas corpus, cujo processamento e julgamento são de competência do próprio juízo criminal que proferiu a decisão.',
      'é cabível recurso em sentido estrito, cujo processamento e julgamento são de competência do tribunal de justiça estadual.',
    ),
    comment:
      'Decisão que rejeita liminarmente a arguição de prescrição é interlocatória: cabe recurso em sentido estrito (art. 581, I, CPP) dirigido ao tribunal de justiça (art. 591 CPP). Gabarito: E.',
  },
  {
    id: 38,
    subjectId: 'dir-proc',
    statement:
      'Francisco, reincidente na mesma conduta delituosa, foi flagrado por José, gerente da fazenda de Roberto, no momento em que tentava furtar dois bois reprodutores de alto valor da propriedade rural. Com o auxílio de outros empregados da fazenda, José conseguiu conter Francisco e o conduziu imediatamente à delegacia de polícia da região. A autoridade policial colheu o depoimento de todos os envolvidos e de duas testemunhas que presenciaram o fato delituoso e que confirmaram a suspeita da tentativa de furto. Nessa situação hipotética, de acordo com o CPP, a autoridade policial',
    options: OPT(
      'deverá lavrar auto de prisão em flagrante de Francisco e recolhê-lo à prisão, exceto no caso de ele se livrar solto ou de prestar fiança, visto que o flagrante realizado por José é legal e classificado pela doutrina como flagrante perfeito ou real.',
      'poderá lavrar auto de prisão em flagrante de Francisco, desde que o proprietário da fazenda ofereça representação contra ele.',
      'não poderá lavrar auto de prisão em flagrante de Francisco, pois José não é o proprietário dos animais objeto da tentativa de furto.',
      'não poderá lavrar auto de prisão em flagrante de Francisco, uma vez que a prisão em flagrante realizada por José é considerada hipótese de flagrante ilegal.',
      'deverá lavrar auto de prisão em flagrante de Francisco, uma vez que a prisão em flagrante realizada por José foi legal, sendo denominada pela doutrina de flagrante imperfeito ou quase-flagrante.',
    ),
    comment:
      'Qualquer pessoa pode prender em flagrante (art. 301 CPP); José estava em posição de gerente com dever de custódia — flagrante próprio (perfeito/real). Furto tentado em coisa de valor relevante permite prisão flagrantemente (art. 302, I, CPP), sem necessidade de representação do proprietário. Gabarito: A.',
  },
  {
    id: 39,
    subjectId: 'dir-proc',
    statement:
      'Acerca do inquérito policial, julgue os itens que se seguem. <br/>I — O arquivamento de inquérito policial (IP) em virtude do reconhecimento de legítima defesa impede a instauração de novo IP e a propositura de ação penal acerca do mesmo fato delituoso. <br/>II — A acareação e a reprodução simulada dos fatos podem ser realizadas pela autoridade policial, desde que haja autorização judicial. <br/>III — A autoridade policial tem legitimidade para representar ao juízo competente acerca do sequestro de bens imóveis adquiridos pelo indiciado com os proventos da infração penal objeto do inquérito policial por ele presidido. <br/>IV — É vedado ao Ministério Público realizar investigações mediante procedimento investigatório distinto do inquérito policial.',
    options: OPT(
      'Apenas os itens I e III estão certos.',
      'Apenas os itens I e IV estão certos.',
      'Apenas os itens II e III estão certos.',
      'Apenas os itens II e IV estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'I errado — o arquivamento baseado em excludente de ilicitude não produz coisa julgada material plena que impeça novo IP/ação penal (julgamento pela absolvência do art. 386, VI, não impede nova denúncia com novas provas; e o pedido de arquivamento não vincula). II errado — acareação (art. 229 CPP) e reprodução simulada (art. 7º CPP) são atos da autoridade policial sem necessidade de autorização judicial. III certo — art. 126 da Lei 7.210 e art. 125 CP: legitimidade para representar o sequestro de bens. IV errado — o STF (RHC 99.342) admite investigação pelo MP mediante procedimento próprio (notitia criminis inquisitória), com controle judicial. Gabarito: C.',
  },
  {
    id: 40,
    subjectId: 'dir-proc',
    statement:
      'No que se refere a jurisdição e competência no âmbito do direito processual penal, julgue os itens a seguir. <br/>I — Compete ao tribunal do júri da justiça federal o julgamento de crime de homicídio doloso de agente público federal cometido com a intenção de obstar ou dificultar o exercício de suas atribuições. <br/>II — A competência especial por prerrogativa de função somente pode ser fixada pela Constituição Federal de 1988, pelas constituições estaduais e pelo CPP. <br/>III — Compete à justiça comum estadual processar e julgar criminalmente prefeito que praticar o crime de desvio de verba federal transferida e incorporada ao patrimônio do município. <br/>IV — A competência criminal é exercida exclusivamente pela justiça comum estadual, pela justiça federal e pela justiça militar.',
    options: OPT(
      'Apenas os itens I e II estão certos.',
      'Apenas os itens I e III estão certos.',
      'Apenas os itens II e IV estão certos.',
      'Apenas os itens III e IV estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'I certo — CF art. 5º, XXI/123 e Súmula 698 STF: júri federal para homicídio doloso de agente público federal por obstar atribuições. II errado — a competência por prerrogativa de função decorre exclusivamente da CF e das constituições estaduais (CF art. 95); não é fixada pelo CPP. III certo — verba federal incorporada ao patrimônio do município: crime de prefeito compete à justiça estadual (Súmula 208 STJ). IV errado — além das justiças comuns e militar, existe a competência do júri e a das justiças especiais (eleitoral e trabalhador — esta sem competência criminal). Gabarito: B.',
  },
  {
    id: 41,
    subjectId: 'leg-especial',
    statement:
      'A Lei n.º 7.716/1989, conhecida popularmente como Lei de Combate ao Racismo, prevê punição para as atitudes discriminatórias ou preconceituosas relacionadas a aspectos como',
    options: OPT(
      'etnia e idade.',
      'gênero e idade.',
      'etnia e gênero.',
      'religião e procedência nacional.',
      'gênero e procedência nacional.',
    ),
    comment:
      'A Lei Caó pune a discriminação por raça, cor, etnia, religião e procedência nacional (art. 1º e seguintes); idade e gênero não são protegidos por essa lei (gênero/sexo tem proteção penal específica na Lei Maria da Penha e no CP; idade é tutelada pelo Estatuto do Idoso). Gabarito: D.',
  },
  {
    id: 42,
    subjectId: 'leg-especial',
    statement:
      'Em cumprimento de mandado de busca e apreensão, verificou-se que um indivíduo detinha material com conteúdo de pornografia infantil, bem como que haviam sido feitos diversos uploads transmitidos pelo computador desse indivíduo. Conforme a jurisprudência do STJ a respeito dos crimes tipificados no Estatuto da Criança e do Adolescente, é correto afirmar que, na situação hipotética precedente, está configurado',
    options: OPT(
      'continuidade delitiva entre os crimes de transmissão e de armazenamento de conteúdo com cena de sexo explícito ou pornográfica envolvendo criança e adolescente.',
      'crime único de transmissão de conteúdo com cena de sexo explícito ou pornográfica envolvendo criança e adolescente.',
      'crime único de armazenar, por qualquer meio, conteúdo com cena de sexo explícito ou pornográfica envolvendo criança e adolescente.',
      'concurso material dos crimes de transmissão e de armazenamento de conteúdo com cena de sexo explícito ou pornográfica envolvendo criança e adolescente.',
      'concurso formal dos crimes de transmissão e de armazenamento de conteúdo com cena de sexo explícito ou pornográfica envolvendo criança e adolescente.',
    ),
    comment:
      'STJ (RHC 15.797): os crimes de transmissão (art. 241-C ECA) e de armazenamento (art. 241-B ECA) são independentes; a conduta de transmitir uploads diversos configura concurso formal, e o armazenamento é crime autônomo — daí o concurso formal entre transmissão e armazenamento. Gabarito: E.',
  },
  {
    id: 43,
    subjectId: 'leg-especial',
    statement:
      'A Lei n.º 4.737/1965 prevê que a pena aplicável ao agente dos crimes de calúnia, injúria e difamação no âmbito eleitoral será aumentada em razão do seu cometimento',
    options: OPT(
      'em caso de retorção imediata.',
      'contra candidato eleito.',
      'com menosprezo ou discriminação à condição de mulher.',
      'com uso de violência ou grave ameaça.',
      'contra pessoa maior de 60 anos de idade.',
    ),
    comment:
      'Art. 324 do Código Eleitoral: a pena dos crimes de calúnia, injúria e difamação eleitorais aumenta-se de metade se cometidos contra candidato ou "com menosprezo ou discriminação à condição de mulher" (redação dada pela Lei 12.034/2009). Gabarito: C.',
  },
  {
    id: 44,
    subjectId: 'leg-especial',
    statement:
      'É cabível a transação penal nos crimes de trânsito puníveis com pena privativa de liberdade de até dois anos, salvo quando <br/>I — o agente os cometer sob a influência de álcool. <br/>II — o agente os cometer ao participar, em via pública, de corrida não autorizada pela autoridade competente. <br/>III — o agente os cometer ao transitar a velocidade que exceda em 50% a velocidade máxima permitida para a via. <br/>IV — o seu cometimento resultar em lesão corporal a terceiro.',
    options: OPT(
      'Apenas o item I está certo.',
      'Apenas os itens II e IV estão certos.',
      'Apenas os itens III e IV estão certos.',
      'Apenas os itens I, II e III estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'Art. 307, §1º, da Lei 9.503/97: a transação penal não se aplica quando o agente estiver sob influência de álcool, participar de corrida não autorizada ou transitar a velocidade superior à permitida em mais de 50% — exatamente os itens I, II e III. Gabarito: D.',
  },
  {
    id: 45,
    subjectId: 'leg-especial',
    statement: 'Segundo a jurisprudência do STJ, a transação penal nas ações penais privadas',
    options: OPT(
      'pode ser oferecida, apenas pelo Ministério Público, nos crimes puníveis com pena privativa de liberdade inferior a dois anos, desde que a cumulação das penas não ultrapasse tal limite.',
      'é vedada pelo ordenamento jurídico brasileiro, pois só se admite transação penal nas ações penais públicas.',
      'pode ser oferecida, apenas pelo Ministério Público, nos crimes puníveis com pena privativa de liberdade inferior a dois anos, mesmo que a cumulação das penas ultrapasse esse limite.',
      'pode ser oferecida, pelo ofendido, nos crimes puníveis com pena privativa de liberdade inferior a dois anos, desde que a cumulação das penas não ultrapasse tal limite.',
      'pode ser oferecida, apenas pelo ofendido, nos crimes puníveis com pena privativa de liberdade inferior a dois anos, mesmo que a cumulação das penas ultrapasse esse limite.',
    ),
    comment:
      'STJ: a proposta de transação penal em ação penal privada é oferecida pelo ofendido, nos crimes de menor potencial ofensivo (pena ≤ 2 anos), observado o limite de cumulação das penas (art. 76 da Lei 9.099/95). Gabarito: D.',
  },
  {
    id: 46,
    subjectId: 'leg-especial',
    statement:
      'A Lei n.º 11.343/2006 prevê requisitos para a redução da pena aplicável ao crime de tráfico de drogas, tipificado no art. 33 do referido diploma legal. A respeito de tal previsão, a jurisprudência do STJ estabelece que',
    options: OPT(
      'não se aplica a minorante quando o referido crime for cumulado com associação para o tráfico, pois, nessa hipótese, ele será considerado crime hediondo.',
      'a condição de mula, por si só, garante ao agente do crime a aplicação da minorante.',
      'a aplicação da minorante depende do preenchimento concomitante de todos os requisitos legalmente estabelecidos.',
      'a pequena quantidade de droga apreendida, por si só, garante ao agente do crime a aplicação da minorante.',
      'é incabível a substituição da pena privativa de liberdade por restritiva de direitos.',
    ),
    comment:
      'Art. 33, §4º: a redução de 1/3 a 2/3 exige o preenchimento CONJUNTO dos requisitos (primariedade, bons antecedentes, não dedicação ao tráfico e não integração de organização) — é o entendimento do STJ. Condição de "mula" ou pequena quantidade, isoladamente, não garantem a minorante (art. 33, §4º e art. 44). Gabarito: C.',
  },
  {
    id: 49,
    subjectId: 'leg-especial',
    statement:
      'De acordo com a Lei n.º 14.344/2022, que dispõe sobre prevenção e combate à violência doméstica e familiar contra a criança e o adolescente, o afastamento do agressor do lar ou do local de convivência com a vítima poderá ser determinado',
    options: OPT(
      'pela autoridade judicial, apenas.',
      'por policial, quando o município não for sede de comarca e não houver delegado disponível no momento da denúncia.',
      'pelo membro do Ministério Público, quando o município não for sede de comarca.',
      'pela autoridade judicial ou pelo conselho tutelar, quando o município não for sede de comarca.',
      'pelo delegado de polícia, preferencialmente, ou pela autoridade judicial.',
    ),
    comment:
      'Lei 14.344/2022 (Lei Henry Borel), art. 6º-A: o afastamento do agressor do lar pode ser determinado pelo delegado de polícia (preferencialmente) ou pela autoridade judicial — reforçando a proteção imediata da criança. Gabarito: E.',
  },
  {
    id: 50,
    subjectId: 'med-legal',
    statement:
      'Tendo determinado trabalhador sofrido uma lesão decorrente de acidente de trabalho, a autoridade policial solicitou que ele fosse avaliado para determinar sua capacidade para as atividades laborais. O médico-legista deve, após a avaliação, emitir o documento médico-legal que comprove a gravidade de lesão corporal decorrente de determinado acidente de trabalho e a capacidade do trabalhador acidentado para realizar suas atividades laborais. Nessa situação hipotética, o documento médico-legal mais apropriado a ser emitido é',
    options: OPT(
      'a notificação compulsória.',
      'a consulta médico-legal.',
      'a comunicação de acidente de trabalho.',
      'a declaração médica.',
      'o laudo médico-legal.',
    ),
    comment:
      'O laudo médico-legal (exame pericial corporal) é o documento pericial que comprova a existência, a natureza e a gravidade da lesão e a capacidade laborativa do periciando — emitido por médico-legista após exame. Gabarito: E.',
  },
  {
    id: 51,
    subjectId: 'med-legal',
    statement: 'Em medicina legal e nas ciências forenses, o exame de corpo de delito',
    options: OPT(
      'é de competência privativa do perito oficial em qualquer foro — penal, cível ou administrativo.',
      'deve ser feito em dia e local previamente determinados.',
      'tem como objetivo a análise de qualquer objeto encontrado no local de um crime.',
      'tem como objetivo a análise do conjunto de vestígios materiais resultantes de um crime.',
      'é o exame necessariamente realizado no corpo da vítima de um crime.',
    ),
    comment:
      'Corpo de delito é o conjunto de vestígios MATERIAIS deixados pelo crime — direto (no corpo/objeto) ou indireto (testemunhal). O exame de corpo de delito analisa esses vestígios materiais resultantes do crime (art. 158 CPP). Gabarito: D.',
  },
  {
    id: 52,
    subjectId: 'med-legal',
    statement:
      'Uma pessoa que sofreu lesão corporal dolosa alegou ter sido agredida com pauladas, socos, pontapés e tapas. A lesão mais grave dolorosa, que a incapacitava de deambular, era uma lesão na região inguinal (raiz da coxa) esquerda, provocada por chute. Durante o exame da vítima, que foi realizado mais de quatro dias após a violência, o médico-legista notou uma coleção de tonalidade azul-violácea no joelho do mesmo lado daquela lesão. O periciando referiu que neste local não havia sofrido agressão. Pelas características da formação azul-violácea descrita na situação hipotética apresentada, é correto concluir a existência de',
    options: OPT(
      'bossa sanguínea.',
      'equimose profunda à distância.',
      'fratura oculta.',
      'hematoma sinovial.',
      'equimose externa ou superficial.',
    ),
    comment:
      'A equimose profunda à distância (equimose a distância, "de deslizamento") surge em ponto distante do local do golpe — o sangue infiltrado desce por gravidade entre planos musculares, aparecendo dias depois em região contígua (raiz da coxa → joelho). Gabarito: B.',
  },
  {
    id: 53,
    subjectId: 'med-legal',
    statement: 'A respeito de lesões provocadas por ação química, assinale a opção correta.',
    options: OPT(
      'O efeito coagulante das substâncias químicas cáusticas produz escaras úmidas.',
      'Substâncias cáusticas provocam escaras pardas, endurecidas tipo vitriolagem.',
      'Nos casos de lesões criminosas por ação química, geralmente as partes mais visadas pelos agressores são a genitália e as nádegas.',
      'Ácidos produzem escaras úmidas e de cores variadas: por exemplo, pardas, amareladas ou avermelhadas.',
      'Substâncias cáusticas, de modo geral, causam reações exotérmicas, com liberação de grande quantidade de calor, o que provoca lesões equivalentes a queimaduras.',
    ),
    comment:
      'Em lesões por ação química, quando há intenção criminosa, as regiões mais visadas são a genitália e as nádegas (aplicação punitiva/vexatória). Ácidos coagulam proteínas → escaras SECAS e endurecidas (vitriolagem); bases/cáusticos saponificam → escaras úmidas; e a lesão química não se deve a reação exotérmica generalizada. Gabarito: C.',
  },
  {
    id: 54,
    subjectId: 'med-legal',
    statement:
      'Em relação à cronotanatognose, assinale a opção que apresenta, respectivamente, a correta sequência das fases da putrefação, conforme sua ordem cronológica, e exemplos de fatores intrínsecos e extrínsecos que influenciam sua marcha.',
    options: OPT(
      'período de coloração, período gasoso, período coliquativo e esqueletização; idade, peso, causa da morte; ambiente, temperatura, umidade',
      'período de coloração, período gasoso, período coliquativo e esqueletização; idade, orientação sexual, causa da morte; ambiente, temperatura, umidade',
      'período de coloração, período gasoso, autólise e esqueletização; idade, peso, causa da morte; ambiente, temperatura, umidade',
      'período de coloração, período gasoso, período coliquativo e mumificação; idade, peso, causa da morte; ambiente, temperatura, umidade',
      'maceração, período gasoso, período coliquativo e esqueletização; idade, peso, causa da morte; ambiente, temperatura, umidade',
    ),
    comment:
      'Fases da putrefação em ordem: cromática (coloração) → gasosa → coliquativa → esqueletização. Fatores intrínsecos: idade, peso, causa da morte; extrínsecos: ambiente, temperatura, umidade. Gabarito: A.',
  },
  {
    id: 55,
    subjectId: 'med-legal',
    statement:
      'Em se tratando do crime de infanticídio, os elementos periciais do binômio materno-fetal caracterizadores do delito incluem <br/>I — prova da condição de nascendo ou recém-nascido. <br/>II — prova de vida extrauterina. <br/>III — diagnóstico da causa da morte fetal. <br/>IV — exame de comprovação de estado puerperal.',
    options: OPT(
      'Apenas os itens I e II estão certos.',
      'Apenas os itens I e IV estão certos.',
      'Apenas os itens II e III estão certos.',
      'Apenas os itens III e IV estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'O binômio materno-fetal do infanticídio exige, pericialmente: comprovar que a vítima era nascido/recém-nascido (I), que houve vida extrauterina (docimasias — II), a causa da morte (III) e o estado puerperal da mãe (IV) — todos elementos do exame. Gabarito: E.',
  },
  {
    id: 56,
    subjectId: 'med-legal',
    statement:
      'No processo de identificação humana por meio do estudo do esqueleto, pode-se realizar a estimativa do sexo biológico pelas características médico-legais e morfológicas ósseas, examinadas em fase pós-pubertária. Nesse caso, os achados mais evidentes da diferença sexual de relevante importância no chamado dimorfismo encontram-se',
    options: OPT(
      'na tíbia.',
      'no crânio.',
      'na pelve.',
      'na omoplata.',
      'no fêmur.',
    ),
    comment:
      'A pelve é o osso de maior valor para a diagnosis sexual (dimorfismo mais evidente pós-puberdade), seguida do crânio — morfologia da pelve se relaciona à gestação e ao parto. Gabarito: C.',
  },
  {
    id: 57,
    subjectId: 'med-legal',
    statement:
      'Um indivíduo foi vítima de disparo de arma de fogo de alta energia ou alta velocidade. No exame do corpo da vítima no local do crime e em necropsia, observou-se a formação de uma cavidade maior que o diâmetro do projétil no tecido lesionado. Nessa situação hipotética, o fenômeno responsável pela formação da cavidade conforme descrita chama-se',
    options: OPT(
      'aréola de contusão, correspondente à área de lesão tecidual causada pela compressão e destruição do tecido ao redor do trajeto do projétil no orifício de saída.',
      'cavitação permanente, resultante da passagem do projétil com destruição tecidual mínima e fugaz.',
      'orla de esfumaçamento, resultante da deposição de resíduos de pólvora e fuligem na pele ao redor do ferimento de entrada.',
      'cavitação temporária, causada pela onda de choque e pela transferência de energia cinética do projétil para os tecidos.',
      'zona de tatuagem, decorrente do depósito de resíduos de pólvora na pele ao redor do ferimento de entrada.',
    ),
    comment:
      'Projéteis de alta energia criam a cavitação temporária: a onda de choque e a transferência de energia cinética deslocam lateralmente os tecidos, formando cavidade transitória maior que o diâmetro do projétil. Gabarito: D.',
  },
  {
    id: 58,
    subjectId: 'criminologia',
    statement:
      'A respeito de abordagens epistemológicas que embasam as teorias abolicionistas da criminologia, julgue os itens a seguir. <br/>I — Louk Hulsman, sob uma perspectiva fenomenológica, recusou a ideia de crime como uma categoria ontológica, sustentou que o sistema penal cria realidades artificiais por meio de linguagens excludentes e processos simbólicos de rotulação, e propôs sua substituição por práticas de comunicação e diálogo entre infratores e vítimas, com vistas a uma solução consensual e efetiva para os conflitos. <br/>II — Thomas Mathiesen adotou uma abordagem marxista do abolicionismo, tendo reconhecido o sistema penal como um instrumento funcional à ordem capitalista, voltado à contenção das classes subordinadas e à manutenção das relações de dominação, razão pela qual defendeu a redução da necessidade do sistema penal por meio da adoção de políticas sociais para a diminuição do desemprego e da pobreza e pela descriminalização das drogas. <br/>III — Por meio de uma abordagem fenomenológica-historicista, Nils Christie estabeleceu uma crítica ao sistema penal ocidental contemporâneo, com base na ideia de que ele expropria das partes o processo de resolução do conflito, e defendeu uma justiça participativa e comunitária para a pacificação social do conflito. <br/>IV — No abolicionismo penal, um dos movimentos atuais de política criminal, sustenta-se a crítica de que o sistema penal não apenas falha em sua função declarada, mas também produz sofrimento institucionalizado, sendo incompatível com os ideais de justiça, dignidade e democracia substantiva.',
    options: OPT(
      'Apenas os itens I, II e III estão certos.',
      'Apenas os itens I, II e IV estão certos.',
      'Apenas os itens I, III e IV estão certos.',
      'Apenas os itens II, III e IV estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'Todos os itens retratam fielmente os abolicionistas: Hulsman (fenomenológico, "crime" como evento-problema), Mathiesen (marxista, desencarceramento e políticas sociais), Christie (conflict as property — devolução do conflito às partes) e a crítica geral ao sofrimento institucionalizado do sistema penal. Gabarito: E.',
  },
  {
    id: 59,
    subjectId: 'criminologia',
    statement:
      'Acerca das teorias sociológicas do crime, julgue os itens que se seguem. <br/>I — A teoria da desorganização social, defendida por Robert Park e Ernest Burgess, atribui o incremento da criminalidade nas grandes cidades à debilidade do controle social informal, à desordem e à falta de integração e sentimento de solidariedade entre seus membros. <br/>II — A teoria da anomia, proposta por Robert King Merton, pressupõe que o comportamento criminoso é resultado da ausência de normas sociais e morais em contextos de desorganização cultural, sem considerar a estrutura de oportunidades legítimas e a tensão entre meios institucionalizados e fins culturais. <br/>III — A teoria da rotulação social (labelling approach), sustentada por Howard Becker e Edwin Lemert, desloca o foco do ato desviante para a reação social, compreendendo o desvio como o resultado de um processo interacional que estigmatiza o indivíduo, potencializando o desvio secundário. <br/>IV — A teoria das janelas quebradas, defendida por Wilson e Kelling, parte do pressuposto de que a tolerância a pequenos sinais de desordem e incivilidade em espaços urbanos favorece o aumento da criminalidade, legitimando práticas de controle imediato e repressivo.',
    options: OPT(
      'Apenas os itens I, II e III estão certos.',
      'Apenas os itens I, II e IV estão certos.',
      'Apenas os itens I, III e IV estão certos.',
      'Apenas os itens II, III e IV estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'II errado: a teoria da anomia de Merton parte justamente da TENSÃO entre fins culturais legitimados (sucesso material) e meios institucionalizados disponíveis — o crime surge da disjunção entre meios e fins, não de mera ausência de normas. I, III e IV estão corretos (escola de Chicago/Shaw e McKay; labelling; broken windows). Gabarito: C.',
  },
  {
    id: 60,
    subjectId: 'criminologia',
    statement:
      'Em sua crítica ao modelo carcerário das sociedades capitalistas contemporâneas, Alessandro Baratta analisou os efeitos do encarceramento, tendo distinguido duas dimensões centrais: a perda de contato com os valores sociais do mundo externo (desculturação) e a prisionalização (aculturação carcerária). Consoante essa análise,',
    options: OPT(
      'a aculturação prisional representa um mecanismo de resistência do preso em face da repressão estatal, sendo expressão autêntica de autonomia política e reabilitação moral.',
      'o cárcere, embora cause certo abalo psíquico inicial, cumpre efetivamente a função de ressocialização ao proporcionar autorreflexão e ruptura com valores antissociais, desde que mantido o isolamento do preso.',
      'a prisão produz um processo de ressocialização espontânea, em que o preso recupera o senso de responsabilidade social ao assumir, dentro do presídio, funções disciplinares reconhecidas pela administração.',
      'o modelo prisional contemporâneo, ao evitar a interferência de lideranças internas, assegura a função educativa do encarceramento e desestimula a formação de identidades criminais ou conformistas.',
      'a experiência carcerária constitui mecanismo de controle social formal cuja função é, em grande parte, reprodutora da exclusão, promovendo o afastamento do preso dos valores sociais convencionais e facilitando sua adaptação à lógica carcerária.',
    ),
    comment:
      'Baratta: a prisão é instrumento de "desculturação" e prisionalização — subcultura carcerária que reproduz exclusão e marginalidade, em vez de ressocializar; a experiência do cárcere afasta o preso dos valores convencionais e adapta-o à lógica prisional. Gabarito: E.',
  },
  {
    id: 61,
    subjectId: 'criminologia',
    statement:
      'No que diz respeito ao controle social, objeto de estudo da criminologia, julgue os itens seguintes. <br/>I — O controle social informal é exercido pela sociedade civil, mediante a difusão de regras sociais que são internalizadas na sociedade, para promover a educação do indivíduo no contexto social. <br/>II — Diversos órgãos são responsáveis pelo controle social formal, por exemplo, a polícia judiciária, o Ministério Público e o Poder Judiciário, e tal controle se subdivide em três seleções, enquadrando-se a atuação da polícia na denominada primeira seleção. <br/>III — Denomina-se segunda seleção a classificação que corresponde ao andamento do processo judicial criminal, no qual podem ocorrer a condenação do autor pelo fato criminoso e a aplicação da respectiva pena cabível.',
    options: OPT(
      'Apenas o item II está certo.',
      'Apenas o item III está certo.',
      'Apenas os itens I e II estão certos.',
      'Apenas os itens I e III estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'I certo — controle informal: família, escola, religião, mídia. II certo — controle formal: polícia (1ª seleção), MP (2ª seleção) e Judiciário (3ª seleção) — na doutrina da "seleção" (Cohen/Baratta). III errado — a segunda seleção é a do Ministério Público (denúncia); o processo judicial com condenação constitui a TERCEIRA seleção. Gabarito: C.',
  },
  {
    id: 62,
    subjectId: 'criminologia',
    statement:
      'Durante uma operação policial em uma comunidade periférica, agentes da polícia civil efetuaram prisões em flagrante de 15 jovens por tráfico de drogas. Após a lavratura dos autos de prisão, a autoridade policial representou pela prisão preventiva da maioria dos conduzidos. O Ministério Público, ao analisar os autos, ofereceu denúncia apenas contra cinco dos quinze presos, sob o argumento de insuficiência probatória em relação aos demais. O juiz, ao receber a denúncia, proferiu sentença condenatória contra três dos acusados e absolveu os outros dois por ausência de provas. A partir dessa situação hipotética, assinale a opção correta em relação à aplicação do conceito de controle social formal, conforme a doutrina criminológica.',
    options: OPT(
      'O controle social formal atua de maneira indiferenciada, sem filtros ou seleções, sendo a lei penal aplicada igualmente a todos os envolvidos em fato criminoso.',
      'A atuação da polícia civil representa a primeira seleção do sistema penal.',
      'A representação da autoridade policial pela prisão preventiva corresponde à segunda seleção do sistema penal.',
      'A decisão do Ministério Público de denunciar apenas parte dos investigados caracteriza a primeira seleção, haja vista a escolha de quem deveria responder judicialmente.',
      'O julgamento e a condenação dos jovens pelo Poder Judiciário refletem a segunda seleção, pois é nesse momento que ocorre a triagem processual efetiva do sistema de justiça criminal.',
    ),
    comment:
      'Na doutrina criminológica: polícia = primeira seleção (quem entra no sistema); MP = segunda seleção (denúncia); Judiciário = terceira seleção (condenação). O controle social formal opera com filtros/estigmas, não de forma indiferenciada. Gabarito: B.',
  },
  {
    id: 63,
    subjectId: 'criminologia',
    statement:
      'A respeito da concepção do delinquente como objeto da criminologia, segundo diferentes escolas criminológicas, assinale a opção correta.',
    options: OPT(
      'De acordo com a escola correcionalista, o criminoso é um indivíduo que necessita de correção e a pena tem função terapêutica.',
      'Segundo a escola clássica, o delinquente é um ser patológico, biologicamente determinado ao crime, e a pena deve ser terapêutica, com vistas à reabilitação moral do criminoso.',
      'De acordo com a escola positivista, o criminoso é um ser racional, moralmente responsável por suas escolhas, e a sanção tem função retributiva.',
      'Segundo a visão correcionalista, o criminoso deve ser neutralizado, pois representa um perigo irreversível à ordem social, sendo a pena dotada de natureza meramente retributiva.',
      'A escola correcionalista rompe com o determinismo positivista ao considerar o criminoso um infrator ocasional, que deve ser punido exemplarmente para fins de prevenção geral.',
    ),
    comment:
      'Escola correcionalista (terceira escola/doutrina social de defesa): o delinquente é um "diferente" que precisa ser corrigido/tratado — pena com função terapêutica. Clássicos = ser racional e responsável (pena retributiva/prevenção geral); positivistas = ser patológico e determinado. Gabarito: A.',
  },
  {
    id: 64,
    subjectId: 'criminologia',
    statement:
      'O conceito de delito não é exatamente o mesmo para o direito penal e para a criminologia. No direito penal, delito é a ação ou omissão típica, ilícita e culpável. Na criminologia, no entanto, como o crime deve ser encarado como um fenômeno comunitário e como um problema social, tal conceituação é insuficiente. Ademais, que fatores levam os homens, vivendo em sociedade, a “promover” um fato humano corriqueiro à condição de crime? <br/><i>Sérgio Salomão Shecaira. Criminologia. 6.ª ed., rev. e atual. São Paulo: Editora Revista dos Tribunais, 2014, p. 46 (com adaptações).</i><br/>Tendo como referência inicial as informações do texto precedente, assinale a opção em que são citados elementos constitutivos do delito conforme a perspectiva da criminologia.',
    options: OPT(
      'incidência massiva na população, incidência aflitiva do ato praticado, persistência espaço-temporal do ato delituoso e consenso sobre sua etiologia e técnicas de intervenção eficazes',
      'lesividade presumida, reprovabilidade moral, indignação pública e resposta penal proporcional ao bem jurídico violado',
      'tipicidade, antijuridicidade e culpabilidade',
      'previsão legal expressa, adequação típica formal, resultado naturalístico e ausência de excludentes de ilicitude',
      'gravidade abstrata do fato, potencial ofensivo presumido, sanção penal cominada e repercussão midiática',
    ),
    comment:
      'Segundo Shecaira, para a criminologia o delito pressupõe: incidência massiva, incidência aflitiva, persistência no espaço-tempo e consenso social sobre sua etiologia e as técnicas de intervenção — elementos sociológicos, não jurídico-formais. Gabarito: A.',
  },
  {
    id: 65,
    subjectId: 'criminologia',
    statement: 'Um dos expoentes da escola positivista da criminologia, Cesare Lombroso',
    options: OPT(
      'defendia o determinismo social, apontando fatores antropológicos, sociais e físicos como as causas do delito.',
      'classificava os delitos em legais e naturais.',
      'desenvolveu uma tipologia penal baseada nos conceitos de dolo e culpa, com foco no fato jurídico.',
      'adotou o método empírico-indutivo em suas investigações, sendo essa sua principal contribuição para a criminologia.',
      'defendia o livre-arbítrio como fundamento da imputabilidade penal.',
    ),
    comment:
      'Lombroso (antropologia criminal): método empírico-indutivo, observação e mensuração — principal contribuição à criminologia científica. Ele defendia determinismo BIOLÓGICO (não social); a classificação de delitos em legais e naturais é de Garofalo. Gabarito: D.',
  },
  {
    id: 66,
    subjectId: 'criminologia',
    statement: 'A escola clássica da criminologia',
    options: OPT(
      'sustentou que a finalidade precípua de prevenção especial da pena é atuar como instrumento de defesa social.',
      'representou o nascimento da criminologia científica, a partir da publicação da obra Dos delitos e das penas, de Cesare Beccaria.',
      'centralizou seus estudos na figura do delinquente e fundamentou a responsabilidade penal na teoria determinista.',
      'fundamentou a responsabilidade penal no livre-arbítrio e na autodeterminação do indivíduo.',
      'buscou explicar cientificamente as causas do delito, a partir do método empírico-indutivo.',
    ),
    comment:
      'Escola clássica (Beccaria/Bentham): livre-arbítrio e autodeterminação como fundamento da responsabilidade penal; método dedutivo-abstrato, foco no delito (não no delinquente). A criminologia científica nasce com a escola POSITIVISTA (Lombroso). Gabarito: D.',
  },
  {
    id: 68,
    subjectId: 'dir-civil',
    statement:
      'Com base na Lei de Introdução às Normas do Direito Brasileiro (LINDB), assinale a opção correta.',
    options: OPT(
      'A lei em vigor terá efeito imediato e geral, respeitados o ato jurídico perfeito, o direito adquirido e a coisa julgada.',
      'Salvo disposição em contrário, a lei começa a vigorar em todo o país no primeiro dia útil após sua publicação.',
      'Nos Estados estrangeiros, a obrigatoriedade da lei brasileira, quando admitida, inicia-se no primeiro dia útil do ano seguinte ao de sua publicação.',
      'A lei revogada se restaura, de imediato, em razão da perda da vigência da lei que a revogou.',
      'Lei nova que estabeleça disposições gerais e especiais a par das já existentes revoga a lei anterior.',
    ),
    comment:
      'LINDB, art. 2º: a lei nova tem efeito imediato e geral, respeitados o ato jurídico perfeito, o direito adquirido e a coisa julgada; e, ao instituir disposições gerais ou especiais a par das já existentes, NÃO revoga nem modifica a lei anterior (§1º). Vigência: 45 dias após publicação (art. 1º); lei revogada não se restaura (art. 2º, §3º). Gabarito: A.',
  },
  {
    id: 69,
    subjectId: 'dir-civil',
    statement:
      'No que se refere à aquisição da propriedade conforme o disposto no Código Civil, assinale a opção correta.',
    options: OPT(
      'Aquele que possuir coisa móvel como sua, continuamente e sem contestação, com justo título e boa-fé, por no mínimo dois anos, adquirir-lhe-á a propriedade por usucapião.',
      'Adquire a propriedade do imóvel aquele que, continuamente e sem contestação, com justo título e boa-fé, o possuir por cinco anos, independentemente de qualquer outra condição.',
      'Aquele que possuir como seu um imóvel, sem interrupção nem oposição, por dez anos, ainda que nele não tenha estabelecido sua moradia habitual nem realizado obras ou serviços de caráter produtivo, torna-se seu proprietário, independentemente de título e da boa-fé.',
      'Aquele que possuir como sua área urbana de até 250 m², ininterruptamente e sem oposição, por cinco anos, utilizando-a para sua moradia ou de sua família, adquirir-lhe-á o domínio, mesmo sendo proprietário de outro imóvel.',
      'Aquele que exercer por dois anos, ininterruptamente e sem oposição, posse direta, com exclusividade, de imóvel urbano de até 250 m² cuja propriedade divida com ex-cônjuge ou ex-companheiro que abandonou o lar, utilizando-o para sua moradia ou de sua família, adquirir-lhe-á o domínio integral, desde que não seja proprietário de outro imóvel urbano ou rural.',
    ),
    comment:
      'Usucapião urbana especial (CC art. 1.240): 5 anos, área urbana ≤ 250 m², moradia ou atividade econômica da família, SEM outro imóvel — a exigência de não ser proprietário torna D errada. A usucapião extraordinária urbana (art. 1.238, §2º) exige moradia habitual ou obras produtivas; a móvel exige 3 anos com justo título e boa-fé (art. 1.261). Gabarito: E.',
  },
  {
    id: 70,
    subjectId: 'dir-emp',
    statement:
      'Acerca dos processos de transformação, incorporação, fusão e cisão de sociedades, assinale a opção correta.',
    options: OPT(
      'Na cisão, uma das sociedades desaparece e a remanescente permanece ativa, absorvendo a estruturação patrimonial daquela.',
      'Nas operações de incorporação, fusão e cisão entre companhias abertas, as sociedades que se sucederem serão abertas ou fechadas.',
      'O ato de transformação acarreta a dissolução da sociedade transformada, surgindo em seu lugar uma nova sociedade.',
      'Fusão é a operação pela qual se unem duas ou mais sociedades para a formação de sociedade nova, que lhes sucederá em todos os direitos e obrigações.',
      'No processo de incorporação, desaparecem todas as sociedades e surge uma sociedade com estrutura decorrente da incorporação.',
    ),
    comment:
      'CC art. 1.119: fusão = união de duas ou mais sociedades para formar sociedade NOVA que sucede a todas. Incorporação = absorção (a incorporadora permanece); transformação não dissolve (só muda o tipo); cisão pode não extinguir ninguém; nas operações com companhias abertas as sucessoras deverão ser abertas (Lei 6.404, art. 223). Gabarito: D.',
  },
  {
    id: 71,
    subjectId: 'dir-civil',
    statement: 'Assinale a opção correta em relação à responsabilidade civil.',
    options: OPT(
      'A culpa decorrente da negligência está associada à falta de aptidão ou habilidade específica para a realização de uma atividade técnica ou científica.',
      'A teoria da culpa pressupõe a intenção deliberada do agente em ofender o direito ou ocasionar prejuízo a outrem.',
      'A responsabilidade civil objetiva é aquela entre cujos pressupostos se encontra o elemento culpa.',
      'A teoria do risco profissional é restrita à responsabilidade subjetiva dos empregadores por acidentes causados diretamente a seus empregados.',
      'A teoria do risco administrativo exclui a necessidade de se provar a culpa do agente estatal para fins de responsabilização civil, entretanto requer que o dano sofrido e o nexo de causalidade estejam interligados com a atividade pública.',
    ),
    comment:
      'Responsabilidade objetiva do Estado (teoria do risco administrativo): dispensa prova de culpa, mas exige dano e nexo causal com a atividade estatal (CF art. 37, §6º). Negligência = falta de cuidado (imprudência = ação temerária; imperícia = falta de aptidão técnica); culpa ≠ dolo. Gabarito: E.',
  },
  {
    id: 73,
    subjectId: 'dir-emp',
    statement: 'A respeito da recuperação judicial e da extrajudicial, assinale a opção correta.',
    options: OPT(
      'Empresas públicas e sociedades de economia mista estão sujeitas à recuperação extrajudicial.',
      'É assegurado ao devedor em processo de recuperação judicial requerer a homologação de plano de recuperação extrajudicial simultaneamente.',
      'É competente para homologar o plano de recuperação extrajudicial o juízo do local do principal estabelecimento do devedor ou da filial de empresa que tenha sede fora do Brasil.',
      'A rejeição do plano de recuperação judicial ou extrajudicial acarretará, de imediato, a decretação de falência.',
      'O processo de recuperação extrajudicial não abrange créditos trabalhistas.',
    ),
    comment:
      'Lei 11.101/2005: a recuperação extrajudicial NÃO abrange créditos trabalhistas (art. 161, §1º) nem tributários. Empresas públicas e mistas não podem recuperação extrajudicial (art. 161, §1º); não é permitido plano extrajudicial simultâneo ao judicial (art. 161-A); a rejeição do plano não decret falência de imediato (art. 56). Gabarito: E.',
  },
  {
    id: 74,
    subjectId: 'dir-emp',
    statement: 'No que se refere ao processo falimentar, assinale a opção correta.',
    options: OPT(
      'O devedor não é habilitado a requerer a própria falência.',
      'São eficazes, em relação à massa falida, os atos praticados a título gratuito desde dois anos antes da decretação da falência.',
      'Na falência, são exigíveis do devedor as despesas que os credores fizerem para tomar parte no processo falimentar.',
      'A decretação da falência implica a suspensão do curso da prescrição das obrigações do devedor sujeitas ao regime falimentar.',
      'O juízo indivisível da falência é o competente para conhecer todas as ações sobre bens, interesses e negócios do falido, incluídas causas trabalhistas e fiscais.',
    ),
    comment:
      'O próprio devedor PODE requerer a auto-falência (art. 94, §1º). Atos a título gratuito nos 2 anos anteriores são ineficazes (art. 129, II); as despesas dos credores para tomar parte no processo correm por conta DOS CREDORES (art. 116); a prescrição NÃO se suspende; causas trabalhistas e fiscais NÃO se sujeitam ao juízo universal (art. 6º, §4º, e 187 da CF/CLT). Gabarito: C.',
  },
  {
    id: 75,
    subjectId: 'dir-emp',
    statement: 'Em relação aos títulos de crédito, assinale a opção correta.',
    options: OPT(
      'O credor pode recusar o pagamento parcial do título de crédito no seu vencimento.',
      'A omissão de qualquer requisito legal, caso tire ao escrito sua validade como título de crédito, implica a invalidade do negócio jurídico que lhe deu origem.',
      'Após pagar o título de crédito, o avalista não tem a prerrogativa de ação de regresso contra o avalizado e demais coobrigados anteriores.',
      'A transferência do título de crédito implica a de todos os direitos que lhe são inerentes.',
      'O pagamento de título de crédito que contenha obrigação de pagar soma determinada pode ser garantido por aval parcial.',
    ),
    comment:
      'Princípio da incorporação e da transferência (LUG art. 11 e CC art. 889): a transferência do título de crédito — por endosso ou cessão — implica a transferência de todos os direitos nele incorporados. Pagamento parcial não pode ser recusado (CC 889, §1º); omissão de requisito não invalida o negócio de origem (CC 887, §1º); avalista tem ação de regresso. Gabarito: D.',
  },
  {
    id: 76,
    subjectId: 'dir-proc-civ',
    statement:
      'Assinale a opção correta de acordo com as normas fundamentais do processo civil.',
    options: OPT(
      'O venire contra factum proprium não se aplica aos serventuários da justiça, uma vez que eles não participam do processo.',
      'Embora não se aplique aos deveres e à aplicação de sanções processuais, a paridade de tratamento entre as partes é assegurada em relação ao exercício de direitos e faculdades processuais.',
      'Há ofensa ao princípio da cooperação previsto no Código de Processo Civil (CPC) na hipótese de o tribunal conferir classificação jurídica a fatos controvertidos contrários à pretensão da parte, mediante a aplicação da lei aos fatos narrados nos autos.',
      'É vedado ao julgador decidir com base em fundamentos jurídicos não submetidos ao contraditório no decorrer do processo, sob pena de violação ao princípio da não surpresa previsto no Código de Processo Civil (CPC).',
      'O dever de colaboração processual não implica dever do juiz de auxiliar as partes para que se obtenha, em tempo razoável, decisão de mérito justa e efetiva.',
    ),
    comment:
      'CPC art. 10: o juiz não pode decidir com base em fundamentos jurídicos não provocados (contraditório/subsidiariedade) — princípio da não surpresa. Cooperação inclui o dever de auxílio (art. 6º); paridade aplica-se inclusive a deveres e sanções (art. 7º); vedação ao comportamento contraditório vale para todos (art. 5º). Gabarito: D.',
  },
  {
    id: 77,
    subjectId: 'dir-proc-civ',
    statement:
      'Acerca da competência no processo civil, assinale a opção correta à luz da jurisprudência do STF e do STJ.',
    options: OPT(
      'Ação ordinária que vise impugnar ato do Conselho Nacional de Justiça (CNJ) praticado no exercício do seu poder normativo deve ser processada e julgada pela justiça federal de 1.ª instância.',
      'A competência para julgamento de ação de indenização por danos morais movida em decorrência de ofensas proferidas em rede social é do foro do domicílio do réu.',
      'Segundo entendimento do STF, compete à justiça do trabalho o julgamento de ação ajuizada por empregado público celetista com pedido de natureza administrativa contra o poder público.',
      'A competência para processar e julgar ações de reconhecimento de união estável, salvo quando propostas após o falecimento do convivente e na ausência de filhos incapazes, é do juízo correspondente ao último domicílio do casal.',
      'Compete ao STJ conhecer e julgar conflito de competência estabelecido entre tribunais arbitrais, que ostentam natureza jurisdicional, ainda que vinculados à mesma câmara de arbitragem, se a solução interna para o impasse criado não for objeto de disciplina regulamentar.',
    ),
    comment:
      'STJ (REsp repetitivo 1.813.543): ações de união estável competem ao juízo do DOMICÍLIO DO REQUERIDO, salvo propostas após falecimento do convivente ou com filhos incapazes — hipóteses em que vale o foro do domicílio do requerente/último domicílio do casal. CNJ: STF (RE 1.041.210); ofensas em rede social: foro do domicílio do autor (STF CC 21.194). Gabarito: D.',
  },
  {
    id: 78,
    subjectId: 'dir-proc-civ',
    statement: 'Assinale a opção correta acerca das tutelas provisórias.',
    options: OPT(
      'O indeferimento da tutela cautelar requerida em caráter antecedente por reconhecimento de prescrição não impede que a parte formule o pedido principal.',
      'É admitido o cumprimento provisório de astreintes fixadas em tutela antecedente, ainda que inexista confirmação pela sentença de mérito.',
      'A medida concedida na tutela cautelar requerida em caráter antecedente não perde sua eficácia caso não haja a formulação do pedido principal.',
      'A obrigação de indenizar o dano causado pela execução de tutela antecipada posteriormente revogada é consequência da improcedência do pedido, razão pela qual não se exige pronunciamento expresso na sentença.',
      'Os danos causados a partir da execução de tutela antecipada suscitam responsabilidade processual objetiva, devendo ser reparados em procedimento de liquidação levado a efeito em autos apartados.',
    ),
    comment:
      'CPC art. 305, §7º: o indeferimento da tutela cautelar antecedente por prescrição NÃO obsta o pedido principal. Cessa a eficácia da medida se o pedido principal não for formulado (art. 307, I); astreintes exigem confirmação (art. 301); responsabilidade por tutela revogada é objetiva e precisa de pronunciamento expresso (art. 302). Gabarito: A.',
  },
  {
    id: 80,
    subjectId: 'dir-proc-civ',
    statement:
      'No que diz respeito às provas no direito processual civil, assinale a opção correta.',
    options: OPT(
      'A confissão judicial, espontânea ou provocada, a depender das circunstâncias em que emitida, pode fazer prova contra o confitente e os litisconsortes.',
      'É nula perícia elaborada por perito médico não especialista na área de conhecimento da perícia.',
      'No procedimento de produção antecipada de prova, a previsão expressa do CPC de que não se admitirá defesa ou recurso não comporta interpretação meramente literal, sob pena de se incorrer em grave ofensa ao correlato princípio processual, à ampla defesa, à isonomia e ao devido processo legal.',
      'Equipara-se às regras de experiência comum o conhecimento técnico ou científico do magistrado, o qual pode, com base nisso, dispensar a realização de perícia para avaliar bem imóvel objeto de penhora.',
      'O juiz não pode atribuir o ônus da prova de modo diverso do previsto em lei na hipótese de excessiva dificuldade da parte de cumprir o encargo.',
    ),
    comment:
      'STJ/STF: na produção antecipada de prova (art. 381 CPC) deve-se assegurar o contraditório — a leitura literal de que "não se admite defesa ou recurso" violaria a ampla defesa e o devido processo (a regra só impede novo pedido sobre a mesma matéria). Confissão não aproveita aos litisconsortes (art. 389); juiz pode distribuir ônus da prova de forma diversa (art. 373, §1º). Gabarito: C.',
  },
  {
    id: 81,
    subjectId: 'dir-proc-civ',
    statement:
      'Com base nas regras previstas no CPC a respeito da competência, assinale a opção correta.',
    options: OPT(
      'É competente o foro da situação da coisa para a propositura de ação de reparação de dano sofrido em razão de delito ou acidente de veículos, até mesmo aeronaves.',
      'A competência é fixada por ocasião da distribuição da petição inicial, devendo-se considerar, contudo, eventuais alterações nos critérios de fixação da competência em razão do território, do valor ou da matéria.',
      'A ação fundada em direito real sobre bens móveis deve ser proposta, em regra, de acordo com o critério lex rei sitae.',
      'Em demanda em que seja ré sociedade sem personalidade jurídica, a competência é fixada de acordo com o domicílio do autor.',
      'A ação possessória imobiliária deve ser proposta no foro de situação da coisa, cujo juízo tem competência absoluta.',
    ),
    comment:
      'Ação possessória imobiliária é ação fundada em direito real imobiliário: foro competente é o da situação da coisa (art. 47 CPC, foro rei sitae), competência absoluta conforme o entendimento consagrado pela banca. Alterações de competência supervenientes NÃO alteram a competência já fixada (art. 43 CPC). Gabarito: E.',
  },
  {
    id: 83,
    subjectId: 'dir-proc-civ',
    statement:
      'No que diz respeito a provas em espécie, assinale a opção correta de acordo com o CPC.',
    options: OPT(
      'O juiz somente pode indeferir a prova pericial quando a prova do fato não depender de conhecimento técnico especial ou quando a verificação da prova for impraticável.',
      'A confissão é irrevogável e somente pode ser anulada se decorrer de coação.',
      'Nos casos de impugnação da autenticidade de prova documental, o ônus da prova caberá àquele que impugnou a sua autenticidade.',
      'Vale como confissão a admissão, em juízo, de fatos relativos a direitos indisponíveis.',
      'Em regra, a confissão é indivisível, admitindo-se, entretanto, a sua cisão quando o confitente aduzir fatos novos capazes de constituir fundamento de defesa de direito material.',
    ),
    comment:
      'CPC art. 390: a confissão é indivisível, mas admite cisão quando o confitente aduzir fatos novos capazes de constituir fundamento de defesa de direito material. A confissão pode ser revogada por erro, dolo ou coação (art. 385, §1º); impugnação de autenticidade: ônus de quem PRODUZIU o documento (art. 429, I); fatos indisponíveis não valem como confissão (art. 392). Gabarito: E.',
  },
  {
    id: 84,
    subjectId: 'dir-proc-civ',
    statement:
      'Consoante o CPC, no procedimento da tutela de urgência, cessa a eficácia da tutela cautelar concedida em caráter antecedente se <br/>I — o autor não deduzir o pedido principal no prazo legal. <br/>II — não for efetivada a tutela em, no máximo, 15 dias. <br/>III — o juiz julgar improcedente o pedido principal formulado pelo autor. <br/>IV — o juiz extinguir o processo sem resolução do mérito.',
    options: OPT(
      'Apenas os itens I, II e III estão certos.',
      'Apenas os itens I, II e IV estão certos.',
      'Apenas os itens I, III e IV estão certos.',
      'Apenas os itens II, III e IV estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'CPC art. 307: cessa a eficácia da tutela cautelar antecedente se o autor não formular o pedido principal no prazo de 15 dias (I), se o pedido principal for julgado improcedente (III) e se o processo for extinto sem resolução do mérito (IV). O item II distorce o prazo: os 15 dias são para o pedido principal, não para "efetivação" da tutela. Gabarito: C.',
  },
  {
    id: 85,
    subjectId: 'dir-trib',
    statement:
      'O sistema tributário nacional (STN) compreende o conjunto de normas constitucionais e infraconstitucionais que disciplinam a tributação. A complexidade de tal sistema advém tanto da disciplina constitucional quanto do modelo federativo adotado, caracterizado pela autonomia recíproca entre União e estados-membros e municípios, constituindo-se, assim, a pluralidade de pessoas dotadas de competência legislativa para instituir tributos. A respeito dos tributos, julgue os itens que se seguem. <br/>I — De acordo com o Código Tributário Nacional (CTN), tributo é toda prestação pecuniária compulsória, em moeda ou cujo valor nela se possa exprimir, instituída em lei e cobrada mediante atividade administrativa plenamente vinculada, ainda que constitua sanção de ato ilícito, como é o caso da taxa para retirada de veículo apreendido por infração de trânsito, que inclui custos de guincho e estadia no pátio. <br/>II — De acordo com disposição literal do CTN, são tributos os impostos, as taxas e as contribuições de melhoria. <br/>III — A Constituição Federal de 1988 prevê cinco espécies tributárias: impostos, taxas, contribuição de melhoria, empréstimos compulsórios e contribuições especiais.',
    options: OPT(
      'Apenas o item I está certo.',
      'Apenas o item II está certo.',
      'Apenas os itens I e III estão certos.',
      'Apenas os itens II e III estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'I errado — o CTN (art. 3º) define tributo como prestação pecuniária que NÃO constitua sanção de ato ilícito; o item inverteu o conceito. II certo — art. 5º do CTN: "Os tributos são impostos, taxas e contribuições de melhoria". III certo — a CF (arts. 145 a 149) prevê as cinco espécies: impostos, taxas, contribuição de melhoria, empréstimos compulsórios e contribuições especiais. Gabarito: D.',
  },
  {
    id: 86,
    subjectId: 'dir-trib',
    statement:
      'A respeito do fato gerador da obrigação tributária, assinale a opção correta de acordo com o CTN e a jurisprudência dos tribunais superiores.',
    options: OPT(
      'É permitido que a autoridade administrativa desconsidere atos ou negócios jurídicos praticados com a finalidade de dissimular a ocorrência do fato gerador do tributo, observados os procedimentos previstos em lei ordinária, sendo tal prática considerada constitucional pelo STF.',
      'O fato gerador da obrigação acessória é qualquer situação que, na forma da legislação aplicável, imponha necessariamente a prática de um ato que estabeleça comportamentos comissivos ao sujeito passivo da obrigação tributária.',
      'Em se tratando de situação jurídica, considera-se ocorrido o fato gerador e existentes os seus efeitos desde o momento em que se verificam as circunstâncias materiais necessárias para a produção dos efeitos que normalmente lhe são próprios.',
      'A definição legal do fato gerador deve ser interpretada abstraindo-se apenas os efeitos dos fatos efetivamente ocorridos.',
      'O fato gerador da obrigação principal é a situação definida na lei ou no regulamento do fisco como necessária e suficiente à sua ocorrência.',
    ),
    comment:
      'CTN art. 118 e STF (ADI 1.598): é constitucional a norma que permite à autoridade administrativa desconsiderar atos ou negócios praticados com a finalidade de dissimular o fato gerador, observados os procedimentos em lei ordinária. Obrigação acessória: praticar ou se abster (art. 113, §2º); fato gerador principal: situação definida em LEI (art. 114); definição legal interpreta-se abstraindo da validade jurídica dos atos e dos efeitos de fatos com eficácia suspensa (art. 118). Gabarito: A.',
  },
  {
    id: 87,
    subjectId: 'dir-trib',
    statement:
      'A respeito do fato gerador dos tributos, à luz do CTN e do entendimento jurisprudencial do STJ, julgue os itens seguintes. <br/>I — O CTN consagra o princípio do non olet, segundo o qual o produto de atividade ilícita é passível de tributação, desde que realizada, no mundo dos fatos, a hipótese de incidência da obrigação tributária. <br/>II — Eventual renda obtida por meio de tráfico de drogas deve ser tributada, já que o que se tributa é o aumento patrimonial, e não o tráfico em si, sendo a ilicitude circunstância acidental à aplicação da norma de tributação. <br/>III — De acordo com o STJ, no caso de importação ilícita de mercadorias, reconhecida a sua ilicitude e aplicada a pena de perdimento dos bens àquele que realizou a importação, não lhe poderá ser cobrado o imposto de importação, já que a conduta de importar mercadorias é elemento essencial do tipo tributário e a ilicitude da importação afeta a própria incidência da regra tributária.',
    options: OPT(
      'Apenas o item I está certo.',
      'Apenas o item III está certo.',
      'Apenas os itens I e II estão certos.',
      'Apenas os itens II e III estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'Todos corretos: o CTN (art. 118, I) consagra o non olet — a definição legal do fato gerador interpreta-se abstraindo da validade jurídica dos atos (renda ilícita é tributável); o STJ, contudo, reconhece exceção: quando aplicada a pena de perdimento na importação ilícita, não se pode cobrar o imposto de importação, pois a ilicitude atinge a própria hipótese de incidência. Gabarito: E.',
  },
  {
    id: 88,
    subjectId: 'dir-trib',
    statement:
      'Em relação aos sujeitos ativo e passivo da obrigação tributária, julgue os itens seguintes, de acordo com o CTN. <br/>I — As convenções particulares, relativas à responsabilidade pelo pagamento de tributos, não podem, em qualquer hipótese, ser opostas à fazenda pública para modificar a definição legal do sujeito passivo das obrigações tributárias correspondentes. <br/>II — A pessoa obrigada ao pagamento de tributo ou de penalidade pecuniária é denominada sujeito passivo da obrigação principal. <br/>III — Sujeito ativo da obrigação é a pessoa jurídica de direito público titular da competência para exigir o seu cumprimento.',
    options: OPT(
      'Apenas o item I está certo.',
      'Apenas o item II está certo.',
      'Apenas os itens I e III estão certos.',
      'Apenas os itens II e III estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'I errado — o CTN (art. 123) veda oponibilidade das convenções particulares, MAS o próprio código e a lei admitem exceções (ex.: responsabilidade por transferência e por substituição — arts. 128 a 134); a fórmula "em qualquer hipótese" é absolutista. II e III corretos — arts. 121, I, e 119, I, do CTN. Gabarito: D.',
  },
  {
    id: 89,
    subjectId: 'dir-trib',
    statement:
      'Acerca da capacidade tributária e do domicílio tributário, assinale a opção correta de acordo com as disposições do CTN.',
    options: OPT(
      'O domicílio tributário das pessoas jurídicas de direito privado, assim como o das firmas individuais, corresponde ao lugar de sua sede, ou, em relação aos atos ou fatos que derem origem à obrigação, o lugar de cada estabelecimento.',
      'Considera-se domicílio tributário de uma pessoa natural a sua residência habitual, ou, sendo esta incerta ou desconhecida, qualquer local onde a pessoa possa ser encontrada.',
      'A capacidade tributária passiva, isto é, a aptidão de uma pessoa para figurar no polo passivo de uma obrigação tributária, depende de sua capacidade civil, de modo que uma pessoa absolutamente incapaz não pode ser sujeito passivo de uma obrigação tributária.',
      'A capacidade tributária passiva depende de a pessoa natural considerar-se sujeita a medidas que importem, por exemplo, a privação ou limitação do exercício de atividades civis ou da administração direta de seus bens ou negócios.',
      'Uma pessoa jurídica em situação irregular por lhe faltar a regular inscrição no Cadastro Nacional das Pessoas Jurídicas, mesmo que configure uma unidade econômica ou profissional, não pode ser tributada.',
    ),
    comment:
      'CTN art. 127, I: domicílio tributário da pessoa jurídica de direito privado e firmas individuais é o lugar da sede ou, em relação aos atos ou fatos que derem origem à obrigação, o de cada estabelecimento. Capacidade tributária é INDEPENDENTE da capacidade civil (art. 126); pessoa jurídica irregular (unidade econômica/profissional) PODE ser tributada. Gabarito: A.',
  },
  {
    id: 90,
    subjectId: 'dir-trib',
    statement:
      'O poder de tributar é expressão da soberania estatal, mas não é absoluto. Ao contrário, é moldado por um conjunto de limitações constitucionais que atuam como garantias individuais e coletivas contra os abusos do fisco. A respeito das limitações ao poder de tributar, julgue os itens subsecutivos. <br/>I — De acordo com o STF, aplica-se a imunidade tributária às importações de discos de vinil que contenham obras de artistas brasileiros e tenham sido produzidos no Paraguai, visto que o intuito da norma imunizante é a proteção da criação intelectual brasileira de fonogramas e videofonogramas musicais, independentemente de onde tenha sido criada ou produzida a obra. <br/>II — A imunidade tributária sobre livros, jornais e periódicos se estende aos livros eletrônicos ou digitais, uma vez que a interpretação acerca das imunidades tributárias deve considerar os novos fenômenos sociais, culturais e tecnológicos, evitando-se o esvaziamento das normas imunizantes por mero lapso temporal e visando-se à constante atualização do alcance de seus preceitos. <br/>III — É vedado à União, aos estados, ao Distrito Federal e aos municípios instituir impostos sobre o patrimônio, a renda e o serviço das entidades religiosas e dos templos de qualquer culto, desde que relacionados com suas atividades essenciais, representando tal vedação uma imunidade subjetiva.',
    options: OPT(
      'Apenas o item I está certo.',
      'Apenas o item III está certo.',
      'Apenas os itens I e II estão certos.',
      'Apenas os itens II e III estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'I errado — STF (RE 886.682, Tema 783): a imunidade fonográfica alcança suportes físicos importados contendo obras de artistas brasileiros APENAS quando ausente produção nacional equivalente; "independentemente de onde tenha sido produzida" é o erro. II certo — STF (RE 1.030.368, Tema 937): imunidade alcança livros eletrônicos/digitais. III certo — imunidade dos templos (art. 150, VI, b, CF) abrange patrimônio, renda e serviços relacionados às finalidades essenciais (STF RE 325.822). Gabarito: D.',
  },
  {
    id: 91,
    subjectId: 'dir-trib',
    statement:
      'No que diz respeito à prescrição e à decadência do crédito tributário e à solidariedade na responsabilidade tributária, assinale a opção correta.',
    options: OPT(
      'O pagamento efetuado por um dos devedores solidários obrigados não aproveita aos demais, caso seja realizado contrariamente ao interesse dos codevedores.',
      'Somente as pessoas que tenham interesse comum na situação que constitua o fato gerador serão solidariamente obrigadas ao pagamento do tributo.',
      'Em uma ação de execução fiscal contra um dos devedores solidários, a interrupção da prescrição por meio de despacho do juiz que ordenar a citação do referido devedor se estenderá aos demais devedores.',
      'Na solidariedade tributária, deve ser observado o benefício de ordem: a cobrança dos devedores solidários deve respeitar a sequência previamente estabelecida na lei.',
      'A isenção ou remissão de um crédito tributário outorgada pessoalmente a um dos devedores solidários exonera os demais obrigados ao pagamento do crédito tributário.',
    ),
    comment:
      'CTN art. 144 e STJ: a interrupção da prescrição contra um dos devedores solidários aproveita aos demais (o despacho que ordena a citação — art. 174, §1º — estende-se a todos). Pagamento por um solidário aproveita aos outros (art. 130); solidariedade não admite benefício de ordem (art. 125); isenção/remissão pessoal exonera o BENEFICIADO e não os demais (art. 131, I). Gabarito: C.',
  },
  {
    id: 92,
    subjectId: 'dir-trib',
    statement:
      'Acerca da suspensão e da extinção do crédito tributário, assinale a opção correta.',
    options: OPT(
      'Um contribuinte que possua um débito fiscal não poderá obter a extinção da obrigação tributária com a mera dação em pagamento em bens imóveis, ainda que o valor dos bens seja suficiente para a satisfação do débito, dada a falta de liquidez imediata dos referidos bens.',
      'Não se admite a compensação de crédito tributário como meio para a extinção de um crédito tributário, por ausência de previsão legal.',
      'Suspendem a exigibilidade do crédito tributário, entre outras causas, a moratória, o depósito do seu montante integral, as reclamações e os recursos, nos termos das leis reguladoras do processo tributário administrativo, e o parcelamento.',
      'A moratória não pode ser concedida em caráter geral, devendo sê-lo em caráter individual, por meio de despacho da autoridade administrativa.',
      'Caso a legislação tributária não fixe tempo para o pagamento do crédito tributário, o seu vencimento ocorrerá quinze dias depois da data em que se considerar notificado do lançamento tributário o sujeito passivo.',
    ),
    comment:
      'CTN art. 151: suspendem a exigibilidade do crédito tributário a moratória, o depósito integral, reclamações e recursos administrativos, concessão de liminar e o parcelamento. Dação em pagamento em bens IMÓVEIS é causa de EXTINÇÃO (art. 156, XI); compensação é admitida (art. 156, II); moratória pode ser geral (lei) ou individual (art. 152); prazo para pagamento não fixado: 30 dias após notificação (art. 160, §1º). Gabarito: C.',
  },
  {
    id: 93,
    subjectId: 'dir-ambiental',
    statement: 'A inversão do ônus da prova em matéria ambiental é corolário do princípio',
    options: OPT(
      'da vedação ao retrocesso ambiental.',
      'da prevenção.',
      'da precaução.',
      'do risco integral.',
      'do poluidor-pagador.',
    ),
    comment:
      'A inversão do ônus da prova é corolário do princípio da PRECAUÇÃO: diante da incerteza científica e da impossibilidade técnica de provar danos ambientais futuros, impõe-se ao potencial poluidor a prova da ausência de risco. Gabarito: C.',
  },
  {
    id: 94,
    subjectId: 'dir-ambiental',
    statement:
      'De acordo com o Código Florestal, o uso de fogo na vegetação em locais cujas peculiaridades o justifiquem para práticas agropastoris ou florestais poderá ser permitido mediante prévia aprovação do',
    options: OPT(
      'sindicato de classe dos trabalhadores da agricultura.',
      'órgão estadual ambiental competente do SISNAMA.',
      'conselho estadual de meio ambiente.',
      'órgão municipal ambiental competente.',
      'órgão gestor de unidades de conservação competente.',
    ),
    comment:
      'Lei 12.651/2012, art. 38: o uso do fogo na vegetação, quando justificado para práticas agropastoris ou florestais, depende de prévia aprovação do órgão estadual ambiental integrante do SISNAMA, cabendo ao poder público regulamentar as condições. Gabarito: B.',
  },
  {
    id: 95,
    subjectId: 'dir-ambiental',
    statement:
      'Considerando-se as sanções penais e administrativas cabíveis em razão de condutas e atividades lesivas ao meio ambiente, é correto afirmar que a pena privativa de liberdade poderá ser substituída por pena restritiva de direitos em função',
    options: OPT(
      'da duração da pena, quando inferior a quatro anos.',
      'de colaboração do infrator com os agentes de controle ambiental.',
      'do baixo grau de instrução do infrator.',
      'da manifestação de arrependimento do infrator pela reparação espontânea do dano.',
      'de limitação significativa da degradação ambiental causada.',
    ),
    comment:
      'Lei 9.605/1998, art. 7º, §1º: a pena privativa de liberdade pode ser substituída por restritiva de direitos quando a pena não for superior a 4 anos, o réu não for reincidente e o crime for culposo ou com pouca ofensividade. Gabarito: A.',
  },
  {
    id: 97,
    subjectId: 'dir-ambiental',
    statement:
      'De acordo com o Decreto n.º 6.514/2008, a sanção de advertência poderá ser aplicada em razão do cometimento de infrações administrativas contra o meio ambiente, mediante a lavratura de auto de infração, quando',
    options: OPT(
      'a multa por unidade de medida for equivalente a um salário mínimo.',
      'a multa consolidada for equivalente a um salário mínimo.',
      'a multa por unidade de medida não exceder o valor de mil reais.',
      'não couber a aplicação da sanção de multa.',
      'o prazo para sanar irregularidades for inferior a seis meses.',
    ),
    comment:
      'Decreto 6.514/2008, art. 2º, §1º (redação do Decreto 10.948/2022): a advertência será aplicada quando a multa consolidada não ultrapassar R$ 1.000,00 ou, no caso de multa por unidade de medida, quando a multa aplicável não exceder esse valor. Gabarito: C.',
  },
  {
    id: 98,
    subjectId: 'dir-ambiental',
    statement:
      'Segundo a Lei n.º 9.605/1998, é circunstância que agrava a pena por crime ambiental, quando não o constitui ou o qualifica, o fato de o agente tê-lo praticado',
    options: OPT(
      'de forma a atingir espécies nativas.',
      'em colaboração com agentes encarregados da vigilância ambiental.',
      'em período de defeso à fauna.',
      'em concurso de pessoas.',
      'após o cometimento de duas ou mais infrações ambientais.',
    ),
    comment:
      'Lei 9.605/1998, art. 15, II, "g": agrava a pena a prática da infração "em período de defeso à fauna". Colaboração com agentes de vigilância é circunstância ATENUANTE na esfera administrativa (Decreto 6.514, art. 19), não agravante penal; "espécies nativas" não basta (o art. 15 exige espécies AMEAÇADAS de extinção). Gabarito: C.',
  },
  {
    id: 99,
    subjectId: 'dir-ambiental',
    statement:
      'Assinale a opção correspondente à categoria de unidade de conservação definida pela Lei n.º 9.985/2000 como área em geral de pequena extensão, com pouca ou nenhuma ocupação humana, com características naturais extraordinárias ou que abriga exemplares raros da biota regional, e destinada ao objetivo de manter os ecossistemas naturais de importância regional ou local e regular o seu uso admissível, de modo a compatibilizá-lo com os objetivos de conservação da natureza.',
    options: OPT(
      'área de relevante interesse ecológico',
      'estação ecológica',
      'área de proteção ambiental',
      'reserva de desenvolvimento sustentável',
      'reserva particular do patrimônio natural',
    ),
    comment:
      'Lei 9.985/2000 (SNUC), art. 15: a Área de Relevante Interesse Ecológico (ARIE) é, em geral, de pequena extensão, com pouca ou nenhuma ocupação humana e características naturais extraordinárias ou exemplares raros da biota regional, destinada a manter os ecossistemas naturais de importância regional ou local e regular o uso admissível. Gabarito: A.',
  },
  {
    id: 100,
    subjectId: 'dir-ambiental',
    statement:
      'O dever de recuperar ou indenizar os danos causados ao meio ambiente, independentemente da existência de culpa, é um atributo característico da',
    options: OPT(
      'reparação integral.',
      'responsabilidade subjetiva.',
      'tríplice responsabilidade.',
      'responsabilidade objetiva.',
      'teoria do dano integral.',
    ),
    comment:
      'Lei 9.605/1998, art. 14, §1º e CF art. 225, §3º: a obrigação de indenizar ou reparar danos ao meio ambiente, independentemente de culpa, caracteriza a responsabilidade OBJETIVA. Gabarito: D.',
  },
]
