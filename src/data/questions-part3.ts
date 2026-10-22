import type { Question } from './types'

export const PART3: Question[] = [
  {
    id: 45,
    subjectId: 'contabilidade',
    statement: `<p>Em relação à natureza contábil das contas e à aplicação do método das partidas dobradas, analise as assertivas e assinale a alternativa que aponta a(s) correta(s).</p>
    <p><b>I.</b> As contas do ativo têm seus saldos aumentados por meio de lançamentos a débito e reduzidos a crédito.</p>
    <p><b>II.</b> Os saldos das contas do passivo e patrimônio líquido aumentam a crédito e, por consequência, diminuem a débito.</p>
    <p><b>III.</b> As contas de receitas e despesas têm natureza devedora e, consequentemente, diminuem a crédito.</p>`,
    options: [
      { key: 'a', html: `I, II e III.` },
      { key: 'b', html: `Apenas I e II.` },
      { key: 'c', html: `Apenas I e III.` },
      { key: 'd', html: `Apenas II.` },
      { key: 'e', html: `Apenas III.` },
    ],
    answer: 'b',
    comment: `<b>I. Correta</b> — as contas de ATIVO têm natureza <b>devedora</b>: aumentam a débito e diminuem a crédito.<p><b>II. Correta</b> — PASSIVO e PATRIMÔNIO LÍQUIDO têm natureza <b>credora</b>: aumentam a crédito e diminuem a débito.</p><p><b>III. Incorreta</b> — as contas de <b>receitas têm natureza credora</b> (aumentam a crédito); apenas as <b>despesas</b> têm natureza devedora. A assertiva generaliza as duas categorias como devedoras, o que é falso.</p>`,
  },
  {
    id: 46,
    subjectId: 'contabilidade',
    statement: `<p>Considerando a correta contabilização de operações típicas de uma empresa, são exemplos de transações que afetam o caixa da empresa, <b>EXCETO</b>:</p>`,
    options: [
      { key: 'a', html: `constituição de perdas estimadas com clientes.` },
      { key: 'b', html: `pagamento de dividendos.` },
      { key: 'c', html: `pagamento de fornecedores.` },
      { key: 'd', html: `recebimento de dividendos.` },
      { key: 'e', html: `recebimento de comissões.` },
    ],
    answer: 'a',
    comment: `A constituição de <b>perdas estimadas com clientes</b> (PCLD — antiga “provisão para créditos de liquidação duvidosa”) é um lançamento contábil que apenas reconhece a provável perda sobre créditos, <b>sem qualquer movimentação de caixa</b>.<p>Os pagamentos de dividendos e de fornecedores <b>reduzem</b> o caixa, e os recebimentos de dividendos e de comissões o <b>aumentam</b>.</p>`,
  },
  {
    id: 47,
    subjectId: 'contabilidade',
    statement: `<p>Considerando as seguintes operações que ocorreram no cotidiano da empresa Petrolina S/A:</p>
    <ul class="my-3 space-y-1">
      <li>• Compra de um veículo a prazo.</li>
      <li>• Pagamento de uma duplicata com juros.</li>
      <li>• Pagamento de salários do período.</li>
    </ul>
    <p>Os fatos contábeis relativos a essas operações são classificados, respectivamente, como fatos contábeis:</p>`,
    options: [
      { key: 'a', html: `Permutativo; Permutativo; Misto.` },
      { key: 'b', html: `Permutativo; Misto; Modificativo.` },
      { key: 'c', html: `Modificativo; Modificativo; Misto.` },
      { key: 'd', html: `Modificativo; Misto; Permutativo.` },
      { key: 'e', html: `Misto; Misto; Modificativo.` },
    ],
    answer: 'b',
    comment: `<p>• <b>Compra de veículo a prazo</b> — FATO <b>PERMUTATIVO</b>: entra um bem (ativo imobilizado) e uma obrigação (fornecedores/contas a pagar), sem alteração do patrimônio líquido.</p><p>• <b>Pagamento de duplicata com juros</b> — FATO <b>MISTO</b> (ou composto): a baixa da duplicata é permutativa (reduz passivo e caixa sem efeito no PL), mas os <b>juros</b> são despesa modificativa (reduzem o PL).</p><p>• <b>Pagamento de salários</b> — FATO <b>MODIFICATIVO</b> (diminutivo): a despesa reduz o ativo (caixa) e o patrimônio líquido.</p>`,
  },
  {
    id: 48,
    subjectId: 'contabilidade',
    statement: `<p>Suponha que a Cia Comercial Araripina auferiu, em 2021, uma receita de R$ 50.000,00, da qual apenas 80% foi recebida. No mesmo período, as despesas atingiram o valor de R$ 30.000,00, das quais foram pagas 50%.</p>
    <p>Apurando-se o resultado do período pelos regimes de caixa e de competência, teremos os seguintes resultados, respectivamente:</p>`,
    options: [
      { key: 'a', html: `R$ 10.000,00; R$ 20.000,00.` },
      { key: 'b', html: `R$ 20.000,00; R$ 10.000,00.` },
      { key: 'c', html: `R$ 20.000,00; R$ 25.000,00.` },
      { key: 'd', html: `R$ 25.000,00; R$ 20.000,00.` },
      { key: 'e', html: `R$ 25.000,00; R$ 25.000,00.` },
    ],
    answer: 'd',
    comment: `<b>Regime de CAIXA</b> (compara recebimentos com pagamentos):<p>• Recebimentos: 80% × 50.000 = 40.000<br/>• Pagamentos: 50% × 30.000 = 15.000<br/>• Resultado: 40.000 − 15.000 = <b>25.000</b></p><p><b>Regime de COMPETÊNCIA</b> (compara receitas com despesas incorridas): 50.000 − 30.000 = <b>20.000</b>.</p><p>Respectivamente: R$ 25.000,00 (caixa) e R$ 20.000,00 (competência).</p>`,
  },
  {
    id: 49,
    subjectId: 'contabilidade',
    statement: `<p>A empresa Carpina adquiriu, em 31/12/2019, uma máquina no valor de R$ 65.000,00 a prazo, sendo esse valor registrado no seu ativo imobilizado. Na data da aquisição, o bem foi colocado em uso e a empresa estimou que a vida útil será de 10 anos e o seu valor residual de R$ 15.000,00. Sabendo-se que a empresa utiliza o método linear para o cálculo da depreciação, com base nessas informações, o valor contábil apresentado no Balanço Patrimonial de 31/12/2021 foi, em reais,</p>`,
    options: [
      { key: 'a', html: `65.000,00.` },
      { key: 'b', html: `60.000,00.` },
      { key: 'c', html: `55.000,00.` },
      { key: 'd', html: `50.000,00.` },
      { key: 'e', html: `45.000,00.` },
    ],
    answer: 'c',
    comment: `Depreciação anual pelo método linear:<p>Depr. = (Custo − Valor residual) / Vida útil = (65.000 − 15.000) / 10 = <b>5.000 por ano</b>.</p><p>O bem foi colocado em uso em 31/12/2019; até o Balanço de 31/12/2021, foram registradas depreciações de <b>2020 e 2021</b> (2 anos): 10.000.</p><p>Valor contábil = 65.000 − 10.000 = <b>55.000,00</b>.</p>`,
  },
  {
    id: 50,
    subjectId: 'contabilidade',
    statement: `<p>A Cia Jatobá efetuou a aquisição de mercadorias à vista, por R$ 20.000,00, gastando ainda R$ 2.000,00 referentes a fretes (a serem pagos em 30 dias) para colocar as mercadorias em condição de venda.</p>
    <p>Considerando o que prevê o CPC 16 – Estoques, assinale a alternativa que reflete corretamente a mudança no Patrimônio da empresa decorrente dessa operação.</p>`,
    options: [
      { key: 'a', html: `Aumento do ativo em R$ 20.000,00; aumento das despesas com fretes em R$ 2.000,00; aumento do passivo em R$ 2.000,00.` },
      { key: 'b', html: `Aumento do ativo em R$ 2.000,00; aumento do passivo em R$ 2.000,00.` },
      { key: 'c', html: `Aumento do ativo em R$ 22.000,00; aumento do passivo em R$ 2.000,00.` },
      { key: 'd', html: `Aumento do ativo em R$ 22.000,00; diminuição do passivo em R$ 20.000,00.` },
      { key: 'e', html: `Aumento do ativo em R$ 2.000,00; aumento das despesas com fretes em R$ 2.000,00; aumento do passivo em R$ 2.000,00.` },
    ],
    answer: 'b',
    comment: `Pelo <b>CPC 16 (R1)</b>, o custo de aquisição dos estoques inclui os gastos necessários para colocar as mercadorias em condição de venda — como os <b>fretes de compra</b>, que <b>não são despesas</b>: incorporam-se ao custo dos estoques.<p>Efeitos: estoques +22.000; caixa −20.000 (compra à vista); fornecedores +2.000 (frete a prazo). Resultado líquido: <b>Ativo aumenta R$ 2.000</b> e <b>Passivo aumenta R$ 2.000</b> — sem efeito no resultado.</p>`,
  },
  {
    id: 51,
    subjectId: 'contabilidade',
    statement: `<p>A empresa CARUARU S/A publicou em seu Balanço Patrimonial a conta Ações em Tesouraria. Essa conta deverá ser classificada no seguinte grupo ou subgrupo:</p>`,
    options: [
      { key: 'a', html: `Ativo Circulante.` },
      { key: 'b', html: `Patrimônio Líquido.` },
      { key: 'c', html: `Investimentos.` },
      { key: 'd', html: `Intangível.` },
      { key: 'e', html: `Passivo Circulante.` },
    ],
    answer: 'b',
    comment: `Ações em Tesouraria (ações próprias adquiridas pela companhia) é conta <b>retificadora do PATRIMÔNIO LÍQUIDO</b> — aparece no balanço com sinal negativo, deduzindo o PL (Lei nº 6.404/76, art. 182, § 5º). Não representa ativo, pois corresponde a redução do capital social registrado.`,
  },
  {
    id: 52,
    subjectId: 'contabilidade',
    statement: `<p>Ao final do exercício social de 2023, a companhia de capital aberto PAULISTA S/A apresentou as seguintes informações parciais, retiradas das demonstrações contábeis realizadas no encerramento desse mesmo exercício:</p>
    <div class="my-4 overflow-hidden rounded-lg border border-slate-200">
      <table class="w-full text-sm">
        <tbody>
          <tr class="border-b border-slate-200"><td class="px-4 py-2 font-medium">Custo das mercadorias vendidas</td><td class="px-4 py-2 text-right tabular-nums">80.000,00</td></tr>
          <tr class="border-b border-slate-200"><td class="px-4 py-2 font-medium">Deduções das vendas</td><td class="px-4 py-2 text-right tabular-nums">24.000,00</td></tr>
          <tr class="border-b border-slate-200"><td class="px-4 py-2 font-medium">Despesas de vendas e administrativas</td><td class="px-4 py-2 text-right tabular-nums">40.000,00</td></tr>
          <tr class="border-b border-slate-200"><td class="px-4 py-2 font-medium">Dividendos obrigatórios propostos pela administração</td><td class="px-4 py-2 text-right tabular-nums">20.000,00</td></tr>
          <tr class="border-b border-slate-200"><td class="px-4 py-2 font-medium">Despesa com Imposto de Renda</td><td class="px-4 py-2 text-right tabular-nums">10.000,00</td></tr>
          <tr class="border-b border-slate-200"><td class="px-4 py-2 font-medium">Participações Estatutárias (empregados e administradores)</td><td class="px-4 py-2 text-right tabular-nums">8.000,00</td></tr>
          <tr><td class="px-4 py-2 font-medium">Receita Líquida das Vendas</td><td class="px-4 py-2 text-right tabular-nums">184.000,00</td></tr>
        </tbody>
      </table>
    </div>
    <p>Considerando exclusivamente as informações recebidas e o que prevê a Lei 6.404/76 para a elaboração da Demonstração do Resultado do Exercício, o lucro líquido da companhia, no exercício, em reais, é</p>`,
    options: [
      { key: 'a', html: `2.000,00` },
      { key: 'b', html: `22.000,00` },
      { key: 'c', html: `26.000,00` },
      { key: 'd', html: `34.000,00` },
      { key: 'e', html: `46.000,00` },
    ],
    answer: 'e',
    comment: `Estrutura da DRE (Lei nº 6.404/76):<p>• Receita Líquida: <b>184.000</b><br/>• (−) CMV: 80.000 → Lucro Bruto: <b>104.000</b><br/>• (−) Despesas de vendas e administrativas: 40.000 → <b>64.000</b><br/>• (−) IR: 10.000 → <b>54.000</b><br/>• (−) Participações Estatutárias: 8.000 → Lucro Líquido: <b>46.000,00</b></p><p>Os <b>dividendos obrigatórios (20.000) não compõem a DRE</b>: são destinação do lucro líquido, não componente de sua apuração.</p>`,
  },
  {
    id: 53,
    subjectId: 'estatistica',
    statement: `<p>A tabela apresentada mostra as frequências absolutas das observações de uma variável X em uma amostra de tamanho igual a 200. Nesse caso, se M<sub>0</sub> representa a moda da amostra, M<sub>d</sub>, a mediana amostral e M<sub>e</sub>, a média aritmética, então o produto M<sub>0</sub> × M<sub>d</sub> × M<sub>e</sub> será igual a:</p>
    <div class="my-4 overflow-hidden rounded-lg border border-slate-200 inline-block min-w-48">
      <table class="w-full text-sm text-center">
        <thead class="bg-slate-100 font-semibold">
          <tr><th class="px-6 py-2">X</th><th class="px-6 py-2">f<sub>i</sub></th></tr>
        </thead>
        <tbody>
          <tr class="border-t border-slate-200"><td class="px-6 py-1.5">1</td><td class="px-6 py-1.5">20</td></tr>
          <tr class="border-t border-slate-200"><td class="px-6 py-1.5">2</td><td class="px-6 py-1.5">40</td></tr>
          <tr class="border-t border-slate-200"><td class="px-6 py-1.5">3</td><td class="px-6 py-1.5">80</td></tr>
          <tr class="border-t border-slate-200"><td class="px-6 py-1.5">4</td><td class="px-6 py-1.5">40</td></tr>
          <tr class="border-t border-slate-200"><td class="px-6 py-1.5">5</td><td class="px-6 py-1.5">20</td></tr>
        </tbody>
      </table>
    </div>`,
    options: [
      { key: 'a', html: `80` },
      { key: 'b', html: `27` },
      { key: 'c', html: `56` },
      { key: 'd', html: `60` },
      { key: 'e', html: `64` },
    ],
    answer: 'b',
    comment: `Com a distribuição dada (n = 200):<p>• <b>Moda (M<sub>0</sub>)</b> = valor de maior frequência = <b>3</b> (f = 80);<br/>• <b>Mediana (M<sub>d</sub>)</b> = média das posições 100 e 101. Frequências acumuladas: 20, 60, 140, 180, 200 → ambas as posições pertencem à classe X = 3 → M<sub>d</sub> = <b>3</b>;<br/>• <b>Média (M<sub>e</sub>)</b> = (1·20 + 2·40 + 3·80 + 4·40 + 5·20) / 200 = (20 + 80 + 240 + 160 + 100) / 200 = 600/200 = <b>3</b>.</p><p>Produto: M<sub>0</sub> × M<sub>d</sub> × M<sub>e</sub> = 3 × 3 × 3 = <b>27</b>.</p>`,
  },
  {
    id: 54,
    subjectId: 'estatistica',
    statement: `<p>Uma amostra aleatória de tamanho 5 é retirada de uma população e observa-se que seus valores, quando postos em ordem crescente, obedecem a uma Progressão Aritmética.</p>
    <p>Se a variância amostral não viciada vale 40, qual é o valor da razão da Progressão Aritmética?</p>`,
    options: [
      { key: 'a', html: `3` },
      { key: 'b', html: `5√2` },
      { key: 'c', html: `4` },
      { key: 'd', html: `2√5` },
      { key: 'e', html: `1` },
    ],
    answer: 'c',
    comment: `Se os 5 valores estão em PA, eles podem ser escritos como a − 2r, a − r, a, a + r, a + 2r (média = a). Os desvios em relação à média são: −2r, −r, 0, r, 2r.<p>Σ(x − x̄)² = 4r² + r² + 0 + r² + 4r² = 10r²</p><p>Variância amostral <b>não viciada</b> (denominador n − 1): s² = 10r² / (5 − 1) = 2,5r² = 40 → r² = 16 → <b>r = 4</b>.</p><p>Pegadinha: quem usar a variância populacional (2r² = 40 → r = 2√5) cai na alternativa “d”.</p>`,
  },
  {
    id: 55,
    subjectId: 'estatistica',
    statement: `<p>João, um policial civil, que está desempenhando um trabalho administrativo, pega duas canetas em um pote onde há um total de 3 canetas azuis e 2 canetas vermelhas. Qual é a probabilidade de ele pegar duas canetas da mesma cor?</p>`,
    options: [
      { key: 'a', html: `60%` },
      { key: 'b', html: `50%` },
      { key: 'c', html: `45%` },
      { key: 'd', html: `48%` },
      { key: 'e', html: `40%` },
    ],
    answer: 'e',
    comment: `Total de formas de escolher 2 canetas: C(5,2) = 10.<p>• Duas azuis: C(3,2) = 3;<br/>• Duas vermelhas: C(2,2) = 1.</p><p>P(mesma cor) = (3 + 1) / 10 = 4/10 = <b>40%</b>.</p>`,
  },
  {
    id: 56,
    subjectId: 'estatistica',
    statement: `<p>A probabilidade de Joana ir fazer a prova de oficial da PC PE é de 0,6 e a probabilidade de Manuel ir fazer a prova de oficial da PC PE é de 0,5. A probabilidade condicional de Joana ir fazer a prova de oficial da PC PE, dado que Manuel fará a prova de oficial da PC PE, é de 0,7.</p>
    <p>Assim, a probabilidade de que Joana vá fazer a prova de oficial da PC PE <b>ou</b> Manuel vá fazer a prova de oficial da PC PE é de:</p>`,
    options: [
      { key: 'a', html: `55%` },
      { key: 'b', html: `64%` },
      { key: 'c', html: `69%` },
      { key: 'd', html: `72%` },
      { key: 'e', html: `75%` },
    ],
    answer: 'e',
    comment: `P(J ∪ M) = P(J) + P(M) − P(J ∩ M), e P(J ∩ M) = P(J|M) × P(M) = 0,7 × 0,5 = 0,35.<p>P(J ∪ M) = 0,6 + 0,5 − 0,35 = 0,75 = <b>75%</b>.</p>`,
  },
  {
    id: 57,
    subjectId: 'estatistica',
    statement: `<p>Numa pesquisa realizada com 100 pessoas sobre a forma de se locomoverem para o trabalho, constatou-se que:</p>
    <ul class="my-3 space-y-1">
      <li>• 45 usam ônibus;</li>
      <li>• 51 usam automóvel;</li>
      <li>• 32 usam moto;</li>
      <li>• 18 usam ônibus e automóvel;</li>
      <li>• 22 usam ônibus e moto;</li>
      <li>• 15 usam automóvel e moto;</li>
      <li>• 6 usam os três meios de transporte.</li>
    </ul>
    <p>Analisando os dados apresentados, qual é o número de pessoas que <b>NÃO</b> utiliza nenhum dos três meios de transporte mencionados?</p>`,
    options: [
      { key: 'a', html: `18` },
      { key: 'b', html: `19` },
      { key: 'c', html: `20` },
      { key: 'd', html: `21` },
      { key: 'e', html: `22` },
    ],
    answer: 'd',
    comment: `Pela fórmula da união:<p>n(Ô ∪ A ∪ M) = 45 + 51 + 32 − 18 − 22 − 15 + 6 = <b>79</b>.</p><p>Pessoas que não usam nenhum meio: 100 − 79 = <b>21</b>.</p>`,
  },
  {
    id: 58,
    subjectId: 'estatistica',
    statement: `<p>Considerando a mesma pesquisa da questão anterior (100 pessoas, com 45 usando ônibus, 51 automóvel, 32 moto, 18 ônibus e automóvel, 22 ônibus e moto, 15 automóvel e moto e 6 os três meios), escolhendo-se ao acaso uma pessoa que usa ônibus, a probabilidade de ela usar os três meios de transporte é igual a:</p>`,
    options: [
      { key: 'a', html: `1/5` },
      { key: 'b', html: `2/5` },
      { key: 'c', html: `1/15` },
      { key: 'd', html: `2/15` },
      { key: 'e', html: `1/10` },
    ],
    answer: 'd',
    comment: `Probabilidade condicional:<p>P(usa os três | usa ônibus) = P(usa os três ∩ usa ônibus) / P(usa ônibus) = 6 / 45 = <b>2/15</b>.</p><p>Das 45 pessoas que usam ônibus, 6 usam também os outros dois meios.</p>`,
  },
  {
    id: 59,
    subjectId: 'estatistica',
    statement: `<p>A média aritmética simples dos preços de 5 bolas, expressos em reais, é igual a R$ 44,00. Se for retirada a bola de maior valor, a média aritmética simples dos preços das 4 bolas restantes será igual a R$ 37,00.</p>
    <p>Então, o preço da bola de maior valor é igual a</p>`,
    options: [
      { key: 'a', html: `R$ 64,00.` },
      { key: 'b', html: `R$ 66,00.` },
      { key: 'c', html: `R$ 68,00.` },
      { key: 'd', html: `R$ 70,00.` },
      { key: 'e', html: `R$ 72,00.` },
    ],
    answer: 'e',
    comment: `Soma das 5 bolas: 5 × 44 = <b>220</b>.<p>Soma das 4 bolas restantes: 4 × 37 = <b>148</b>.</p><p>Bola de maior valor: 220 − 148 = <b>R$ 72,00</b>.</p>`,
  },
  {
    id: 60,
    subjectId: 'estatistica',
    statement: `<p>Uma população em uma certa região se encontra dividida em três estratos, com tamanhos N<sub>1</sub> = 128, N<sub>2</sub> = 192 e N<sub>3</sub> = 96. Ao se realizar uma amostragem estratificada proporcional, 16 elementos da amostra foram retirados do primeiro estrato.</p>
    <p>Indique qual o número total de elementos da amostra.</p>`,
    options: [
      { key: 'a', html: `36` },
      { key: 'b', html: `48` },
      { key: 'c', html: `52` },
      { key: 'd', html: `64` },
      { key: 'e', html: `72` },
    ],
    answer: 'c',
    comment: `Na amostragem estratificada proporcional, a fração de amostragem é constante: 16/128 = <b>1/8</b> do primeiro estrato.<p>População total: N = 128 + 192 + 96 = 416.</p><p>Tamanho da amostra: n = 416 × (1/8) = <b>52</b>.</p>`,
  },
]
