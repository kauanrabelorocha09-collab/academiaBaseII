(function () {
  "use strict";

  var config = window.ACADEMIA_CONFIG || {};
  var mensagens = config.mensagens || {};
  var configurado = window.WhatsApp.numeroConfigurado(config.whatsappNumero);

  if (!configurado) {
    console.warn(
      "[Academia Base II] Número de WhatsApp não configurado. " +
        "Preencha 'whatsappNumero' em js/config.js antes da publicação."
    );
  }

  /* ---------- Links de WhatsApp ---------- */
  var botoes = document.querySelectorAll("[data-whatsapp]");
  Array.prototype.forEach.call(botoes, function (botao) {
    var chave = botao.getAttribute("data-whatsapp");
    var link = window.WhatsApp.montarLink(config.whatsappNumero, mensagens[chave]);

    if (link) {
      botao.setAttribute("href", link);
      botao.setAttribute("target", "_blank");
      botao.setAttribute("rel", "noopener noreferrer");
      botao.removeAttribute("aria-disabled");
      var rotulo = botao.getAttribute("aria-label");
      if (rotulo && rotulo.indexOf("nova aba") === -1) {
        botao.setAttribute("aria-label", rotulo + " (abre em nova aba)");
      }
    } else {
      botao.setAttribute("href", "#");
      botao.setAttribute("aria-disabled", "true");
      botao.addEventListener("click", function (evento) {
        evento.preventDefault();
        mostrarAviso(
          "O contato pelo WhatsApp estará disponível em breve. Obrigado pelo interesse!"
        );
      });
    }
  });

  /* ---------- Aviso acessível (aria-live) ---------- */
  var aviso = document.getElementById("aviso");
  var temporizador;
  function mostrarAviso(texto) {
    if (!aviso) return;
    aviso.textContent = texto;
    aviso.classList.add("aviso--visivel");
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      aviso.classList.remove("aviso--visivel");
    }, 4500);
  }

  /* ---------- Atividades aquáticas (somente as confirmadas) ---------- */
  var listaAquatica = document.getElementById("atividades-aquaticas");
  var atividades = (config.atividadesAquaticas || []).filter(Boolean);
  if (listaAquatica && atividades.length) {
    atividades.forEach(function (nome) {
      var item = document.createElement("li");
      item.textContent = nome;
      listaAquatica.appendChild(item);
    });
    listaAquatica.hidden = false;
  }

  /* ---------- Fotos oficiais com imagem de referência provisória ---------- */
  var imagens = document.querySelectorAll("img[data-referencia]");
  Array.prototype.forEach.call(imagens, function (img) {
    function usarReferencia() {
      var referencia = img.getAttribute("data-referencia");
      if (referencia && img.getAttribute("src") !== referencia) {
        img.setAttribute("src", referencia);
        var midia = img.closest(".midia");
        if (midia) midia.classList.add("midia--referencia");
      }
    }
    img.addEventListener("error", usarReferencia);
    if (img.complete && img.naturalWidth === 0) usarReferencia();
  });

  /* ---------- Menu móvel ---------- */
  var menuBotao = document.querySelector(".menu-botao");
  var menu = document.getElementById("menu");
  if (menuBotao && menu) {
    menuBotao.addEventListener("click", function () {
      var aberto = menuBotao.getAttribute("aria-expanded") === "true";
      menuBotao.setAttribute("aria-expanded", String(!aberto));
      menu.classList.toggle("menu--aberto", !aberto);
    });
    menu.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) {
        menuBotao.setAttribute("aria-expanded", "false");
        menu.classList.remove("menu--aberto");
      }
    });
  }

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
