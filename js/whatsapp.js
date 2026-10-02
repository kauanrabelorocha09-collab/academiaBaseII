/*
 * Utilitários de link do WhatsApp (sem dependências).
 * Usado pelo navegador (window.WhatsApp) e pelos testes em Node (module.exports).
 */
(function (root) {
  "use strict";

  // 55 + DDD (2 dígitos) + número de 8 (fixo) ou 9 (celular) dígitos.
  var NUMERO_VALIDO = /^55\d{2}\d{8,9}$/;

  function normalizarNumero(numero) {
    return String(numero == null ? "" : numero).replace(/\D/g, "");
  }

  function numeroConfigurado(numero) {
    return NUMERO_VALIDO.test(normalizarNumero(numero));
  }

  /**
   * Retorna o link https://wa.me/55DDDNUMERO?text=MENSAGEM_CODIFICADA
   * ou null se o número não estiver configurado corretamente.
   */
  function montarLink(numero, mensagem) {
    var digitos = normalizarNumero(numero);
    if (!NUMERO_VALIDO.test(digitos)) return null;
    var url = "https://wa.me/" + digitos;
    if (mensagem) url += "?text=" + encodeURIComponent(mensagem);
    return url;
  }

  var api = {
    normalizarNumero: normalizarNumero,
    numeroConfigurado: numeroConfigurado,
    montarLink: montarLink,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.WhatsApp = api;
})(typeof window !== "undefined" ? window : this);
