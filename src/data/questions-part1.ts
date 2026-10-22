import type { Question } from './types'

export const PART1: Question[] = [
  {
    id: 1,
    subjectId: 'leg-estadual',
    statement: `“A Segurança Pública, dever do Estado, direito e responsabilidade de todos, é exercida para preservação da ordem pública, da incolumidade das pessoas e do patrimônio e asseguramento da liberdade e das garantias individuais através dos seguintes órgãos permanentes”.
    <p>Tendo como referência o texto da Constituição do Estado de Pernambuco, marque a alternativa <b>CORRETA</b>:</p>`,
    options: [
      { key: 'a', html: `Cabe ao Governador do Estado, assessorado por um Conselho de Defesa Social, o estabelecimento da Política de defesa social e a coordenação das ações de Segurança Pública.` },
      { key: 'b', html: `As atividades de Segurança Pública serão organizadas em sistema, na forma de decreto do chefe do poder executivo.` },
      { key: 'c', html: `À Polícia Civil, dirigida por Delegado de Polícia, de qualquer nível da carreira, incumbem, privativamente, ressalvada a competência da União, as funções de Polícia Judiciária e a apuração de infrações penais e militares.` },
      { key: 'd', html: `São órgãos permanentes da segurança pública a polícia civil e a polícia militar, excetuando-se o corpo de bombeiros, pois trata-se de órgão da defesa civil do Estado de Pernambuco.` },
      { key: 'e', html: `À Polícia Militar, força auxiliar e reserva das Forças Armadas, cabe com exclusividade a polícia ostensiva e a preservação da ordem pública.` },
    ],
    answer: 'a',
    comment: `A alternativa “a” reproduz a regra da Constituição de Pernambuco: ao Governador do Estado, assessorado pelo Conselho de Defesa Social, cabe estabelecer a política de defesa social e coordenar as ações de segurança pública.<p>A “b” erra o fundamento: a organização da segurança pública em sistema se dá <b>na forma da lei</b> (e não por decreto). A “c” contém dois erros: a Polícia Civil é dirigida por delegado de polícia <b>de carreira</b> (e não “de qualquer nível”) e apura as infrações penais <b>exceto as militares</b>. A “d” é falsa porque o corpo de bombeiros militar <b>é</b> órgão permanente da segurança pública. A “e” erra ao afirmar “exclusividade”: à PM <b>incumbe</b> a polícia ostensiva e a preservação da ordem pública, sem esse monopólio.</p>`,
  },
  {
    id: 2,
    subjectId: 'leg-estadual',
    statement: `<p>Tendo como base a Lei nº 6.425/1972, que versa sobre o Estatuto do Policial Civil do Estado de Pernambuco, julgue os itens a seguir e marque a alternativa <b>INCORRETA</b>.</p>`,
    options: [
      { key: 'a', html: `O provimento por nomeação e por acesso dependerá de aprovação em processo de seleção constituído de concurso público de provas, ou, sempre que houver exigência de escolaridade de nível superior, de concurso público de provas e títulos, e frequência e aproveitamento em curso de formação profissional específica para o cargo.` },
      { key: 'b', html: `A conduta psicológica dos candidatos será objeto de investigação, podendo o Conselho Superior de Polícia, em sessão aberta, impugnar pedido ou cancelar inscrição, ou, em qualquer fase do concurso até o momento da posse, determinar a exclusão do candidato, declarando, neste caso, as razões da decisão, quando solicitado pelo legítimo interessado.` },
      { key: 'c', html: `A remoção por conveniência da disciplina deverá ser expressamente justificada pelo chefe do serviço em que estiver lotado o funcionário e acarretará ao mesmo a perda dos direitos e vantagens atribuídas às outras formas de remoção.` },
      { key: 'd', html: `Ao policial que se deslocar de sua sede em objeto de serviço, missão oficial ou estudo, serão concedidas diárias correspondentes ao período de ausência, a título de indenização das despesas de alimentação e pousada.` },
      { key: 'e', html: `Ao funcionário ferido ou acidentado em serviço será concedido auxílio-acidente correspondente às despesas de assistência médico-hospitalar de que o mesmo necessitar.` },
    ],
    answer: 'b',
    comment: `A alternativa “b” é a incorreta. Pela Lei nº 6.425/1972, a vida pregressa e a conduta psicológica dos candidatos serão objeto de investigação, podendo o Conselho Superior de Polícia, em <b>sessão secreta</b> (e não “aberta”), impugnar pedido ou cancelar inscrição ou, em qualquer fase do concurso, <b>até o momento da nomeação</b> (e não “da posse”), determinar a exclusão do candidato, declarando as razões da decisão quando solicitado pelo legítimo interessado.<p>As demais alternativas reproduzem corretamente dispositivos do Estatuto Policial (concurso para provimento, remoção por conveniência da disciplina justificada, diárias e auxílio-acidente).</p>`,
  },
  {
    id: 3,
    subjectId: 'leg-estadual',
    statement: `<p>De acordo com a Lei nº 6.123/1968 – Estatuto do Servidor do Estado de Pernambuco, os cargos serão providos pelos seguintes atos, <b>EXCETO</b>:</p>`,
    options: [
      { key: 'a', html: `nomeação` },
      { key: 'b', html: `aproveitamento` },
      { key: 'c', html: `reintegração` },
      { key: 'd', html: `readaptação` },
      { key: 'e', html: `reversão` },
    ],
    answer: 'd',
    comment: `O Estatuto dos Servidores de Pernambuco (Lei nº 6.123/1968) lista entre os atos de provimento dos cargos a <b>nomeação, a promoção, a reintegração, o aproveitamento e a reversão</b> — todos presentes no enunciado, exceto a <b>readaptação</b>, que não integra a relação de atos de provimento da lei pernambucana (diferentemente do que ocorre no regime federal da Lei nº 8.112/1990).`,
  },
  {
    id: 4,
    subjectId: 'leg-estadual',
    statement: `<p>Com atenção ao Plano de Cargos, Carreiras e Vencimentos – PCCV, instituído pela Lei Complementar nº 137/2008 no âmbito da Polícia Civil do Estado de Pernambuco, associe uma coluna à outra e marque a alternativa correta.</p>
    <ul class="my-3 space-y-1">
      <li><b>I – Função Policial Civil</b></li>
      <li><b>II – Classe</b></li>
      <li><b>III – Nível</b></li>
      <li><b>IV – Matriz</b></li>
    </ul>
    <ol class="my-3 space-y-2 pl-0 list-none">
      <li>(  ) conjunto de classes e faixas salariais sequenciadas, estruturadas segundo a formação, habilitação, titulação ou qualificação profissional, com respectivos valores nominais de vencimento base.</li>
      <li>(  ) conjunto de classes semelhantes quanto à natureza, grau de complexidade e responsabilidade das atribuições, superpostas verticalmente, constituindo a linha natural de progressão do servidor público na carreira, por elevação da sua respectiva qualificação profissional.</li>
      <li>(  ) corresponde a um conjunto de faixas salariais de um mesmo cargo, estabelecendo níveis de desenvolvimento vertical na carreira.</li>
      <li>(  ) conjunto dos direitos, obrigações e atribuições inerentes ao servidor público legalmente investido em cargo público de natureza policial civil.</li>
    </ol>
    <p>Marque a alternativa correspondente:</p>`,
    options: [
      { key: 'a', html: `I, III, II e IV` },
      { key: 'b', html: `II, III, IV e I` },
      { key: 'c', html: `IV, III, II e I` },
      { key: 'd', html: `IV, II, III e I` },
      { key: 'e', html: `III, IV, II e I` },
    ],
    answer: 'c',
    comment: `Pela LC nº 137/2008 (PCCV/PC-PE), no glossário:<ul><li><b>Matriz (IV)</b> – conjunto de classes e faixas salariais sequenciadas, estruturadas segundo a formação, habilitação, titulação ou qualificação profissional, com respectivos valores nominais de vencimento base;</li><li><b>Nível (III)</b> – conjunto de classes semelhantes quanto à natureza, grau de complexidade e responsabilidade das atribuições, superpostas verticalmente, constituindo a linha natural de progressão do servidor na carreira;</li><li><b>Classe (II)</b> – corresponde a um conjunto de faixas salariais de um mesmo cargo, estabelecendo níveis de desenvolvimento vertical na carreira;</li><li><b>Função Policial Civil (I)</b> – conjunto dos direitos, obrigações e atribuições inerentes ao servidor público legalmente investido em cargo público de natureza policial civil.</li></ul><p>Logo: IV, III, II e I.</p>`,
  },
  {
    id: 5,
    subjectId: 'dir-constitucional',
    statement: `<p>Realizada por meio da Emenda Constitucional nº 45/2004, a reforma do Judiciário instituiu o Conselho Nacional de Justiça, que tem composição plural. De acordo com o texto constitucional:</p>`,
    options: [
      { key: 'a', html: `um Ministro do Supremo Tribunal Federal que integre o Conselho exercerá obrigatoriamente a função de Ministro-Corregedor.` },
      { key: 'b', html: `O Ministro-Corregedor do CNJ deve ser, necessariamente, um Ministro do Tribunal Superior do Trabalho.` },
      { key: 'c', html: `O Conselho Nacional de Justiça compõe-se de 14 membros, com mandato de 2 anos, admitida 1 recondução, e será presidido pelo Presidente do Supremo Tribunal Federal.` },
      { key: 'd', html: `Compete ao Conselho o controle da atuação administrativa, jurisdicional e financeira do Poder Judiciário e do cumprimento dos deveres funcionais dos juízes.` },
      { key: 'e', html: `Terá na sua composição dois membros do Ministério Público.` },
    ],
    answer: 'e',
    comment: `A CF (art. 103-B, com a composição fixada pela EC nº 61/2009) garante ao CNJ <b>15 membros</b> com mandato de 2 anos, admitida uma recondução. Integram o Conselho, entre outros, <b>um membro do Ministério Público da União e um membro do Ministério Público estadual</b> — ou seja, <b>dois membros do MP</b> (alternativa “e” correta).<p>A função de <b>Ministro-Corregedor é do Ministro do Superior Tribunal de Justiça</b> (art. 103-B, § 5º) — afastando “a” (STF) e “b” (TST). O Conselho não tem 14, e sim 15 membros (“c”). E o controle é da atuação <b>administrativa e financeira</b> (art. 103-B, § 4º) — a palavra “jurisdicional” invalida a alternativa “d”, pois o CNJ não reanalisa atos jurisdicionais.</p>`,
  },
  {
    id: 6,
    subjectId: 'dir-constitucional',
    statement: `<p>A partir da Emenda Constitucional nº 45/2004, uma importante mudança no nosso ordenamento jurídico: os tratados e convenções internacionais sobre direitos humanos</p>`,
    options: [
      { key: 'a', html: `sempre terão a natureza jurídica de lei ordinária, exigindo a sua aprovação pelo Congresso Nacional e a promulgação, na ordem interna, pelo Chefe do Poder Executivo.` },
      { key: 'b', html: `sempre terão a natureza jurídica de atos de direito internacional, não se integrando, em qualquer hipótese, à ordem jurídica interna do país.` },
      { key: 'c', html: `podem ter a natureza jurídica de emenda constitucional, caso sua aprovação aconteça nas duas casas do Congresso Nacional, se dê em dois turnos de votação, com o voto favorável de três quintos dos respectivos membros.` },
      { key: 'd', html: `podem ter a natureza jurídica de lei complementar, desde que o Congresso Nacional venha a aprová-los com observância do processo legislativo ordinário.` },
      { key: 'e', html: `sempre terão a natureza jurídica de emenda constitucional, exigindo, apenas, que a sua aprovação pelo Congresso Nacional se dê em dois turnos de votação, com o voto favorável de dois terços dos respectivos membros.` },
    ],
    answer: 'c',
    comment: `CF, art. 5º, § 3º (incluído pela EC nº 45/2004): os tratados e convenções internacionais sobre direitos humanos que forem aprovados, <b>em cada Casa do Congresso Nacional, em dois turnos, por três quintos dos votos dos respectivos membros</b>, serão <b>equivalentes às emendas constitucionais</b>.<p>Sem essa aprovação qualificada, o tratado ingressa com natureza de lei ordinária (status anterior à EC 45) — por isso o “sempre” da alternativa “a” está errado; a “e” erra o quórum (dois terços) e o “sempre”; e não há previsão de natureza de lei complementar (“d”).</p>`,
  },
  {
    id: 7,
    subjectId: 'dir-constitucional',
    statement: `<p>Suponha que Ross e Val, casados, cidadãos americanos, estavam de férias no Brasil quando, devido a uma intercorrência médica, Val deu à luz prematuramente ao seu filho Tanaka.</p>
    <p>Considerando o disposto na Constituição Federal, é correto afirmar que Tanaka</p>`,
    options: [
      { key: 'a', html: `é brasileiro nato e poderá perder sua naturalização em virtude da prática de atividade nociva ao interesse nacional.` },
      { key: 'b', html: `tem nacionalidade inata e, no futuro, poderá se candidatar para o cargo de Presidente e Vice-Presidente da República Federativa do Brasil.` },
      { key: 'c', html: `é brasileiro naturalizado e, no futuro, poderá ocupar o cargo de Presidente da Câmara dos Deputados.` },
      { key: 'd', html: `deve ser considerado brasileiro nato e poderá perder a nacionalidade se fizer pedido expresso de perda da nacionalidade brasileira perante autoridade brasileira competente, sem ressalvas.` },
      { key: 'e', html: `apenas será considerado brasileiro após residir por um ano ininterrupto no Brasil e comprovar que tem idoneidade moral.` },
    ],
    answer: 'b',
    comment: `CF, art. 12, I, “b”: são <b>brasileiros natos</b> os nascidos no Brasil, ainda que de pais estrangeiros, desde que estes não estejam a serviço de seu país — regra que alcança turistas, como Ross e Val. Tanaka tem nacionalidade primária/inata e, por isso, preenche o requisito de nascimento no Brasil para concorrer aos cargos de <b>Presidente e Vice-Presidente</b> da República (CF, art. 14, § 3º, VI).<p>A “a” confunde a perda de nacionalidade do <b>naturalizado</b> (atividade nociva ao interesse nacional) com a do nato; a “d” ignora as ressalvas do art. 12, § 4º, II (aquisição de outra nacionalidade não causa perda quando há risco de apatridia); e a “e” descreve requisitos de naturalização, inaplicáveis ao caso.</p>`,
  },
  {
    id: 8,
    subjectId: 'dir-constitucional',
    statement: `<p>Entre os direitos sociais previstos pela Constituição Federal de 1988 (CF) inclui-se o direito que <b>não nasceu com o texto da CF/88</b>:</p>`,
    options: [
      { key: 'a', html: `educação.` },
      { key: 'b', html: `moradia.` },
      { key: 'c', html: `trabalho.` },
      { key: 'd', html: `lazer.` },
      { key: 'e', html: `previdência social.` },
    ],
    answer: 'b',
    comment: `O rol do art. 6º da CF/88 (educação, saúde, alimentação, trabalho, lazer, segurança, previdência social, proteção à maternidade e à infância e assistência aos desamparados) foi ampliado pela EC nº 26/2000, que incluiu a <b>MORADIA</b> (e, depois, a EC nº 90/2015 acrescentou o transporte urbano — não listado entre as opções). Educação, trabalho, lazer e previdência social constavam do texto original de 1988.`,
  },
  {
    id: 9,
    subjectId: 'dir-administrativo',
    statement: `<p>Quando um ente federado transfere a execução e a titularidade de um serviço para uma autarquia, ocorre a chamada</p>`,
    options: [
      { key: 'a', html: `Desconcentração.` },
      { key: 'b', html: `Descentralização por serviços.` },
      { key: 'c', html: `Concentração.` },
      { key: 'd', html: `Descentralização por colaboração.` },
      { key: 'e', html: `Centralização.` },
    ],
    answer: 'b',
    comment: `A criação de autarquia para a execução de um serviço público configura a <b>descentralização por serviços</b> (ou por outorga): o Estado transfere a <b>titularidade e a execução</b> do serviço a uma pessoa jurídica de direito público por ele criada.<p>A <b>desconcentração</b> é mera redistribuição interna de competências dentro do mesmo ente (sem criação de pessoa jurídica); a <b>descentralização por colaboração</b> (delegação) ocorre quando o Estado transfere apenas a execução a particulares (concessão, permissão, autorização).</p>`,
  },
  {
    id: 10,
    subjectId: 'dir-administrativo',
    statement: `<p>Caio, delegado de polícia do Estado de Pernambuco, com a finalidade de distribuir e ordenar o serviço interno da Delegacia de Polícia onde é lotado, editou uma ordem de serviço e realizou a divisão de tarefas entre os setores.</p>
    <p>Considerando o caso hipotético, o ato praticado por Caio decorre do</p>`,
    options: [
      { key: 'a', html: `poder de polícia, o qual permite organizar as rotinas administrativas necessárias para a realização de investigação criminal.` },
      { key: 'b', html: `poder disciplinar, o qual permite editar atos normativos com o objetivo de ordenar a atuação de seus agentes.` },
      { key: 'c', html: `poder regulamentar, o qual permite a estruturação interna da atividade policial.` },
      { key: 'd', html: `poder disciplinar, o qual permite inovar o ordenamento jurídico no âmbito de sua circunscrição.` },
      { key: 'e', html: `poder hierárquico, o qual permite editar atos normativos com o objetivo de ordenar a atuação de seus agentes.` },
    ],
    answer: 'e',
    comment: `A distribuição e a ordenação do serviço interno decorrem do <b>poder hierárquico</b>, que habilita o superior a coordenar, fiscalizar, avocar, delegar e ordenar a atividade dos subordinados e a estruturação interna do órgão (atos normativos internos, como ordens de serviço).<p>O poder de polícia restringe a liberdade e o patrimônio de <b>particulares</b> em prol do interesse público; o poder disciplinar volta-se à apuração de infrações funcionais; e o poder regulamentar é atribuição do Chefe do Executivo para complementar leis com normas gerais e externas.</p>`,
  },
  {
    id: 11,
    subjectId: 'dir-administrativo',
    statement: `<p>A extinção do ato administrativo que é aplicada quando o ato não é compatível com a nova legislação denomina-se</p>`,
    options: [
      { key: 'a', html: `cassação.` },
      { key: 'b', html: `revogação.` },
      { key: 'c', html: `contraposição.` },
      { key: 'd', html: `anulação.` },
      { key: 'e', html: `caducidade.` },
    ],
    answer: 'e',
    comment: `A <b>caducidade</b> (ou decadência do ato) é a extinção do ato administrativo que permanece válido em si, mas se torna <b>incompatível com nova legislação</b> ou fato posterior que lhe retire o fundamento.<p>A <b>cassação</b> decorre de ilegalidade na conduta do titular (p. ex., uso indevido do ato); a <b>revogação</b> funda-se na conveniência e oportunidade (meritório); e a <b>anulação</b> decorre de vício de legalidade, com efeitos retroativos (teoria dos motivos determinantes e o art. 53 da Lei nº 9.784/1999).</p>`,
  },
  {
    id: 12,
    subjectId: 'dir-administrativo',
    statement: `<p>Considerando as regras e disposições doutrinárias e jurisprudenciais acerca da responsabilidade civil do Estado, assinale a alternativa correta.</p>`,
    options: [
      { key: 'a', html: `A condenação do Estado em ação indenizatória ajuizada em razão de dano causado por servidor público enseja a responsabilização do servidor em ação regressiva, independente da configuração de dolo ou culpa na sua conduta.` },
      { key: 'b', html: `O servidor que, no exercício da função, causar dano a um terceiro, poderá responder juntamente com o Estado na ação indenizatória, caso tenha agido com dolo ou culpa.` },
      { key: 'c', html: `Para a responsabilização estatal é irrelevante que a conduta tenha sido comissiva ou omissiva.` },
      { key: 'd', html: `A participação da vítima para a ocorrência do evento danoso pode atenuar ou até mesmo excluir a responsabilização estatal.` },
      { key: 'e', html: `Todos os entes da Administração Pública respondem de forma objetiva, não sendo necessária a comprovação do dolo ou culpa do agente causador do dano.` },
    ],
    answer: 'd',
    comment: `Na teoria do risco administrativo (CF, art. 37, § 6º), a <b>culpa concorrente ou exclusiva da vítima</b> atenua ou exclui integralmente a responsabilidade do Estado — alternativa “d”.<p>A ação regressiva contra o servidor <b>exige dolo ou culpa</b> (STF, RE 580.254/Tema 940), o que invalida a “a”; nas condutas <b>omissivas</b> a regra é a responsabilidade subjetiva (ressalvada a omissão em relação a presos), pelo que a “c” está errada; e a generalização da “e” não se sustenta, pois a objetividade plena não alcança, sem distinção, todas as hipóteses e entes.</p>`,
  },
  {
    id: 13,
    subjectId: 'dir-penal',
    statement: `<p>No que diz respeito à aplicação da Lei Penal, assinale a alternativa <b>INCORRETA</b>:</p>`,
    options: [
      { key: 'a', html: `Praticado um fato que, posteriormente, a lei define como crime, o seu autor pode ser punido desde que não tenha ocorrido a prescrição.` },
      { key: 'b', html: `O princípio da legalidade é conhecido pela seguinte expressão latina: nullum crimen, nulla poena sine lege.` },
      { key: 'c', html: `Se o autor de um fato está respondendo a processo por contravenção penal e, posteriormente, a lei venha a definir esse fato como crime, a denúncia não poderá ser aditada para que o agente responda de acordo com a nova classificação.` },
      { key: 'd', html: `Ninguém pode ser punido por fato que lei posterior deixa de considerar crime.` },
      { key: 'e', html: `Se uma lei nova deixar de incriminar certa conduta, antes definida como crime, o réu não continuará a responder ao processo, porque a lei benéfica retroagirá para alcançar fatos anteriores.` },
    ],
    answer: 'a',
    comment: `A alternativa “a” fere o princípio da legalidade (CF, art. 5º, XXXIX, e CP, art. 1º): praticado um fato que a lei posterior define como crime, o autor <b>não pode ser punido</b> — a lei incriminadora é <b>irretroativa</b>, pouco importando a prescrição.<p>As demais alternativas estão corretas: traduzem o lema <i>nullum crimen, nulla poena sine lege</i>, a retroatividade da lei benéfica (abolitio criminis) e a vedação de aditamento da denúncia para agravar a imputação após a lei nova.</p>`,
  },
  {
    id: 14,
    subjectId: 'dir-penal',
    statement: `<p>Luciana é professora de direito penal de uma Faculdade de Direito que é autarquia municipal na comarca de São Bernardo do Campo-SP. Em conluio e unidade de designios com seu assistente Rodrigo, decidem se apropriar do notebook e do microfone de última geração que foi entregue à Luciana para que esta pudesse ministrar as aulas.</p>
    <p>Assim, Rodrigo, sabendo da condição de funcionária pública de Luciana, concorda com o intento criminoso e, visando facilitar a manobra criminosa, coloca os objetos na bolsa enquanto a professora conversava com alguns alunos ao final da aula. Contudo, ao tentarem sair da Faculdade, foram surpreendidos pelo segurança, que foi avisado por um dos alunos que a tudo assistiu.</p>
    <p>Nesse caso hipotético, assinale a opção correta:</p>`,
    options: [
      { key: 'a', html: `Luciana responde por peculato-furto e Rodrigo, por furto.` },
      { key: 'b', html: `Ambos respondem pelo crime de peculato, pois a condição de funcionário público é pessoal e elementar do delito, transmitindo-se ao coautor.` },
      { key: 'c', html: `Apenas Luciana responde pelo crime de peculato, pois ser funcionário público é uma condição pessoal e não se comunica aos coautores.` },
      { key: 'd', html: `Ambos respondem pelo delito de peculato, sendo obrigatória a redução da pena em 1/2 caso Luciana repare o dano após o trânsito em julgado da sentença condenatória.` },
      { key: 'e', html: `Luciana responde pelo crime de peculato doloso, enquanto Rodrigo responde por peculato culposo, pois concorreu para o delito de outrem.` },
    ],
    answer: 'b',
    comment: `Luciana é funcionária pública por equiparação (CP, art. 327 — cargo em autarquia). Havendo <b>conluio</b> (unidade de desígnios), Rodrigo é <b>coautor</b> do peculato (CP, art. 29), e a condição pessoal que constitui <b>elementar do crime comunica-se</b> aos demais concorrentes (CP, art. 29, § 2º) — logo, <b>ambos respondem por peculato</b>, ainda que Rodrigo não seja servidor.<p>Não existe “peculato-furto” como categoria autônoma para repartir as respostas (“a”); a elementar não deixa de se comunicar (“c”); o arrependimento posterior (CP, art. 16) só cabe <b>antes</b> do recebimento da denúncia/queixa? — na verdade, até o trânsito em julgado não, exige reparação anterior ao julgamento e redução de 1/3 a 2/3, não obrigatória em 1/2 (“d”); e não há peculato culposo concorrente ao doloso (“e”).</p>`,
  },
  {
    id: 15,
    subjectId: 'leg-extravagante',
    statement: `<p>Moçambique, policial civil em Pernambuco, com a intenção de obter uma confissão de Luigi, submeteu este, mediante violência ou grave ameaça, a sofrimento físico.</p>
    <p>Com base nessa situação hipotética, marque a alternativa correta que traga a exata modalidade de tortura praticada pelo agente público.</p>`,
    options: [
      { key: 'a', html: `Tortura omissiva` },
      { key: 'b', html: `Tortura-prova` },
      { key: 'c', html: `Tortura-crime` },
      { key: 'd', html: `Tortura-discriminatória` },
      { key: 'e', html: `Tortura-castigo` },
    ],
    answer: 'b',
    comment: `Lei nº 9.455/1997, art. 1º, I, “a”: constranger alguém, empregando violência ou grave ameaça, causando-lhe sofrimento físico ou mental <b>com o fim de obter informação, declaração ou confissão da vítima ou de terceiro</b> configura a chamada <b>tortura-prova</b> (tortura para instruir processo/investigação).<p>Na <b>tortura-crime</b> (art. 1º, II), a tortura é imposta como meio de aplicar <b>castigo</b> pessoal ou medida de caráter preventivo, ou motivada por <b>discriminação</b> religiosa, racial ou étnica — categorias que correspondem às demais alternativas.</p>`,
  },
  {
    id: 16,
    subjectId: 'leg-extravagante',
    statement: `<p>Em relação aos crimes de abuso de autoridade, assinale a opção correta.</p>`,
    options: [
      { key: 'a', html: `A divergência na interpretação de lei ou na avaliação da prova configura abuso de autoridade.` },
      { key: 'b', html: `São penas restritivas de direitos a prestação de serviços à comunidade ou a entidades públicas e a suspensão temporária e sem vencimentos do cargo, função ou mandato, as quais podem ser aplicadas de forma autônoma ou cumulativa.` },
      { key: 'c', html: `Apenas membros de Poderes podem ser sujeitos ativos de tais infrações penais, excluída a possibilidade da prática por procuradores municipais.` },
      { key: 'd', html: `A ação penal nos crimes de abuso de autoridade é pública condicionada à representação.` },
      { key: 'e', html: `A perda do cargo público e a inabilitação temporária para o exercício de função pública são efeitos automáticos da condenação.` },
    ],
    answer: 'd',
    comment: `Pela Lei nº 13.869/2019, a ação penal nos crimes de abuso de autoridade é, em regra, <b>pública condicionada à representação</b> do ofendido ou de seu representante legal (art. 30), ressalvadas hipóteses específicas de resultado morte/lesão grave.<p>A “a” está errada: o direito de interpretar a lei e avaliar fatos e provas <b>não</b> configura abuso de autoridade (art. 2º). A “b” erra ao admitir cumulação: as penas restritivas de direitos aplicam-se de forma <b>autônoma</b>, não se cumulando entre si (art. 25). A “c” é falsa: o sujeito ativo é <b>qualquer agente público</b> (art. 1º), abrangendo procuradores municipais. E a “e” é incorreta porque a perda do cargo e a inabilitação não decorrem <b>automaticamente</b> da condenação — são efeitos a serem fixados judicialmente nos termos do art. 92 do Código Penal.</p>`,
  },
  {
    id: 17,
    subjectId: 'dir-processual',
    statement: `<p>Nos termos do CPP e da decisão proferida pelo STF quando do julgamento das ADIs 6298, 6299, 6300 e 6305, é correto afirmar que as normas relativas ao juiz das garantias não são aplicáveis:</p>`,
    options: [
      { key: 'a', html: `aos processos submetidos ao rito ordinário.` },
      { key: 'b', html: `aos processos de competência do tribunal do júri.` },
      { key: 'c', html: `aos crimes praticados contra a mulher.` },
      { key: 'd', html: `aos crimes patrimoniais com resultado morte.` },
      { key: 'e', html: `aos crimes contra a administração pública.` },
    ],
    answer: 'b',
    comment: `STF, ADIs 6298, 6299, 6300 e 6305 (Tema 1006, j. 24/08/2023): o juiz das garantias é constitucional, mas a Corte fixou que as normas do instituto <b>não se aplicam</b>: (i) aos processos de competência originária do STF e do STJ (Lei nº 8.038/1990); (ii) <b>aos processos de competência do Tribunal do Júri</b>; (iii) aos casos de violência <b>doméstica e familiar</b> contra a mulher; e (iv) às infrações penais de menor potencial ofensivo.<p>A alternativa “b” reproduz uma das exclusões de forma exata. Já a “c” é imprecisa: a exclusão quanto à mulher restringe-se à violência <b>doméstica e familiar</b>, e não a todos os crimes praticados contra a mulher. O rito ordinário e os demais crimes listados permanecem alcançados pelo instituto quando haja violência ou grave ameaça (CPP, art. 3º-A).</p>`,
  },
  {
    id: 18,
    subjectId: 'dir-processual',
    statement: `<p>Assinale a alternativa correta no que tange ao inquérito policial, à ação penal e ao acordo de não persecução penal:</p>`,
    options: [
      { key: 'a', html: `O MP, por ser o titular da ação penal pública, pode requisitar a instauração do IP, bem como realizar diretamente as diligências e presidir o inquérito policial.` },
      { key: 'b', html: `O direito conferido ao investigado e ao seu defensor, de acesso a todos os elementos informativos e provas produzidos no âmbito da investigação criminal, abrange as diligências em andamento cuja eficácia dependa do sigilo.` },
      { key: 'c', html: `A vítima tem legitimidade para ajuizar ação penal privada subsidiária caso o MP se manifeste pelo arquivamento do inquérito policial.` },
      { key: 'd', html: `Em caso de arquivamento do inquérito policial, além da vítima ou de seu representante legal, a autoridade judicial competente também poderá submeter a matéria à revisão da instância competente do órgão ministerial, caso verifique patente ilegalidade ou teratologia no ato do arquivamento.` },
      { key: 'e', html: `O descumprimento do acordo de não persecução penal pelo investigado não poderá ser utilizado pelo Ministério Público como justificativa para o eventual não oferecimento de suspensão condicional do processo.` },
    ],
    answer: 'd',
    comment: `CPP, art. 28 (redação da Lei nº 13.964/2019): diante de pedido de arquivamento, o juiz pode determinar diligências necessárias, <b>homologar</b> o pedido ou — identificando atuação <b>omissiva ou teratológica</b> do membro do MP — <b>submeter a matéria à revisão da instância competente do órgão ministerial</b>, além de poder comunicar a corregedoria para apuração de infração administrativa (alternativa “d”).<p>A “a” é falsa: o MP requisita diligências e instauração, mas <b>não preside</b> o inquérito policial. A “b” contraria a Súmula Vinculante 14 (o acesso não alcança diligências em andamento cuja eficácia dependa de sigilo). A “c” está errada: homologado o arquivamento, não há inércia a justificar queixa subsidiária — cabe, sim, a revisão do arquivamento. E a “e” contraria o art. 28-B, § 7º: o descumprimento do ANPP <b>pode</b> justificar o não oferecimento da suspensão condicional do processo.</p>`,
  },
  {
    id: 19,
    subjectId: 'dir-processual',
    statement: `<p>Acerca da prisão e da liberdade provisória, assinale a alternativa correta, considerando as disposições legais e jurisprudenciais:</p>`,
    options: [
      { key: 'a', html: `A citação por edital do acusado é fundamento suficiente para a decretação da prisão preventiva, uma vez que a sua não localização gera presunção de fuga.` },
      { key: 'b', html: `No tocante ao flagrante retardado ou à ação controlada, a ausência de autorização judicial torna ilegal a prisão em flagrante postergado.` },
      { key: 'c', html: `A dúvida sobre a identidade civil da pessoa ou o fato de esta não fornecer elementos suficientes para esclarecê-la não é fundamento para a decretação da prisão preventiva.` },
      { key: 'd', html: `Após receber o auto de prisão em flagrante, no prazo máximo de até 24 (vinte e quatro) horas após a realização da prisão, o juiz deverá promover audiência de custódia com a presença do acusado, seu advogado constituído ou membro da Defensoria Pública e o membro do Ministério Público, podendo, em caso de urgência e se o meio se revelar idôneo, realizar a audiência de custódia por videoconferência.` },
      { key: 'e', html: `O STJ admite a conversão da prisão em flagrante em prisão preventiva de ofício, desde que se trate de flagrante de crime inafiançável.` },
    ],
    answer: 'c',
    comment: `CPP, art. 313, § 1º (incluído pela Lei nº 13.964/2019): <b>não será admitida</b> a decretação da prisão preventiva se houver <b>dúvida sobre a identidade civil</b> da pessoa ou quando esta não fornecer elementos suficientes para esclarecê-la — a alternativa “c” reproduz a regra.<p>A “a” está errada: a citação por edital não gera presunção de fuga nem basta, por si, para a preventiva. A “b” também: na ação controlada (Lei nº 12.850/2015, art. 54), o retardamento da intervenção não exige autorização prévia em todas as hipóteses (em caso de risco iminente, admite-se comunicação posterior em até 24 horas). A “d” não reproduz com exatidão o art. 310 do CPP (presença do preso perante o juiz como regra, com participação do MP e do defensor). E a “e” é incorreta: a conversão de ofício não se justifica pela mera inafiançabilidade do delito.</p>`,
  },
  {
    id: 20,
    subjectId: 'dir-processual',
    statement: `<p>Acerca do tema de provas, assinale a alternativa correta, considerando as disposições legais e jurisprudenciais:</p>`,
    options: [
      { key: 'a', html: `Haverá prioridade na realização do exame de corpo de delito quando se tratar de crime cuja vítima seja mulher.` },
      { key: 'b', html: `Na falta de perito oficial, o exame de corpo de delito será realizado por um perito não oficial, portador de diploma de curso superior.` },
      { key: 'c', html: `É proibida a entrada em locais isolados, bem como a remoção de quaisquer vestígios de locais de crime, antes da liberação por parte do perito responsável, sendo tipificada como fraude processual a sua realização.` },
      { key: 'd', html: `É indispensável a presença da defesa técnica no interrogatório em sede policial.` },
      { key: 'e', html: `Na cadeia de custódia, o armazenamento é o procedimento por meio do qual cada vestígio coletado é embalado de forma individualizada, de acordo com suas características físicas, químicas e biológicas, para posterior análise.` },
    ],
    answer: 'c',
    comment: `CPP, art. 158-C, § 2º (Lei nº 13.964/2019): é <b>proibida a entrada em locais isolados</b>, bem como a remoção de quaisquer vestígios de locais de crime, antes da liberação pelo perito responsável — conduta <b>tipificada como fraude processual</b> (alternativa “c”).<p>A “a” é imprecisa: o parágrafo único do art. 158 garante prioridade nos crimes que envolvam violência <b>doméstica e familiar</b> contra a mulher e violência contra criança, adolescente, idoso ou pessoa com deficiência — não em todo crime com vítima mulher. A “b” erra: na falta de perito oficial, o exame é feito por <b>duas</b> pessoas idôneas com diploma de curso superior (art. 159, § 1º). A “d” está errada: o interrogatório policial não exige presença de defesa técnica. A “e” confunde etapas da cadeia de custódia (art. 158-B): a embalagem individualizada do vestígio é o <b>acondicionamento</b>; o <b>armazenamento</b> é a guarda adequada do material.</p>`,
  },
]
