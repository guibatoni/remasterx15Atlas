# Atlas X15 v1.4 — Efeitos da ISO traduzidos para PT-BR

Atualização do Atlas v1.3, preservando as tabelas de drops, três ranks,
fusões, ATK/DEF, nomes das 722 cartas e tipos originais.

## Conteúdo traduzido

- **315/315 cartas Effect ou Gemini** com descrições de regras traduzidas para português.
- **94/94 cartas Magic/Trap/Equip/Ritual com descrição** traduzidas para português.
- Sub-Type, nomes de cartas, grupos (ex. "Battleguard"), atributos (DARK, FIRE), nomes de tipos (Zombie, Fish, Beast...), terrenos (Yami, Sogen, Umi) e marcadores de efeito da ISO são mantidos em inglês.
- As descrições meramente narrativas (sem efeitos) continuam em inglês.
- Cartas sem descrição continuam identificadas como "Sem descrição na ISO".
- Texto em português aparece como **principal** na ficha; descrição inglesa original fica recolhida em "Consultar texto original".

Traduções feitas a partir das frases recuperadas da ISO pelo próprio projeto.
A redação em inglês é a referência para casos ambíguos: a tradução de um texto
não garante a execução daquela regra na lógica interna do jogo.

## Arquivos

- index.html + styles.css + app.js + data/: site para publicação em hospedagem estática.
- `DESCRICOES_X15_ISO_PT_BR.csv`: ID, nome, ATK, DEF, tipo, descrição original e tradução.
- `data/textos_iso.json`: tabela estruturada das 722 cartas com EN/PT.
- Abra o `index.html` extraindo o ZIP inteiro, ou use o HTML offline separado.

Fonte primária: ISO `Yu-Gi-Oh! Remaster [VER. 1.2.1 - X15 - NO REQUIREMENTS].bin` enviada pelo usuário.


## Atualização v1.5 — links individuais

Os nomes de cartas nas seções Enciclopédia, Drops e ranks, Efeitos, Fusões e nas fichas abrem sua **ficha específica em uma nova aba**. Exemplo: `index.html#carta/241` para Vampire Lord, acessível tanto offline quanto em GitHub Pages. A ficha inclui ATK/DEF, descrição PT-BR, texto original, drops por rank e receitas de fusão. Os links usam os IDs internos do catálogo X15, sem redirecionar ao TCG. A opção **Copiar link** utiliza a área de transferência quando o navegador autoriza.


## Atualização de adversários — ISO X15 1.2.1

A tabela de nomes no executável `SLUS_014.11` foi conferida diretamente na ISO.
Os **39 adversários** agora utilizam os nomes exibidos no mod (ex.: ID 7 = **Mage Guard**).
As **3.972 entradas de drops**, os três ranks Z-POW/S-POW/S-TEC, as 722 cartas e as 23.334 fusões foram preservados.
Cada grupo de drops por adversário e rank soma **2.048** unidades de peso.
As artes já publicadas em `images/sprites` continuam sem alteração. Retratos individuais de oponentes ainda não estão disponíveis no site; o pacote de desktop inclui os arquivos extraídos da ISO.
