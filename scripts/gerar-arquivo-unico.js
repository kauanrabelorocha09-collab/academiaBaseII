/*
 * Gera o site em UM ÚNICO ARQUIVO HTML (CSS, JavaScript e imagens embutidos),
 * fácil de enviar e abrir com dois cliques, sem internet e sem instalar nada.
 *
 *   node scripts/gerar-arquivo-unico.js   →  entrega/academia-base-ii-site.html
 *
 * Fotos oficiais presentes em assets/img/ entram no arquivo; as que ainda não
 * existirem são substituídas pela imagem de referência provisória.
 */
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");
const SAIDA = path.join(RAIZ, "entrega", "academia-base-ii-site.html");
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };

const ler = (rel) => fs.readFileSync(path.join(RAIZ, rel), "utf8");
const existe = (rel) => fs.existsSync(path.join(RAIZ, rel));
const dataUri = (rel) =>
  `data:${MIME[path.extname(rel).toLowerCase()]};base64,${fs.readFileSync(path.join(RAIZ, rel)).toString("base64")}`;

let html = ler("index.html");
const faltando = [];

// CSS
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => `<style>\n${ler(href)}</style>`);

// JavaScript (escapa "</script" para não fechar a tag antes da hora)
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) =>
  `<script>\n${ler(src).replace(/<\/script/gi, "<\\/script")}</script>`);

// Imagens: foto oficial se existir; senão, referência provisória com o selo.
html = html.replace(
  /<figure class="([^"]*)">(\s*(?:<!--[\s\S]*?-->\s*)?)<img src="([^"]+)"\s+data-referencia="([^"]+)"/g,
  (_, classes, meio, oficial, referencia) => {
    if (existe(oficial)) return `<figure class="${classes}">${meio}<img src="${dataUri(oficial)}"`;
    faltando.push(oficial);
    return `<figure class="${classes} midia--referencia">${meio}<img src="${dataUri(referencia)}"`;
  }
);

if (/(?:src|href)="(?:css|js|assets)\//.test(html)) {
  throw new Error("Restou alguma referência a arquivo externo no HTML gerado.");
}

fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
fs.writeFileSync(SAIDA, html);

console.log(`Gerado: ${path.relative(RAIZ, SAIDA)} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
if (faltando.length) {
  console.log("\nFotos oficiais ainda ausentes (usando imagem de referência):");
  faltando.forEach((f) => console.log("  - " + f));
}
const config = ler("js/config.js");
if (/whatsappNumero:\s*""/.test(config)) {
  console.log("\nATENÇÃO: whatsappNumero está vazio em js/config.js — os botões de WhatsApp mostram apenas um aviso.");
}
