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

  /** Somente os preços com valor preenchido. */
  function precosValidos(plano) {
    return (plano.precos || []).filter(function (p) { return valorValido(p.valor); });
  }

  /** Preço de referência do card: o mensal (meses = 1) ou, se não houver, o primeiro. */
  function precoPrincipal(plano) {
    var precos = precosValidos(plano);
    for (var i = 0; i < precos.length; i++) if ((precos[i].meses || 1) === 1) return precos[i];
    return precos[0] || null;
  }

  /**
   * Para pacotes de vários meses: valor equivalente por mês e economia em
   * relação a pagar o mensal todos os meses. null se não se aplica.
   */
  function comparativo(plano, preco) {
    var mensal = precoPrincipal(plano);
    var meses = preco.meses || 1;
    if (!mensal || meses <= 1 || (mensal.meses || 1) !== 1) return null;
    var economia = Math.round((mensal.valor * meses - preco.valor) * 100) / 100;
    return {
      porMes: formatarValor(Math.round((preco.valor / meses) * 100) / 100),
      economia: economia > 0 ? formatarValor(economia) : null,
    };
  }

  /** Mensagem do WhatsApp para o botão do plano. */
  function mensagemPlano(plano) {
    var precos = precosValidos(plano);
    if (!precos.length) {
      return "Olá! Vi o site da Academia Base II e gostaria de saber o valor da mensalidade de " +
        plano.nome + ".";
    }
    var lista = precos.map(function (p) {
      return (p.tipo || "").toLowerCase() + " " + formatarValor(p.valor).texto;
    }).join(", ");
    return "Olá! Vi no site os valores de " + plano.nome + " (" + lista +
      ") e quero me matricular na Academia Base II.";
  }

  /** Mensagem do WhatsApp para um serviço avulso (avaliação física, aula avulsa...). */
  function mensagemAvulso(item) {
    var valor = formatarValor(item.valor);
    return "Olá! Quero " + item.acao + " na Academia Base II" +
      (valor ? " (" + valor.texto + ")" : "") + ".";
  }

  var api = {
    valorValido: valorValido,
    formatarValor: formatarValor,
    precosValidos: precosValidos,
    precoPrincipal: precoPrincipal,
    comparativo: comparativo,
    mensagemPlano: mensagemPlano,
    mensagemAvulso: mensagemAvulso,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Planos = api;
})(typeof window !== "undefined" ? window : this);
