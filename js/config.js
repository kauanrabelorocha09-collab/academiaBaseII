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
  whatsappNumero: "",

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
   *  MENSALIDADES  >>> PREENCHA OS VALORES REAIS <<<
   * ============================================================
   *  valor: número em reais, com ponto para centavos. Ex.: 120 ou 89.90
   *         Deixe null enquanto o valor não estiver confirmado: o card
   *         mostra "Consulte o valor" e o botão pergunta o preço no WhatsApp.
   *  periodo: aparece depois do preço ("/mês").
   *  selo: etiqueta opcional em destaque no topo do card.
   *  destaque: true deixa o card com borda laranja.
   *  Para remover um plano, apague o bloco { ... } dele.
   */
  planos: [
    {
      id: "musculacao",
      nome: "Musculação",
      descricao: "Treino com equipamentos para força, resistência e qualidade de vida.",
      valor: null,
      periodo: "mês",
    },
    {
      id: "jiu-jitsu",
      nome: "Jiu-jitsu",
      descricao: "Aulas no tatame com a Equipe Renan Rocha.",
      valor: null,
      periodo: "mês",
      selo: "Equipe Renan Rocha",
      destaque: true,
    },
    {
      id: "muay-thai",
      nome: "Muay Thai",
      descricao: "Técnica de luta e condicionamento físico.",
      valor: null,
      periodo: "mês",
    },
    {
      id: "judo",
      nome: "Judô",
      descricao: "Projeções, imobilizações, equilíbrio e disciplina.",
      valor: null,
      periodo: "mês",
    },
    {
      id: "piscina",
      nome: "Piscina",
      descricao: "Atividades aquáticas na piscina da academia.",
      valor: null,
      periodo: "mês",
    },
  ],

  /* Texto pequeno abaixo dos planos. Deixe "" para não exibir. */
  observacaoPlanos: "Valores e condições podem mudar. Confirme pelo WhatsApp antes de se matricular.",
};
