import type { QuestionOption } from '../types'

/**
 * PROVA OFICIAL — PM/RJ Soldado 2024 — Parte 2 (questões 24 a 50)
 * Banca: FGV Conhecimento • Caderno Tipo 1 (Branca) • Aplicação: 09/04/2024
 * Gabarito: GABARITO DEFINITIVO (FGV) — questões 35 e 40 anuladas (não transcritas).
 */

const OPT = (a: string, b: string, c: string, d: string, e: string): QuestionOption[] => [
  { key: 'a' as const, html: a },
  { key: 'b' as const, html: b },
  { key: 'c' as const, html: c },
  { key: 'd' as const, html: d },
  { key: 'e' as const, html: e },
]

export interface ItemPm2 {
  id: number
  subjectId: string
  statement: string
  options: QuestionOption[]
  comment: string
}

export const ITEMS_PM2: ItemPm2[] = [
  {
    id: 24,
    subjectId: 'dir-const',
    statement:
      'O jovem André, negro, de 19 anos e morador da favela Beta, quando chegava em sua casa vindo da faculdade, foi preso em flagrante pelo policial militar José. O PM deu voz de prisão a André exclusivamente pelo jovem estar portando uma mochila preta, haja vista que a senhora Maria narrara ao policial, minutos antes, que seu celular acabara de ser roubado por uma pessoa que portava uma mochila preta. O PM levou o jovem até a rua de trás e perguntou a Maria se ele era o autor do crime. Mesmo com resposta categoricamente negativa da vítima e não tendo sido encontrado o aparelho de celular, o PM manteve a prisão, levou o jovem até a delegacia, onde o Delegado de Polícia Pedro lavrou auto de prisão em flagrante pelo crime de roubo. No caso em tela, de acordo com a Constituição da República, a prisão ilegal de André será:',
    options: OPT(
      'imediatamente revogada pelo Ministério Público;',
      'imediatamente relaxada pela autoridade judiciária;',
      'revogada, em até 48h (quarenta e oito horas), por meio de habeas corpus;',
      'anulada, em até 72h (setenta e duas horas), pelo Tribunal de Justiça.',
      'objeto de conversão em liberdade provisória, no prazo de 24h (vinte e quatro horas) por autoridade competente da polícia, do Judiciário ou do Ministério Público.',
    ),
    comment:
      'CF, art. 5º, LXV: “a prisão ilegal será imediatamente relaxada pela autoridade judiciária”. O MP não revoga prisões; não há prazo de 48h/72h nem “anulação” por tribunal. Gabarito: B.',
  },
  {
    id: 25,
    subjectId: 'dir-humanos',
    statement:
      'O Estado brasileiro aderiu à Convenção Americana de Direitos Humanos (Pacto de São José da Costa Rica), reconhecendo o sistema criado pela Organização dos Estados Americanos (OEA). De acordo com a citada convenção:',
    options: OPT(
      'o sistema interamericano é formado pela Comissão Interamericana de Direitos Humanos e pelo Tribunal Penal Internacional;',
      'a jurisdição da Corte Interamericana de Direitos Humanos é aplicável desde 1988 e foi reconhecida pelo Brasil com a promulgação da Constituição da República vigente;',
      'a realização de audiência de custódia é um ato ilegal, porque submete o investigado a mais uma camada de controle sobre o ilícito penal que lhe é imputado;',
      'a pessoa detida pela prática de crimes deve ser informada das razões da sua detenção e notificada, no prazo de trinta dias, da acusação formulada contra ela, para que possa constituir advogado ou defensor público;',
      'ninguém deve ser detido por dívida, mas esse princípio não limita os mandados de autoridade judiciária competente expedidos em virtude de inadimplemento de obrigação alimentar.',
    ),
    comment:
      'Pacto de São José da Costa Rica, art. 7º, 5: ninguém deve ser detido por dívida — princípio que NÃO limita os mandados judiciais por inadimplemento de obrigação alimentar. O sistema interamericano é composto pela Comissão e pela Corte IDH (não pelo TPI); o Brasil só reconheceu a jurisdição da Corte em 1998 (Decreto 4.463/2002); a audiência de custódia é ato legal e de proteção. Gabarito: E.',
  },
  {
    id: 26,
    subjectId: 'dir-humanos',
    statement:
      'A Lei nº 13.445, de 24 de maio de 2017, instituiu a Lei de Migração, dispondo sobre os direitos e os deveres do migrante e do visitante, regulando a sua entrada e estada no País e estabelecendo princípios e diretrizes para as políticas públicas para o emigrante. Consoante dispõe o citado diploma legal:',
    options: OPT(
      'ao migrante é garantida no território nacional, em condição de igualdade com os nacionais, a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade;',
      'a situação migratória deverá ser determinante na análise do alcance dos direitos e garantias previstos na referida lei, na Constituição Federal e nos tratados vigentes;',
      'a realização de expulsão ou de deportação coletivas deverão ser fomentadas nas situações de migrações numerosas, que geram grave impacto na economia nacional;',
      'o migrante e o refugiado não poderão frequentar a escola pública, pois sua nacionalidade ou condição migratória podem configurar grave risco aos demais alunos;',
      'a política migratória observará o princípio do fomento ao retorno do migrante ao seu país de origem, independentemente das condições que ocasionaram a sua saída, sendo exceção a política de regularização documental.',
    ),
    comment:
      'Lei 13.445/2017, art. 4º, IV: garantia, em igualdade com os nacionais, da inviolabilidade do direito à vida, liberdade, igualdade, segurança e propriedade. A situação migratória NÃO é determinante (art. 4º, VIII); expulsão/deportação coletivas são VEDADAS (art. 7º); escola pública é assegurada (art. 4º, III); o retorno é voluntário e a regularização documental é diretriz (art. 5º). Gabarito: A.',
  },
  {
    id: 27,
    subjectId: 'dir-humanos',
    statement:
      'No ano de 2010, o Rio de Janeiro foi o primeiro estado da federação a instituir um sistema estadual de prevenção e combate à tortura no âmbito do Poder Legislativo, com a constituição de um comitê estadual e um mecanismo estadual de prevenção e combate à tortura. Sobre o Sistema Nacional de Prevenção e Combate à Tortura (SNPCT), é correto afirmar que:',
    options: OPT(
      'as corregedorias e ouvidorias de polícia não poderão integrar o SNPCT, uma vez que serão fiscalizadas pelo referido sistema e deverão prestar informações quando requisitadas;',
      'uma de suas diretrizes é o respeito aos direitos humanos, mas os das pessoas privadas de liberdade devem ser relativizados, inclusive com prevalência dos direitos das vítimas;',
      'o SNPCT atuará em preponderância às demais esferas de governo e de poder, responsáveis pela segurança pública, pela custódia de pessoas privadas de liberdade, por locais de internação de longa permanência e pela proteção de direitos humanos;',
      'está em desacordo com o Protocolo Facultativo à Convenção das Nações Unidas contra a Tortura e Outros Tratamentos ou Penas Cruéis, Desumanos ou Degradantes, promulgado pelo Decreto nº 6.085, de 19 de abril de 2007, pois permite tortura vigiada por médicos nos casos de imprescindível obtenção de prova de crime;',
      'é composto pelo Comitê Nacional de Prevenção e Combate à Tortura (CNPCT), pelo Mecanismo Nacional de Prevenção e Combate à Tortura (MNPCT), pelo Conselho Nacional de Política Criminal e Penitenciária (CNPCP) e pelo órgão do Ministério da Justiça responsável pelo sistema penitenciário nacional.',
    ),
    comment:
      'Lei 11.448/2007, art. 3º: o SNPCT é composto pelo CNPCT, pelo MNPCT, pelo CNPCP e pelo órgão do Ministério da Justiça responsável pelo sistema penitenciário nacional. As diretrizes vedam relativização de direitos; o SNPCT coopera (não prepondera) e está EM ACORDO com o Protocolo Facultativo da ONU — a tortura é absolutamente proibida. Gabarito: E.',
  },
  {
    id: 28,
    subjectId: 'dir-humanos',
    statement:
      'Neiva, uma idosa de 68 anos, é detida pela polícia local após ser suspeita de envolvimento em um furto. Durante sua audiência de custódia, ela alega ter sido vítima de tortura por parte dos policiais. Neiva afirma que foi submetida a diversas formas de agressão física e psicológica enquanto estava sob custódia: foi levada para uma sala isolada, interrogada de maneira agressiva, com emprego de força física, espancamento, ameaça de morte e choques elétricos. Os policiais, por outro lado, negam as acusações, alegando que a força foi usada apenas quando necessário para garantir a segurança e a cooperação de Neiva na elucidação do crime. No caso em tela, de acordo com a Lei Federal nº 9.455/1997, que define os crimes de tortura:',
    options: OPT(
      'as condutas praticadas pelos policiais podem configurar o crime de tortura, na hipótese de comprovação dos fatos narrados por Neiva;',
      'os policiais poderão ter as penas diminuídas, uma vez que são agentes públicos, caso respondam pela prática do crime de tortura;',
      'os policiais não poderão ser acusados do suposto crime de tortura, em razão da presunção de veracidade de suas alegações;',
      'os policiais atuaram sob o manto de uma excludente de ilicitude, uma vez que o uso da força teve por finalidade a comprovação da prática de um crime;',
      'os policiais não poderão perder os seus cargos, sendo afastados das suas funções de patrulhamento para um trabalho burocrático, na hipótese de condenação pelo crime de tortura, de acordo com a lei.',
    ),
    comment:
      'Lei 9.455/1997, art. 1º: submeter pessoa, com emprego de violência física, a intenso sofrimento físico ou mental, com fim de obter informação, é crime de tortura — as condutas narradas, se comprovadas, configuram o delito. Sendo o agente funcionário público, há AUMENTO de pena (art. 1º, §4º); não há excludente de ilicitude para “obter prova”; a condenação acarreta perda do cargo (art. 1º, §6º). Gabarito: A.',
  },
  {
    id: 29,
    subjectId: 'dir-humanos',
    statement:
      'Observe, a seguir, a prática dos seguintes crimes: I — João, de forma livre e consciente, realizou transferência, à força, de crianças do grupo para outro grupo com intenção de destruir, no todo ou em parte, um grupo nacional, étnico, racial ou religioso. II — Maria, de forma livre e consciente, praticou desaparecimento forçado de pessoas, cometido no quadro de um ataque, generalizado ou sistemático, contra qualquer população civil, havendo conhecimento desse ataque. Para efeitos do Estatuto de Roma do Tribunal Penal Internacional (TPI), promulgado pelo Decreto nº 4.388/2002, João e Maria praticaram, respectivamente, crimes:',
    options: OPT(
      'de sequestro e de guerra;',
      'contra a vida e de genocídio;',
      'de genocídio e contra a humanidade;',
      'de guerra e de tortura;',
      'contra infância e contra a pessoa.',
    ),
    comment:
      'Estatuto de Roma, art. 6º, “e”: a transferência forçada de crianças do grupo para outro grupo com intenção de destruir, no todo ou em parte, grupo nacional, étnico, racial ou religioso é GENOCÍDIO; art. 7º, 1, “i”: o desaparecimento forçado cometido no quadro de ataque generalizado ou sistemático contra população civil é crime CONTRA A HUMANIDADE. Gabarito: C.',
  },
  {
    id: 30,
    subjectId: 'dir-humanos',
    statement:
      'João, um jovem de 23 anos, compareceu à ouvidoria da polícia e alegou ter sido vítima de abuso policial, haja vista que policiais militares fizeram uso de arma de fogo contra seu veículo, mesmo levando em consideração que João, de fato, desrespeitou bloqueio policial em via pública. Considerando o disposto na Lei Federal nº 13.060/2014, que disciplina o uso dos instrumentos de menor potencial ofensivo pelos agentes de segurança pública em todo o território nacional, no caso em tela, os policiais agiram de forma:',
    options: OPT(
      'legítima, caso a conduta de João tenha representado risco de morte ou lesão aos agentes de segurança pública ou a terceiros;',
      'legítima, pois qualquer desobediência a bloqueio policial em via pública dá ensejo a emprego de arma de fogo;',
      'legítima, desde que tenha havido prévia autorização pelo superior hierárquico responsável pela ação policial para o uso de arma de fogo;',
      'ilegítima, em qualquer hipótese, pois desobediência a bloqueio policial em via pública não dá ensejo a emprego de arma de fogo, em qualquer hipótese;',
      'ilegítima, salvo se os policiais militares estivessem usando câmeras corporais que filmaram a conduta de João, independentemente de risco de morte ou lesão aos agentes de segurança pública ou a terceiros.',
    ),
    comment:
      'Lei 13.060/2014, art. 6º: o uso de arma de fogo é permitido quando esgotados os instrumentos de menor potencial ofensivo, ou quando, pelas circunstâncias, NÃO houver tempo hábil para utilizá-los, sobretudo no caso de risco de morte ou lesão a agente ou terceiro. O mero desrespeito a bloqueio não autoriza o uso da arma; o critério é o risco. Gabarito: A.',
  },
  {
    id: 31,
    subjectId: 'leg-adm-pmerj',
    statement:
      'João, policial militar, foi convocado para fazer o policiamento ostensivo durante a inauguração de uma obra realizada no Município Alfa, com a presença do prefeito da cidade e do governador do estado. Ao se apresentar para o serviço, o agente da lei percebe que não há, no local, qualquer promoção pessoal dos políticos presentes no evento. Na verdade, todas as informações atinentes à obra têm caráter educativo e informativo. Considerando o entendimento doutrinário e jurisprudencial dominantes, está-se diante de uma manifestação do princípio da:',
    options: OPT(
      'proporcionalidade;',
      'impessoalidade;',
      'continuidade;',
      'juridicidade;',
      'legalidade.',
    ),
    comment:
      'CF, art. 37: a publicidade dos atos administrativos não pode ser utilizada para promoção pessoal de autoridades ou servidores — princípio da IMPESSOALIDADE (aplicado à impessoalidade da publicidade). Gabarito: B.',
  },
  {
    id: 32,
    subjectId: 'leg-adm-pmerj',
    statement:
      '1º cenário: A Administração Pública, após a observância das formalidades legais, aplicou uma multa à sociedade empresária XYZ, contratada para fornecer bens ao Poder Público, em razão do descumprimento de cláusulas contratuais. 2º cenário: o policial militar Petrônio, após o exercício do contraditório e da ampla defesa, recebeu uma sanção disciplinar, por descumprir ordens legais do seu superior hierárquico. Considerando o entendimento doutrinário e jurisprudencial dominantes, as punições aplicadas à sociedade empresária XYZ e ao policial militar Petrônio são, respectivamente, manifestações do:',
    options: OPT(
      'poder disciplinar e poder hierárquico;',
      'poder hierárquico e poder disciplinar;',
      'poder disciplinar e poder disciplinar;',
      'poder de polícia e poder disciplinar;',
      'poder de polícia e poder de polícia.',
    ),
    comment:
      'Ambas as sanções são exercício do poder DISCIPLINAR: a multa aplicada à contratada decorre da disciplina contratual (a doutrina sujeita o particular contratado ao poder disciplinar do contrato), e a sanção ao policial militar decorre da hierarquia e disciplina militares. Gabarito: C.',
  },
  {
    id: 33,
    subjectId: 'leg-adm-pmerj',
    statement:
      'Diversas pessoas, insatisfeitas com a crise econômica vivenciada no Estado Alfa, resolveram fechar ruas para protestar contra o governo. Após horas de manifestação pacífica, a passeata se tornou violenta, com a depredação do patrimônio público. Em assim sendo, dezenas de policiais militares foram convocados, pondo fim aos eventos. Considerando o entendimento doutrinário e jurisprudencial dominantes, os policiais militares puderam interromper a passeata, mesmo sem a manifestação do Poder Judiciário, em razão da:',
    options: OPT(
      'presunção relativa de veracidade dos atos administrativos;',
      'autoexecutoriedade dos atos administrativos;',
      'imperatividade dos atos administrativos;',
      'coercibilidade dos atos administrativos;',
      'exigibilidade dos atos administrativos.',
    ),
    comment:
      'AUTOEXECUTORIEDADE: atributo que permite à Administração executar materialmente seus atos, coagindo o particular, sem necessidade de autorização judicial prévia — como na repressão imediata a tumultos e depredações (com respaldo na legalidade e na urgência). Gabarito: B.',
  },
  {
    id: 34,
    subjectId: 'leg-adm-pmerj',
    statement:
      'João, policial no âmbito da Polícia Militar do Estado do Rio de Janeiro, conduzia uma viatura em alta velocidade durante perseguição a Tício, que tinha acabado de roubar um automóvel. Nesse contexto, o agente da lei colidiu com o veículo automotor de Caio, particular, o qual manifestou o interesse em ingressar, em juízo, com uma ação indenizatória para se ressarcir dos prejuízos suportados. Caio, então, procurou um advogado, que lhe informou que o Estado do Rio de Janeiro é uma pessoa jurídica de direito público, enquanto a Polícia Militar é um órgão público. Considerando o entendimento doutrinário e jurisprudencial dominantes, o particular deverá ingressar com a ação indenizatória em face do (da):',
    options: OPT(
      'policial João, pois o Estado do Rio de Janeiro e a Polícia Militar não podem ser demandados por ato praticado por policial militar;',
      'Estado do Rio de Janeiro, pois a Polícia Militar, enquanto órgão público, não pode, como regra, demandar, tampouco ser demandada;',
      'Estado do Rio de Janeiro ou da Polícia Militar, pois ambos, como regra, podem demandar e ser demandados;',
      'Polícia Militar, que pode, como regra, ser demandada, muito embora não possa demandar;',
      'Polícia Militar, que pode, como regra, demandar e ser demandada.',
    ),
    comment:
      'Órgãos públicos não têm personalidade jurídica própria: em regra, não podem demandar nem ser demandados — quem responde é a pessoa jurídica de direito público a que pertencem (Estado do RJ), com ação regressiva contra o agente. Gabarito: B.',
  },
  {
    id: 36,
    subjectId: 'leg-adm-pmerj',
    statement:
      'Caio, grande apreciador de armas de fogo, perguntou ao seu irmão, policial militar, quais procedimentos deveria adotar para possuir um revólver, de forma regular, em seu domicílio. O agente da lei, então, explicou, detalhadamente, o caminho que deveria ser percorrido por Caio. Após a observância de todas as formalidades legais, a Administração Pública editou um ato administrativo, manifestando a concordância com o pedido formulado por Caio, autorizando-o a ter a posse de uma arma de fogo em seu domicílio. Considerando o entendimento doutrinário e jurisprudencial dominantes, está-se diante de um ato administrativo (de):',
    options: OPT(
      'enunciativo;',
      'ordinatório;',
      'normativo;',
      'controle;',
      'negocial.',
    ),
    comment:
      'Ato NEGOCIAL: contém declaração de vontade da Administração voltada a concretizar interesses do particular (autorizações, permissões e licenças). Atos enunciativos apenas atestam/certificam; normativos editam normas; de controle conferem legitimidade a atos de outros órgãos. Gabarito: E.',
  },
  {
    id: 37,
    subjectId: 'leg-adm-pmerj',
    statement:
      'João, policial militar, está em gozo de licença para tratar de interesse particular, ocasião em que, em observância às formalidades legais, a autoridade competente decreta estado de emergência. Preocupado e aproveitando o cenário posto, o policial consulta a legislação de regência, para analisar eventuais repercussões práticas que a medida terá sobre o seu licenciamento e sobre outras licenças. Considerando as disposições da Lei Estadual nº 443/1981 (Estatuto dos Policiais Militares), a decretação de estado de emergência poderá ensejar a interrupção da licença:',
    options: OPT(
      'especial, para tratar de interesse particular e para tratamento de saúde de pessoa da família;',
      'especial e para tratamento de saúde de pessoa da família;',
      'para tratamento de saúde de pessoa da família, apenas;',
      'especial e para tratar de interesse particular;',
      'para tratar de interesse particular, apenas.',
    ),
    comment:
      'Lei 443/1981 (Estatuto dos PM do RJ): decretado estado de emergência, podem ser interrompidas a LICENÇA ESPECIAL (prêmio) e a licença para tratar de INTERESSE PARTICULAR — a licença para tratamento de saúde de pessoa da família não é atingida. Gabarito: D.',
  },
  {
    id: 38,
    subjectId: 'leg-adm-pmerj',
    statement:
      'Tício, policial militar, foi afastado do cargo, na esfera administrativa e após a observância de todas as formalidades legais, ao argumento de que a sua atuação demonstrou incapacidade no exercício de funções policiais-militares inerentes à posição ocupada. Considerando as disposições da Lei Estadual nº 443/1981 (Estatuto dos Policiais Militares), Tício foi afastado do cargo pelo:',
    options: OPT(
      'presidente da Assembleia Legislativa;',
      'comandante geral da Polícia Militar;',
      'secretário de estado da Casa Civil;',
      'presidente do Tribunal de Justiça;',
      'vice-governador do estado.',
    ),
    comment:
      'Lei 443/1981: o afastamento do cargo de policial militar, por incapacidade no exercício das funções, é decretado, na esfera administrativa, pelo COMANDANTE GERAL da Polícia Militar (a transferência para a reserva, de oficial, é que cabe ao Governador). Gabarito: B.',
  },
  {
    id: 39,
    subjectId: 'leg-adm-pmerj',
    statement:
      'João, após ingressar na Polícia Militar do Estado do Rio de Janeiro, busca informações sobre a existência de eventual grupo que defenda as prerrogativas dos policiais, vindo a ser informado, por colegas de farda, sobre a matéria. Nesse cenário, considerando as disposições da Constituição do Estado do Rio de Janeiro, é possível a criação de:',
    options: OPT(
      'associação de natureza não sindical, sem fins lucrativos, admitindo-se a greve, na forma da lei;',
      'sindicato ou de associação, sem fins lucrativos, admitindo-se a greve, na forma da lei;',
      'associação de natureza não sindical, sem fins lucrativos, vedando-se a greve;',
      'sindicato ou de associação, sem fins lucrativos, vedando-se a greve;',
      'sindicato ou de associação, com fins lucrativos, vedando-se a greve.',
    ),
    comment:
      'CE-RJ: aos policiais militares é assegurada a organização em ASSOCIAÇÃO de natureza não sindical, SEM fins lucrativos, com VEDAÇÃO do direito de greve (conforme a regra constitucional aplicada aos militares, CF art. 42, §1º, que exclui associação sindical e greve). Gabarito: C.',
  },
  {
    id: 41,
    subjectId: 'dir-penal',
    statement:
      'Caio e João, policiais militares, realizavam policiamento ostensivo, ocasião em que, observando as formalidades legais, abordaram Tício, mas nada de ilícito foi arrecadado com o agente. Em conversa com os policiais, Tício afirmou que está cumprindo pena, em uma colônia agrícola, em razão de um crime perpetrado no passado. Considerando as disposições do Código Penal, Tício está cumprindo pena no regime:',
    options: OPT(
      'semiaberto, sendo certo que o trabalho externo é admissível;',
      'semiaberto, sendo certo que o trabalho externo é proibido;',
      'fechado, sendo certo que o trabalho externo é admissível;',
      'aberto, sendo certo que o trabalho externo é admissível;',
      'aberto, sendo certo que o trabalho externo é proibido.',
    ),
    comment:
      'CP, art. 33, §1º, “b”: o regime SEMIABerto é cumprido em colônia agrícola, industrial ou estabelecimento similar — e, nos termos do art. 34 da Lei de Execução Penal, o condenado em regime semiaberto PODE ser autorizado a trabalhar externamente. Gabarito: A.',
  },
  {
    id: 42,
    subjectId: 'dir-penal',
    statement:
      'Após receberem informações no sentido de que um homem estaria agredindo a sua esposa, policiais militares dirigiram-se ao domicílio do casal, e viram Tício correndo com um facão na direção de Mévia, afirmando que a mataria. Ato contínuo, a mulher — policial civil — efetuou um disparo de arma de fogo em direção a Tício, matando-o. Considerando as disposições do Código Penal, Mévia não responderá por qualquer crime, tendo agido sob o manto do (da):',
    options: OPT(
      'exercício regular de um direito, causa de exclusão de tipicidade;',
      'inexigibilidade de conduta diversa, causa de exclusão de ilicitude;',
      'estrito cumprimento do dever legal, causa de exclusão de tipicidade;',
      'estado de necessidade, causa de exclusão de ilicitude;',
      'legítima defesa, causa de exclusão de ilicitude.',
    ),
    comment:
      'CP, art. 25: entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele INJUSTA agressão, atual ou iminente, a direito seu ou de outrem — Tício corria com facão afirmando que mataria (agressão injusta e iminente à vida). Legítima defesa é causa de EXCLUSÃO DE ILICITUDE (art. 23). Gabarito: E.',
  },
  {
    id: 43,
    subjectId: 'dir-penal',
    statement:
      '1º cenário: Tício ingressou no jardim de uma residência e escalou o muro do imóvel, com o objetivo de adentrar o local e proceder à subtração de diversos bens. Contudo, o agente viu uma pequena criança brincando com o pai, motivo pelo qual mudou de ideia e deixou a localidade. 2º cenário: Mévio desferiu diversos socos no rosto do seu desafeto, ocasião em que o último pediu por clemência. Muito embora pudesse continuar agredindo-o, Mévio interrompeu os atos e fugiu da localidade. Considerando as disposições do Código Penal, Tício e Mévio somente responderão pelos atos já praticados, respectivamente, em razão do (da):',
    options: OPT(
      'arrependimento posterior e arrependimento posterior;',
      'arrependimento eficaz e arrependimento posterior;',
      'desistência voluntária e arrependimento posterior;',
      'arrependimento eficaz e arrependimento eficaz;',
      'desistência voluntária e desistência voluntária.',
    ),
    comment:
      'Tício abandonou espontaneamente a execução ANTES da consumação (não adentrou o imóvel) — DESISTÊNCIA VOLUNTÁRIA (art. 15 CP). Mévio já havia consumado as lesões corporais e depois parou — ARREPENDIMENTO POSTERIOR (art. 16 CP), respondendo pelo crime já consumado (lesão). Gabarito: C.',
  },
  {
    id: 44,
    subjectId: 'dir-penal',
    statement:
      'João e Caio, policiais militares, foram chamados para atender a uma ocorrência de furto em um estabelecimento comercial no Município do Rio de Janeiro. Ao chegarem ao local dos fatos, Tício, autor do crime, encontrava-se clara e completamente embriagado, tendo afirmado aos policiais que teria tomado diversas doses de tequila para criar coragem para praticar o crime. Considerando as disposições do Código Penal, é correto afirmar que Tício:',
    options: OPT(
      'responderá pelo crime praticado, pois a embriaguez voluntária pelo álcool não exclui a imputabilidade penal, salvo se o agente demonstrar que, ao tempo da ação, era inteiramente incapaz de entender o caráter ilícito do fato e de determinar-se de acordo com esse entendimento;',
      'responderá pelo crime praticado, pois a embriaguez voluntária pelo álcool não exclui a imputabilidade penal. A sua pena, contudo, será reduzida, se o agente demonstrar que não possuía a plena capacidade de entender o caráter ilícito do seu comportamento;',
      'não responderá pelo crime praticado, se o agente demonstrar que não possuía a plena capacidade de entender o caráter ilícito do seu comportamento;',
      'não responderá pelo crime praticado, pois a embriaguez completa exclui a imputabilidade penal;',
      'responderá pelo crime praticado, com pena agravada, pois a embriaguez voluntária pelo álcool não exclui a imputabilidade penal.',
    ),
    comment:
      'CP, art. 28, II e § único: a embriaguez voluntária ou culposa, pelo álcool ou substância de efeitos análogos, NÃO exclui a imputabilidade penal (nem admite o “salvo” da alternativa A); a redução de pena do art. 29, II, alcança a embriaguez INCOMPLETA por outra substância, não a do caso. O agente responde pelo crime (a embriaguez premeditada com fins de criar coragem reforça a reprovação — é o volintio crimenis). Gabarito: E.',
  },
  {
    id: 45,
    subjectId: 'dir-penal',
    statement:
      'João e Caio, policiais militares, realizavam patrulhamento de rotina, ocasião em que foram abordados por Maria, que lhes disse que um indivíduo, chamado Tício, a obrigou, mediante o emprego de arma de fogo, a adentrar o seu automóvel. Ato contínuo, o criminoso levou a vítima a uma agência bancária e determinou que ela colocasse a senha no caixa, para sacar o numerário disponível, evadindo-se na sequência, após 30 minutos com a vítima em seu poder. A partir da descrição física fornecida pela vítima, os policiais militares iniciaram as buscas e conseguiram prender Tício em flagrante. Considerando as disposições do Código Penal, Tício responderá pelo crime de:',
    options: OPT(
      'extorsão mediante sequestro;',
      'extorsão indireta;',
      'latrocínio;',
      'extorsão, mediante restrição de liberdade da vítima;',
      'roubo.',
    ),
    comment:
      'CP, art. 158, §1º: extorsão mediante RESTRIÇÃO DE LIBERDADE da vítima (para obtenção de vantagem indevida). O sequestro (art. 159) exige a detenção prolongada para negociação do resgate; aqui houve curto tempo (30 min) com o fim imediato de sacar o dinheiro — restrição de liberdade como meio da extorsão. Gabarito: D.',
  },
  {
    id: 46,
    subjectId: 'dir-penal',
    statement:
      'Caio e João, policiais militares, realizavam patrulhamento de rotina, ocasião em que, em observância às formalidades legais, abordaram Tício, com ele encontrando 600 gramas de cocaína. Cientificado dos seus direitos constitucionais, o agente confessou ser traficante, oferecendo R$ 5.000,00 para cada policial, caso o liberassem. Considerando as disposições do Código Penal, Tício, além do tráfico de drogas, responderá pelo crime de:',
    options: OPT(
      'excesso de exação;',
      'corrupção passiva;',
      'corrupção ativa;',
      'concussão;',
      'peculato.',
    ),
    comment:
      'CP, art. 333: CORRUPÇÃO ATIVA é oferecer ou prometer vantagem indevida a funcionário público, para determiná-lo a praticar, omitir ou retardar ato de ofício — Tício OFERECEU a vantagem aos policiais (os policiais, se aceitassem, cometeriam corrupção passiva). Gabarito: C.',
  },
  {
    id: 47,
    subjectId: 'dir-proc-penal',
    statement:
      'Thiago, delegado de polícia, tomou conhecimento de que, na circunscrição da sua unidade policial, houve o roubo de um caminhão da loja XYZ, com a subtração da integralidade da carga que estava em seu interior, o que gerou forte repercussão na imprensa local. Considerando as disposições do Código de Processo Penal, a autoridade policial deflagrará um inquérito policial:',
    options: OPT(
      'mediante requisição do Ministro da Justiça, pois o crime de roubo é persequível mediante ação penal pública condicionada à representação;',
      'mediante representação do ofendido, pois o crime de roubo é persequível mediante ação penal pública condicionada à representação;',
      'mediante requerimento do Ministério Público, que é o titular exclusivo da ação penal de iniciativa pública;',
      'de ofício, pois o crime de roubo é persequível mediante ação penal pública incondicionada;',
      'de ofício, desde que comprove a forte repercussão dos fatos na imprensa local.',
    ),
    comment:
      'Roubo é crime de ação penal pública INCONDICIONADA: a autoridade policial instaura o inquérito DE OFÍCIO (CPP, art. 5º, I), independentemente de representação, requisição, requerimento do MP ou repercussão na imprensa. Gabarito: D.',
  },
  {
    id: 48,
    subjectId: 'dir-proc-penal',
    statement:
      'Dois policiais militares realizavam patrulhamento de rotina, ocasião em que visualizaram um homem com uma arma de fogo apontada para a cabeça de uma mulher, visando à subtração dos bens dela. Em assim sendo, os agentes da lei se aproximaram em silêncio e lograram êxito em desarmar Tício, que estava cometendo um crime patrimonial em detrimento de Maria. Considerando as disposições do Código de Processo Penal, Tício foi preso em flagrante:',
    options: OPT(
      'presumido;',
      'preparado;',
      'impróprio;',
      'esperado;',
      'próprio.',
    ),
    comment:
      'Flagrante PRÓPRIO (real/perfeito): a prisão ocorre no momento ou imediatamente após a prática da infração, por qualquer pessoa (CPP, art. 302, I e II) — os policiais não eram perseguidos nem agiam em provocação. Flagrante preparado (provocado) e presumido (imediato, pós-perseguição) não se configuram. Gabarito: E.',
  },
  {
    id: 49,
    subjectId: 'dir-proc-penal',
    statement:
      'Caio e João, policiais militares, compareceram ao imóvel de Joana, que afirmou que teria sido injuriada por Tício, Mévio e Petrônio, seus vizinhos, que ofenderam a sua dignidade. Contudo, Joana afirmou que pretendia ingressar com uma queixa-crime apenas em face de Tício, pois teria um bom relacionamento com os demais vizinhos. Considerando as disposições do Código de Processo Penal, a queixa contra qualquer dos autores do crime obrigará ao processo de todos em razão do princípio da:',
    options: OPT(
      'intranscendência;',
      'indisponibilidade;',
      'obrigatoriedade;',
      'indivisibilidade;',
      'oficialidade.',
    ),
    comment:
      'Princípio da INDIVISIBILIDADE da ação penal privada (CPP, art. 48; CP, art. 100, §2º): a queixa contra qualquer dos autores obriga ao processo de TODOS — a vítima não pode renunciar seletivamente à ação contra coautores. Gabarito: D.',
  },
  {
    id: 50,
    subjectId: 'dir-proc-penal',
    statement:
      'Caio e João, policiais militares, prenderam Tício em flagrante, pela suposta prática do crime de furto qualificado, encaminhando-o à Delegacia de Polícia, onde prestaram depoimento na qualidade de testemunha. Na data designada para a instrução processual, na persecução penal em juízo, os policiais militares não puderam ser ouvidos, por estarem em uma complexa operação policial em andamento. O Ministério Público, então, dispensou a oitiva dos agentes da lei e pediu a condenação do acusado Tício, exclusivamente, com base nos depoimentos prestados, em sede policial, por Caio e João. Considerando as disposições do Código de Processo Penal, é correto afirmar que o juiz:',
    options: OPT(
      'não poderá condenar Tício com base nos depoimentos prestados por Caio e João em sede policial, pois o magistrado deve formar a sua convicção pela livre apreciação da prova produzida em contraditório judicial, não podendo fundamentar sua decisão exclusivamente nos elementos informativos colhidos na investigação, ressalvadas as provas cautelares, não repetíveis e antecipadas;',
      'não poderá condenar Tício com base nos depoimentos prestados por Caio e João em sede policial, pois o magistrado deve formar a sua convicção pela livre apreciação da prova produzida em contraditório judicial, não podendo fundamentar sua decisão exclusivamente nos elementos informativos colhidos na investigação ou em provas cautelares, não repetíveis e antecipadas;',
      'poderá condenar Tício com base nos depoimentos prestados por Caio e João em sede policial, em razão do sistema do livre convencimento motivado;',
      'poderá condenar Tício com base nos depoimentos prestados por Caio e João em sede policial, em razão do sistema da íntima convicção;',
      'poderá condenar Tício com base nos depoimentos prestados por Caio e João em sede policial, em razão do sistema da prova tarifada.',
    ),
    comment:
      'Jurisprudência consolidada (STF/STJ — CPP, art. 155): a condenação deve fundar-se na prova produzida em contraditório judicial; elementos informativos do inquérito não servem de sustentação exclusiva da sentença — RESSALVADAS as provas cautelares, não repetíveis e antecipadas. A alternativa B é o espelho da correta, mas suprime a ressalva das provas cautelares/não repetíveis/antecipadas, tornando-se equivocada. Gabarito: A.',
  },
]
