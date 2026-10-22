import type { Question, Subject } from '../types'

/**
 * PROVA OFICIAL — Concurso Público de Delegado de Polícia Civil do Ceará (PC/CE 2025)
 * Banca: CEBRASPE • Caderno 084_PC_CE_001_01 • Prova Objetiva P1
 * Gabarito: GABARITO DEFINITIVO (Cebraspe) — questões 5, 11, 18 e 30 anuladas.
 * Transcrição das questões 1 a 35 (P1).
 */

const SUBJECTS: Subject[] = [
  { id: 'leg-ce', name: 'Legislação do Ceará', professor: '' },
  { id: 'dir-const', name: 'Direito Constitucional', professor: '' },
  { id: 'dir-adm', name: 'Direito Administrativo', professor: '' },
  { id: 'dir-penal', name: 'Direito Penal', professor: '' },
  { id: 'dir-proc', name: 'Direito Processual Penal', professor: '' },
  { id: 'leg-especial', name: 'Legislação Especial', professor: '' },
]

const OPT = (a: string, b: string, c: string, d: string, e: string) => [
  { key: 'a' as const, html: a },
  { key: 'b' as const, html: b },
  { key: 'c' as const, html: c },
  { key: 'd' as const, html: d },
  { key: 'e' as const, html: e },
]

/** Gabarito definitivo (X = anulada, não incluída) */
const GAB: Record<number, 'a' | 'b' | 'c' | 'd' | 'e'> = {
  1: 'd', 2: 'd', 3: 'b', 4: 'b', 6: 'e', 7: 'b', 8: 'd', 9: 'c', 10: 'a',
  12: 'd', 13: 'b', 14: 'a', 15: 'b', 16: 'a', 17: 'e', 19: 'b',
  20: 'a', 21: 'd', 22: 'e', 23: 'd', 24: 'c', 25: 'c', 26: 'd', 27: 'c', 28: 'b',
  29: 'b', 31: 'c', 32: 'c', 33: 'd', 34: 'e', 35: 'c',
}

interface Item {
  id: number
  subjectId: string
  statement: string
  options: { key: 'a' | 'b' | 'c' | 'd' | 'e'; html: string }[]
  comment: string
}

const ITEMS: Item[] = [
  {
    id: 1,
    subjectId: 'leg-ce',
    statement: 'Nos termos da Constituição do Estado do Ceará, o Conselho de Segurança Pública é órgão com funções',
    options: OPT(
      'deliberativas e fiscalizadoras, goza de autonomia administrativa e financeira, e dispõe da dotação orçamentária que lhe seja diretamente vinculada.',
      'consultivas e deliberativas, tem autonomia administrativa e financeira, e dispõe da dotação orçamentária que lhe seja diretamente vinculada.',
      'consultivas e deliberativas, tem autonomia administrativa e financeira, e goza de iniciativa para sua proposta orçamentária.',
      'consultivas e fiscalizadoras, goza de autonomia administrativa e financeira, e dispõe da dotação orçamentária que lhe seja diretamente vinculada.',
      'consultivas e fiscalizadoras, tem autonomia administrativa e financeira, e goza de iniciativa para sua proposta orçamentária.',
    ),
    comment: 'A Constituição do Estado do Ceará define o Conselho de Segurança Pública como órgão de funções consultivas e fiscalizadoras, com autonomia administrativa e financeira e dotação orçamentária diretamente vinculada. Gabarito: D.',
  },
  {
    id: 2,
    subjectId: 'dir-const',
    statement: 'Se determinado estado da Federação publicar lei que trate de procedimento em matéria processual, ela será',
    options: OPT(
      'constitucional, por tratar de matéria legislativa concorrente da União, dos estados e dos municípios.',
      'inconstitucional, por tratar de matéria de competência legislativa exclusiva da União.',
      'inconstitucional, por tratar de matéria de competência legislativa concorrente da União e do Distrito Federal.',
      'constitucional, por tratar de matéria legislativa concorrente da União, dos estados e do Distrito Federal.',
      'constitucional, caso estabeleça normas específicas sobre o tema e já exista lei da União estabelecendo suas normas gerais.',
    ),
    comment: 'Direito processual é competência legislativa PRIVATIVA da União (art. 22, I, CF), com a delegação do art. 22, § único. Sem lei delegada, lei estadual sobre procedimento processual seria inconstitucional — a alternativa correta é a que aponta a competência privativa da União. Gabarito: D.',
  },
  {
    id: 3,
    subjectId: 'leg-ce',
    statement: 'Conforme previsto na Constituição do Estado do Ceará, o Ministério Público nesse estado possui estrutura organizacional com as curadorias',
    options: OPT(
      'da segurança pública, do consumidor, dos grupos socialmente discriminados, de acidente do trabalho e de ausentes e incapazes.',
      'do meio ambiente, do consumidor, dos grupos socialmente discriminados, de acidente do trabalho e de ausentes e incapazes.',
      'do meio ambiente, da segurança pública, dos grupos socialmente discriminados, de acidente do trabalho e de ausentes e incapazes.',
      'do meio ambiente, do consumidor, dos grupos socialmente discriminados, de acidente do trabalho e da segurança pública.',
      'do meio ambiente, do consumidor, dos grupos socialmente discriminados, da segurança pública e de ausentes e incapazes.',
    ),
    comment: 'A Constituição do Ceará organiza as curadorias do MP estadual nas áreas de meio ambiente, consumidor, grupos socialmente discriminados, acidente do trabalho e ausentes e incapazes. Gabarito: B.',
  },
  {
    id: 4,
    subjectId: 'dir-penal',
    statement:
      'Considere que as condutas apresentadas nos itens a seguir tenham sido praticadas de maneira intencional. I — Frederico ofereceu a um agente público, indiretamente, benefício indevido, em proveito de outra pessoa, a fim de que o agente público se abstivesse de praticar um ato no desempenho de suas funções oficiais. II — Josias, agente público, aceitou benefício indevido para si, a fim de se abster de praticar um ato no desempenho de suas funções oficiais. III — Emílio, servidor da administração pública indireta, nomeou seu cônjuge para o exercício de cargo em comissão na mesma pessoa jurídica em que é lotado. A partir das informações apresentadas, é correto afirmar que são previstas como infrações penais na Convenção de Palermo as condutas de',
    options: OPT(
      'Frederico, Josias e Emílio.',
      'Frederico e Josias, somente.',
      'Josias e Emílio, somente.',
      'Emílio, somente.',
      'Josias, somente.',
    ),
    comment:
      'A Convenção de Palermo (corrupção) tipifica como infrações penais a promessa/offering indireto de vantagem para que agente público se abstenha de ato de ofício (Frederico) e a aceitação de vantagem indevida pelo agente público para se abster (Josias). A nepotismo/nomeação de cônjuge (Emílio) não é tipificada pela Convenção como infração penal. Gabarito: B.',
  },
  {
    id: 6,
    subjectId: 'dir-const',
    statement:
      'No início de determinada sessão legislativa, uma proposta de emenda constitucional (PEC) e um projeto de lei (PL) foram rejeitados. Na situação apresentada, segundo a Constituição Federal de 1988, ainda na mesma sessão legislativa,',
    options: OPT(
      'as matérias constantes da PEC e do PL poderão ser objeto de novas propostas, desde que apresentadas por 2/3 dos membros de qualquer das casas do Congresso Nacional.',
      'as matérias constantes da PEC e do PL poderão ser objeto de novas propostas, desde que apresentadas pela maioria absoluta dos membros de qualquer das casas do Congresso Nacional.',
      'as matérias constantes da PEC e do PL não poderão ser objeto de novas propostas.',
      'a matéria constante da PEC, mas não a do PL, pode ser objeto de nova proposta, desde que apresentada pela maioria absoluta dos membros de qualquer das Casas do Congresso Nacional.',
      'a matéria constante do PL, mas não a da PEC, pode ser objeto de nova proposta, desde que apresentada pela maioria absoluta dos membros de qualquer das casas do Congresso Nacional.',
    ),
    comment:
      'O art. 60, §5º, da CF veda a reapresentação da PEC rejeitada na mesma sessão legislativa — mas essa vedação é específica da emenda constitucional; o projeto de lei rejeitado pode ser reapresentado normalmente. Gabarito: E.',
  },
  {
    id: 7,
    subjectId: 'dir-const',
    statement: 'A impetração de mandado de segurança coletivo por entidade de classe',
    options: OPT(
      'condiciona-se ao requisito de que a pretensão veiculada seja do interesse de toda a categoria.',
      'independe de autorização dos seus associados.',
      'condiciona-se ao requisito de a entidade estar constituída e em funcionamento há pelo menos um ano.',
      'depende da autorização de 2/3 dos seus associados.',
      'depende da autorização da maioria absoluta dos seus associados.',
    ),
    comment:
      'O art. 5º, LXX, “b”, da CF: o MS coletivo pode ser impetrado por entidade de classe em favor de seus associados, INDEPENDENDO de autorização deles. Gabarito: B.',
  },
  {
    id: 8,
    subjectId: 'dir-const',
    statement:
      'Ana, pessoa idosa, passou a ter incapacidade civil absoluta; Maria, com 21 anos de idade, passou a ter incapacidade civil absoluta; Lúcio, chileno naturalizado brasileiro, teve sua naturalização cancelada por sentença transitada em julgado. Em relação aos direitos políticos das citadas pessoas nas situações apresentadas, é correto afirmar que',
    options: OPT(
      'Ana e Lúcio tiveram seus direitos políticos cassados.',
      'Lúcio teve seus direitos políticos suspensos.',
      'Ana e Lúcio tiveram seus direitos políticos suspensos.',
      'Lúcio perdeu seus direitos políticos.',
      'Maria e Lúcio tiveram seus direitos políticos cassados.',
    ),
    comment:
      'O cancelamento de naturalização por sentença transitada em julgado é hipótese de PERDA de direitos políticos (art. 12, §2º, e art. 15, II, CF) — não suspensão nem cassação. Incapacidade civil absoluta não afeta direitos políticos (Ana e Maria não têm restrição de direitos políticos por isso). Gabarito: D.',
  },
  {
    id: 9,
    subjectId: 'dir-const',
    statement: 'De acordo com a Constituição Federal de 1988, constitui crime inafiançável e imprescritível, sujeito à pena de reclusão,',
    options: OPT(
      'a ação de grupos armados contra a ordem constitucional.',
      'o tráfico ilícito de entorpecentes.',
      'a prática de racismo.',
      'o terrorismo.',
      'a prática de tortura.',
    ),
    comment:
      'O art. 5º, XLII, da CF: a prática do racismo constitui crime INAFIANÇÁVEL e IMPRESCRITÍVEL, sujeito à pena de reclusão. O racismo é o único crime imprescritível na Constituição. Gabarito: C.',
  },
  {
    id: 10,
    subjectId: 'dir-adm',
    statement:
      'A Convenção de Mérida prevê que cada Estado-parte, quando for apropriado e de conformidade com os princípios fundamentais de seu ordenamento jurídico, procure adotar sistemas de convocação, contratação, retenção, promoção e aposentadoria de funcionários públicos e, quando proceder, de outros funcionários públicos não empossados, ou manter e fortalecer tais sistemas, os quais devem estar baseados em princípios de',
    options: OPT(
      'eficiência e transparência.',
      'moralidade e transparência.',
      'legalidade e eficiência.',
      'moralidade e impessoalidade.',
      'legalidade e impessoalidade.',
    ),
    comment:
      'O art. 7º, 1, “a”, da Convenção de Mérida exige sistemas baseados em princípios de EFICIÊNCIA e TRANSPARÊNCIA. Gabarito: A.',
  },
  {
    id: 12,
    subjectId: 'dir-adm',
    statement:
      'A respeito do processo administrativo disciplinar (PAD), assinale a opção correta de acordo com o entendimento jurisprudencial do STF.',
    options: OPT(
      'Não é possível que prova produzida em PAD declarado nulo seja aproveitada para a instrução de novo PAD, ainda que sejam assegurados o contraditório e a ampla defesa.',
      'No ato de instauração do PAD, a autoridade instauradora deve nomear advogado para que este apresente a defesa técnica do servidor público, caso contrário haverá ofensa à Constituição Federal de 1988.',
      'No ato de instauração do PAD, o servidor público deve nomear advogado para que este ofereça sua defesa técnica, para fins de garantia da ampla defesa e do contraditório.',
      'A falta de defesa técnica por advogado não ofende o princípio da ampla defesa, previsto na Constituição Federal de 1988.',
      'A falta de intimação do servidor público após a apresentação do relatório final pela comissão processante configura ofensa às garantias do contraditório e da ampla defesa.',
    ),
    comment:
      'Segundo a jurisprudência do STF, no PAD a defesa técnica por advogado NÃO é indispensável — o servidor pode se defender pessoalmente (autodefesa), que é ampla e suficiente. Gabarito: D.',
  },
  {
    id: 13,
    subjectId: 'dir-adm',
    statement:
      'Em relação à tomada de decisão coordenada em processo administrativo federal, assinale a opção correta à luz da Lei n.º 9.784/1999.',
    options: OPT(
      'A decisão coordenada é aplicável a processos administrativos federais de licitação relacionados ao poder sancionador ou em que estejam envolvidas autoridades de Poderes distintos.',
      'A decisão coordenada poderá ser tomada sempre que for justificável pela relevância da matéria e houver discordância que prejudique a celeridade do processo administrativo decisório.',
      'A decisão coordenada exclui a responsabilidade originária de cada órgão ou atividade envolvida.',
      'Decisão coordenada é aquela tomada quando da atuação compartilhada entre instâncias de natureza interinstitucional ou intersetorial com a finalidade de incrementar a complexidade do processo administrativo.',
      'Devem participar da decisão coordenada em processo administrativo federal todas as autoridades e agentes decisórios, excluindo-se os responsáveis pela instrução técnico-jurídica do processo em questão.',
    ),
    comment:
      'O art. 6º-A da Lei 9.784/99 (incluído pela Lei 13.726/2018): a decisão coordenada pode ser adotada quando for justificável pela relevância da matéria e houver discordância que prejudique a celeridade do processo decisório. Gabarito: B.',
  },
  {
    id: 14,
    subjectId: 'dir-adm',
    statement:
      'Considerando as disposições da Lei n.º 9.784/1999 acerca do benefício da prioridade de tramitação em processo administrativo federal, assinale a opção correta.',
    options: OPT(
      'Os autos dos processos administrativos dos beneficiários da prioridade de tramitação devem receber identificação própria que evidencie a tramitação prioritária.',
      'A autoridade administrativa não é obrigada a determinar providências relacionadas à prioridade de tramitação em procedimentos administrativos em que figurem pessoas vulneráveis, podendo ser aplicado o juízo de conveniência e oportunidade.',
      'O citado benefício é garantido ao interessado com diagnóstico de HIV devidamente emitido pela medicina especializada, salvo se o diagnóstico da doença for dado no decurso do processo.',
      'O rol de possíveis beneficiários da prioridade na tramitação de processo administrativo limita-se a pessoas com deficiência, física ou mental, e pessoas com idade superior a 60 anos.',
      'A pessoa interessada no benefício em questão não é obrigada a juntar prova de sua condição, pois esse ônus é da administração pública.',
    ),
    comment:
      'O art. 6º-D da Lei 9.784/99 determina que os autos recebam identificação própria e destacada evidenciando a tramitação prioritária. O rol inclui doença degenerativa, HIV, portadores de deficiência, maiores de 60 anos, e é ampliado; a prova da condição é ônus do interessado. Gabarito: A.',
  },
  {
    id: 15,
    subjectId: 'dir-adm',
    statement:
      'Um delegado de polícia foi condenado por ter cometido, de forma culposa, ato de improbidade administrativa que causou dano ao erário. A conduta foi praticada antes da vigência da Lei n.º 14.230/2021, que alterou a Lei n.º 8.429/1992 (Lei de Improbidade Administrativa). Após a prolação da decisão condenatória e antes do seu trânsito em julgado, o STF fixou várias teses no Tema 1.199, de repercussão geral. Julgue os itens: I — Se a condenação houver apontado culpa gravíssima na responsabilidade subjetiva, o delegado de polícia continuará responsabilizado pelo ato de improbidade administrativa. II — O delegado de polícia poderá ser beneficiado pela retroatividade da norma benéfica, prevista na Lei n.º 14.230/2021, uma vez que não houve o trânsito em julgado da decisão condenatória. III — Deverá ser aplicado ao processo o novo regime prescricional de 8 anos previsto na Lei n.º 14.230/2021, que deve ser observado imediatamente, conforme o princípio do tempus regit actum. Assinale a opção correta.',
    options: OPT(
      'Apenas o item I está certo.',
      'Apenas o item II está certo.',
      'Apenas os itens I e III estão certos.',
      'Apenas os itens II e III estão certos.',
      'Todos os itens estão certos.',
    ),
    comment:
      'Tema 1.199/STF: a Lei 14.230/21 aplica-se imediatamente às condenações não transitadas em julgado (retroatividade da norma mais benéfica) — mas a conduta culposa deixou de ser improbidade, sendo exigido dolo; a tese da “culpa gravíssima” foi superada como critério de responsabilização autônoma. Aplica-se a regra processual transitória; o prazo prescricional segue regras próprias do art. 23 e ss. da Lei 8.429/92 com a nova lei. Apenas o item II está certo. Gabarito: B.',
  },
  {
    id: 16,
    subjectId: 'dir-adm',
    statement:
      'Com base no entendimento do STJ acerca da intervenção do Estado na propriedade privada, assinale a opção correta.',
    options: OPT(
      'É indevida indenização por expropriação de imóvel adquirido após a imposição de limitação administrativa, pois se presume que as restrições de uso e gozo da propriedade já tenham sido consideradas na fixação do preço do imóvel.',
      'No ato de tombamento geral, devem constar individualizados os bens abarcados pelo tombo, pois as restrições não se estendem à totalidade dos imóveis situados na área tombada.',
      'Qualquer construção acrescida ao conjunto arquitetônico tombado deverá ser demolida, mesmo se inexistir ofensa à harmonia estética.',
      'Será devida, em regra, indenização por limitação administrativa ao direito de edificar advinda da criação de área non aedificandi, mesmo que não fique demonstrado prejuízo causado ao proprietário.',
      'O tombamento do Plano Piloto de Brasília está restrito à sua estrutura física, não abrangendo seu singular conceito paisagístico e urbanístico.',
    ),
    comment:
      'STJ: imóvel adquirido depois de imposta a limitação administrativa não gera direito à indenização, pois se presume que o comprador considerou as restrições no preço. Tombamento geral não exige individualização; a construção que ofende a harmonia é demolida; limitação non aedificandi em regra não indeniza sem prejuízo concreto; o tombamento do Plano Piloto abrange o conjunto paisagístico. Gabarito: A.',
  },
  {
    id: 17,
    subjectId: 'dir-adm',
    statement:
      'De acordo com o entendimento do STJ em relação aos bens públicos, assinale a opção correta.',
    options: OPT(
      'Construção ou atividade irregular em bem de uso comum do povo não caracteriza dano presumido, devendo ser demonstrado o prejuízo em concreto.',
      'A União perderá o domínio das terras devolutas situadas em faixas de fronteira e indispensáveis à defesa destas se houver inércia ou tolerância em relação aos possuidores ou detentores, nos casos de concessão pelos estados.',
      'Os bens pertencentes às sociedades de economia mista sujeitos a destinação pública estão suscetíveis à prescrição aquisitiva.',
      'Imóvel vinculado ao Sistema Financeiro de Habitação (SFH) não está afetado à prestação de serviço público e, por isso, não deve ser tratado como bem público; logo, está sujeito à usucapião.',
      'É possível a usucapião do domínio útil de bem público sobre o qual tenha sido instituída a enfiteuse, por não ter havido prejuízo ao Estado com a mera substituição do enfiteuta pelo usucapiente.',
    ),
    comment:
      'STJ: imóvel vinculado ao SFH não está afetado à prestação de serviços públicos nem sujeito a regime jurídico de direito público, por isso NÃO é bem público e admite usucapião. Gabarito: D.',
  },
  {
    id: 19,
    subjectId: 'dir-adm',
    statement:
      'Assinale a opção correta no que se refere ao entendimento do STJ acerca do PAD.',
    options: OPT(
      'A mera ausência do servidor acusado ou de seu procurador gera nulidade da colheita de depoimento de testemunha, mesmo que um deles tenha sido intimado sobre a realização de audiência no PAD.',
      'Se o interrogatório deixar de ocorrer por contribuição do próprio investigado, não será caracterizado o cerceamento de defesa, ante a impossibilidade de ele se favorecer de uma nulidade a que ele próprio deu causa.',
      'Se o advogado constituído para a oitiva de testemunhas não for intimado, haverá nulidade do PAD, mesmo que o servidor investigado tenha sido intimado.',
      'É necessária a intimação pessoal do servidor da decisão proferida no PAD, mesmo se este for representado por advogado, sendo insuficiente a publicação no Diário Oficial.',
      'Haverá cerceamento de defesa no PAD se a oitiva de testemunha deixar de ser realizada ante a ausência da testemunha, mesmo quando intimada para a audiência.',
    ),
    comment:
      'STJ: ninguém pode se beneficiar da própria torpeza — se o interrogatório não ocorreu por contribuição do próprio investigado, não há cerceamento de defesa. Nas demais opções, a jurisprudência dispensa a intimação pessoal quando o servidor tem advogado e não gera nulidade a ausência do acusado regularmente intimado. Gabarito: B.',
  },
  {
    id: 20,
    subjectId: 'leg-especial',
    statement:
      'De acordo com a Lei n.º 14.735/2023 (Lei Orgânica Nacional das Polícias Civis), assinale a opção correta.',
    options: OPT(
      'Compete à lei orgânica da polícia civil de cada estado, de iniciativa do respectivo governador, estabelecer regras específicas sobre diretrizes para a elaboração da proposta orçamentária, devendo ser observadas as normas gerais previstas na Lei Orgânica Nacional das Polícias Civis.',
      'Em caso de morte de servidor policial, seus dependentes apenas farão jus a pensão vitalícia se a morte houver decorrido de doença ocupacional ou do exercício da função policial, sendo a pensão equivalente à remuneração do cargo da classe e do nível mais elevados à época do falecimento.',
      'Caso seja aplicada a penalidade de demissão no âmbito de processo disciplinar contra policial civil, ser-lhe-á garantido o direito de interpor recurso diretamente ao chefe do Poder Executivo.',
      'Em virtude da atividade de risco exercida, o policial civil pode ser promovido, de forma póstuma, à classe superior, desde que haja vaga disponível.',
      'As policiais civis femininas tem garantia de retorno e permanência na mesma lotação durante um ano após o retorno de licença-maternidade.',
    ),
    comment:
      'A Lei 14.735/2023 garante às policiais civis o retorno à mesma lotação durante um ano após a licença-maternidade. As demais opções contrariam a lei (competência do estado com iniciativa reservada, pensão, recurso, promoção póstuma). Gabarito: A.',
  },
  {
    id: 21,
    subjectId: 'dir-penal',
    statement: 'Assinale a opção correta no que se refere à teoria da imputação objetiva no direito penal.',
    options: OPT(
      'Consoante os fundamentos dessa teoria, a imputação objetiva é incompatível com crimes culposos.',
      'Nessa teoria, dispensa-se a relação de causalidade para a atribuição de responsabilidade penal.',
      'Na imputação objetiva, exige-se apenas a comprovação de nexo causal para a responsabilização penal do agente.',
      'A referida teoria fundamenta-se na criação ou no incremento de risco juridicamente proibido para a imputação penal.',
      'Segundo essa teoria, é irrelevante o risco permitido na análise do fato típico.',
    ),
    comment:
      'A teoria da imputação objetiva (Jakobs/Roxin) fundamenta a imputação do resultado na criação (ou incremento) de um risco juridicamente desaprovado (proibido). O risco permitido é relevante e afasta a tipicidade. Gabarito: D.',
  },
  {
    id: 22,
    subjectId: 'dir-penal',
    statement:
      'Em relação às escolas penais e a sua evolução histórica e metodológica, assinale a opção correta.',
    options: OPT(
      'A escola técnico-jurídica, cujo maior expoente foi Cesare Lombroso, rejeitou qualquer forma de construção lógico-dedutiva ao conceber o delito exclusivamente como ente natural e estatístico, e excluiu do seu sistema o princípio da culpabilidade.',
      'A escola moderna alemã, fundada por Carrara e Pessina, inaugurou a dogmática penal com ênfase no direito penal mínimo e defendeu a abolição da pena privativa de liberdade e sua substituição por sanções meramente preventivas.',
      'A escola clássica, ainda que tenha defendido o princípio da responsabilidade moral, baseava-se em métodos empíricos de observação e análise estatística, fundando suas conclusões na psicologia criminal e na periculosidade do agente.',
      'A escola positivista, apesar de seu forte vínculo com o determinismo biológico e social, consagrou a noção de pena retributiva como instrumento de justiça moral e universal, mantendo vínculo com o livre-arbítrio do agente.',
      'A terceira escola, também chamada de escola eclética, buscou superar o antagonismo entre as escolas clássica e positiva, mantendo a estrutura dogmática da imputabilidade e introduzindo as medidas de segurança para os inimputáveis.',
    ),
    comment:
      'A terceira escola (eclética/intermediária) conciliou clássicos e positivistas: manteve a dogmática (imputabilidade, culpabilidade) e introduziu o sistema duplo-binário (pena para imputáveis + medidas de segurança para inimputáveis). As demais invertem as características das escolas. Gabarito: E.',
  },
  {
    id: 23,
    subjectId: 'dir-penal',
    statement: 'O princípio da insignificância',
    options: OPT(
      'é inaplicável a crimes tributários federais.',
      'é aplicável, de forma irrestrita, aos crimes contra a administração pública.',
      'sempre exclui a culpabilidade do agente.',
      'é inaplicável a crimes ou contravenções penais praticados contra a mulher no âmbito das relações domésticas.',
      'é inaplicável a crimes ambientais, segundo a jurisprudência consolidada dos tribunais superiores.',
    ),
    comment:
      'STJ e STF: o princípio da insignificância é INAPLICÁVEL a crimes/contravenções praticados contra a mulher no âmbito das relações domésticas (violência doméstica — Lei Maria da Penha). Nos crimes tributários aplica-se (após recolhimento); nos crimes contra a administração é vedado; e o princípio afasta a TIPICIDADE, não a culpabilidade. Gabarito: D.',
  },
  {
    id: 24,
    subjectId: 'dir-penal',
    statement:
      'Assinale a opção correta, considerando a interpretação sistemática do Código Penal, bem como a jurisprudência consolidada dos tribunais superiores.',
    options: OPT(
      'O limite máximo de 40 anos para o cumprimento sequencial ou cumulativo das penas privativas de liberdade, estabelecido pelo Código Penal, permanece inalterável e absoluto mesmo diante da eventualidade de novas condenações por crimes cometidos após o início do cumprimento da pena originária, devendo sempre ser contabilizado o tempo já cumprido pelo sentenciado.',
      'A inexistência, em decisão judicial, de determinação expressa de suspensão ou revogação do livramento condicional, caso transcorrido integralmente o período de prova, não autoriza, por si só, a declaração judicial da extinção da punibilidade em razão do integral cumprimento da pena.',
      'Presente o dolo específico de satisfazer à lascívia, própria ou de terceiro, a prática de ato libidinoso com menor de 14 anos de idade configura o crime de estupro de vulnerável, independentemente da ligeireza ou da superficialidade da conduta, não sendo possível a desclassificação para o delito de importunação sexual.',
      'A multa prevista na legislação penal caracteriza-se como sanção cuja prestação em dinheiro deve ser obrigatoriamente revertida à vítima ou a seus dependentes legais, sendo o valor pago considerado crédito a ser abatido, posteriormente, da quantia eventualmente fixada em ação civil indenizatória decorrente do mesmo fato.',
      'Tal como sucede com a reincidência, revela-se juridicamente inadmissível, para fins de valoração negativa dos antecedentes na primeira fase da dosimetria da pena, a utilização de condenações cujas penas tenham sido integralmente extintas há mais de cinco anos em relação à nova infração penal, sob pena de violação ao princípio da proporcionalidade e à regra depuradora prevista no inciso I do art. 64 do Código Penal.',
    ),
    comment:
      'STJ: dolo específico de satisfazer à lascívia + ato libidinoso com menor de 14 = estupro de vulnerável (art. 217-A CP), ainda que a conduta seja ligeira — não se desclassifica para importunação sexual. As demais contrariam a jurisprudência (art. 75 CP alterado; Súmula 441 STJ sobre livramento; multa vai ao Estado; maus antecedentes não se confundem com regra da reincidência). Gabarito: C.',
  },
  {
    id: 25,
    subjectId: 'dir-penal',
    statement: 'Acerca do concurso aparente de normas penais, assinale a opção correta.',
    options: OPT(
      'Os princípios que embasam as normas penais não são suficientes para resolver adequadamente o concurso aparente entre crime-meio e crime-fim.',
      'Segundo o princípio da especialidade, diante da impossibilidade de aplicação da norma mais grave, aplica-se a norma menos grave.',
      'O princípio da alternatividade é aplicável a infrações penais de ação múltipla ou de conteúdo variado.',
      'Aplica-se o princípio da subsidiariedade apenas quando expressamente previsto em lei.',
      'O princípio da consunção jamais é aplicável a crimes contra bens jurídicos distintos.',
    ),
    comment:
      'O princípio da alternatividade (competeência) resolve o concurso aparente de normas quando o tipo descreve várias formas alternativas de conduta (ação múltipla/contento variado): basta uma das formas para o crime, que não admite concurso. Gabarito: C.',
  },
  {
    id: 26,
    subjectId: 'dir-penal',
    statement: 'No que se refere à omissão penalmente relevante, assinale a opção correta.',
    options: OPT(
      'Em se tratando dos crimes omissivos próprios, a norma constante do tipo penal é de natureza proibitiva.',
      'A relevância da omissão depende exclusivamente da gravidade do resultado.',
      'Qualquer omissão será considerada penalmente relevante se resultar em dano.',
      'A omissão será penalmente relevante quando o agente, encontrando-se em posição de garantidor, deixar de agir, podendo fazê-lo, desde que tal omissão seja causa adequada do resultado, segundo juízo normativo de imputação.',
      'Somente a omissão dolosa é considerada penalmente relevante.',
    ),
    comment:
      'Nos crimes omissivos impróprios (comissivos por omissão), a omissão do garantidor que, podendo agir, deixa de fazê-lo e que seja causa adequada do resultado segundo juízo normativo, é penalmente relevante (art. 13, §2º, CP). Nos omissivos próprios a norma é MANDAMENTO (não proibitiva). Gabarito: D.',
  },
  {
    id: 27,
    subjectId: 'dir-penal',
    statement:
      'Pedro, brasileiro residente no exterior, cometeu, fora do território brasileiro, crime de genocídio contra um grupo religioso e, posteriormente, retornou ao Brasil. Nessa situação hipotética, Pedro',
    options: OPT(
      'não poderá ser julgado no Brasil, pois o país não é signatário de tratado sobre genocídio.',
      'não poderá ser julgado no Brasil, pois o crime não foi cometido em território nacional.',
      'poderá ser julgado no Brasil, ainda que absolvido ou condenado no estrangeiro.',
      'poderá ser julgado no Brasil desde que o crime também seja punível no país onde foi praticado.',
      'poderá ser julgado no Brasil se o país onde ocorreu o crime não exercer sua jurisdição.',
    ),
    comment:
      'Genocídio é crime ao qual o Brasil é obrigado a reprimir por tratado e admite extraterritorialidade INCONDICIONADA pelo critério da universalidade (art. 7º, II, “d”, CP): julgável no Brasil mesmo se absolvido no estrangeiro. Gabarito: C.',
  },
  {
    id: 28,
    subjectId: 'dir-penal',
    statement:
      'Em relação à prescrição penal, a seus termos iniciais e a suas causas suspensivas, assinale a opção correta.',
    options: OPT(
      'Nos crimes em geral, incluídos os permanentes, o termo inicial do prazo prescricional coincide com o recebimento da denúncia ou da queixa.',
      'O curso do prazo prescricional fica suspenso enquanto pender, em processo diverso, controvérsia judicial cuja resolução seja condição lógica ou jurídica para o reconhecimento da própria existência do crime imputado.',
      'O prazo da prescrição da pretensão punitiva, nos crimes cuja consumação se prolongue no tempo, inicia-se a partir da ciência da infração pela autoridade policial.',
      'A prescrição da pretensão executória não será suspensa durante o tempo em que o condenado estiver preso por motivo diverso.',
      'O prazo prescricional, antes do trânsito em julgado da sentença, mantém-se em curso durante o cumprimento de pena pelo agente no estrangeiro.',
    ),
    comment:
      'Art. 116, I, do CP: a prescrição fica SUSPENSA enquanto não resolvida, em outro processo, questão de que dependa o reconhecimento da existência do crime. Nos crimes permanentes o termo inicial é do dia em CESSA a permanência; para crimes que dependem de extradição etc. há regras próprias. Gabarito: B.',
  },
  {
    id: 29,
    subjectId: 'dir-penal',
    statement:
      'Durante o velório e sepultamento de uma pessoa pública de relevância nacional, com a presença de familiares e a cobertura da imprensa, um dos presentes aproximou-se do caixão e, de forma deliberada, fotografou o cadáver, que estava exposto. Posteriormente, ele divulgou as fotografias nas redes sociais, com legenda e comentários depreciativos, fazendo piadas acerca da aparência do falecido e incitando zombarias em larga escala. Na situação hipotética precedente, a conduta narrada caracteriza crime',
    options: OPT(
      'contra o sentimento religioso, haja vista o ataque à realização do funeral, em razão da ridicularização do falecido por sua aparência.',
      'de vilipêndio a cadáver, dada a manifestação de desprezo público à memória e dignidade da pessoa morta, em afronta ao sentimento coletivo de respeito aos mortos.',
      'de calúnia contra os mortos, pois ofende o decoro do falecido.',
      'de injúria real, na medida em que a manifestação ofensiva é dirigida à honra subjetiva dos familiares da vítima.',
      'de difamação, uma vez que atinge a reputação do falecido perante terceiros, independentemente da veracidade das imagens divulgadas.',
    ),
    comment:
      'O art. 212 do CP pune a violação de sepultura ou o vilipêndio de cadáver ou suas cinzas — atentado ao respeito devido aos mortos, tutelando o sentimento coletivo. Fotografar e ridicularizar publicamente o cadáver configura vilipêndio. Gabarito: B.',
  },
  {
    id: 31,
    subjectId: 'dir-proc',
    statement:
      'Assinale a opção que apresenta corretamente o princípio do direito processual penal que estabelece que ninguém será processado nem sentenciado senão pela autoridade competente, bem como que impede a criação de tribunais de exceção.',
    options: OPT(
      'princípio da persuasão racional do juiz',
      'princípio da presunção de inocência ou da não culpabilidade',
      'princípio do juiz natural',
      'princípio do devido processo legal',
      'princípio do contraditório',
    ),
    comment:
      'O princípio do juiz natural (art. 5º, XXXVII e LIII, CF) exige autoridade julgadora competente, previamente designada pela Constituição/lei, vedando tribunais de exceção. Gabarito: C.',
  },
  {
    id: 32,
    subjectId: 'dir-proc',
    statement:
      'Na ação penal de iniciativa privada, o Ministério Público (MP)',
    options: OPT(
      'pode oferecer denúncia substitutiva à queixa-crime somente no caso de incapacidade do querelante e ocorrência de conflito de interesse entre este e seu representante legal.',
      'pode oferecer denúncia substitutiva à queixa-crime desde que o querelante desista da ação penal após o recebimento da queixa, caso em que o MP assume a titularidade da ação penal.',
      'não pode oferecer denúncia substitutiva à queixa-crime oferecida pelo querelante.',
      'pode, em qualquer caso, oferecer denúncia substitutiva à queixa-crime oferecida pelo querelante.',
      'pode oferecer denúncia substitutiva à queixa-crime somente se ficar comprovada incapacidade do querelante.',
    ),
    comment:
      'Art. 29 do CPP: o MP pode aditar a queixa e, quando o querelante for incapaz ou houver conflito de interesses com seu representante legal, oferecer DENÚNCIA SUBSTITUTIVA — hipóteses taxativas. Gabarito: A.',
  },
  {
    id: 33,
    subjectId: 'dir-proc',
    statement: 'A arguição da exceção de litispendência nos crimes de ação penal pública incondicionada',
    options: OPT(
      'deve ser apresentada pelo acusado, dentro do prazo da defesa prévia, ou pelo MP, até o oferecimento das alegações finais.',
      'é incabível.',
      'deve ser apresentada pela defesa do acusado somente até as alegações finais.',
      'pode ser apresentada, a qualquer tempo, pela defesa do acusado e pelo MP, ou reconhecida de ofício pelo juízo.',
      'deve ser apresentada necessariamente pela defesa do acusado, dentro do prazo da defesa prévia.',
    ),
    comment:
      'A litispendência é questão processual reconhecível a qualquer tempo, pela defesa, pelo MP ou de ofício (não preclui), inclusive em ação penal pública incondicionada. Gabarito: D.',
  },
  {
    id: 34,
    subjectId: 'dir-proc',
    statement:
      'João foi preso em flagrante delito pela prática de dois crimes (A e B) em concurso material. A competência para processamento e julgamento do crime A é da justiça comum, estando o agente sujeito à pena de um a três anos de DETENÇÃO; e o processamento e julgamento do crime B são de competência do juizado especial criminal, sendo prevista pena de seis meses a dois anos de detenção. Ambos os crimes praticados são afiançáveis. Nessa situação hipotética, de acordo com o Código de Processo Penal (CPP) e a Lei n.º 9.099/1995, a autoridade policial deverá lavrar',
    options: OPT(
      'auto de prisão em flagrante referente aos dois crimes, sendo-lhe permitido arbitrar fiança para o agente somente quanto ao crime B.',
      'auto de prisão em flagrante referente aos dois crimes, sendo-lhe permitido arbitrar fiança para o agente quanto a ambos.',
      'auto de prisão em flagrante quanto ao crime A, sem, contudo, poder arbitrar fiança para o agente no que diz respeito a esse crime; e termo circunstanciado de ocorrência quanto ao crime B.',
      'auto de prisão em flagrante quanto ao crime A, podendo arbitrar fiança para o agente no que diz respeito a esse crime; e termo circunstanciado de ocorrência quanto ao crime B.',
      'auto de prisão em flagrante referente aos dois crimes, sem, contudo, poder arbitrar fiança para o agente quanto a nenhum deles.',
    ),
    comment:
      'Pela reunião de procedimentos (art. 69, § único, da Lei 9.099/99), crimes de competências distintas (JEC + justiça comum) adotam o rito da justiça comum → auto de prisão em flagrante para AMBOS. E, pelo art. 322 do CP/CPP, nos crimes punidos com DETENÇÃO o pedido de fiança é processado perante o JUIZ (a arbitração pela autoridade policial é restrita aos crimes de reclusão até 4 anos não vedados) → o delegado não pode arbitrar fiança para nenhum deles. Gabarito: E.',
  },
  {
    id: 35,
    subjectId: 'dir-proc',
    statement:
      'Mário praticou crime de estupro contra Gustavo, tendo-lhe causado danos de ordem moral e material. Após o regular processamento da ação penal pelo crime citado, o juiz proferiu a sentença penal condenatória, porém Mário, condenado, interpôs recurso de apelação contra a referida sentença. Ao analisar a apelação, o tribunal manteve a decisão do juiz de 1.ª instância, tendo a sentença transitado em julgado. Nessa situação hipotética, caso Gustavo pretenda pleitear a reparação dos danos por ele sofridos, será cabível a propositura de',
    options: OPT(
      'ação civil de conhecimento perante o tribunal que julgou o recurso de apelação da ação penal condenatória, requerendo-se a condenação de Mário pelos danos causados a Gustavo.',
      'ação civil de conhecimento perante o juízo criminal que condenou Mário pelo crime de estupro, na qual deverá ser apreciada a fixação do valor mínimo de indenização pelos danos sofridos.',
      'execução no juízo cível do valor civil mínimo fixado na sentença penal condenatória, sem qualquer ação de conhecimento.',
      'ação civil de conhecimento perante o juízo cível competente para apreciar a quantificação dos danos, sendo vedada a discussão da materialidade do fato e da autoria, já reconhecidas na esfera criminal.',
      'ação civil de conhecimento perante o juízo cível competente, na qual serão discutidos e quantificados os danos materiais, e caberá ao réu o ônus de afastar a responsabilidade civil se alegar que o dano não decorreu do fato criminoso.',
    ),
    comment:
      'A sentença penal condenatória é título executivo, mas para a fixação do dano moral/material é necessária liquidação ou ação de conhecimento no juízo cível; a materialidade do fato e a autoria não podem mais ser discutidas (art. 66 e 67 CPP). Gabarito: C.',
  },
]

export const QUESTIONS: Question[] = ITEMS.map((it) => ({
  id: it.id,
  subjectId: it.subjectId,
  statement: it.statement,
  options: it.options,
  answer: GAB[it.id],
  comment: it.comment,
}))

export const PC_CE_SUBJECTS = SUBJECTS
