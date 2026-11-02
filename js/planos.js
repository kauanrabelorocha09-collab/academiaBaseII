/*
 * Utilitários das mensalidades (sem dependências).
 * Usado pelo navegador (window.Planos) e pelos testes em Node (module.exports).
 */
(function (root) {
  "use strict";

  function valorValido(valor) {
    return typeof valor === "number" && isFinite(valor) && valor > 0;
  }

  /** 120 → { reais: "120", centavos: "00", texto: "R$ 120,00" }; inválido → null */
  function formatarValor(valor) {
    if (!valorValido(valor)) return null;
    var centavosTotais = Math.round(valor * 100);
    var reais = String(Math.floor(centavosTotais / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    var centavos = String(centavosTotais % 100);
    if (centavos.length < 2) centavos = "0" + centavos;
    return { reais: reais, centavos: centavos, texto: "R$ " + reais + "," + centavos };
  }

  /** Mensagem do WhatsApp para o botão do plano. */
  function mensagemPlano(plano) {
    var valor = formatarValor(plano.valor);
    if (valor) {
      return "Olá! Vi no site a mensalidade de " + plano.nome + " (" + valor.texto + "/" +
        (plano.periodo || "mês") + ") e quero me matricular na Academia Base II.";
    }
    return "Olá! Vi no site da Academia Base II e gostaria de saber o valor da mensalidade de " +
      plano.nome + ".";
  }

  var api = { valorValido: valorValido, formatarValor: formatarValor, mensagemPlano: mensagemPlano };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Planos = api;
})(typeof window !== "undefined" ? window : this);
