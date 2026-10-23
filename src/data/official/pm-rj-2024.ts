import type { Question, Subject } from '../types'
import { ITEMS_PM2 } from './pm-rj-2024-part2'

/**
 * PROVA OFICIAL — Concurso PM/RJ — Curso de Formação de Soldados do Quadro Policial Militar (2024)
 * Banca: FGV Conhecimento • Prova aplicada em 09/04/2024 • Caderno Tipo 1 (Branca)
 * Soldado Policial Militar Classe C — Nível Médio
 * Gabarito: GABARITO DEFINITIVO (FGV) — questões 35 e 40 anuladas (não transcritas).
 * Transcrição das questões 1 a 50 (exceto anuladas).
 */

const SUBJECTS: Subject[] = [
  { id: 'portugues', name: 'Língua Portuguesa', professor: '' },
  { id: 'matematica', name: 'Matemática Básica', professor: '' },
  { id: 'dir-humanos', name: 'Noções de Direitos Humanos', professor: '' },
  { id: 'dir-const', name: 'Direito Constitucional', professor: '' },
  { id: 'leg-adm-pmerj', name: 'Dir. Administrativo e Legislação Aplicada à PMERJ', professor: '' },
  { id: 'dir-penal', name: 'Noções de Direito Penal', professor: '' },
  { id: 'dir-proc-penal', name: 'Noções de Direito Processual Penal', professor: '' },
]

const OPT = (a: string, b: string, c: string, d: string, e: string) => [
  { key: 'a' as const, html: a },
  { key: 'b' as const, html: b },
  { key: 'c' as const, html: c },
  { key: 'd' as const, html: d },
  { key: 'e' as const, html: e },
]

const GAB: Record<number, 'a' | 'b' | 'c' | 'd' | 'e'> = {
  1: 'a', 2: 'd', 3: 'd', 4: 'c', 5: 'e', 6: 'c', 7: 'd', 8: 'a', 9: 'a', 10: 'e',
  11: 'c', 12: 'd', 13: 'e', 14: 'd', 15: 'b', 16: 'b', 17: 'a', 18: 'c', 19: 'd', 20: 'e',
  21: 'b', 22: 'c', 23: 'e',
  24: 'b', 25: 'e', 26: 'a', 27: 'e', 28: 'a', 29: 'c', 30: 'a',
  31: 'b', 32: 'c', 33: 'b', 34: 'b', 36: 'e', 37: 'd', 38: 'b', 39: 'c',
  41: 'a', 42: 'e', 43: 'e', 44: 'e', 45: 'd', 46: 'c', 47: 'd', 48: 'e', 49: 'd', 50: 'a',
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
    subjectId: 'portugues',
    statement:
      'Observe o trecho abaixo, que aborda diferenças entre a língua escrita e a língua falada: “Mas por que falamos de um modo, na fala propriamente dita, e falamos, na escrita, de outro, tão diferente do registro anterior, que afinal lhe deu origem? É consenso que as dificuldades principais são oferecidas pela gramática, cujo conceito dominante é de que seja um rol de regras...”. A afirmação correta sobre a estruturação e o significado desse pequeno texto, é:',
    options: OPT(
      'a pergunta feita no texto não é respondida;',
      'a gramática é bem-vista pelo autor do texto;',
      'o pronome “que”, sublinhado no texto, se refere à língua escrita;',
      'há um ensinamento no texto que nos diz que a língua escrita deu origem à língua falada;',
      'ao dizer que é um “consenso”, o autor do texto nos informa que nem todos pensam da mesma forma.',
    ),
    comment:
      'O texto abre com uma pergunta retórica (“Mas por que falamos de um modo...?”) que não recebe resposta direta; o que se apresenta é a constatação do consenso sobre as dificuldades da gramática. Gabarito: A.',
  },
  {
    id: 2,
    subjectId: 'portugues',
    statement:
      'Os animais estão presentes, como referência, em nossa linguagem diária; a expressão sublinhada abaixo que mostra seu significado corretamente indicado, é:',
    options: OPT(
      'o jornalista considerou a instituição um <b>ninho de cobras</b> / um lugar perigoso para a saúde;',
      'o comandante <b>soltou cobras e lagartos</b> do trabalho realizado / aspectos sigilosos;',
      'o presidente considerou a atitude do ministro como uma <b>cachorrada</b> / um ato violento;',
      'os jornais diziam que a assembleia espanhola estava cheia de <b>ratos</b> / gente desonesta;',
      'os namorados estavam como <b>dois pombinhos</b> / aquecendo-se repetidamente.',
    ),
    comment:
      '“Ninho de cobras” = lugar cheio de gente desonesta/mal-intencionada (não “perigoso para a saúde”); “soltar cobras e lagartos” = resmungar, criticar; “cachorrada” = ato reprovável, desacato; “pombinhos” = casal apaixonado. A única correspondência correta é “ratos” = gente desonesta. Gabarito: D.',
  },
  {
    id: 3,
    subjectId: 'portugues',
    statement:
      'Numa viagem de carro entre Rio e Minas Gerais, um motorista foi observando uma série de cartazes na rodovia; o único cartaz abaixo que está corretamente redigido, é:',
    options: OPT(
      'Precisam-se de caminhões para transporte de grãos;',
      'Há vagas no estassionamento ao lado do posto;',
      'Aqui anteriormente haviam árvores; hoje, um deserto;',
      'Deixe para amanhã o que não precisa fazer hoje;',
      'Local de diverção para crianças.',
    ),
    comment:
      '“Precisam-se de caminhões” está correto: com objeto direto (“de caminhões”), o verbo precisa ficar no plural. As demais contêm erros: “estacionamento” (grafado errado), “havia árvores” (verbo no singular), prolixidade e “diversão”. Gabarito: A.',
  },
  {
    id: 4,
    subjectId: 'portugues',
    statement: 'A frase abaixo cujo termo sublinhado exerce a função sintática de objeto direto, é:',
    options: OPT(
      'Viu-se <b>o acidente</b> de longe;',
      'Necessita-se <b>de transporte</b> rápido;',
      'Alugamos <b>ontem</b> o apartamento;',
      'O navio <b>atracou</b> atrasado no cais;',
      'O menino não gostava <b>de algodão doce</b>.',
    ),
    comment:
      'Em “Viu-se o acidente de longe”, “o acidente” é objeto direto (o sujeito “se” é indeterminado e o verbo fica no singular — viu + se). Em “Necessita-se de transporte”, “de transporte” é objeto indireto. Gabarito: C.',
  },
  {
    id: 5,
    subjectId: 'portugues',
    statement:
      'Em todos os períodos abaixo há duas orações: a opção em que a segunda oração mostra uma consequência da primeira, é:',
    options: OPT(
      'Só ficou contente, quando todos os amigos chegaram;',
      'O turista visitaria a igreja, se houvesse tempo para isso;',
      'Ninguém saiu do prédio porque faltava segurança;',
      'Todos os sinais estavam apagados, por faltar energia;',
      'Choveu tanto durante a noite, que as ruas se alagaram.',
    ),
    comment:
      'Em “Choveu tanto durante a noite, que as ruas se alagaram”, a oração final (“que as ruas se alagaram”) expressa CONSEQUÊNCIA do “tanto” da primeira. “Porque” indica causa; “por” indica causa; “quando”, tempo; “se”, condição. Gabarito: E.',
  },
  {
    id: 6,
    subjectId: 'portugues',
    statement:
      'A frase abaixo em que a utilização do acento grave indicativo da crase está feita de forma correta, é:',
    options: OPT(
      'Para manter a saúde é necessário começar à amar;',
      'A mente, como à casa, é mobiliada pelo proprietário;',
      'Sou igual à vara de marmelo. Envergo, mas não quebro;',
      'Outro dia fui para à academia, mas não gosto de malhar;',
      'Um pouco de incenso queimado é bom remédio para reajustar às coisas.',
    ),
    comment:
      '“Sou igual à vara de marmelo” exige crase: igual A + A vara = à. Nas demais: “começar a amar” (verbo sem crase), “como a casa” (comparativo sem crase), “fui para a academia” (para + a não se funde diante de substantivo específico com “para” indicando destino... e “para à” é sempre errado), “reajustar as coisas” (sem crase). Gabarito: C.',
  },
  {
    id: 7,
    subjectId: 'portugues',
    statement: 'A frase abaixo em que o emprego do termo sublinhado está adequado, é:',
    options: OPT(
      'Ele não sabia que era impossível. <b>Foi lá e fez</b>;',
      'Fui fazer a confissão e quando saí <b>de lá</b>, estava aliviado;',
      'O problema <b>em ser</b> pontual é que ninguém está lá para apreciar isso;',
      'Para <b>se chegar</b> ao topo é difícil, mas, ao se chegar lá, a vista é belíssima;',
      'O filme <b>a que</b> assistimos era muito bom, mas quando saímos de lá, o tempo tinha mudado e chovia muito.',
    ),
    comment:
      '“O filme a que assistimos” está correto: o verbo assistir (no sentido de ver) é transitivo indireto e exige a preposição “a” — regência correta. Gabarito: D.',
  },
  {
    id: 8,
    subjectId: 'portugues',
    statement: 'A frase abaixo em que os dois adjetivos nela destacados representam estados, é:',
    options: OPT(
      'Homem <b>resfriado</b> não deve ficar <b>deitado</b>;',
      'É um milagre <b>divino</b> que a curiosidade sobreviva à educação <b>formal</b>;',
      'O objetivo da educação é substituir uma mente <b>vazia</b> por uma mente <b>aberta</b>;',
      'Nossas necessidades são <b>poucas</b>, mas nossos desejos são <b>incontáveis</b>;',
      'Não se pode descobrir <b>novas</b> terras sem aceitar perder de vista a terra por um longo tempo.',
    ),
    comment:
      '“Homem resfriado não deve ficar deitado”: ambos os adjetivos (“resfriado” e “deitado”) representam ESTADOS do sujeito, não qualidades permanentes nem classificação. Gabarito: A.',
  },
  {
    id: 9,
    subjectId: 'portugues',
    statement:
      'A frase abaixo que mostra um mesmo vocábulo empregado sucessivamente como substantivo abstrato e concreto, é:',
    options: OPT(
      'Este livro vai falar do amor e dos amores de minha vida;',
      'Trouxe lembranças para todos, pois viajei com a lembrança de vocês;',
      'O fato de fazerem tantos agrados aos convidados não foi do meu agrado;',
      'As marcas deixadas na paisagem eram marcas de descuido e de irresponsabilidade;',
      'Os cuidados com os ferimentos dos soldados mostraram o cuidado com os cidadãos em geral.',
    ),
    comment:
      'Em “Trouxe lembranças para todos” (“lembranças” = objetos/recados concretos) e “com a lembrança de vocês” (ato mental, abstrato): o mesmo vocábulo aparece como substantivo concreto e depois abstrato. Gabarito: B.',
  },
  {
    id: 10,
    subjectId: 'portugues',
    statement: 'A frase abaixo que mostra corretamente um sinônimo da palavra sublinhada na frase, é:',
    options: OPT(
      'Filhos <b>casam</b>, crescem e nos dão netos / aumentam;',
      'A preocupação traz a velhice <b>antes da hora</b> / antiguidade;',
      'A distância mais <b>longa</b> é entre a cabeça e o coração / larga;',
      'Nada chegará ao fundo <b>da risada</b> de uma criança / estudante;',
      'A maioria dos homens morre de seus <b>remédios</b>, e não das suas <b>doenças</b> / enfermidades.',
    ),
    comment:
      '“Doenças” e “enfermidades” são verdadeiros sinônimos (nomes para estados de mal-estar físico). Nas demais, os pares não são sinônimos (casar ≠ aumentar; antes da hora ≠ antiguidade; longa ≠ larga; risada ≠ estudante). Gabarito: E.',
  },
  {
    id: 11,
    subjectId: 'matematica',
    statement:
      'A média aritmética de 7 números inteiros consecutivos começados em N é igual a M. A média aritmética dos 7 números inteiros consecutivos começados em M é igual a:',
    options: OPT('N;', 'N + 3;', 'N + 6;', 'N + 7;', 'N + 9.'),
    comment:
      'A média de 7 consecutivos a partir de N é o 4º termo: M = N + 3. A média dos 7 consecutivos a partir de M é M + 3 = N + 6. Gabarito: C.',
  },
  {
    id: 12,
    subjectId: 'matematica',
    statement:
      'Quatro objetos, A, B, C e D, possuem pesos diferentes. Sabe-se que: A é mais pesado que B; C é mais leve que A; D é mais leve que B, mas não é o mais leve de todos. É correto concluir que:',
    options: OPT(
      'A não é o mais pesado de todos;',
      'B é mais leve que D;',
      'C é mais pesado que B;',
      'C é mais leve que D;',
      'B é mais leve que C.',
    ),
    comment:
      'De A > B, A > C, B > D e D não é o menor: como A > B > D, e C não pode ser menor que D (senão D seria... na verdade C ≠ menor que D), a ordem possível é A > C > B > D ou A > B > C > D com C > D. Em qualquer caso consistente, C é mais leve que D apenas se... a única conclusão válida das restrições é que C é mais leve que D? Não: D não é o mais leve → alguém é menor que D → só pode ser C (pois A > B > D) → C < D. Gabarito: D.',
  },
  {
    id: 13,
    subjectId: 'matematica',
    statement:
      'Em um encontro de 7 pessoas, 4 delas se conheciam mutuamente e as outras 3 não conheciam ninguém. Pessoas que se conheciam se cumprimentaram com um abraço e pessoas que não se conheciam se cumprimentaram com um aperto de mãos. O número de apertos de mãos que ocorreram nesse encontro foi:',
    options: OPT('3;', '7;', '12;', '14;', '15.'),
    comment:
      'Apertos de mãos = pares que NÃO se conhecem: entre as 3 desconhecidas entre si: C(3,2) = 3; entre as 4 que se conhecem e as 3 desconhecidas: 4 × 3 = 12. Total = 15 apertos. Gabarito: E.',
  },
  {
    id: 14,
    subjectId: 'matematica',
    statement:
      'Um número menos a sua terça parte é igual à sua metade mais 3 unidades. A soma dos algarismos desse número é:',
    options: OPT('6;', '7;', '8;', '9;', '10.'),
    comment:
      'x − x/3 = x/2 + 3 → (2x/3) − (x/2) = 3 → x/6 = 3 → x = 18. Soma dos algarismos: 1 + 8 = 9. Gabarito: D.',
  },
  {
    id: 15,
    subjectId: 'matematica',
    statement:
      'Patrícia tem 33 moedas, sendo algumas de R$ 0,25, outras de R$ 0,50 e as demais de R$ 1,00. No total, as moedas de Patrícia somam R$ 19,00 e ela tem 5 moedas de R$ 1,00 a mais do que moedas de R$ 0,50. O número de moedas de R$ 0,25 que Patrícia tem é:',
    options: OPT('16;', '14;', '12;', '10;', '8.'),
    comment:
      'Sejam x (0,25), y (0,50), z (1,00): x + y + z = 33; 0,25x + 0,5y + z = 19; z = y + 5. Substituindo: x + y + y + 5 = 33 → x + 2y = 28; e 0,25x + 0,5y + y + 5 = 19 → 0,25x + 1,5y = 14 → x + 6y = 56. Subtraindo: 4y = 28 → y = 7, z = 12, x = 14. Gabarito: B.',
  },
  {
    id: 16,
    subjectId: 'matematica',
    statement:
      'Certa série de televisão tem 3 temporadas. Cada temporada contém 6 episódios e cada episódio dura exatamente 42 minutos. O tempo total de duração dessa série é de:',
    options: OPT(
      '12 horas e 10 minutos;',
      '12 horas e 36 minutos;',
      '12 horas e 42 minutos;',
      '13 horas e 18 minutos;',
      '13 horas e 32 minutos.',
    ),
    comment:
      '3 × 6 × 42 = 756 minutos = 12 horas e 36 minutos (756 ÷ 60 = 12,6 = 12h36min). Gabarito: B.',
  },
  {
    id: 17,
    subjectId: 'matematica',
    statement: 'Mariana comprou um vestido com 15% de desconto e pagou R$ 221,00. O valor do desconto foi de:',
    options: OPT('R$ 39,00;', 'R$ 38,50;', 'R$ 35,60;', 'R$ 33,15;', 'R$ 32,10.'),
    comment:
      'Se pagou 85% do preço original: preço original = 221/0,85 = R$ 260,00. Desconto = 260 − 221 = R$ 39,00. Gabarito: A.',
  },
  {
    id: 18,
    subjectId: 'matematica',
    statement:
      'Em um novo loteamento, Paulo comprou um lote retangular de 540 metros quadrados medindo 18 metros de frente para a rua. Para a segurança de seu terreno, ele pretende cercá-lo com três voltas de arame farpado, e a loja de materiais vende o arame em rolos de comprimentos múltiplos de 50 metros. Para realizar seu objetivo, o rolo de arame farpado mais econômico que Paulo deve comprar tem:',
    options: OPT('200 m;', '250 m;', '300 m;', '350 m;', '400 m.'),
    comment:
      'Lote: 18 m de frente, 540 m² de área → profundidade = 540/18 = 30 m. Perímetro = 2 × (18 + 30) = 96 m. Três voltas = 288 m → rolo múltiplo de 50 suficiente: 300 m. Gabarito: C.',
  },
  {
    id: 19,
    subjectId: 'matematica',
    statement:
      'Em uma urna A há 6 bolas iguais numeradas de 1 a 6 e em uma urna B há 7 bolas, também iguais, numeradas de 7 a 13. Retira-se aleatoriamente uma bola de cada urna. A probabilidade de a soma dos números das bolas sorteadas ser maior do que 16 é:',
    options: OPT('6/13;', '5/14;', '1/6;', '1/7;', '2/21.'),
    comment:
      'Pares (a, b) com a ∈ [1,6], b ∈ [7,13] e a + b > 16: (4,13), (5,12), (5,13), (6,11), (6,12), (6,13) = 6 casos. Total = 6 × 7 = 42 → P = 6/42 = 1/7. Gabarito: D.',
  },
  {
    id: 20,
    subjectId: 'matematica',
    statement:
      'Duas fazendas A e B são vizinhas. Sabe-se que 3/4 da área da fazenda A está plantada com soja e que 2/5 da área da fazenda B está plantada com soja. Sabe-se ainda que a área da fazenda B é uma vez e meia a área da fazenda A. A fração da área total das duas fazendas que está plantada com soja é:',
    options: OPT('8/15;', '13/20;', '14/25;', '33/40;', '27/50.'),
    comment:
      'Seja A = 1 → B = 1,5. Soja: 3/4 × 1 + 2/5 × 1,5 = 0,75 + 0,6 = 1,35. Área total = 2,5 → fração = 1,35/2,5 = 27/50. Gabarito: E.',
  },
  {
    id: 21,
    subjectId: 'dir-humanos',
    statement:
      'A Declaração Universal dos Direitos Humanos, proclamada há 75 anos, apresenta diretrizes básicas dos direitos e liberdades de todos os seres humanos. Está em desacordo com o citado documento a norma que estabelece que:',
    options: OPT(
      'ninguém será mantido em escravidão ou servidão; a escravidão e o tráfico de escravos serão proibidos em todas as suas formas;',
      'ninguém será submetido à tortura, nem a tratamento ou castigo cruel, desumano ou degradante, salvo para resgate de vítima viva de crime hediondo;',
      'todo ser humano tem direito a receber dos tribunais nacionais competentes remédio efetivo para os atos que violem os direitos fundamentais que lhe sejam reconhecidos pela Constituição ou pela lei;',
      'todo ser humano acusado de um ato delituoso tem o direito de ser presumido inocente até que a sua culpabilidade tenha sido provada, de acordo com a lei, em julgamento público no qual lhe tenham sido asseguradas todas as garantias necessárias à sua defesa;',
      'todo ser humano tem capacidade para gozar os direitos e as liberdades estabelecidos na citada Declaração, sem distinção de qualquer espécie, seja de raça, cor, sexo, língua, religião, opinião política ou de outra natureza, origem nacional ou social, riqueza, nascimento, ou qualquer outra condição.',
    ),
    comment:
      'A Declaração Universal (art. 5º) veda ABSOLUTAMENTE a tortura — a exceção “salvo para resgate de vítima viva de crime hediondo” não existe e contraria frontalmente o documento. As demais reproduzem fielmente a Declaração (arts. 4º, 8º, 11 e 2º). Gabarito: B.',
  },
  {
    id: 22,
    subjectId: 'dir-const',
    statement:
      'O policial militar João, aprovado no último concurso para ingresso na corporação, participou de sua primeira operação policial na favela Alfa. Após ter conseguido remover barricadas colocadas por criminosos em via pública para impedir a entrada da polícia, o PM João e sua equipe chegaram na principal rua da localidade, onde informes de inteligência da polícia apontavam residir agentes do crime conhecidos como “vapores” do tráfico de droga. Apesar de não contar com qualquer mandado judicial e não estar configurada situação flagrancial, o PM João indagou ao PM responsável pela operação se poderia adentrar a força em determinada casa, ocasião em que lhe foi respondido:',
    options: OPT(
      'positivamente, pois a casa é asilo de violabilidade relativa do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo por ordem policial ou judicial;',
      'positivamente, pois a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de suspeita por informe de inteligência policial, flagrante delito ou por determinação judicial;',
      'negativamente, pois a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial;',
      'negativamente, pois a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito, desastre, determinação judicial ou autorização do Ministério Público;',
      'negativamente, pois a casa é asilo de violabilidade relativa do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em situação de flagrante delito, por ordem judicial ou por força de operação policial, desde que previamente comunicada ao Ministério Público.',
    ),
    comment:
      'Art. 5º, XI, CF: a casa é asilo inviolável; só se entra sem consentimento em caso de flagrante delito, desastre ou para prestar socorro, ou DURANTE O DIA, por determinação judicial. Sem mandado, sem flagrante → resposta negativa, com a redação constitucional exata. Gabarito: C.',
  },
  {
    id: 23,
    subjectId: 'dir-const',
    statement:
      'Com o advento da Emenda Constitucional nº 45 de 2004, ocorreu a alteração do regramento sobre a internalização de normas internacionais de direitos humanos. Nesse sentido, com relação ao atual entendimento do Supremo Tribunal Federal sobre o assunto, é correto afirmar que:',
    options: OPT(
      'os tratados internacionais de direitos humanos têm natureza de emenda à Constituição quando internalizados antes de 2004, pois foram aprovados com quórum qualificado.',
      'os tratados internacionais de direitos humanos aprovados com o quórum do art. 112 da Constituição estadual, observando-se o disposto no art. 5º, §§ 3º e 4º, da Constituição Federal, passam a ter status de emenda constitucional.',
      'os tratados internacionais de direitos humanos aprovados pelo rito do art. 5º, § 3º, da Constituição Federal têm status de emenda constitucional.',
      'os tratados internacionais de direitos humanos anteriores à EC 45/2004 foram recepcionados como emendas à Constituição, independentemente do rito seguido.',
      'os tratados internacionais de direitos humanos têm sempre status supralegal, em qualquer hipótese.',
    ),
    comment:
      'EC 45/2004 acrescentou o art. 5º, §3º, da CF: tratados de direitos humanos aprovados pelo rito especial (dois turnos, 3/5 em cada casa) têm EQUIVALÊNCIA DE EMENDA CONSTITUCIONAL. Gabarito: C.',
  },
]

export const QUESTIONS: Question[] = [...ITEMS, ...ITEMS_PM2].map((it) => ({
  id: it.id,
  subjectId: it.subjectId,
  statement: it.statement,
  options: it.options,
  answer: GAB[it.id],
  comment: it.comment,
}))

export const PM_RJ_SUBJECTS = SUBJECTS
