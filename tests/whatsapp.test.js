// Testes unitários dos links de WhatsApp: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const W = require("../js/whatsapp.js");
const P = require("../js/planos.js");

// Carrega js/config.js como no navegador.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../js/config.js"), "utf8"), sandbox);
const config = sandbox.window.ACADEMIA_CONFIG;

// Número FICTÍCIO usado apenas nos testes — não é o número da academia.
const NUMERO_TESTE = "5511900000000";

test("número vazio ou inválido não gera link", () => {
  for (const n of ["", null, undefined, "DDDNUMERO", "11999999999", "551199999", "55119999999999", "+1 555 0100"]) {
    assert.equal(W.montarLink(n, "Olá"), null, `deveria rejeitar ${n}`);
    assert.equal(W.numeroConfigurado(n), false);
  }
});

test("número com máscara é normalizado para dígitos", () => {
  assert.equal(W.montarLink("+55 (11) 90000-0000", "Oi"), "https://wa.me/5511900000000?text=Oi");
  assert.equal(W.montarLink("55 11 3000-0000", null), "https://wa.me/551130000000");
});

test("todas as mensagens são codificadas corretamente e voltam idênticas", () => {
  const chaves = ["geral", "chamada-final", "musculacao", "jiu-jitsu", "muay-thai", "judo", "piscina"];
  for (const chave of chaves) {
    const msg = config.mensagens[chave];
    assert.ok(msg, `mensagem ausente: ${chave}`);
    const url = new URL(W.montarLink(NUMERO_TESTE, msg));
    assert.equal(url.origin + url.pathname, "https://wa.me/" + NUMERO_TESTE);
    assert.equal(url.searchParams.get("text"), msg);
    const bruto = url.search.slice("?text=".length);
    assert.doesNotMatch(bruto, /[ ?,&#]|[^\x00-\x7F]/, `caracteres não codificados em ${chave}`);
  }
});

test("acentos, espaços, interrogação e & são codificados", () => {
  const url = W.montarLink(NUMERO_TESTE, "Judô & Muay Thai? Olá!");
  assert.equal(url, "https://wa.me/5511900000000?text=Jud%C3%B4%20%26%20Muay%20Thai%3F%20Ol%C3%A1!");
});

test("mensagens exigidas pelo briefing", () => {
  assert.equal(config.mensagens.geral, "Olá! Conheci a Academia Base II pelo site e gostaria de saber mais sobre as modalidades, os horários e os valores.");
  assert.match(config.mensagens["jiu-jitsu"], /Equipe Renan Rocha/);
  assert.match(config.mensagens.musculacao, /musculação/);
  assert.match(config.mensagens["muay-thai"], /Muay Thai/);
  assert.match(config.mensagens.judo, /Judô/);
  assert.match(config.mensagens.piscina, /atividades aquáticas/);
});

test("valores das mensalidades são formatados em reais", () => {
  assert.equal(P.formatarValor(120).texto, "R$ 120,00");
  assert.equal(P.formatarValor(89.9).texto, "R$ 89,90");
  assert.equal(P.formatarValor(1250.5).texto, "R$ 1.250,50");
  assert.deepEqual(P.formatarValor(99.99), { reais: "99", centavos: "99", texto: "R$ 99,99" });
  for (const v of [null, undefined, 0, -10, "120", NaN, Infinity]) assert.equal(P.formatarValor(v), null);
});

test("mensagem do plano lista todos os períodos com valor", () => {
  const plano = { nome: "Judô", precos: [{ tipo: "Mensal", valor: 100, meses: 1 }, { tipo: "Trimestral", valor: 270, meses: 3 }] };
  assert.equal(P.mensagemPlano(plano),
    "Olá! Vi no site os valores de Judô (mensal R$ 100,00, trimestral R$ 270,00) e quero me matricular na Academia Base II.");
  assert.equal(P.mensagemPlano({ nome: "Judô", precos: [] }),
    "Olá! Vi o site da Academia Base II e gostaria de saber o valor da mensalidade de Judô.");
});

test("pacotes mostram o valor por mês e a economia sobre o mensal", () => {
  const plano = config.planos.find((p) => p.id === "musculacao");
  const [mensal, tri, sem] = plano.precos;
  assert.equal(P.precoPrincipal(plano), mensal);
  assert.equal(P.comparativo(plano, mensal), null);
  assert.equal(P.comparativo(plano, tri).porMes.texto, "R$ 115,00");
  assert.equal(P.comparativo(plano, tri).economia.texto, "R$ 15,00");
  assert.equal(P.comparativo(plano, sem).porMes.texto, "R$ 105,00");
  assert.equal(P.comparativo(plano, sem).economia.texto, "R$ 90,00");
  // pacote mais caro que o mensal: sem "economia"
  const caro = { precos: [{ valor: 100, meses: 1 }, { valor: 330, meses: 3 }] };
  assert.equal(P.comparativo(caro, caro.precos[1]).economia, null);
});

test("valores informados pela academia", () => {
  const valores = JSON.parse(JSON.stringify(Object.fromEntries(config.planos.map((p) => [p.id, p.precos.map((x) => [x.tipo, x.valor])]))));
  assert.deepEqual(valores.musculacao, [["Mensal", 120], ["Trimestral", 345], ["Semestral", 630]]);
  assert.deepEqual(valores.black, [["Mensal", 145], ["Trimestral", 405], ["Semestral", 720]]);
  assert.deepEqual(valores["muay-thai"], [["Mensal", 115], ["Trimestral", 330]]);
  assert.deepEqual(valores["jiu-jitsu"], valores["muay-thai"]);
  assert.deepEqual(valores.ginastica, [["Mensal", 80]]);
  assert.deepEqual(valores.sertanejo, [["Mensal", 75]]);
  assert.deepEqual(valores["judo-kids"], [["Mensal", 80]]);
  assert.deepEqual(JSON.parse(JSON.stringify(config.avulsos.map((a) => [a.id, a.valor]))), [["avaliacao-fisica", 30], ["aula-avulsa", 20]]);
});

test("planos e avulsos configurados são válidos", () => {
  const ids = new Set();
  for (const p of config.planos) {
    assert.match(p.id, /^[a-z0-9-]+$/);
    assert.ok(!ids.has(p.id), "id repetido: " + p.id);
    ids.add(p.id);
    assert.ok(p.nome);
    for (const x of p.precos) {
      assert.ok(P.valorValido(x.valor), "valor inválido em " + p.id);
      assert.ok(x.tipo && Number.isInteger(x.meses) && x.meses >= 1, "período inválido em " + p.id);
    }
    const url = new URL(W.montarLink(NUMERO_TESTE, P.mensagemPlano(p)));
    assert.equal(url.searchParams.get("text"), P.mensagemPlano(p));
  }
  for (const a of config.avulsos) {
    assert.ok(a.nome && a.acao && P.valorValido(a.valor));
    assert.equal(P.mensagemAvulso(a), `Olá! Quero ${a.acao} na Academia Base II (${P.formatarValor(a.valor).texto}).`);
  }
});
