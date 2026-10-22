import type { QuestionOption } from '../types'

/**
 * PROVA OFICIAL — PRF 2021 — Parte 2 (itens 55 a 120, Blocos II e III)
 * Banca: CEBRASPE • Caderno 578_PRF_001_01 • Gabarito DEFINITIVO
 * Itens anulados (X): 67, 69, 76, 83, 89, 98, 99 (não transcritos).
 */

const CE: QuestionOption[] = [
  { key: 'a' as const, html: 'Certo' },
  { key: 'b' as const, html: 'Errado' },
]

export interface ItemPrf2 {
  id: number
  subjectId: string
  statement: string
  comment: string
}

export const ITEMS_PRF2: ItemPrf2[] = [
  {
    id: 55,
    subjectId: 'geografia',
    statement:
      'Os arranjos populacionais de Campinas e Ribeirão Preto, no estado de São Paulo, e de Uberlândia, em Minas Gerais, configuram-se como metrópoles em ascensão na rede urbana brasileira e encontram-se no primeiro nível da hierarquia urbana.',
    comment:
      'No IBGE (Regic), Campinas, Ribeirão Preto e Uberlândia são metrópoles — mas do SEGUNDO nível da hierarquia urbana brasileira; no primeiro nível figuram apenas São Paulo, Rio de Janeiro, Belo Horizonte, Porto Alegre, Recife, Salvador, Brasília, Fortaleza, Curitiba e Manaus. Item ERRADO.',
  },
  {
    id: 56,
    subjectId: 'leg-transito',
    statement:
      'Em rodovias de via dupla de zonas rurais em que não houver sinalização regulamentadora, deve-se aplicar a automóveis, camionetas e motocicletas o mesmo limite máximo de velocidade permitido para transitar.',
    comment:
      'CTB, art. 61, I, “a” (com a redação da Lei 14.071/2020): nas rodovias de pista dupla, quando não houver sinalização regulamentadora, o limite é de 110 km/h para automóveis, camionetas E MOTOCICLETAS — o mesmo limite para as três categorias. Item CERTO.',
  },
  {
    id: 57,
    subjectId: 'leg-transito',
    statement:
      'Veículos em movimento em via pública que possuam espelhos retrovisores em ambos os lados poderão usar cortinas nas áreas envidraçadas.',
    comment:
      'CTB, art. 110, parágrafo único: a proibição de cortinas, persianas ou antolhos que reduzam a visibilidade NÃO se aplica a veículos equipados com espelhos retrovisores de ambos os lados. Item CERTO.',
  },
  {
    id: 58,
    subjectId: 'leg-transito',
    statement:
      'Considere que, em determinada rodovia federal, tenha havido um acidente, sem vítimas, em que um veículo colidira com outro, do que resultara, para os dois veículos, em avaria e em dano patrimonial. Nessa situação hipotética, o causador do acidente deverá preservar o local, a fim de facilitar os trabalhos da polícia e da perícia, sob pena de responder por grave infração administrativa de trânsito.',
    comment:
      'CTB, art. 176, I: a obrigação de preservar o local, sob pena de grave infração, é para acidente COM VÍTIMA. Sem vítimas, os envolvidos podem remover os veículos (art. 178). Item ERRADO.',
  },
  {
    id: 59,
    subjectId: 'leg-transito',
    statement:
      'Para que autoridade ou agente policial possa autorizar a remoção de veículos envolvidos em acidente de trânsito ocorrido em leito de via pública que tenha causado lesão em pessoas e dano aos veículos envolvidos, é necessário que antes tenha sido prestado socorro às vítimas e realizada a perícia no local.',
    comment:
      'CTB, art. 178: havendo vítima, a remoção depende de socorro às vítimas; a perícia no local como condição obrigatória é exigida apenas nos acidentes COM MORTE (art. 179) — não basta lesão. A exigência de perícia prévia no caso de lesões torna o item ERRADO.',
  },
  {
    id: 60,
    subjectId: 'leg-transito',
    statement:
      'Cidadão que seja penalmente inimputável não pode obter habilitação para conduzir veículo automotor e elétrico.',
    comment:
      'CTB, art. 140, § único: é vedada a expedição de CNH ao candidato penalmente inimputável. Item CERTO.',
  },
  {
    id: 61,
    subjectId: 'leg-transito',
    statement:
      'A fiscalização de trânsito por videomonitoramento independe de sinalização na via e, em caso de infração, a autoridade ou o agente de trânsito responsável pela lavratura de auto de infração deve indicar, no campo observação, informações relativas ao modo de constatação da referida infração.',
    comment:
      'Resolução CONTRAN nº 798/2020: o videomonitoramento não exige sinalização específica na via (diferente do radar de velocidade) e o auto de infração deve indicar no campo de observações o modo de constatação. Item CERTO.',
  },
  {
    id: 62,
    subjectId: 'leg-transito',
    statement:
      'A emissão de Certificado de Registro e Licenciamento de Veículo em meio digital (CRLV-e), no qual constam o Certificado de Registro de Veículo (CRV) e o Certificado de Licenciamento Anual (CLA), é obrigatória se houver transferência de propriedade, sendo dispensável em caso de mudança de município de residência do proprietário.',
    comment:
      'Resolução CONTRAN nº 988/2023: o CRLV-e concentra CRV e CLA; a nova emissão é OBRIGATÓRIA na transferência de propriedade e também na mudança de município/domicílio do proprietário — por isso a dispensa pretendida é falsa. Item ERRADO.',
  },
  {
    id: 66,
    subjectId: 'leg-transito',
    statement:
      'Infração de trânsito concomitante é aquela em que o cometimento de uma infração tem como pressuposto o cometimento de outra.',
    comment:
      'Resolução CONTRAN nº 918/2022: infração concomitante é aquela em que o cometimento de uma infração tem como pressuposto o cometimento de outra (ex.: estacionar em vaga reservada sem credencial pressupõe estacionar em local proibido). Item CERTO.',
  },
  {
    id: 68,
    subjectId: 'leg-transito',
    statement:
      'A circulação de veículos em via pode ocorrer a título precário, sendo vedado o transporte de passageiro que esteja em pé no veículo ou que tenha menos de dezoito anos de idade no caso de transporte de passageiros em veículos de carga ou misto.',
    comment:
      'CTB, art. 67, § único (circulação a título precário) e art. 107 (é proibido o transporte de passageiros em pé em veículos de carga/misto; e é vedado transportar menores de 18 anos em veículos de carga ou misto). Item CERTO.',
  },
  {
    id: 70,
    subjectId: 'leg-transito',
    statement:
      'É permitido que veículos de passageiros, ônibus, micro-ônibus e caminhões transitem em rodovia com trincas em seus para-brisas, desde que elas estejam dentro do limite previsto em norma específica e não haja fratura de configuração circular.',
    comment:
      'Resolução CONTRAN nº 344/2005 (vidros de segurança): admitem-se trincas/quebras não extensas dentro dos limites da norma, vedada a fratura de configuração circular (em forma de moeda) na área de visão do condutor. Item CERTO.',
  },
  {
    id: 71,
    subjectId: 'leg-transito',
    statement:
      'O equipamento em questão deve apresentar o tempo de movimentação do veículo, bem como suas interrupções.',
    comment:
      'Resolução CONTRAN nº 91/2018 (registrador instantâneo e inalterável de velocidade e tempo): o equipamento deve registrar o tempo de movimentação do veículo e suas interrupções. Item CERTO.',
  },
  {
    id: 72,
    subjectId: 'leg-transito',
    statement:
      'Em caso de operação de fiscalização do registrador instantâneo e inalterável de velocidade e tempo, o policial rodoviário federal deve identificar-se e assinar o verso do disco ou da fita diagrama, além de mencionar o local, a data e horário em que ocorreu a fiscalização.',
    comment:
      'Resolução CONTRAN sobre o disco/fitas diagrama: o agente fiscalizador deve identificar-se, assinar o verso do disco/fita e registrar local, data e horário da fiscalização. Item CERTO.',
  },
  {
    id: 73,
    subjectId: 'leg-transito',
    statement:
      'É de seis meses o prazo em que as informações relativas às últimas vinte e quatro horas de operação do veículo devem ficar à disposição das autoridades competentes em caso de acidente.',
    comment:
      'Resolução CONTRAN nº 91/2018: em caso de acidente, as informações das últimas 24 horas de operação registradas no equipamento devem ficar à disposição das autoridades pelo prazo de seis meses. Item CERTO.',
  },
  {
    id: 74,
    subjectId: 'leg-transito',
    statement:
      'A largura máxima autorizada para a circulação de veículos em via pública, com ou sem carga, é de 2,50 metros.',
    comment:
      'CTB, art. 99, II: a largura máxima autorizada é de 2,60 metros (as dimensões máximas: comprimento 14,00 m; largura 2,60 m; altura 4,40 m). Item ERRADO.',
  },
  {
    id: 78,
    subjectId: 'leg-transito',
    statement:
      'Na condução de veículo de carga com peso bruto total superior a 4.536 kg, é permitido ao motorista profissional dirigir por até seis horas e meia ininterruptas.',
    comment:
      'Lei 13.103/2015, art. 5º, I: o tempo máximo de direção ininterrupta do motorista profissional é de 4 horas e meia, facultado o acréscimo de uma hora em condições especiais — nunca seis horas e meia. Item ERRADO.',
  },
  {
    id: 81,
    subjectId: 'leg-transito',
    statement:
      'Excetuados os produtos perigosos e a critério do policial rodoviário federal, desde que observadas as condições de segurança, produtos perecíveis e cargas vivas podem ser dispensados do remanejamento ou transbordo em caso de excesso de peso veicular.',
    comment:
      'Lei 10.709/2003 e Resolução CONTRAN: em caso de excesso de peso, cabe o remanejamento/transbordo; produtos perecíveis e cargas vivas (excetuados os perigosos) podem, a critério do fiscal, ser dispensados do transbordo, observadas as condições de segurança. Item CERTO.',
  },
  {
    id: 86,
    subjectId: 'dir-adm',
    statement:
      'A impetração de mandado de segurança configura controle judicial de mérito administrativo.',
    comment:
      'O mandado de segurança é instrumento de controle da LEGALIDADE do ato administrativo — o Judiciário não revê o mérito (conveniência e oportunidade), apenas a legalidade. Item ERRADO.',
  },
  {
    id: 87,
    subjectId: 'dir-adm',
    statement:
      'Órgão público é ente descentralizado da administração indireta que possui personalidade jurídica de direito público.',
    comment:
      'Órgão público é centro de competência SEM personalidade jurídica, integrante da administração DIRETA. A administração indireta é formada por autarquias, fundações, empresas públicas e sociedades de economia mista (entes com personalidade jurídica). Item ERRADO.',
  },
  {
    id: 88,
    subjectId: 'dir-adm',
    statement:
      'Essa situação caracteriza contratação direta por dispensa de licitação.',
    comment:
      'A contratação de empresa de reconhecida especialização em serviço singular, após justificativa de preço e compatibilidade, configura contratação direta por DISPENSA de licitação (Lei 14.133/2021, art. 74, XXV — ex-art. 25, II, da Lei 8.666/93). Item CERTO.',
  },
  {
    id: 90,
    subjectId: 'dir-adm',
    statement:
      'O ajuizamento da ação judicial para conter eventuais abusos praticados pela administração pública caracteriza a aplicação do princípio da sindicabilidade.',
    comment:
      'A sindicabilidade é a sujeição dos atos administrativos ao controle judicial: a ação que apura abusos (ultra vires) da administração é exatamente o exercício desse controle. Item CERTO.',
  },
  {
    id: 91,
    subjectId: 'leg-carreira',
    statement:
      'A promoção do policial rodoviário federal para a segunda classe depende de participação em cursos de capacitação cujo conteúdo seja compatível com as atribuições do cargo e que tenha duração de, no mínimo, 150 horas.',
    comment:
      'Lei 10.253/2001: a promoção para a segunda classe (2ª classe da carreira PRF) exige a participação em cursos de capacitação compatíveis com as atribuições do cargo, com carga horária mínima de 150 horas. Item CERTO.',
  },
  {
    id: 92,
    subjectId: 'leg-carreira',
    statement:
      'As atribuições do policial rodoviário federal de terceira classe, cuja jornada de trabalho é de quarenta horas semanais, incluem realizar patrulhamento e policiamento ostensivo.',
    comment:
      'Lei 10.253/2001: a carreira PRF compreende as classes especial (1ª, 2ª e 3ª) e superior; a jornada é de 40 horas semanais e as atribuições incluem o patrulhamento e o policiamento ostensivo federal. Item CERTO.',
  },
  {
    id: 93,
    subjectId: 'dir-const',
    statement:
      'A manifestação pública em defesa da abolição de crime, por ser considerada incitação à prática de fato criminoso, não está protegida pela liberdade de reunião.',
    comment:
      'Defender a abolição de um tipo penal (descriminalização) é pauta política-legislativa lícita, protegida pela liberdade de reunião e de expressão (CF, art. 5º, IV e XVI) — não se confunde com incitação à prática de fato criminoso. Item ERRADO.',
  },
  {
    id: 95,
    subjectId: 'dir-const',
    statement:
      'As hipóteses de perda da nacionalidade brasileira previstas na Constituição Federal de 1988 têm natureza taxativa, de modo que nem mesmo convenções ou tratados internacionais podem ampliá-las.',
    comment:
      'CF, art. 12, § 4º: a perda da nacionalidade ocorre apenas nas duas hipóteses taxativas (cancellation de naturalização por atividade nociva e aquisição voluntária de outra nacionalidade). Item CERTO.',
  },
  {
    id: 97,
    subjectId: 'dir-const',
    statement:
      'De acordo com o Supremo Tribunal Federal, não é cabível habeas data para a obtenção de informações a respeito da identidade de responsáveis por agressões e denúncias feitas contra o impetrante.',
    comment:
      'STF (MS 23.652): o habeas data (CF, art. 5º, LXXII) não serve para apurar autoria de denúncias/agressões nem para colher dados de terceiros — sua finalidade é o conhecimento/retificação de dados pessoais do impetrante em registros públicos. Item CERTO.',
  },
  {
    id: 100,
    subjectId: 'dir-penal',
    statement:
      'A remarcação de novo número no chassi e a falsificação do certificado de registro do veículo caracterizam crime único de falsificação de documento público.',
    comment:
      'São crimes distintos: remarcação de novo número no chassi (Lei 9.243/1995, art. 3º) e falsificação de documento público (CP, art. 299) — a falsificação de documento não é meio necessário/normal da adulteração, configurando-se em concurso. Item ERRADO.',
  },
  {
    id: 101,
    subjectId: 'dir-penal',
    statement:
      'A remarcação do chassi com o mesmo número original do veículo caracteriza crime contra a fé pública e infração administrativa de trânsito.',
    comment:
      'Lei 9.243/1995, art. 3º, § único: remarcar o chassi com o MESMO número original NÃO configura crime (somente infração administrativa) — portanto não há crime contra a fé pública. Item ERRADO.',
  },
  {
    id: 102,
    subjectId: 'dir-penal',
    statement:
      'Ao oferecer dinheiro para ser irregularmente liberado da blitz, o condutor praticou o crime de corrupção ativa.',
    comment:
      'CP, art. 333: oferecer vantagem indevida a funcionário público, para determiná-lo a praticar, omitir ou retardar ato de ofício, configura corrupção ATIVA — consumada com o mero oferecimento. Item CERTO.',
  },
  {
    id: 103,
    subjectId: 'dir-penal',
    statement:
      'Nessa situação, se o policial não aceitar o dinheiro oferecido, a conduta da pessoa deve ser punida na modalidade tentada.',
    comment:
      'Corrupção ativa (CP, art. 333) é crime formal que se CONSUMA com o oferecimento/promessa da vantagem, independentemente da aceitação ou do ato do funcionário — não há tentativa. Item ERRADO.',
  },
  {
    id: 104,
    subjectId: 'dir-penal',
    statement:
      'A adulteração grosseira do chassi do veículo não caracteriza crime impossível.',
    comment:
      'CP, art. 17: o crime impossível exige ineficácia ABSOLUTA do meio; a adulteração grosseira do chassi continua sendo meio relativo — configura o crime da Lei 9.243/1995 (STJ). Item CERTO.',
  },
  {
    id: 105,
    subjectId: 'dir-proc',
    statement:
      'A busca e a apreensão no veículo foram ilícitas, já que o policial as realizou sem autorização judicial.',
    comment:
      'CPP, art. 240, § 1º, II: a busca pessoal independe de mandado judicial quando houver fundada suspeita de o agente portar coisa proibida ou ser objeto de prisão; a busca em veículo segue a mesma regra (CPP, art. 243). Item ERRADO.',
  },
  {
    id: 106,
    subjectId: 'dir-proc',
    statement:
      'A situação caracteriza flagrante próprio e, em até vinte e quatro horas após a realização da prisão, deverá ser entregue a nota de culpa ao preso.',
    comment:
      'Flagrante PRÓPRIO (CPP, art. 302, I) e, nos termos do art. 306 do CPP, a nota de culpa deve ser entregue ao preso em até 24 horas após a prisão. Item CERTO.',
  },
  {
    id: 107,
    subjectId: 'dir-proc',
    statement:
      'A identificação criminal do condutor não poderá ser feita, uma vez que ele foi identificado civilmente pela CNH.',
    comment:
      'Lei 12.037/2009, art. 3º, III: a identificação criminal é possível quando o documento civil apresentado for INSUFICIENTE para identificação — a CNH com rasura não identifica de forma confiável. Item ERRADO.',
  },
  {
    id: 108,
    subjectId: 'dir-proc',
    statement:
      'O policial poderá ser arrolado como testemunha, caso em que seu depoimento terá valor probatório superior ao do interrogatório do condutor.',
    comment:
      'O policial PODE ser testemunha (CPP, art. 208), mas adota o sistema da persuasão racional: não há hierarquia de provas — o depoimento do policial não vale mais que o interrogatório. Item ERRADO.',
  },
  {
    id: 109,
    subjectId: 'dir-proc',
    statement:
      'A prisão do condutor é uma espécie de prisão provisória, dispensa a expedição de mandado e o policial deve exigir o recibo de entrega do preso.',
    comment:
      'A prisão em flagrante é prisão PROVISÓRIA (cautelar), dispensa mandado (CPP, art. 301) e, nos termos do art. 301, § único, deve-se exigir do condutor recibo de entrega do preso. Item CERTO.',
  },
  {
    id: 110,
    subjectId: 'dir-penal',
    statement:
      'Caso três pessoas associadas, com divisão de tarefas, subtraiam substância explosiva, estará configurado crime hediondo.',
    comment:
      'Lei 8.072/1990, art. 1º, V: são hediondos a fabricação, o fornecimento, a aquisição, a POSSE ou o TRANSPORTE de explosivos — a SUBTRAÇÃO (furto/roubo) de explosivos não consta do rol taxativo de crimes hediondos. Item ERRADO.',
  },
  {
    id: 111,
    subjectId: 'dir-penal',
    statement:
      'Qualquer agente público, ainda que não seja servidor e não perceba remuneração, pode ser sujeito ativo do crime de abuso de autoridade.',
    comment:
      'Lei 13.869/2019, art. 1º, § 2º: considera-se autoridade, para os fins da lei, quem exerce cargo, emprego ou função pública, MESMO que transitoriamente ou sem remuneração. Item CERTO.',
  },
  {
    id: 112,
    subjectId: 'dir-proc',
    statement:
      'Mesmo em caso de apresentação do documento de identificação civil, é possível a identificação criminal em caso de constar de registros policiais o uso de outros nomes ou diferentes qualificações.',
    comment:
      'Lei 12.037/2009, art. 3º, V: a identificação criminal é possível quando constar de registros policiais o uso de outros nomes ou diferentes qualificações, ainda que apresentado documento de identidade civil. Item CERTO.',
  },
  {
    id: 113,
    subjectId: 'leg-especial',
    statement:
      'Entre as atividades de prevenção do uso indevido de drogas, está o fortalecimento da autonomia e da responsabilidade individual em relação ao uso indevido dessas substâncias ilícitas.',
    comment:
      'Lei 11.343/2006, art. 3º, III: as atividades de prevenção do uso indevido de drogas incluem o fortalecimento da autonomia e da responsabilidade individual. Item CERTO.',
  },
  {
    id: 114,
    subjectId: 'dir-penal',
    statement:
      'Conduzir arma de fogo, no exercício de atividade comercial, sem autorização, configura comércio ilegal de arma de fogo.',
    comment:
      'Lei 10.826/2003, art. 17: configura COMÉRCIO ilegal de arma de fogo adquirir, alugar, emprestar, recolher, transportar, CONDUZIR, trazer consigo, guardar ou negociar arma sem autorização, no exercício de atividade comercial. Item CERTO.',
  },
  {
    id: 115,
    subjectId: 'dir-penal',
    statement:
      'Praticam o crime de tortura policiais rodoviários federais que, dentro de um posto policial, submetem o autor de crime a sofrimento físico, independentemente de sua intensidade.',
    comment:
      'O inciso I do art. 1º da Lei 9.455/1997 exige sofrimento INTENSO com fim específico, e o § 2º (redação vigente à época da prova) exige que o sofrimento seja forma de castigo pessoal ou medida preventiva — a assertiva, ao prescindir da intensidade e do fim legal, não se amolda às figuras típicas do crime de tortura. Item ERRADO.',
  },
  {
    id: 116,
    subjectId: 'dir-humanos',
    statement:
      'A mera intuição de que esteja havendo tráfico de drogas em uma casa não configura justa causa para autorizar o ingresso sem mandado judicial ou sem o consentimento do morador, exceto em caso de flagrante delito.',
    comment:
      'CF, art. 5º, XI: a casa é asilo inviolável — o ingresso só se dá por ordem judicial, consentimento do morador ou flagrante delito; mera intuição/suspeita não é justa causa. Item CERTO.',
  },
  {
    id: 117,
    subjectId: 'dir-humanos',
    statement:
      'O aviso prévio é uma condicionante ao exercício do direito de reunião previsto na CF: a inexistência de notificação às autoridades competentes torna ilegal a manifestação coletiva.',
    comment:
      'CF, art. 5º, XVI: o aviso prévio é REQUISITO para a reunião em locais abertos ao público, mas sua falta não torna a manifestação ilegal (a jurisprudência admite reuniões espontâneas, desde que pacíficas e sem fim ilícito). Item ERRADO.',
  },
  {
    id: 118,
    subjectId: 'dir-humanos',
    statement:
      'A alteração do gênero nos assentamentos de registro civil independe da realização de procedimento cirúrgico, denominado transgenitalização, ou da comprovação da realização de tratamentos hormonais ou patologizantes, por parte da pessoa interessada.',
    comment:
      'STF (ADI 4.275 e RE 670.422): a retificação do registro civil de pessoa transexual independe de cirurgia de transgenitalização, tratamentos hormonais ou patologizantes. Item CERTO.',
  },
  {
    id: 119,
    subjectId: 'dir-humanos',
    statement:
      'A Declaração Universal dos Direitos Humanos, um dos primeiros instrumentos normativos gerais de direitos humanos adotados por uma organização internacional, destacou-se pelo fato de comportar a ideia de dignidade da pessoa humana como ponto de convergência da ética universal e do fundamento valorativo do sistema protetivo global dos direitos humanos.',
    comment:
      'A DUDH (1948) tem a dignidade da pessoa humana como valor central e fundamento do sistema global de proteção dos direitos humanos (preambulo e art. 1º). Item CERTO.',
  },
  {
    id: 120,
    subjectId: 'dir-humanos',
    statement:
      'A Convenção Internacional dos Direitos das Pessoas com Deficiência possui status supraconstitucional no ordenamento pátrio, sendo um exemplo de instrumento normativo internacional de caráter inclusivo adotado pelo Brasil para promover a acessibilidade e a autodeterminação de pessoas com deficiência.',
    comment:
      'A CDPD, aprovada pelo Decreto 6.949/2009 com rito do art. 5º, § 3º, da CF, tem status de EMENDA CONSTITUCIONAL — não supraconstitucional. Item ERRADO.',
  },
]
