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
};
