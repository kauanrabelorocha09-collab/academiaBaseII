/*
 * ============================================================
 *  CONFIGURAÇÃO DO SITE — ACADEMIA BASE II
 * ============================================================
 *
 *  >>> PREENCHA O NÚMERO OFICIAL DO WHATSAPP ANTES DA PUBLICAÇÃO <<<
 *
 *  Formato: 55 (Brasil) + DDD + número, somente dígitos,
 *  sem espaços, parênteses, traços ou o sinal "+".
 *    Formato esperado: "55" + "DD" + "9XXXXXXXX"  → ex.: "55DD9XXXXXXXX"
 *
 *  Enquanto o número estiver vazio ou inválido, nenhum botão de WhatsApp
 *  abre conversa: o visitante vê um aviso de que o contato ainda não está
 *  disponível, e um alerta aparece no console do navegador.
 */
window.ACADEMIA_CONFIG = {
  whatsappNumero: "5511944887323", // (11) 94488-7323

  /*
   * Mensagens pré-preenchidas. A chave corresponde ao atributo
   * data-whatsapp="..." dos botões no index.html.
   */
  mensagens: {
    geral:
      "Olá! Conheci a Academia Base II pelo site e gostaria de saber mais sobre as modalidades, os horários e os valores.",
    "chamada-final":
      "Olá! Conheci a Academia Base II pelo site e quero dar o meu próximo passo. Gostaria de saber mais sobre as modalidades, os horários e os valores.",
    musculacao:
      "Olá! Tenho interesse em conhecer os planos de musculação da Academia Base II.",
    "jiu-jitsu":
      "Olá! Tenho interesse em treinar jiu-jitsu com a Equipe Renan Rocha. Poderiam me informar os horários e valores?",
    "muay-thai":
      "Olá! Gostaria de saber mais sobre as aulas de Muay Thai, os horários e os valores.",
    judo:
      "Olá! Gostaria de saber mais sobre as aulas de Judô, os horários e os valores.",
    piscina:
      "Olá! Gostaria de saber quais atividades aquáticas estão disponíveis na Academia Base II.",
  },

  /*
   * Liste SOMENTE as atividades aquáticas efetivamente oferecidas pela academia,
   * por exemplo: ["Natação", "Hidroginástica"].
   * Deixe vazio ([]) enquanto não houver confirmação — nenhuma lista é exibida.
   */
  atividadesAquaticas: [],

  /*
   * ============================================================
   *  MENSALIDADES
   * ============================================================
   *  Cada plano tem uma lista de "precos":
   *    tipo:  nome do período, aparece no card ("Mensal", "Trimestral"...)
   *    valor: número em reais, com ponto para centavos. Ex.: 120 ou 89.90
   *    meses: quantos meses o pagamento cobre (1, 3, 6...). Serve para mostrar
   *           quanto sai por mês e a economia em relação ao mensal.
   *  Planos com mais de um período aparecem nos cards grandes; planos com um
   *  único preço aparecem em "Outras aulas". Sem preço (precos: []), o card
   *  mostra "Consulte o valor" e o botão pergunta o preço no WhatsApp.
   *  selo: etiqueta opcional no topo do card. destaque: true = borda dourada.
   *  Para remover um plano, apague o bloco { ... } dele.
   */
  planos: [
    {
      id: "musculacao",
      nome: "Musculação",
      descricao: "Treino com equipamentos para força, resistência e qualidade de vida.",
      precos: [
        { tipo: "Mensal", valor: 120, meses: 1 },
        { tipo: "Trimestral", valor: 345, meses: 3 },
        { tipo: "Semestral", valor: 630, meses: 6 },
      ],
    },
    {
      id: "black",
      nome: "Plano Black",
      descricao: "Pergunte pelo WhatsApp tudo o que está incluído no Plano Black.",
      destaque: true,
      precos: [
        { tipo: "Mensal", valor: 145, meses: 1 },
        { tipo: "Trimestral", valor: 405, meses: 3 },
        { tipo: "Semestral", valor: 720, meses: 6 },
      ],
    },
    {
      id: "muay-thai",
      nome: "Muay Thai",
      descricao: "Técnica de luta e condicionamento físico.",
      precos: [
        { tipo: "Mensal", valor: 115, meses: 1 },
        { tipo: "Trimestral", valor: 330, meses: 3 },
      ],
    },
    {
      id: "jiu-jitsu",
      nome: "Jiu-jitsu",
      descricao: "Aulas no tatame com a Equipe Renan Rocha.",
      selo: "Equipe Renan Rocha",
      precos: [
        { tipo: "Mensal", valor: 115, meses: 1 },
        { tipo: "Trimestral", valor: 330, meses: 3 },
      ],
    },
    {
      id: "ginastica",
      nome: "Ginástica",
      descricao: "Aulas de ginástica.",
      precos: [{ tipo: "Mensal", valor: 80, meses: 1 }],
    },
    {
      id: "sertanejo",
      nome: "Sertanejo",
      descricao: "Aulas de dança sertaneja.",
      precos: [{ tipo: "Mensal", valor: 75, meses: 1 }],
    },
    {
      id: "judo-kids",
      nome: "Judô Kids",
      descricao: "Judô para crianças.",
      precos: [{ tipo: "Mensal", valor: 80, meses: 1 }],
    },
    {
      id: "piscina",
      nome: "Piscina",
      descricao: "Atividades aquáticas na piscina da academia.",
      precos: [],
    },
  ],

  /*
   * Serviços avulsos (pagamento único). "acao" completa a mensagem do WhatsApp:
   * "Olá! Quero <acao> na Academia Base II (R$ 30,00)."
   */
  avulsos: [
    { id: "avaliacao-fisica", nome: "Avaliação física", valor: 30, unidade: "por avaliação", acao: "agendar uma avaliação física" },
    { id: "aula-avulsa", nome: "Aula avulsa", valor: 20, unidade: "por aula", acao: "fazer uma aula avulsa" },
  ],

  /* Texto pequeno abaixo dos planos. Deixe "" para não exibir. */
  observacaoPlanos: "Valores e condições podem mudar. Confirme pelo WhatsApp antes de se matricular.",
};
