/*
 * Testes no navegador (Playwright + Chromium).
 *   NODE_PATH=$(npm root -g) node tests/e2e.js
 * Executa em desktop e celular, com o número NÃO configurado (estado atual
 * de js/config.js) e com um número FICTÍCIO injetado só para o teste.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium, devices } = require("playwright");

const RAIZ = path.join(__dirname, "..");
const NUMERO_TESTE = "5511900000000"; // fictício
const TIPOS = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };

const servidor = http.createServer((req, res) => {
  const arquivo = path.join(RAIZ, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  fs.readFile(arquivo, (erro, dados) => {
    if (erro) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(arquivo)] || "application/octet-stream" });
    res.end(dados);
  });
});

const CHAVES = ["geral", "musculacao", "jiu-jitsu", "muay-thai", "judo", "piscina", "chamada-final"];
const configTexto = fs.readFileSync(path.join(RAIZ, "js/config.js"), "utf8");
const mensagens = (() => { const w = {}; new Function("window", configTexto)(w); return w.ACADEMIA_CONFIG.mensagens; })();

let falhas = 0;
async function caso(nome, fn) {
  try { await fn(); console.log("  ✓ " + nome); }
  catch (e) { falhas++; console.log("  ✗ " + nome + "\n    " + e.message.split("\n").join("\n    ")); }
}

async function rodar(browser, base, perfil, opcoesContexto, configurado) {
  console.log(`\n[${perfil}] número ${configurado ? "configurado (fictício)" : "NÃO configurado"}`);
  const contexto = await browser.newContext(opcoesContexto);
  // Nunca acessar o WhatsApp real durante os testes.
  await contexto.route("https://wa.me/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "wa.me ok" }));
  if (configurado) {
    await contexto.route("**/js/config.js", (r) =>
      r.fulfill({ contentType: "text/javascript", body: configTexto.replace('whatsappNumero: ""', `whatsappNumero: "${NUMERO_TESTE}"`) }));
  }
  const page = await contexto.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await page.goto(base + "/index.html");

  await caso("sem erros de JavaScript", async () => assert.deepEqual(erros, []));

  await caso("botão flutuante fixo no canto inferior direito e visível após rolar", async () => {
    const f = page.locator(".whatsapp-flutuante");
    for (const y of [0, 1500, 99999]) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await assert.doesNotReject(f.waitFor({ state: "visible" }));
      const caixa = await f.boundingBox();
      const vp = page.viewportSize();
      assert.ok(caixa.x + caixa.width <= vp.width - 12 && caixa.x + caixa.width >= vp.width - 32, "lado direito");
      assert.ok(caixa.y + caixa.height <= vp.height - 12 && caixa.y + caixa.height >= vp.height - 32, "parte inferior");
      assert.ok(caixa.height >= 44 && caixa.width >= 44, "alvo de toque >= 44px");
    }
    assert.equal(await f.evaluate((el) => getComputedStyle(el).position), "fixed");
    assert.equal(await f.evaluate((el) => getComputedStyle(el).backgroundColor), "rgb(37, 211, 102)");
  });

  await caso("texto 'Fale conosco' (desktop) / só ícone (celular)", async () => {
    const visivel = await page.locator(".whatsapp-flutuante__texto").isVisible();
    assert.equal(visivel, perfil === "desktop");
  });

  await caso("no fim da página o botão flutuante não cobre o rodapé nem o botão da chamada final", async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const f = await page.locator(".whatsapp-flutuante").boundingBox();
    for (const sel of [".rodape p", ".chamada .btn"]) {
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const b = await page.locator(sel).boundingBox();
      const sobrepoe = !(b.x + b.width <= f.x || f.x + f.width <= b.x || b.y + b.height <= f.y || f.y + f.height <= b.y);
      assert.ok(!sobrepoe, `${sel} coberto pelo botão flutuante`);
    }
  });

  await caso("acessível por teclado e leitor de tela", async () => {
    const f = page.locator(".whatsapp-flutuante");
    assert.match(await f.getAttribute("aria-label"), /Fale conosco pelo WhatsApp/);
    await f.focus();
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains("whatsapp-flutuante")), true);
    const outline = await f.evaluate((el) => getComputedStyle(el).outlineStyle);
    assert.notEqual(outline, "none", "foco visível");
  });

  await caso("cada modalidade tem foto, nome, descrição e botão TENHO INTERESSE", async () => {
    for (const id of ["jiu-jitsu", "musculacao", "muay-thai", "judo", "piscina"]) {
      const art = page.locator(`article#${id}`);
      await art.scrollIntoViewIfNeeded();
      await page.waitForFunction((i) => { const img = document.querySelector(`#${i} img`); return img.complete && img.naturalWidth > 0; }, id);
      assert.ok((await art.locator("img").getAttribute("alt")).length > 5);
      assert.ok((await art.locator("h3").innerText()).length > 2);
      assert.ok((await art.locator("p").last().innerText()).length > 20);
      assert.equal((await art.locator("a[data-whatsapp]").innerText()).trim(), "TENHO INTERESSE");
    }
    assert.match(await page.locator("#jiu-jitsu .selo").innerText(), /Equipe Renan Rocha/i);
    assert.ok(await page.locator("#jiu-jitsu").evaluate((el) => el.classList.contains("modalidade--destaque")));
  });

  await caso("chamada final com título, texto e botão", async () => {
    assert.match(await page.locator("#chamada-titulo").innerText(), /SEU PRÓXIMO PASSO\s+COMEÇA AQUI\./);
    assert.match(await page.locator(".chamada p").innerText(), /^Escolha sua modalidade, conheça nossa estrutura e venha descobrir o seu espaço na Academia Base II\.$/);
    assert.equal((await page.locator(".chamada .btn").innerText()).trim(), "FALAR COM A ACADEMIA PELO WHATSAPP");
    assert.equal(await page.locator(".chamada").evaluate((el) => getComputedStyle(el).backgroundColor), "rgb(0, 0, 0)");
  });

  for (const chave of CHAVES) {
    await caso(`botão "${chave}"`, async () => {
      const botao = page.locator(`[data-whatsapp="${chave}"]`);
      await botao.scrollIntoViewIfNeeded();
      const href = await botao.getAttribute("href");
      if (!configurado) {
        assert.equal(href, "#");
        assert.equal(await botao.getAttribute("aria-disabled"), "true");
        const urlAntes = page.url();
        // aria-disabled: o Playwright exige force; no navegador real o clique ocorre normalmente.
        await botao.click({ force: true });
        await page.locator("#aviso.aviso--visivel").waitFor();
        assert.match(await page.locator("#aviso").innerText(), /em breve/);
        assert.equal(page.url(), urlAntes, "não deve navegar");
      } else {
        const url = new URL(href);
        assert.equal(url.origin + url.pathname, `https://wa.me/${NUMERO_TESTE}`);
        assert.equal(url.searchParams.get("text"), mensagens[chave]);
        assert.equal(await botao.getAttribute("target"), "_blank");
        assert.equal(await botao.getAttribute("aria-disabled"), null);
        const [aba] = await Promise.all([contexto.waitForEvent("page"), botao.click()]);
        await aba.waitForLoadState();
        assert.equal(decodeURIComponent(new URL(aba.url()).searchParams.get("text")), mensagens[chave]);
        assert.ok(aba.url().startsWith(`https://wa.me/${NUMERO_TESTE}?text=`));
        await aba.close();
      }
    });
  }

  await caso("botão flutuante ativado pelo teclado (Enter)", async () => {
    const f = page.locator(".whatsapp-flutuante");
    await f.focus();
    if (configurado) {
      const [aba] = await Promise.all([contexto.waitForEvent("page"), page.keyboard.press("Enter")]);
      assert.ok(aba.url().startsWith(`https://wa.me/${NUMERO_TESTE}?text=Ol%C3%A1!%20Conheci`));
      await aba.close();
    } else {
      await page.keyboard.press("Enter");
      await page.locator("#aviso.aviso--visivel").waitFor();
    }
  });

  if (perfil === "celular") {
    await caso("sem rolagem horizontal no celular", async () => {
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    });
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(process.env.CAPTURAS || RAIZ, `captura-${perfil}-${configurado ? "config" : "sem-config"}.png`), fullPage: true });
  await contexto.close();
}

(async () => {
  await new Promise((r) => servidor.listen(0, r));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const browser = await chromium.launch();
  const perfis = {
    desktop: { viewport: { width: 1366, height: 800 } },
    celular: { ...devices["Pixel 7"] },
  };
  for (const [perfil, opcoes] of Object.entries(perfis)) {
    for (const configurado of [false, true]) await rodar(browser, base, perfil, opcoes, configurado);
  }
  await browser.close();
  servidor.close();
  console.log(falhas ? `\n${falhas} falha(s).` : "\nTodos os testes passaram.");
  process.exit(falhas ? 1 : 0);
})();
