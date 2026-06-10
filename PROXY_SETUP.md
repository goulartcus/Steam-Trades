# Configurar o proxy da Steam (Cloudflare Worker)

A Steam **não permite** que um site estático (como este) leia o seu inventário
diretamente pelo navegador — ela bloqueia CORS e removeu o endpoint antigo que
funcionava por JSONP. Os preços e imagens funcionam porque os endpoints de
*mercado* da Steam aceitam JSONP, mas o de *inventário* não.

A solução é um **proxy**: um pequeno servidor que faz a requisição para a Steam
e devolve o resultado para o site. O **Cloudflare Workers** roda isso de graça
(até **100.000 requisições por dia**, sem cartão de crédito).

Você só precisa fazer isto **uma vez**. Leva ~5 minutos.

---

## Passo a passo

### 1. Crie uma conta no Cloudflare (grátis)

1. Acesse https://dash.cloudflare.com/sign-up
2. Crie a conta com seu e-mail (não pede cartão).

### 2. Crie o Worker

1. No painel do Cloudflare, no menu lateral, clique em **Workers & Pages**.
2. Clique em **Create application** → **Create Worker**.
3. Dê um nome, por exemplo `steam-proxy`. A URL final será algo como
   `https://steam-proxy.SEU-USUARIO.workers.dev`.
4. Clique em **Deploy** (ele cria um worker de exemplo).

### 3. Cole o código do proxy

1. Depois do deploy, clique em **Edit code** (ou **Continue to project** → **Edit code**).
2. Apague todo o código que estiver lá.
3. Copie e cole o conteúdo do arquivo [`cloudflare-worker.js`](./cloudflare-worker.js)
   deste repositório.
4. Clique em **Deploy** (canto superior direito).

### 4. Pegue a URL do Worker

No topo da página do Worker aparece a URL pública, algo como:

```
https://steam-proxy.SEU-USUARIO.workers.dev
```

Copie essa URL.

### 5. Cole a URL no site

1. Abra o site (Análise do Mercado Steam).
2. No card **Inventário Steam**, clique em **⚙️ Configurar proxy**.
3. Cole a URL do Worker no campo e clique em **Salvar**.

Pronto! Agora a busca de inventário funciona — tanto com `/profiles/76561198…`
quanto com `/id/seunome`. A configuração fica salva no navegador (não precisa
repetir).

---

## É seguro?

- O Worker **só repassa requisições para `steamcommunity.com`** — não pode ser
  usado como proxy aberto para outros sites.
- Apenas o pedido do **inventário público** passa pelo Worker. O seu arquivo
  **CSV de histórico nunca sai do navegador** — ele continua 100% local.
- O código é aberto e está em [`cloudflare-worker.js`](./cloudflare-worker.js).

## Por que não dá para usar o GitHub?

GitHub Pages é hospedagem **estática** (só serve arquivos), e GitHub Actions só
roda em gatilhos/agendamentos — nenhum dos dois funciona como um servidor que
fica de pé recebendo requisições. Por isso o proxy precisa do Cloudflare (ou
equivalente como Vercel/Deno Deploy). O **site continua no GitHub** normalmente.

## Quero que funcione sem configurar para todo mundo

Depois de criar o Worker, dá para "fixar" a URL no código do site: em
`index.html`, procure por:

```js
const DEFAULT_STEAM_PROXY = "";
```

e coloque a sua URL:

```js
const DEFAULT_STEAM_PROXY = "https://steam-proxy.SEU-USUARIO.workers.dev";
```

Assim qualquer pessoa que abrir o site já usa o proxy sem precisar configurar.
