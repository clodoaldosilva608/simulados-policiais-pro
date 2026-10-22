import type { Question, QuestionOption, Subject } from '../types'

/**
 * PROVA OFICIAL — Polícia Federal 2025 (Edital nº 1 – PF – Policial, de 20/05/2025)
 * Aplicação: 27/07/2025 • Banca: CEBRASPE • Caderno 106_PF_CB2_01
 * Conhecimentos Básicos — Bloco I (cargos 15, 16 e 17: Escrivão, Agente e Papiloscopista)
 * Gabarito: gabaritos oficiais preliminares publicados pela PF/MJSP.
 * Itens com fórmulas estatísticas complexas (45–53) foram omitidos desta transcrição.
 */

const SUBJECTS: Subject[] = [
  { id: 'portugues', name: 'Língua Portuguesa', professor: '' },
  { id: 'redacao-oficial', name: 'Redação Oficial', professor: '' },
  { id: 'dir-adm', name: 'Direito Administrativo', professor: '' },
  { id: 'dir-const', name: 'Direito Constitucional', professor: '' },
  { id: 'dir-penal', name: 'Direito Penal', professor: '' },
  { id: 'dir-proc', name: 'Direito Processual Penal', professor: '' },
  { id: 'dir-humanos', name: 'Direitos Humanos e Direito Internacional', professor: '' },
  { id: 'leg-especial', name: 'Legislação Especial', professor: '' },
  { id: 'logico', name: 'Raciocínio Lógico', professor: '' },
]

const CE: QuestionOption[] = [
  { key: 'a', html: 'Certo' },
  { key: 'b', html: 'Errado' },
]

/** Mapa do gabarito oficial: C→'a' (Certo), E→'b' (Errado) */
const GAB: Record<number, 'C' | 'E'> = {
  1: 'E', 2: 'E', 3: 'C', 4: 'E', 5: 'E', 6: 'C', 7: 'E', 8: 'C', 9: 'C', 10: 'C',
  11: 'E', 12: 'C', 13: 'C', 14: 'E', 15: 'E', 16: 'C', 17: 'E', 18: 'E', 19: 'E', 20: 'C',
  21: 'C', 22: 'E', 23: 'C', 24: 'C', 25: 'E', 26: 'C', 27: 'E', 28: 'E', 29: 'C', 30: 'E',
  31: 'E', 32: 'C', 33: 'C', 34: 'E', 35: 'C', 36: 'E', 37: 'E', 38: 'C', 39: 'E', 40: 'C',
  41: 'E', 42: 'C', 43: 'C', 44: 'C', 57: 'E', 58: 'C', 59: 'C', 60: 'E',
  62: 'E', 63: 'C', 64: 'C',
}

interface Item {
  id: number
  subjectId: string
  statement: string
  comment: string
}

const ITEMS: Item[] = [
  {
    id: 1,
    subjectId: 'portugues',
    statement:
      'O texto sugere que o gênero policial é o preferido do público na literatura, na televisão e no cinema.',
    comment:
      'O texto apenas informa que o gênero policial tem sucesso duradouro e que suas narrativas respondem a preocupações sociais do público; em nenhum momento afirma que ele é o preferido em literatura, TV e cinema. Essa é uma generalização não sustentada pelo texto — por isso o item está ERRADO.',
  },
  {
    id: 2,
    subjectId: 'portugues',
    statement:
      'Entende-se da leitura do texto que a frequente transposição da narrativa de best-sellers para as telas da televisão e do cinema se justifica pela expectativa de repetição do sucesso obtido na venda das respectivas obras literárias.',
    comment:
      'O texto menciona a “crescente quantidade de best-sellers adaptados para o cinema” como constatação, mas não atribui essa transposição à expectativa de repetir o sucesso de vendas — o motivo apresentado é outro: as narrativas aproximam o público porque este se identifica nelas. Atribuição de causa não constante do texto → item ERRADO.',
  },
  {
    id: 3,
    subjectId: 'portugues',
    statement:
      'A partir das ideias de Carlos Gerbase reproduzidas no texto, conclui-se que as histórias narradas em livros e filmes podem nortear a conduta social de leitores e espectadores.',
    comment:
      'Segundo o texto, quando nos identificamos com determinado personagem, aprendemos a como agir socialmente (ou antissocialmente) e a literatura funciona como uma espécie de guia universal de boas maneiras para a convivência. Logo, as histórias podem de fato nortear a conduta social — item CERTO.',
  },
  {
    id: 4,
    subjectId: 'portugues',
    statement:
      'O termo “crescente” (segundo período do primeiro parágrafo) poderia ser substituído, sem prejuízo do sentido original do texto, por <b>considerável</b>.',
    comment:
      '“Crescente” indica algo que aumenta continuamente; “considerável” indica grande quantidade, sem a ideia de progressão. A troca alteraria o sentido original — item ERRADO.',
  },
  {
    id: 5,
    subjectId: 'portugues',
    statement:
      'No segundo período do segundo parágrafo, a oração “que as histórias têm começo, meio e fim” classifica-se sintaticamente como subordinada adjetiva restritiva.',
    comment:
      'A oração é subordinada substantiva — funciona como objeto direto de “explica” (o autor explica que as histórias têm começo, meio e fim). Não é adjetiva restritiva — item ERRADO.',
  },
  {
    id: 6,
    subjectId: 'portugues',
    statement:
      'A supressão da vírgula empregada após “personagem” (primeiro período do terceiro parágrafo) prejudicaria a correção gramatical do texto.',
    comment:
      'Em “quando nos identificamos com determinado personagem, aprendemos a como agir socialmente”, a oração adverbial é anteposta à principal, o que exige vírgula. Sua supressão prejudicaria a pontuação/correção — item CERTO.',
  },
  {
    id: 7,
    subjectId: 'portugues',
    statement:
      'No segundo parágrafo, o intercambiamento das expressões “Logo” (terceiro período) e “Além disso” (quarto período), embora alterasse as relações coesivas entre os períodos, manteria a coerência das ideias do texto.',
    comment:
      '“Logo” marca conclusão e “Além disso” marca soma. Trocá-los de lugar quebraria a relação lógico-discursiva adequada entre os períodos, prejudicando também a coerência do texto — item ERRADO.',
  },
  {
    id: 8,
    subjectId: 'portugues',
    statement:
      'O pronome presente no termo “nela” (último parágrafo) tem como referente “a narrativa policial”.',
    comment:
      'No trecho “os indivíduos, que buscam nela sanar suas preocupações com a segurança ou buscar um senso de justiça”, o pronome “nela” retoma “a narrativa policial” — item CERTO.',
  },
  {
    id: 9,
    subjectId: 'redacao-oficial',
    statement:
      'Os assuntos objetos dos expedientes oficiais devem ser tratados de forma estritamente impessoal, uma vez que a redação oficial é elaborada sempre em nome do serviço público e em atendimento ao interesse geral dos cidadãos.',
    comment:
      'A impessoalidade é característica essencial da redação oficial (MRPR): os expedientes devem evitar marcações pessoais, pois são feitos em nome do serviço público e no interesse geral — item CERTO.',
  },
  {
    id: 10,
    subjectId: 'redacao-oficial',
    statement:
      'Na redação oficial, os pronomes de tratamento são empregados em três contextos: endereçamento, vocativo e corpo do texto.',
    comment:
      'Conforme o MRPR, os pronomes de tratamento aparecem no endereçamento, no vocativo e no corpo do texto (nesse último, quando o texto volta a referir-se ao destinatário) — item CERTO.',
  },
  {
    id: 11,
    subjectId: 'dir-adm',
    statement:
      'A presunção de veracidade dos atos administrativos refere-se aos fatos, ou seja, presumem-se verdadeiros os fatos alegados pela administração pública, ao passo que a autoexecutoriedade constitui atributo pelo qual os atos administrativos se impõem a terceiros, independentemente de sua concordância.',
    comment:
      'A presunção de veracidade (ou legitimidade) presume verdadeiros os fatos e a legalidade dos atos administrativos; a autoexecutoriedade é o atributo que permite ao ato produzir efeitos imediatos e se impor a terceiros sem necessidade de autorização judicial — item CERTO.',
  },
  {
    id: 12,
    subjectId: 'dir-adm',
    statement:
      'A pessoa que sofrer algum dano por ato praticado por um servidor público no exercício da função poderá ajuizar ação de indenização somente contra o Estado.',
    comment:
      'Gabarito oficial: CERTO. Na regra do art. 37, §6º, da CF, o Estado responde objetivamente pelos danos causados por seus agentes no exercício da função; a vítima endereça sua pretensão indenizatória ao Estado, que depois ajuíza ação regressiva contra o agente (quando houver dolo ou culpa).',
  },
  {
    id: 13,
    subjectId: 'dir-adm',
    statement:
      'As sociedades de economia mista e as empresas públicas desempenham atividade de natureza econômica e se distinguem pela forma de organização e pela composição do capital.',
    comment:
      'Ambas exploram atividade econômica (art. 173, §1º, CF). A sociedade de economia mista é sempre sociedade anônima com participação pública minoritária no capital; a empresa pública pode assumir qualquer forma societária admitida em direito e tem capital público — distinguem-se, portanto, pela forma de organização e pelo capital — item CERTO.',
  },
  {
    id: 14,
    subjectId: 'dir-adm',
    statement:
      'O cancelamento do registro da penalidade de suspensão de servidor público, que ocorre após o decurso de dois anos de efetivo exercício, surtirá efeitos retroativos caso o servidor não pratique, nesse período, nova infração disciplinar.',
    comment:
      'É a leitura do art. 130, §2º, da Lei 8.112/90: o registro do cancelamento da suspensão produz efeitos retroativos à data da penalidade quando o servidor não comete nova infração no período — item CERTO.',
  },
  {
    id: 15,
    subjectId: 'dir-adm',
    statement:
      'É inexigível a licitação para a contratação que possa acarretar comprometimento da segurança nacional, nos casos estabelecidos pelo Ministério da Defesa, mediante demanda dos comandos das Forças Armadas.',
    comment:
      'É hipótese clássica de inexigibilidade de licitação (art. 25 da Lei 14.133/2021, que reproduz a lógica do art. 25 da Lei 8.666/93): contratação que possa acarretar comprometimento da segurança nacional, nos casos estabelecidos em regulamento pelo Ministério da Defesa — item CERTO.',
  },
  {
    id: 16,
    subjectId: 'dir-adm',
    statement:
      'O princípio da razoabilidade é considerado um princípio implícito da administração pública e se baseia naquilo que se situa dentro de limites aceitáveis.',
    comment:
      'A razoabilidade não está expressa no art. 37, caput, da CF (legalidade, impessoalidade, moralidade, publicidade e eficiência), sendo princípio implícito decorrente do regime jurídico-administrativo; exige que a atuação se situe dentro de limites aceitáveis — item CERTO.',
  },
  {
    id: 17,
    subjectId: 'dir-const',
    statement:
      'O sigilo da correspondência e das comunicações telefônicas pode ser afastado por determinação judicial, quando isso for necessário à apuração de infrações penais ou administrativas, conforme dispuser a lei.',
    comment:
      'O art. 5º, XII, da CF admite a quebra do sigilo por ordem judicial para fins de investigação criminal ou instrução processual penal. A inclusão genérica de “infrações administrativas” não corresponde ao texto constitucional — item ERRADO.',
  },
  {
    id: 18,
    subjectId: 'dir-const',
    statement:
      'A forma de governo diz respeito à relação entre os Poderes Executivo e Legislativo, ao passo que o sistema de governo refere-se à origem e à titularidade do poder político.',
    comment:
      'Está invertido: a forma de governo relaciona-se à origem e à titularidade do poder (monarquia x república); o sistema de governo diz respeito à relação entre Executivo e Legislativo (presidencialismo x parlamentarismo) — item ERRADO.',
  },
  {
    id: 19,
    subjectId: 'dir-const',
    statement:
      'Cabe à Polícia Federal exercer, com exclusividade, as funções de polícia judiciária da União, dos estados e do Distrito Federal.',
    comment:
      'À PF cabe apurar infrações penais contra a ordem política e social ou em detrimento de bens, serviços e interesses da União, bem como outras matérias de competência da União (art. 144, §1º, CF). As polícias civis exercem as funções de polícia judiciária dos estados e do DF — a exclusividade federal para estados/DF não existe. Item ERRADO.',
  },
  {
    id: 20,
    subjectId: 'dir-const',
    statement:
      'Além das pessoas físicas, as pessoas jurídicas também podem ser responsabilizadas penalmente pela prática de crimes ambientais.',
    comment:
      'A Lei 9.605/1998 (art. 3º) prevê expressamente a responsabilidade penal da pessoa jurídica por crimes ambientais — item CERTO.',
  },
  {
    id: 21,
    subjectId: 'dir-const',
    statement:
      'A pesquisa e a lavra de minerais em terras indígenas só podem ser efetivadas mediante autorização do Congresso Nacional.',
    comment:
      'O art. 231, §3º, da CF exige autorização do Congresso Nacional para o aproveitamento dos recursos hídricos e a pesquisa e lavra de riquezas minerais em terras indígenas, ouvidas as comunidades afetadas — item CERTO.',
  },
  {
    id: 22,
    subjectId: 'dir-const',
    statement:
      'O patrulhamento ostensivo das ferrovias federais compete à Polícia Rodoviária Federal.',
    comment:
      'O art. 144, §2º, da CF atribui à PRF o patrulhamento ostensivo das RODOVIAS federais; as ferrovias federais não constam da competência constitucional da PRF — item ERRADO.',
  },
  {
    id: 23,
    subjectId: 'dir-penal',
    statement:
      'O crime de prevaricação exige, além da conduta típica de retardar, deixar de praticar ou praticar indevidamente ato de ofício, o dolo específico de satisfazer interesse ou sentimento pessoal, não sendo suficiente a constatação de mera negligência ou descompromisso funcional.',
    comment:
      'O art. 319 do CP exige a finalidade especial de satisfazer interesse ou sentimento pessoal; a simples negligência pode configurar outras figuras (como prevaricação imprópria ou infração disciplinar), mas não a prevaricação típica — item CERTO.',
  },
  {
    id: 24,
    subjectId: 'dir-penal',
    statement:
      'O uso de um cabo de vassoura contra a vítima durante a prática de roubo pode justificar a aplicação da causa de aumento de pena prevista no art. 157, §2º, VII, do CP, desde que comprovada sua potencialidade lesiva, ainda que não haja perícia ou apreensão do objeto.',
    comment:
      'A jurisprudência consolidada (inclusive do STJ) admite a majorante do uso de arma quando o instrumento (ainda que impróprio) tem potencialidade lesiva, podendo ser demonstrada por testemunhos, sem necessidade de perícia ou apreensão — item CERTO.',
  },
  {
    id: 25,
    subjectId: 'dir-penal',
    statement:
      'Considere que um casal tenha sido preso em flagrante enquanto furtava cabos de energia elétrica em via pública: a mulher encontrava-se ao lado do poste com uma mochila onde estavam armazenados diversos metros de fios já cortados e perto dela havia um facão utilizado para o corte; o homem se encontrava no alto do poste, com o facão em mãos, em plena retirada de novos cabos. Nessa situação, a ausência de laudo pericial sobre o local e os meios utilizados impede, em relação à mulher, a configuração da qualificadora da escalada no crime de furto, ainda que policiais tenham presenciado diretamente a prática delitiva e narrado detalhadamente os fatos.',
    comment:
      'A escalada (art. 155, §4º, II, CP) é qualificadora que dispensa perícia técnica quando comprovada por outros meios de prova (declarações de policiais que presenciaram os fatos). A ausência de laudo pericial não impede o reconhecimento da qualificadora — item ERRADO.',
  },
  {
    id: 26,
    subjectId: 'dir-proc',
    statement:
      'O inquérito policial poderá ser iniciado mediante requerimento do ofendido, mesmo nos crimes de ação pública incondicionada.',
    comment:
      'O art. 5º, §1º, do CPP permite que, nos crimes de ação pública, o inquérito seja iniciado de ofício, mediante requisição da autoridade competente ou mediante requerimento do ofendido ou de quem tiver qualidade para representá-lo — item CERTO.',
  },
  {
    id: 27,
    subjectId: 'dir-proc',
    statement:
      'A autoridade policial deve instaurar inquérito policial sempre que qualquer pessoa do povo comunicar, verbalmente ou por escrito, a ocorrência de uma infração penal, independentemente da natureza da ação penal ou da verificação da procedência das informações.',
    comment:
      'O art. 5º, §3º, do CPP prevê a comunicação de infrações por qualquer pessoa do povo, mas a autoridade deve verificar a procedência das informações, e o trâmite depende da natureza da ação penal (representação, requisição do Ministério da Justiça etc.). A afirmativa é absolutista demais — item ERRADO.',
  },
  {
    id: 28,
    subjectId: 'dir-proc',
    statement:
      'Durante operação de fiscalização em águas internacionais (alto-mar), uma embarcação brasileira de propriedade privada foi flagrada transportando substâncias entorpecentes. As autoridades estrangeiras permitiram que o Brasil conduzisse a investigação e eventual processo criminal, já que a embarcação estava registrada no Brasil. Com base na situação hipotética e no disposto no CP, julgue o item: como o crime ocorreu fora do território brasileiro, em alto-mar, e não envolveu embarcação pública, a lei penal brasileira não pode ser aplicada ao caso.',
    comment:
      'O art. 7º, II, “a”, do CP estabelece a extraterritorialidade condicionada: crimes cometidos a bordo de embarcações brasileiras de propriedade privada em alto-mar são puníveis no Brasil, se não forem julgados no estrangeiro (e outras condições). Como as autoridades estrangeiras permitiram a condução da investigação pelo Brasil, a lei penal brasileira se aplica — item ERRADO.',
  },
  {
    id: 29,
    subjectId: 'dir-humanos',
    statement:
      'Na admissão de indivíduos em estabelecimentos prisionais, deverá ser adicionado, no sistema de registro do recluso, inventário dos seus bens pessoais.',
    comment:
      'As Regras de Mandela (regra 55) e o sistema de registro do recluso exigem inventário dos bens pessoais no momento da admissão, para garantia e devolução posterior — item CERTO.',
  },
  {
    id: 30,
    subjectId: 'dir-humanos',
    statement:
      'As Regras de Mandela contemplam a possibilidade de se impor ao recluso a realização de trabalho no estabelecimento prisional em cumprimento de qualquer medida disciplinar.',
    comment:
      'As Regras de Mandela proíbem expressamente o trabalho forçado como sanção disciplinar (regras 43 e 44): medidas disciplinares não podem incluir trabalho como punição — item ERRADO.',
  },
  {
    id: 31,
    subjectId: 'dir-humanos',
    statement:
      'A separação de categorias de pessoas presas deve orientar-se por critérios de gênero, idade e natureza dos delitos, não havendo regra que determine a separação dos presos em razão da natureza da detenção, isto é, se preventiva ou se oriunda de condenação definitiva.',
    comment:
      'As Regras de Mandela (regra 11) determinam separação também conforme a razão da detenção: pessoas presas preventivamente devem ser separadas das condenadas definitivamente — a assertiva nega essa regra — item ERRADO.',
  },
  {
    id: 32,
    subjectId: 'dir-humanos',
    statement:
      'Qualquer pessoa declarada culpada por um delito terá o direito de recorrer a uma instância superior para rever a sentença condenatória que lhe tenha sido imposta e a pena que lhe tenha sido aplicada.',
    comment:
      'É o direito ao duplo grau previsto no art. 14, §5º, do Pacto Internacional sobre Direitos Civis e Políticos e nas Regras de Mandela (regra 58) — item CERTO.',
  },
  {
    id: 33,
    subjectId: 'dir-humanos',
    statement:
      'Os Estados-partes da Convenção contra a Tortura e Outros Tratamentos ou Penas Cruéis, Desumanos ou Degradantes devem incluir os atos de tortura como crimes extraditáveis em todos os tratados de extradição que vierem a concluir entre si.',
    comment:
      'O art. 8º, §1º, da Convenção determina que os atos de tortura sejam incluídos como crimes extraditáveis em todo tratado de extradição a ser celebrado entre os Estados-partes — item CERTO.',
  },
  {
    id: 34,
    subjectId: 'dir-humanos',
    statement:
      'A Convenção Relativa ao Estatuto dos Refugiados veda aos Estados contratantes, em qualquer circunstância, a expulsão de refugiados.',
    comment:
      'A vedação absoluta é do refoulement — expulsão/retorno para locais onde a vida ou a liberdade estejam ameaçadas (non-refoulement); a Convenção admite expulsão por razões de segurança nacional ou ordem pública, com devido processo — a expressão “em qualquer circunstância” torna o item ERRADO.',
  },
  {
    id: 35,
    subjectId: 'leg-especial',
    statement:
      'O pedido do Ministério Público para aplicação de medida socioeducativa deverá ser julgado improcedente pela autoridade judiciária nas seguintes hipóteses: comprovação da inexistência do fato; ausência de prova da existência do fato; não caracterização do fato como ato infracional; e falta de prova da participação do adolescente no ato infracional.',
    comment:
      'É a literalidade do art. 189, §2º, do ECA (Lei 8.069/90): as quatro hipóteses de improcedência listadas — item CERTO.',
  },
  {
    id: 36,
    subjectId: 'leg-especial',
    statement:
      'No âmbito da segurança privada, compete à Polícia Federal renovar, a cada dois anos, a autorização de funcionamento das empresas de monitoramento de sistemas eletrônicos de segurança que atuam, simultaneamente, em mais de um estado da Federação.',
    comment:
      'Pela Lei 14.967/2024 (novo marco da segurança privada), a renovação da autorização de funcionamento ocorre a cada cinco anos, e não a cada dois — item ERRADO.',
  },
  {
    id: 37,
    subjectId: 'leg-especial',
    statement:
      'Segundo a Lei de Migração, desde que exista disposição específica em tratado, o pedido de prisão cautelar poderá ser transmitido à autoridade competente para extradição no Brasil, mediante canal estabelecido com o ponto focal da INTERPOL no país, devidamente instruído com a documentação comprobatória da existência de ordem de prisão proferida por Estado estrangeiro.',
    comment:
      'É a literalidade do art. 96 da Lei 13.445/2017 (Lei de Migração): prisão cautelar para fins de extradição via ponto focal INTERPOL, quando houver disposição em tratado — item CERTO.',
  },
  {
    id: 38,
    subjectId: 'leg-especial',
    statement:
      'A apreensão dos meios de transporte e dos maquinários, utensílios, instrumentos e objetos de qualquer natureza utilizados para a prática, habitual ou não, do tráfico ilícito de drogas deve ser imediatamente comunicada pela autoridade de polícia judiciária responsável pela investigação ao juízo competente, que, no prazo de trinta dias, contado dessa comunicação, deve determinar a alienação dos bens apreendidos, excetuadas as armas.',
    comment:
      'O art. 63 da Lei 11.343/2006 prevê a alienação em 30 dias dos veículos e objetos apreendidos, mas a exceção alcança ARMAS, MUNIÇÕES E OUTROS OBJETOS cuja alienação for contrária ao interesse público — o item restringe indevidamente a exceção (“excetuadas as armas”) — item ERRADO.',
  },
  {
    id: 39,
    subjectId: 'leg-especial',
    statement:
      'O condenado por crime de tortura, bem como aquele que se houver omitido em face das condutas que o caracterizam quando tinha o dever de evitá-las ou apurá-las, iniciará o cumprimento da pena em regime fechado.',
    comment:
      'O art. 1º, §4º, da Lei 9.455/1997 impõe regime inicial fechado tanto ao autor da tortura quanto ao que, tendo o dever de evitá-la ou apurá-la, se omite — item CERTO.',
  },
  {
    id: 40,
    subjectId: 'leg-especial',
    statement:
      'A carteira de identidade fará prova de todos os dados nela incluídos, dispensando a apresentação dos documentos que lhe deram origem ou que nela tenham sido mencionados.',
    comment:
      'É a literalidade da Lei 7.116/1983 (art. 5º, parágrafo único) e do Decreto 11.797/2023 sobre a Carteira Nacional de Identificação — item CERTO.',
  },
  {
    id: 41,
    subjectId: 'leg-especial',
    statement:
      'No âmbito do Serviço de Identificação do Cidadão, compete à Polícia Federal definir especificações técnicas de documentos de segurança vinculados à identificação de pessoas naturais e regulamentar o procedimento a ser adotado em caso de divergência na verificação dos dados da pessoa natural.',
    comment:
      'As competências do Serviço de Identificação do Cidadão (Lei 7.116/1983) são dos órgãos de identificação estaduais e da regulação federal própria, não da Polícia Federal — item ERRADO.',
  },
  {
    id: 42,
    subjectId: 'leg-especial',
    statement:
      'Quando houver repercussão interestadual ou internacional que exija repressão uniforme, poderá o Departamento de Polícia Federal do Ministério da Justiça, sem prejuízo da responsabilidade dos órgãos de segurança pública arrolados na Constituição Federal de 1988, proceder à investigação de quaisquer crimes praticados por meio da rede mundial de computadores que difundam conteúdo misógino, definido como aquele que propaga ódio ou aversão às mulheres.',
    comment:
      'A legislação recente sobre crimes cibernéticos (Lei 14.994/2024) incluiu o difundimento de conteúdo misógino entre as infrações investigáveis pela PF quando houver repercussão interestadual ou internacional que exija repressão uniforme (Lei 10.446/2002) — item CERTO.',
  },
  {
    id: 43,
    subjectId: 'leg-especial',
    statement:
      'Pratica crime o proprietário de empresa de segurança e transporte de valores que, nas primeiras 24 horas depois de sofrer perda, furto, roubo ou outra forma de extravio de arma de fogo, acessório ou munição que estejam sob sua guarda, deixa de registrar ocorrência policial e de comunicar o fato à Polícia Federal.',
    comment:
      'O art. 15 da Lei 10.826/2003 (com a alteração da Lei 14.688/2023) criminaliza exatamente essa omissão do proprietário/diretor técnico de empresa de segurança privada no prazo de 24 horas — item CERTO.',
  },
  {
    id: 44,
    subjectId: 'leg-especial',
    statement:
      'Nas infrações penais derivadas de condutas e atividades lesivas ao meio ambiente, a ação penal é pública incondicionada.',
    comment:
      'É a literalidade do art. 26 da Lei 9.605/1998: nas infrações penais desta lei, a ação penal é pública INCONDICIONADA — item CERTO.',
  },
  {
    id: 57,
    subjectId: 'logico',
    statement:
      'Em determinado dia, 1.000 veículos de carga, com seus respectivos condutores e cargas, passaram por um posto de fiscalização de fronteira. Desses, 800 estavam com a documentação em situação regular e 200 apresentavam alguma irregularidade. Tendo como base a situação hipotética apresentada, julgue o item: a negação da sentença “todo condutor abordado na fiscalização era brasileiro ou estrangeiro” é a seguinte sentença: “nenhum condutor abordado na fiscalização era brasileiro ou estrangeiro”.',
    comment:
      'A negação correta de “todo X é A ou B” é “existe pelo menos um X que não é A e não é B” (algum condutor não era brasileiro e não era estrangeiro). A sentença proposta (“nenhum condutor...”) é negação de “algum condutor era brasileiro ou estrangeiro” — item ERRADO.',
  },
  {
    id: 58,
    subjectId: 'logico',
    statement:
      'Se duas placas forem aleatoriamente selecionadas ao final do dia entre as 1.000 placas registradas, será superior a 0,3 a probabilidade de uma delas pertencer a um veículo/condutor/carga em situação irregular e a outra, a um veículo/condutor/carga em situação regular.',
    comment:
      'P(irregular e regular, em 2 extrações sem reposição) = 2 × (200/1000) × (800/999) ≈ 0,320 > 0,3 — item CERTO.',
  },
  {
    id: 59,
    subjectId: 'logico',
    statement:
      'Considere que as placas de todos os veículos sejam constituídas por uma sequência de 4 letras justaposta a uma sequência de 3 dígitos numéricos entre 0 e 9, admitindo-se repetições. Considere, ainda, que a soma dos dígitos numéricos da placa de cada um dos 1.000 veículos fiscalizados seja sempre superior ou igual a 26. Nessa situação, pelo menos 250 placas têm os mesmos dígitos numéricos, nas mesmas posições.',
    comment:
      'Com 3 dígitos (0–9), as triplas com soma ≥ 26 são pouquíssimas (soma 27 = 9+9+9; soma 26 = 8+9+9 e permutações) — menos de 4 combinações distintas. Pelo princípio da casa dos pombos, 1.000 placas distribuídas em menos de 4 combinações garantem ao menos 250 placas com os mesmos dígitos nas mesmas posições — item CERTO.',
  },
  {
    id: 60,
    subjectId: 'logico',
    statement:
      'Considere que, entre os veículos em situação irregular, 120 apresentavam problemas na documentação do veículo; 85, na documentação do condutor; e 40, na documentação da carga transportada. Além disso, os veículos com problemas na documentação da carga não apresentavam problemas na documentação do veículo nem na documentação do condutor. Nessa situação, é inferior a 40 a quantidade de veículos que apresentavam, simultaneamente, irregularidades na documentação do veículo e do seu condutor.',
    comment:
      'Total irregular = 200. Excluindo os 40 de carga: 160 veículos com problemas em veículo e/ou condutor. Pela inclusão-exclusão: |V ∪ C| = |V| + |C| − |V ∩ C| → 160 = 120 + 85 − |V∩C| → |V∩C| = 45 > 40. Logo, NÃO é inferior a 40 — item ERRADO.',
  },
  {
    id: 62,
    subjectId: 'logico',
    statement:
      'Considere que um crime foi cometido e três suspeitos desse crime, X, Y e Z, foram intimados e conduzidos a um interrogatório. Nessa ocasião, sobre o crime, X afirmou: “nem Y nem Z são culpados”; Z afirmou: “os culpados foram Y e X”; e Y afirmou: “o culpado foi Z ou X”. Sabendo-se que todos os suspeitos mentiram, é correto concluir que o culpado do crime é X.',
    comment:
      'Se todos mentiram: da mentira de Y (“o culpado foi Z ou X”) conclui-se que o culpado não é Z nem X; da mentira de X (“nem Y nem Z são culpados”) conclui-se que Y ou Z são culpados; logo, o culpado é Y — não X — item ERRADO.',
  },
  {
    id: 63,
    subjectId: 'logico',
    statement:
      'Considere as proposições verdadeiras — P: “Se Paulo é parente da vítima, então ele é inocente e estava no exterior no dia do crime”. Q: “Se Paulo tem o mesmo sobrenome da vítima ou tem o mesmo tipo sanguíneo, então ele é parente da vítima”. Com base nessas proposições, é correto afirmar que, se Paulo não estava no exterior no dia do crime, então ele não tem o mesmo tipo sanguíneo da vítima.',
    comment:
      'De P, pela contrapositiva: se Paulo não estava no exterior (ou não é inocente), então não é parente. Não sendo parente, de Q: nem tem o mesmo sobrenome, nem tem o mesmo tipo sanguíneo. Logo, a conclusão decorre logicamente — item CERTO.',
  },
  {
    id: 64,
    subjectId: 'logico',
    statement:
      'Suponha que a sentença “Se Aldo ou Bruno é filho de Carlos, então Daniel é pai de Elza e de Fernanda” seja verdadeira. Nesse caso, se Elza não for filha de Daniel, então Carlos não é pai de Aldo nem de Bruno.',
    comment:
      'A negação do consequente (“Daniel é pai de Elza e de Fernanda” — basta Elza não ser filha) leva, pela contrapositiva, à negação do antecedente: nem Aldo nem Bruno é filho de Carlos — item CERTO.',
  },
]

export const QUESTIONS: Question[] = ITEMS.map((it) => ({
  id: it.id,
  subjectId: it.subjectId,
  statement: it.statement,
  options: CE,
  answer: GAB[it.id] === 'C' ? 'a' : 'b',
  comment: it.comment,
}))

export const PF_SUBJECTS = SUBJECTS
