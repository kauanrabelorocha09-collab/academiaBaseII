# Academia Base II — site

Site estático (HTML, CSS e JavaScript puro, sem build). Basta publicar a pasta
inteira em qualquer hospedagem estática.

Para gerar o site em **um único arquivo HTML** (fácil de enviar e abrir com dois
cliques, sem internet e sem instalar nada):

```bash
node scripts/gerar-arquivo-unico.js   # cria entrega/academia-base-ii-site.html
```

O arquivo já leva CSS, JavaScript e imagens embutidos. Gere-o de novo sempre que
mudar o número do WhatsApp, as mensagens ou as fotos.

## ⚠️ Antes de publicar (obrigatório)

1. **Número do WhatsApp** — abra `js/config.js` e preencha `whatsappNumero` com o
   número oficial da academia: `55` + DDD + número, só dígitos
   (sem espaços, parênteses, traços ou `+`). Ex. de formato: `55DD9XXXXXXXX`.
   Enquanto estiver vazio, **nenhum botão abre o WhatsApp**: o visitante vê o aviso
   "O contato pelo WhatsApp estará disponível em breve" e o console mostra um alerta.
2. **Fotografias oficiais** — salve as fotos reais em `assets/img/modalidades/`
   (veja `assets/img/modalidades/LEIA-ME.md`) e a foto da academia/equipe em
   `assets/img/equipe.jpg`. As imagens atuais são **referências provisórias**
   (marcadas com o selo "Imagem de referência") e devem ser substituídas.
3. **Atividades aquáticas** — em `js/config.js`, liste em `atividadesAquaticas`
   somente as atividades que a academia oferece de fato. Vazio = nada é exibido.
4. Rode os testes (abaixo) com o número já preenchido.

O site não exibe horários, preços, faixas etárias nem turmas: essas informações
são tratadas pelo WhatsApp.

## Links de WhatsApp

Todos os botões usam o formato `https://wa.me/55DDDNUMERO?text=MENSAGEM_CODIFICADA`
(montado em `js/whatsapp.js`, com `encodeURIComponent`). Cada botão tem o atributo
`data-whatsapp="<chave>"`, e a mensagem correspondente fica em
`ACADEMIA_CONFIG.mensagens` (`js/config.js`):

| Botão                         | Chave           |
|-------------------------------|-----------------|
| Flutuante "Fale conosco"      | `geral`         |
| Jiu-jitsu (Equipe Renan Rocha)| `jiu-jitsu`     |
| Musculação                    | `musculacao`    |
| Muay Thai                     | `muay-thai`     |
| Judô                          | `judo`          |
| Piscina                       | `piscina`       |
| Chamada final                 | `chamada-final` |

## Testes

```bash
# Unitários: validação do número e codificação das mensagens
node --test tests/whatsapp.test.js

# Navegador (Chromium via Playwright), desktop e celular,
# com o número vazio e com um número fictício injetado só no teste
NODE_PATH=$(npm root -g) node tests/e2e.js
```

Para visualizar localmente: `npx http-server .` e abra `http://localhost:8080`.
