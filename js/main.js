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

  /* ---------- Mensalidades (geradas a partir de config.planos / config.avulsos) ---------- */
  var P = window.Planos;
  var gradePlanos = document.getElementById("planos");
  var gradeOutros = document.getElementById("planos-outros");
  (config.planos || []).forEach(function (plano) {
    var chave = "plano-" + plano.id;
    mensagens[chave] = P.mensagemPlano(plano);
    var completo = P.precosValidos(plano).length > 1;
    var destino = completo ? gradePlanos : gradeOutros;
    if (!destino) return;
    destino.appendChild(criarCardPlano(plano, chave, completo));
    if (!completo) document.getElementById("bloco-outros").hidden = false;
  });

  var listaAvulsos = document.getElementById("avulsos");
  (config.avulsos || []).forEach(function (item) {
    if (!listaAvulsos) return;
    var chave = "avulso-" + item.id;
    mensagens[chave] = P.mensagemAvulso(item);
    listaAvulsos.appendChild(criarAvulso(item, chave));
    document.getElementById("bloco-avulsos").hidden = false;
  });

  var observacao = document.getElementById("planos-observacao");
  if (observacao && config.observacaoPlanos) {
    observacao.textContent = config.observacaoPlanos;
    observacao.hidden = false;
  }

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function botaoWhatsApp(chave, texto, rotulo, classe) {
    var botao = el("a", "btn " + classe);
    botao.href = "#";
    botao.setAttribute("data-whatsapp", chave);
    botao.setAttribute("aria-label", rotulo + " — conversar pelo WhatsApp");
    botao.innerHTML = '<svg class="btn__icone" aria-hidden="true"><use href="#icone-whatsapp"/></svg>';
    botao.appendChild(document.createTextNode(texto));
    return botao;
  }

  function precoGrande(preco) {
    var valor = P.formatarValor(preco.valor);
    var sufixo = (preco.meses || 1) === 1 ? "/mês" : "/" + (preco.tipo || "").toLowerCase();
    var bloco = el("p", "plano__preco");
    bloco.setAttribute("aria-label", valor.texto + " " + (preco.tipo || "").toLowerCase());
    bloco.appendChild(el("span", "plano__moeda", "R$"));
    bloco.appendChild(el("span", "plano__reais", valor.reais));
    bloco.appendChild(el("span", "plano__centavos", "," + valor.centavos));
    bloco.appendChild(el("span", "plano__periodo", sufixo));
    return bloco;
  }

  function criarCardPlano(plano, chave, completo) {
    var principal = P.precoPrincipal(plano);
    var card = el("article", "plano" + (plano.destaque ? " plano--destaque" : "") + (completo ? "" : " plano--compacto"));
    card.id = "plano-" + plano.id;
    card.setAttribute("aria-labelledby", "plano-titulo-" + plano.id);

    if (plano.selo) card.appendChild(el("p", "plano__selo", plano.selo));
    var titulo = el(completo ? "h3" : "h4", "plano__nome", plano.nome);
    titulo.id = "plano-titulo-" + plano.id;
    card.appendChild(titulo);

    if (principal) {
      card.appendChild(precoGrande(principal));
    } else {
      card.appendChild(el("p", "plano__preco plano__preco--consulte", "Consulte o valor"));
    }

    // Demais períodos (trimestral, semestral...) com valor por mês e economia.
    var outros = P.precosValidos(plano).filter(function (p) { return p !== principal; });
    if (outros.length) {
      var lista = el("ul", "plano__periodos");
      outros.forEach(function (preco) {
        var item = el("li", "plano__periodo-item");
        var linha = el("div", "plano__periodo-linha");
        linha.appendChild(el("span", "plano__periodo-nome", preco.tipo));
        linha.appendChild(el("strong", "plano__periodo-valor", P.formatarValor(preco.valor).texto));
        item.appendChild(linha);
        var comp = P.comparativo(plano, preco);
        if (comp) {
          var detalhe = el("p", "plano__periodo-detalhe", "sai " + comp.porMes.texto + "/mês");
          if (comp.economia) {
            detalhe.appendChild(document.createTextNode(" · "));
            detalhe.appendChild(el("span", "plano__economia", "economize " + comp.economia.texto));
          }
          item.appendChild(detalhe);
        }
        lista.appendChild(item);
      });
      card.appendChild(lista);
    }

    if (plano.descricao) card.appendChild(el("p", "plano__descricao", plano.descricao));

    card.appendChild(principal
      ? botaoWhatsApp(chave, "QUERO ESTE PLANO", "Quero me matricular em " + plano.nome,
          plano.destaque ? "btn--laranja" : "btn--contorno")
      : botaoWhatsApp(chave, "CONSULTAR VALOR", "Consultar o valor de " + plano.nome, "btn--contorno"));
    return card;
  }

  function criarAvulso(item, chave) {
    var valor = P.formatarValor(item.valor);
    var li = el("li", "avulso");
    li.id = "avulso-" + item.id;
    var info = el("div", "avulso__info");
    info.appendChild(el("span", "avulso__nome", item.nome));
    var preco = el("span", "avulso__preco", valor ? valor.texto : "Consulte");
    if (item.unidade && valor) preco.appendChild(el("small", "", " " + item.unidade));
    info.appendChild(preco);
    li.appendChild(info);
    li.appendChild(botaoWhatsApp(chave, "AGENDAR", item.nome, "btn--contorno btn--pequeno"));
    return li;
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

  /* ---------- Número visível no rodapé: (11) 94488-7323 ---------- */
  var rodapeLink = document.getElementById("rodape-whatsapp");
  if (rodapeLink && configurado) {
    var d = window.WhatsApp.normalizarNumero(config.whatsappNumero).slice(2);
    rodapeLink.textContent = "(" + d.slice(0, 2) + ") " + d.slice(2, -4) + "-" + d.slice(-4);
    rodapeLink.href = window.WhatsApp.montarLink(config.whatsappNumero);
    rodapeLink.target = "_blank";
    rodapeLink.rel = "noopener noreferrer";
    document.getElementById("rodape-contato").hidden = false;
  }

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
