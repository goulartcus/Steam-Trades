# 📊 Análise do Mercado Steam — Lucro & Prejuízo

Aplicativo web (um único arquivo, sem servidor) que lê o seu **histórico do Mercado Steam** (CSV) e mostra:

- **Lucro e prejuízo realizados** (do que você já vendeu)
- **Resultado líquido** total
- **Itens que ainda estão na sua carteira** e o custo parado neles
- Tabela com busca, filtro por jogo e por status, ordenação por coluna
- **Exportação para Excel (.xlsx)**

> 🔒 **Privacidade:** roda 100% no seu navegador. Seu CSV **não é enviado para nenhum servidor** — nada sai do seu computador.

## 🔗 Acesse

👉 **[ABRA O APP AQUI](https://SEU-USUARIO.github.io/steam-market-pnl/)** — *troque por este link pelo seu, depois de publicar.*

## ▶️ Como usar

1. Gere o seu arquivo CSV (veja a seção abaixo).
2. Abra o app e escolha (ou arraste) o arquivo.
3. Veja o resultado na hora e, se quiser, clique em **Baixar Excel (.xlsx)**.

## 📥 Como gerar o arquivo CSV

1. Instale a extensão **[Steam Inventory Helper](https://steaminventoryhelper.com/)** (Chrome, Edge ou Firefox).
2. No Steam, vá em **Comunidade → Mercado**.
3. Abra o seu **histórico do Mercado** ("Ver histórico do mercado").
4. Clique no botão **Export .csv file** que a extensão adiciona à página.
5. Salve o arquivo `my_market_history_….csv` e carregue no app.

💡 Se o download não vier de primeira, atualize a página do histórico e clique no botão de novo. Históricos grandes podem levar alguns segundos. Também funciona com o CSV de extensões equivalentes que geram as mesmas colunas (ex.: *Steam Market History Helper*, *CSGO Trader*).

## 🧮 Como os números são calculados

- **Custo médio** por item (média de todas as suas compras daquele item).
- **Lucro/prejuízo realizado** = valor recebido nas vendas − custo médio das unidades vendidas. Só conta o que já foi vendido.
- O preço de venda do CSV já é o **valor líquido** recebido (a taxa da Steam já está descontada).
- **Itens restantes** = comprados − vendidos. O "custo parado" é o **preço de compra** desses itens, **não** o valor de mercado atual.
- **Drops** (itens ganhos e vendidos sem ter comprado) entram como lucro puro.
- Os cálculos usam a coluna `Price in Cents`, então funcionam em **qualquer moeda**.
- A carteira é uma **estimativa** baseada nas transações do Mercado (cartas viram emblemas, itens são consumidos no jogo, etc.).

## 🛠️ Tecnologia

HTML + CSS + JavaScript puro, em um único `index.html`. Sem dependências, sem build, sem backend. O parser de CSV e a exportação `.xlsx` são feitos no próprio navegador.

## 📄 Licença

[MIT](LICENSE).
