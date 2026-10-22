import type { Question } from './types'

export const PART2: Question[] = [
  {
    id: 21,
    subjectId: 'portugues',
    textRef: 'texto-fungo',
    statement: `<p>De acordo com o texto, a biorremediação é um processo de</p>`,
    options: [
      { key: 'a', html: `remoção de fungos e bactérias responsáveis pela poluição dos aterros sanitários.` },
      { key: 'b', html: `reciclagem a partir da eliminação de organismos vivos do meio ambiente.` },
      { key: 'c', html: `eliminação de poliuretano com remédios produzidos especificamente para tal fim.` },
      { key: 'd', html: `despoluição ambiental por meio do uso de micro-organismos vivos.` },
      { key: 'e', html: `decomposição artificial de matéria poluente considerada não biodegradável.` },
    ],
    answer: 'd',
    comment: `O texto define biorremediação como “processo tecnológico que utiliza <b>organismos vivos</b> para remover ou reduzir resíduos poluentes ou tóxicos no ambiente” — ou seja, despoluição ambiental por meio do uso de micro-organismos vivos (fungos, bactérias etc.), o que corresponde à alternativa “d”.`,
  },
  {
    id: 22,
    subjectId: 'portugues',
    textRef: 'texto-fungo',
    statement: `<p>O texto apresenta como informação principal a</p>`,
    options: [
      { key: 'a', html: `importância dos programas de conscientização acerca da eliminação do consumo de produtos feitos de plásticos.` },
      { key: 'b', html: `quantidade de itens feitos de plástico que, ao longo da última década, se acumulou nos lixões e aterros sanitários nacionais.` },
      { key: 'c', html: `variedade dos tipos de plásticos e suas diferentes possibilidades de aplicação para o consumo da população mundial.` },
      { key: 'd', html: `maneira como a indústria tem utilizado fungos para dar resistência a alguns tipos de plástico, como o poliuretano.` },
      { key: 'e', html: `descoberta, feita por pesquisadores da Universidade de Yale, de um fungo capaz de decompor um tipo de plástico.` },
    ],
    answer: 'e',
    comment: `A informação principal do texto é a <b>descoberta de pesquisadores da Universidade de Yale</b> de um fungo (encontrado em árvores da Amazônia Equatoriana) capaz de produzir uma enzima que degrada o poliuretano — plástico até então considerado não biodegradável. As demais alternativas são informações secundárias ou contrárias ao texto (como a “d”: não é a indústria que utiliza fungos, mas os cientistas que estudam sua capacidade de decompor plásticos).`,
  },
  {
    id: 23,
    subjectId: 'portugues',
    textRef: 'texto-fungo',
    statement: `<p>“Uma equipe de pesquisadores da Universidade de Yale, nos EUA, <u>vem testando</u> diferentes espécies de fungos com potencial de decomposição de diferentes tipos de plástico.” (3º parágrafo)</p>
    <p>Ao transpor-se para a voz passiva a expressão sublinhada, a forma verbal resultante será:</p>`,
    options: [
      { key: 'a', html: `está sendo testado` },
      { key: 'b', html: `tem sido testadas` },
      { key: 'c', html: `estão sendo testados` },
      { key: 'd', html: `vêm sendo testadas` },
      { key: 'e', html: `vem sendo testados` },
    ],
    answer: 'd',
    comment: `Na passagem para a voz passiva, o objeto direto “diferentes espécies de fungos” torna-se sujeito, e a locução verbal ativa “vem testando” converte-se em passiva analítica com o mesmo auxiliar: <b>“vêm sendo testadas”</b>.<p>A concordância é com o novo sujeito, <b>plural e feminino</b> (“as diferentes espécies de fungos”), o que invalida “a” e “e” (singular) e “c” (masculino). A “b”, embora concorde no feminino plural, altera o auxiliar (“tem sido”), descartando a locução “vem + gerúndio” do original.</p>`,
  },
  {
    id: 24,
    subjectId: 'portugues',
    textRef: 'texto-fungo',
    statement: `<p>Considere as afirmações:</p>
    <p><b>I.</b> No trecho “Embora <u>haja</u> muitos programas para conscientização do seu uso e da sua reutilização...” (1º parágrafo), a forma verbal sublinhada pode ser substituída por “existam”, sem prejuízo para o sentido nem para a correção da frase.</p>
    <p><b>II.</b> No trecho “O resultado de produzir algo tão difícil de ser reciclado é a grande quantidade de resíduos <u>depositada</u> não só nos lixões ou aterros sanitários...” (1º parágrafo), o elemento sublinhado pode ser substituído por “depositados”.</p>
    <p><b>III.</b> No trecho “O resultado é incrível, na medida em que <u>nos dá</u> esperanças reais de biorremediação desse tipo de poluição.” (3º parágrafo), o segmento sublinhado deve ser substituído por “dão-nos” para que a frase esteja gramaticalmente correta.</p>
    <p>Está correto o que se afirma <b>APENAS</b> em</p>`,
    options: [
      { key: 'a', html: `III.` },
      { key: 'b', html: `II.` },
      { key: 'c', html: `I.` },
      { key: 'd', html: `I e II.` },
      { key: 'e', html: `II e III.` },
    ],
    answer: 'd',
    comment: `<b>I. Correta</b> — no sentido de “existir”, o verbo haver admite substituição por existir, mantendo o subjuntivo: “Embora <b>existam</b> muitos programas...”.<p><b>II. Correta</b> — o particípio pode concordar com o núcleo do complemento “resíduos” (masculino plural): “a grande quantidade de resíduos <b>depositados</b>...”.<br/><b>III. Incorreta</b> — o sujeito de “dá” é “o resultado” (singular): “O resultado é incrível, na medida em que <b>nos dá</b>...”. A substituição por “dão-nos” geraria erro de concordância verbal.</p>`,
  },
  {
    id: 25,
    subjectId: 'portugues',
    textRef: 'texto-fungo',
    statement: `<p>Uma frase escrita com clareza e correção é:</p>`,
    options: [
      { key: 'a', html: `São prováveis que nas próximas décadas mais rios, lagos, mares e florestas se tornem poluídos com detritos de diversos tipos de plástico.` },
      { key: 'b', html: `A poluição resultante do acúmulo de plástico no meio ambiente tem sido vista com preocupação por diferentes órgãos governamentais.` },
      { key: 'c', html: `Com o proposito de corresponder para a demanda da população mundial, as indústrias se dispõe de lançar toneladas de plástico na natureza.` },
      { key: 'd', html: `Multiplica-se a cada dia as organizações empenhadas de reverter o processo de poluição provocado pelo discarte inadequado de plástico.` },
      { key: 'e', html: `Muitos consumidores já estão mais consciente de sua responsabilidade e evitam disperdiçar sacolas e recipientes de plástico, reutilizando-as.` },
    ],
    answer: 'b',
    comment: `Somente a alternativa “b” está clara e correta. As demais apresentam desvios:<p><b>a)</b> concordância — o correto é “É provável que...” (sujeito oracional); <b>c)</b> “proposito” (sem acento), regência errada (“corresponder <i>a</i>”), concordância (“as indústrias se <i>dispõem</i>”) e regência de “dispor” (“dispor-se <i>a</i>”); <b>d)</b> voz passiva pronominal exige “Multiplicam-se... as organizações”, além de regência (“empenhadas <i>em</i>”); <b>e)</b> concordância (“mais conscientes”) e grafia (“desperdiçar”).</p>`,
  },
  {
    id: 26,
    subjectId: 'portugues',
    textRef: 'texto-ferias',
    statement: `<p>De acordo com o autor, as férias das crianças são, para as mães de hoje, causa de</p>`,
    options: [
      { key: 'a', html: `inquietação.` },
      { key: 'b', html: `alívio.` },
      { key: 'c', html: `entusiasmo.` },
      { key: 'd', html: `satisfação.` },
      { key: 'e', html: `descanso.` },
    ],
    answer: 'a',
    comment: `O texto mostra as mães de hoje “descabeladas”, correndo o risco de ver as férias como “um verdadeiro inferno” nos telejornais e planejando intensivamente cada dia do mês — as férias dos filhos são, para elas, fonte de <b>inquietação</b>, em contraste com a tranquilidade da mãe do autor (“Nenhuma preocupação passava pela cabeça da minha mãe...”).`,
  },
  {
    id: 27,
    subjectId: 'portugues',
    textRef: 'texto-ferias',
    statement: `<p>“As férias, propriamente ditas, eram por nossa conta.” (1º parágrafo)</p>
    <p>Com a afirmação acima, o autor chama a atenção para o fato de que</p>`,
    options: [
      { key: 'a', html: `havia muitas atividades para ocupar o tempo das crianças durante as férias, o que também é dito no trecho: “Os repórteres dão mil sugestões para preencher as vinte e quatro horas diárias das crianças, durante o mês inteirinho.” (2º parágrafo)` },
      { key: 'b', html: `as crianças apreciavam suas férias com autonomia e demandavam pouca atenção materna, o que é reforçado no trecho: “Nenhuma preocupação passava pela cabeça da minha mãe naqueles trinta e um dias de julho.” (5º parágrafo)` },
      { key: 'c', html: `ele e seus irmãos conservavam nas férias os mesmos hábitos que nutriam durante o período letivo, o que é detalhado no trecho: “Acordávamos às seis da manhã, comíamos um pão com manteiga, bebíamos um copo de leite e descíamos para o quintal.” (4º parágrafo)` },
      { key: 'd', html: `as férias representavam um tempo de diversão que deveria ser aproveitado ao máximo, o que é confirmado no trecho: “mas, pensando bem, ainda faltam duas semanas inteirinhas para preencher.” (3º parágrafo)` },
      { key: 'e', html: `as atividades praticadas durante as férias não traziam perigo às crianças, pois eram monitoradas por sua mãe, o que é narrado no trecho: “De vez em quando ela entrava em ação quando um chegava com o joelho ralado, o cotovelo esfolado ou uma picada de abelha.” (5º parágrafo)` },
    ],
    answer: 'b',
    comment: `“As férias, propriamente ditas, eram <b>por nossa conta</b>” indica que as crianças gozavam de <b>autonomia</b> e demandavam pouca atenção da mãe, ideia reforçada por “<b>Nenhuma preocupação passava pela cabeça da minha mãe</b> naqueles trinta e um dias de julho” (5º parágrafo) — alternativa “b”.<p>As demais alternativas distorcem o texto: os repórteres (“a”) refletem as férias de hoje, não as do autor; os hábitos citados em “c” mostram rotina própria das férias (quintal), não dos dias letivos; a afirmação de “d” pertence à ironia sobre as mães de hoje; e a “e” contraria o texto, pois as crianças exploravam o quintal sem supervisão constante — a mãe só agia diante de ferimentos.</p>`,
  },
  {
    id: 28,
    subjectId: 'portugues',
    textRef: 'texto-ferias',
    statement: `<p>“Lembro-me bem dela recolhendo os nossos uniformes do colégio e levando <u>os nossos uniformes do colégio</u> para lavar...” (1º parágrafo)</p>
    <p>Para que a expressão sublinhada seja corretamente retomada por um pronome, o segmento sublinhado deve ser substituído por:</p>`,
    options: [
      { key: 'a', html: `lhes levando` },
      { key: 'b', html: `levando-nos` },
      { key: 'c', html: `levando-lhe` },
      { key: 'd', html: `o levando` },
      { key: 'e', html: `levando-os` },
    ],
    answer: 'e',
    comment: `O termo a retomar é “os nossos uniformes do colégio” — objeto direto masculino plural. O pronome pessoal oblíquo adequado é <b>“os”</b>: “recolhendo os nossos uniformes do colégio e <b>levando-os</b> para lavar”.<p>“Lhes” (“a” e “c”) retoma objetos indiretos; “nos” (“b”) remete às pessoas (as crianças), não aos uniformes; e “o” (“d”) é singular, incapaz de retomar o termo no plural.</p>`,
  },
  {
    id: 29,
    subjectId: 'informatica',
    statement: `<p>No Windows, é possível configurar um recurso de acessibilidade que permite o pressionamento de uma tecla inicial de um atalho (CTRL, ALT etc.) e, depois, o pressionamento do seu complemento, e o computador entenda que foi digitado o atalho completo. Esse recurso se chama:</p>`,
    options: [
      { key: 'a', html: `Teclado pausado.` },
      { key: 'b', html: `Sombra.` },
      { key: 'c', html: `Tecla de aderência.` },
      { key: 'd', html: `Reprodução automática.` },
      { key: 'e', html: `Super teclas.` },
    ],
    answer: 'c',
    comment: `As <b>Teclas de Aderência</b> (Sticky Keys) são o recurso de acessibilidade do Windows que permite pressionar teclas modificadoras (Ctrl, Alt, Shift e Windows) <b>uma de cada vez</b>, em vez de simultaneamente, para compor atalhos.<p>As demais alternativas não correspondem a recursos do Windows com essa função (a “d”, Reprodução automática, é o recurso que executa mídias automaticamente ao inserir dispositivos).</p>`,
  },
  {
    id: 30,
    subjectId: 'informatica',
    statement: `<p>No Word, na opção “Localização Avançada”, qual das opções abaixo <b>não</b> é possível?</p>`,
    options: [
      { key: 'a', html: `Diferenciar maiúsculas de minúsculas.` },
      { key: 'b', html: `Localizar metade da palavra.` },
      { key: 'c', html: `Localizar apenas palavras inteiras.` },
      { key: 'd', html: `Usar caracteres curinga.` },
      { key: 'e', html: `Coincidir prefixo.` },
    ],
    answer: 'b',
    comment: `Na janela de busca avançada (Localizar e Substituir → Avançado) do Word, existem opções como <b>Diferenciar maiúsculas de minúsculas</b>, <b>Localizar apenas palavras inteiras</b>, <b>Usar caracteres curinga</b> e <b>Coincidir prefixo</b> (e sufixo).<p>Não existe a opção de “localizar metade da palavra” — o recurso pode buscar palavras inteiras ou partes de palavras (busca livre), mas não há um modo específico para “metade da palavra”.</p>`,
  },
  {
    id: 31,
    subjectId: 'informatica',
    statement: `<p>No Excel, os dados do tipo texto são alinhados, por padrão:</p>`,
    options: [
      { key: 'a', html: `à direita da célula.` },
      { key: 'b', html: `no meio da célula.` },
      { key: 'c', html: `não existe padrão definido.` },
      { key: 'd', html: `à esquerda da célula.` },
      { key: 'e', html: `na parte superior da célula.` },
    ],
    answer: 'd',
    comment: `O alinhamento padrão do Excel depende do tipo de dado: <b>textos à esquerda</b>, <b>números à direita</b> e valores lógicos (VERDADEIRO/FALSO) e de erro ao <b>centro</b> da célula.`,
  },
  {
    id: 32,
    subjectId: 'informatica',
    statement: `<p>No PowerPoint, é possível realizar a gravação da apresentação. Essa funcionalidade pode ser encontrada na guia:</p>`,
    options: [
      { key: 'a', html: `Página Inicial.` },
      { key: 'b', html: `Exibir.` },
      { key: 'c', html: `Apresentação de Slides.` },
      { key: 'd', html: `Ajuda.` },
      { key: 'e', html: `Inserir.` },
    ],
    answer: 'c',
    comment: `A funcionalidade <b>Gravar Apresentação de Slides</b> (gravar narrações, tempos de slide e anotações) está disponível na guia <b>Apresentação de Slides</b> do PowerPoint (junto a outras opções como “Do Início” e “Do Slide Atual”).`,
  },
  {
    id: 33,
    subjectId: 'informatica',
    statement: `<p>O SSL é um certificado digital que garante a transmissão de dados criptografados em uma rede. Um protocolo que o utiliza é:</p>`,
    options: [
      { key: 'a', html: `SMTP` },
      { key: 'b', html: `IMAP` },
      { key: 'c', html: `HTTP` },
      { key: 'd', html: `HTTPS` },
      { key: 'e', html: `POP` },
    ],
    answer: 'd',
    comment: `O <b>HTTPS</b> (HyperText Transfer Protocol Secure) é o protocolo HTTP operando sobre <b>SSL/TLS</b>, garantindo a criptografia da transmissão de dados na web.<p>SMTP, IMAP e POP são protocolos de e-mail (com variantes seguras como SMTPS, IMAPS e POP3S), e o HTTP puro trafega sem criptografia.</p>`,
  },
  {
    id: 34,
    subjectId: 'informatica',
    statement: `<p>Sobre Dark Web, é correto afirmar que:</p>`,
    options: [
      { key: 'a', html: `Seu conteúdo não é acessado através dos navegadores comerciais mais conhecidos, como Chrome e Edge.` },
      { key: 'b', html: `Seu conteúdo é catalogado por órgãos especiais que controlam essa rede paralela.` },
      { key: 'c', html: `Seu conteúdo apresenta basicamente caráter científico e literário.` },
      { key: 'd', html: `Confunde-se com a Deep Web, visto que ambas têm o mesmo intuito, regras e basicamente o mesmo conteúdo.` },
      { key: 'e', html: `Também pode ser chamada de Surface Web.` },
    ],
    answer: 'a',
    comment: `A <b>Dark Web</b> exige navegadores e redes específicos (como o Tor) — seu conteúdo <b>não é acessível</b> pelos navegadores comerciais comuns, como Chrome e Edge.<p>Ela <b>não se confunde</b> com a Deep Web (conteúdo não indexado pelos mecanismos de busca, mas acessível por navegação normal, como internet banking) nem com a Surface Web (a parte indexada e visível da internet). Não há catalogação por “órgãos especiais”, e o conteúdo não tem caráter predominantemente científico/literário.</p>`,
  },
  {
    id: 35,
    subjectId: 'informatica',
    statement: `<p>Paulo trabalha no setor de investigação e deseja mandar uma mensagem para um determinado suspeito, mas deseja que a sua equipe e o seu superior acompanhem o envio, porém sem que o suspeito saiba. Os demais destinatários devem ser digitados no campo:</p>`,
    options: [
      { key: 'a', html: `CC.` },
      { key: 'b', html: `CCo.` },
      { key: 'c', html: `Anexo.` },
      { key: 'd', html: `Assunto.` },
      { key: 'e', html: `De.` },
    ],
    answer: 'b',
    comment: `O campo <b>CCo</b> (Com Cópia Oculta / BCC) envia cópias da mensagem <b>sem que os demais destinatários vejam</b> quem as recebeu — exatamente o que Paulo precisa para que a equipe e o superior acompanhem o envio sem que o suspeito saiba.<p>No <b>CC</b> (Com Cópia), os destinatários copiados ficam visíveis a todos. “Anexo” é para arquivos; “Assunto” é o título; e “De” identifica o remetente.</p>`,
  },
  {
    id: 36,
    subjectId: 'informatica',
    statement: `<p>O ataque também conhecido como “envenenamento de cache DNS” é o:</p>`,
    options: [
      { key: 'a', html: `Ransomware` },
      { key: 'b', html: `Adware.` },
      { key: 'c', html: `Phishing` },
      { key: 'd', html: `Spyware.` },
      { key: 'e', html: `Pharming.` },
    ],
    answer: 'e',
    comment: `O <b>Pharming</b> consiste em manipular o cache (ou os registros) do DNS para redirecionar o usuário de um site legítimo para um site falso, sem que ele perceba — daí o apelido <b>“envenenamento de cache DNS”</b> (DNS cache poisoning).<p>Ransomware sequestra dados por criptografia; adware exibe publicidades indesejadas; phishing engana o usuário por mensagens fraudulentas; e spyware espiona atividades do dispositivo.</p>`,
  },
  {
    id: 37,
    subjectId: 'rac-logico',
    statement: `<p>Em uma região produtora de uvas, verificou-se que 10% da produção é perdida no momento da colheita. Do restante da produção, 20% se estraga durante o transporte até a comercialização e, do que foi transportado, 10% é perdido na comercialização, sendo o restante vendido ao consumidor final. Sabe-se, ainda, que os consumidores desperdiçam 1/4 do que compram.</p>
    <p>Nessa situação, a porcentagem da produção das uvas dessa região que não é efetivamente consumida é:</p>`,
    options: [
      { key: 'a', html: `superior a 52%` },
      { key: 'b', html: `superior a 51% e inferior a 52%` },
      { key: 'c', html: `superior a 50% e inferior a 51%` },
      { key: 'd', html: `superior a 49% e inferior a 50%` },
      { key: 'e', html: `superior a 48% e inferior a 49%` },
    ],
    answer: 'b',
    comment: `Considere 100% da produção:<p>• Colheita: perde 10% → restam <b>90%</b>;<br/>• Transporte: perde 20% de 90% → restam 90% × 0,8 = <b>72%</b>;<br/>• Comercialização: perde 10% de 72% → restam 72% × 0,9 = <b>64,8%</b> vendidos;<br/>• Consumidores desperdiçam 1/4 → consomem 3/4: 64,8% × 3/4 = <b>48,6%</b>.</p><p>Logo, a parcela <b>não consumida</b> é 100% − 48,6% = <b>51,4%</b> — superior a 51% e inferior a 52%.</p>`,
  },
  {
    id: 38,
    subjectId: 'rac-logico',
    statement: `<p>Considere três conjuntos A, B e C que apresentam as seguintes propriedades:</p>
    <ul class="my-3 space-y-1">
      <li>• n(A) = 128;</li>
      <li>• n(B) = 66;</li>
      <li>• n(C) = 50;</li>
      <li>• n(A∩B) = 16;</li>
      <li>• n(B∩C) = 10;</li>
      <li>• n(A∩B∩C) = 0; e</li>
      <li>• n(A∪B∪C) = 194.</li>
    </ul>
    <p>Sabendo-se que n(X) representa o número de elementos de um conjunto X, n(A∩C) é:</p>`,
    options: [
      { key: 'a', html: `18` },
      { key: 'b', html: `20` },
      { key: 'c', html: `22` },
      { key: 'd', html: `24` },
      { key: 'e', html: `26` },
    ],
    answer: 'd',
    comment: `Pela fórmula da inclusão-exclusão:<p>n(A∪B∪C) = n(A) + n(B) + n(C) − n(A∩B) − n(A∩C) − n(B∩C) + n(A∩B∩C)</p><p>194 = 128 + 66 + 50 − 16 − n(A∩C) − 10 + 0</p><p>194 = 218 − n(A∩C) → <b>n(A∩C) = 24</b>.</p>`,
  },
  {
    id: 39,
    subjectId: 'rac-logico',
    statement: `<p>Dois escrivães da PC PE foram incumbidos de carimbar certa quantidade de documentos, que foram divididos entre eles em partes inversamente proporcionais aos seus respectivos tempos de serviço. Se o que trabalha há 12 meses deverá carimbar 36 documentos e o outro trabalha há 9 meses, então o total de documentos que ambos deverão carimbar é</p>`,
    options: [
      { key: 'a', html: `76` },
      { key: 'b', html: `84` },
      { key: 'c', html: `88` },
      { key: 'd', html: `94` },
      { key: 'e', html: `96` },
    ],
    answer: 'b',
    comment: `Divisão inversamente proporcional a 12 e 9 meses equivale a uma divisão diretamente proporcional aos inversos: 1/12 e 1/9, ou seja, na razão 3 : 4 (multiplicando ambos por 36).<p>Se 3k = 36, então k = 12; o segundo escrivão carimba 4k = 48 documentos. Total: 36 + 48 = <b>84</b>.</p>`,
  },
  {
    id: 40,
    subjectId: 'rac-logico',
    statement: `<p>Para formar um grupo de trabalho, a PC PE dispõe de 22 policiais civis. Se esse grupo de trabalho deve ter 3 policiais, então o número de maneiras distintas de se formar esse grupo é igual a:</p>`,
    options: [
      { key: 'a', html: `1.540` },
      { key: 'b', html: `3.080` },
      { key: 'c', html: `8.000` },
      { key: 'd', html: `9.240` },
      { key: 'e', html: `10.648` },
    ],
    answer: 'a',
    comment: `Como a ordem dos componentes do grupo é irrelevante, trata-se de <b>combinação</b>:<p>C(22,3) = 22! / (3! · 19!) = (22 × 21 × 20) / (3 × 2 × 1) = 9.240 / 6 = <b>1.540</b>.</p>`,
  },
  {
    id: 41,
    subjectId: 'rac-logico',
    statement: `<p>Dispondo de um total de 10 gavetas vazias, Joãozinho propôs para o seu amigo o seguinte desafio: “coloque uma meia na primeira gaveta, 4 meias na segunda, 16 meias na terceira, e assim sucessivamente, de modo que na gaveta seguinte seja colocada uma quantidade de meias que é o quádruplo da quantidade colocada na gaveta anterior”.</p>
    <p>Nessa situação, para que o amigo de Joãozinho cumpra o desafio, a quantidade de meias necessárias para se colocar nas 10 gavetas vazias é:</p>`,
    options: [
      { key: 'a', html: `(4<sup>9</sup> − 1)/3` },
      { key: 'b', html: `(4<sup>9</sup> − 1)/4` },
      { key: 'c', html: `(4<sup>10</sup> − 1)/4` },
      { key: 'd', html: `(2<sup>20</sup> − 1)/3` },
      { key: 'e', html: `(2<sup>18</sup> − 1)/4` },
    ],
    answer: 'd',
    comment: `A sequência 1, 4, 16, ... é uma PG de razão q = 4, com 10 termos (do 4<sup>0</sup> ao 4<sup>9</sup>).<p>Soma da PG: S = a<sub>1</sub> · (q<sup>n</sup> − 1) / (q − 1) = 1 · (4<sup>10</sup> − 1) / 3.</p><p>Como 4<sup>10</sup> = (2<sup>2</sup>)<sup>10</sup> = 2<sup>20</sup>, temos S = <b>(2<sup>20</sup> − 1)/3</b>.</p>`,
  },
  {
    id: 42,
    subjectId: 'rac-logico',
    statement: `<p>No estacionamento de um shopping, há 30 veículos entre motos e carros. Se o total de rodas é 100, considerando que cada moto tem 2 rodas e cada carro tem 4 rodas, então é correto afirmar que há</p>`,
    options: [
      { key: 'a', html: `8 motos a mais do que carros.` },
      { key: 'b', html: `10 motos a mais do que carros.` },
      { key: 'c', html: `16 motos a mais do que carros.` },
      { key: 'd', html: `8 carros a mais do que motos.` },
      { key: 'e', html: `10 carros a mais do que motos.` },
    ],
    answer: 'e',
    comment: `Sistema:<p>• m + c = 30<br/>• 2m + 4c = 100 → m + 2c = 50</p><p>Subtraindo a primeira da segunda: c = 20 e m = 10.</p><p>Logo, há <b>10 carros a mais do que motos</b> (20 − 10).</p>`,
  },
  {
    id: 43,
    subjectId: 'rac-logico',
    statement: `<p>A negação da proposição “Pedro foi à praia e disse que o mar estava azul” é:</p>`,
    options: [
      { key: 'a', html: `Pedro não foi à praia e disse que o mar não estava azul.` },
      { key: 'b', html: `Pedro não foi à praia e não disse que o mar estava azul.` },
      { key: 'c', html: `Pedro não foi à praia ou disse que o mar não estava azul.` },
      { key: 'd', html: `Pedro não foi à praia ou não disse que o mar não estava azul.` },
      { key: 'e', html: `Pedro não foi à praia ou não disse que o mar estava azul.` },
    ],
    answer: 'e',
    comment: `A proposição é a conjunção p ∧ q, em que:<p>• p: “Pedro foi à praia”; • q: “Pedro disse que o mar estava azul”.</p><p>Pela lei de De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q — ou seja, “Pedro <b>não foi</b> à praia <b>ou</b> <b>não disse</b> que o mar estava azul” (alternativa “e”). Cuidado com a “d”: negar a segunda proposição produziria “não disse que o mar <i>não</i> estava azul”, invertendo o sentido original.</p>`,
  },
  {
    id: 44,
    subjectId: 'rac-logico',
    statement: `<p>Considere as premissas a seguir:</p>
    <ul class="my-3 space-y-1">
      <li><b>P1:</b> Se Amadeu gosta de música clássica, Pablo aprecia obras de arte.</li>
      <li><b>P2:</b> Se Amadeu não gosta de música clássica, então Carlos gosta de literatura brasileira.</li>
      <li><b>P3:</b> Carlos não gosta de literatura brasileira.</li>
    </ul>
    <p>Assinale a alternativa que apresenta uma conclusão que torna válido o argumento cujas premissas são P1, P2 e P3.</p>`,
    options: [
      { key: 'a', html: `Ou Amadeu gosta de música clássica, ou Carlos não gosta de literatura brasileira.` },
      { key: 'b', html: `Se Carlos não gosta de literatura brasileira, então Amadeu não gosta de música clássica.` },
      { key: 'c', html: `Amadeu gosta de música clássica e Pablo aprecia obras de arte.` },
      { key: 'd', html: `Pablo não aprecia obras de arte ou Carlos gosta de literatura brasileira.` },
      { key: 'e', html: `Se Pablo aprecia obras de arte, então Amadeu não gosta de música clássica.` },
    ],
    answer: 'c',
    comment: `Símbolos: A = “Amadeu gosta de música clássica”; P = “Pablo aprecia obras de arte”; C = “Carlos gosta de literatura brasileira”.<p>Premissas: P1: A → P; P2: ¬A → C; P3: ¬C.</p><p>De P2 e P3, por <b>modus tollens</b>: ¬A → C e ¬C ⊢ <b>A</b> (Amadeu gosta de música clássica). De P1 e A, por <b>modus ponens</b>: A → P e A ⊢ <b>P</b> (Pablo aprecia obras de arte).</p><p>Logo, a conclusão “<b>A e P</b>” (alternativa “c”) é consequência lógica das premissas e torna o argumento válido.</p>`,
  },
]
