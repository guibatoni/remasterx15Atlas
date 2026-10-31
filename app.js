/* Atlas X15 — site estático, sem chamadas remotas. Dados extraídos da ISO fornecida. */
(() => {
'use strict';
const db=window.X15_DATA, root=document.querySelector('#view');
if(!db){root.innerHTML='<div class="notice">Erro: não foi possível carregar data/catalogo.js. Extraia o ZIP inteiro.</div>';return;}
const byId=new Map(db.cards.map(c=>[c[0],c]));
const isoTexts=window.X15_TEXTS||[];
const isoTextById=new Map(isoTexts.map(x=>[x.id,x]));
const classLabels={efeito:'Effect',gemini:'Gemini',subtipo:'Sub-Type',descricao:'Descrição',sem_descricao:'Sem descrição'};
const getText=id=>isoTextById.get(+id)||{en:'',pt:'',categoria:'sem_descricao',subtipos:[],marcadores:{}};
const textBadge=id=>{const t=getText(id);return t.categoria==='sem_descricao'?'':`<span class="effect-flag">${classLabels[t.categoria]||'Texto ISO'}</span>`;};
const textPanel=id=>{const t=getText(id);if(!t.en)return '<div class="effect-info unknown"><span class="effect-tag">Sem descrição na ISO</span><p>Nenhum texto foi encontrado para esta carta. Isso não comprova ausência de habilidades.</p></div>';
 const sub=t.subtipos?.length?`<div class="subtype-tags"><strong>Sub-Type</strong> ${t.subtipos.map(s=>`<span>${safe(s)}</span>`).join('')}</div>`:'';
 const isEffect=t.marcadores?.effect||t.marcadores?.gemini;
 const label=isEffect?(t.marcadores?.gemini?'Gemini':'Effect'):classLabels[t.categoria]||'Descrição';
 const pt=t.pt?`<div class="translation-primary"><span class="translation-kicker">DESCRIÇÃO EM PORTUGUÊS · ${safe(label)}</span><p class="effect-display">${safe(t.pt)}</p></div>`:'';
 const original=t.pt?`<details class="original-text"><summary>Consultar texto original em inglês (ISO)</summary><p class="effect-display">${safe(t.en)}</p></details>`:`<div class="original-text-alone"><h4>Texto original da ISO (English)</h4><p class="effect-display">${safe(t.en)}</p></div>`;
 return `<div class="effect-info">${sub}${pt}${original}</div>`;
};
const fx=window.X15_EFFECTS||{entries:[],mechanics:[]};
const effectById=new Map(fx.entries.map(e=>[e.id,e]));
const dropByOp=new Map(), dropByCard=new Map(), byPair=new Map(), asIngredient=new Map(), asResult=new Map();
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const safe=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Number(n||0).toLocaleString('pt-BR');
const pct=w=>(w/2048*100).toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:4})+'%';
const name=id=>(byId.get(+id)||[])[1]||'Carta desconhecida';
const atk=id=>(byId.get(+id)||[])[2]||0;
const def=id=>(byId.get(+id)||[])[3]||0;
const statLine=id=>`ATK ${num(atk(id))} / DEF ${num(def(id))}`;
const hasStat=id=>{const c=byId.get(+id);return c&&c[4]<20;};
const statLineCard=id=>hasStat(id)?statLine(id):'Carta especial — ATK/DEF não aplicáveis';
const effectBadge=id=>textBadge(id);
const effectInfo=id=>textPanel(id);
const label=id=>String(id).padStart(3,'0')+' · '+name(id);
const cardHref=id=>'#carta/'+Number(id);
const cardLink=(id,caption)=>`<a class="link-button card-link" href="${cardHref(id)}" target="_blank" rel="noopener noreferrer" title="Abrir ficha de ${safe(name(id))} em nova aba">${safe(caption==null?name(id):caption)}<span class="link-external" aria-hidden="true"> ↗</span></a>`;

const rankChip=r=>`<span class="chip ${['z','pow','tec'][+r]}">${db.rankLabels[+r]}</span>`;
const attrName={0:'LIGHT',1:'DARK',2:'EARTH',3:'WATER',4:'FIRE',5:'WIND'};
const typeName={0:'Dragon',1:'Spellcaster',2:'Zombie',3:'Warrior',4:'Beast-Warrior',5:'Beast',6:'Winged Beast',7:'Fiend',8:'Fairy',9:'Insect',10:'Dinosaur',11:'Reptile',12:'Fish',13:'Sea Serpent',14:'Machine',15:'Thunder',16:'Aqua',17:'Pyro',18:'Rock',19:'Plant',20:'Magic',21:'Trap',22:'Ritual',23:'Equip'};
const S={route:'inicio',opponent:1,rank:'0',mode:'op',dropTerm:'',dropSort:'chance',cardSearch:'',cardType:'all',cardPage:0,cardSort:'id',minAtk:0,minDef:0,onlyDocumented:false,effectTerm:'',effectKind:'all',effectSort:'id',effectPage:0,selected:1,fusionA:'',fusionB:'',fusionTarget:'',hand:['','','','','']};
for(const row of db.drops){let [op,r,id]=row;let key=op+':'+r;if(!dropByOp.has(key))dropByOp.set(key,[]);dropByOp.get(key).push(row);if(!dropByCard.has(id))dropByCard.set(id,[]);dropByCard.get(id).push(row);}
for(const row of db.fusions){const [a,b,c]=row,k=[Math.min(a,b),Math.max(a,b)].join(':');if(!byPair.has(k))byPair.set(k,new Set());byPair.get(k).add(c);if(!asIngredient.has(a))asIngredient.set(a,[]);if(!asIngredient.has(b))asIngredient.set(b,[]);asIngredient.get(a).push([b,c]);asIngredient.get(b).push([a,c]);if(!asResult.has(c))asResult.set(c,[]);asResult.get(c).push([a,b]);}
const opts=(array,selected)=>array.map(([value,l])=>`<option value="${safe(value)}" ${String(value)===String(selected)?'selected':''}>${safe(l)}</option>`).join('');
const opOpts=()=>opts(db.opponents.map((n,i)=>[i+1,`#${i+1} · ${n}`]),S.opponent);
const rankOpts=(all=true)=>opts([...(all?[['all','Todos os ranks']]:[]),...[0,1,2].map(i=>[String(i),db.rankLabels[i]])],S.rank);
// Artes originais Remaster X15: 722 imagens extraídas da ISO, em 29 spritesheets WebP (5×5).
const img=id=>{
 const n=Number(id);if(!Number.isInteger(n)||n<1||n>722)return '<span class="no-art">✧</span>';
 const sheet=String(Math.floor((n-1)/25)).padStart(2,'0'),pos=(n-1)%25;
 return `<span class="x15-art" role="img" aria-label="Arte original de ${safe(name(n))}" style="--sprite:url('images/sprites/x15_${sheet}.webp');--sprite-x:${(pos%5)*25}%;--sprite-y:${Math.floor(pos/5)*25}%"></span>`;
};
function go(route){S.route=route;document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.route===route));document.querySelector('.sidebar').classList.remove('open');document.querySelector('#breadcrumb').textContent=({inicio:'Visão geral',drops:'Drops e ranks',cartas:'Enciclopédia',fusoes:'Laboratório de fusões',efeitos:'Efeitos do mod',guia:'Guia e metodologia',carta:'Ficha de '+name(S.detailId)})[route]||'Atlas';window.scrollTo(0,0);document.title=(route==='carta'?name(S.detailId)+' · ':'')+'Atlas X15 — Remaster 1.2.1';render();}
function button(title,route){return `<button class="btn" data-route="${route}">${safe(title)} →</button>`;}
function infoBox(text){return `<div class="notice">${text}</div>`;}
function heading(tag,title,desc){return `<div class="section-header"><div><span class="eyebrow">${tag}</span><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div></div>`;}
function cardTile(c){const [id,n,a,d,t,l]=c;return `<a class="catalog-card" href="${cardHref(id)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ficha de ${safe(n)} em nova aba"><div class="card-picture"><span class="badge-top mono">#${String(id).padStart(3,'0')}</span>${img(id)}</div><div class="catalog-card-info"><strong title="${safe(n)}">${safe(n)}</strong><div class="card-combat"><span><b>ATK</b> ${t<20?num(a):'—'}</span><span><b>DEF</b> ${t<20?num(d):'—'}</span></div>${effectBadge(id)}<small>${safe(typeName[t]||'Especial')} · Nv. ${l||'—'}</small></div></a>`;}
function cardRow(row){const [op,r,id,w]=row;return `<tr><td><div class="table-name"><div class="mini-art">${img(id)}</div><div><strong>${cardLink(id)}</strong><div class="hint mono">#${String(id).padStart(3,'0')}${op===1&&id===142?' · No resultado do jogo apareceu #143 — divergência em análise':''}</div>${effectBadge(id)}</div></div></td><td>${rankChip(r)}</td><td class="number stat-atk">${hasStat(id)?num(atk(id)):'—'}</td><td class="number stat-def">${hasStat(id)?num(def(id)):'—'}</td><td class="number"><span class="pbar"><span style="width:${Math.min(100,w/220*100)}%"></span></span><strong>${pct(w)}</strong></td><td class="number mono">${w}/2048</td></tr>`;}
function home(){const teases=[['Z-POW',0,'95 pontos ou mais','Recompensas do topo da classificação.','var(--gold)'],['S-POW',1,'50–94 pontos','Segunda bolsa, com chances próprias por carta.','var(--cyan)'],['S-TEC',2,'0–49 pontos','Distribuição alternativa de cartas, magias e armadilhas.','var(--purple)']];
 return `<section class="hero"><div class="hero-copy"><span class="eyebrow">◈ THE FORBIDDEN ARCHIVE · REMASTER X15</span><h1>Domine cada <em>duelo.</em><br>Descubra cada carta.</h1><p>O catálogo do seu Yu-Gi-Oh! Forbidden Memories Remaster: drops por oponente, chances por rank e 23 mil fusões para montar a estratégia perfeita.</p><div class="hero-actions"><button class="btn primary" data-route="drops">◉ Explorar drops <span>↗</span></button><button class="btn alt" data-route="fusoes">✧ Simular fusões</button><button class="btn alt" data-route="efeitos">◈ Efeitos do mod</button></div></div><div class="hero-art"><div class="hero-orbit two"></div><div class="hero-orbit"></div><div class="holo-card"><div class="card-top"><span>REMΛSTER</span><span>✦ ✦ ✦ ✦ ✦</span></div><div class="card-window">✧</div><div class="card-bottom">ATLAS X15 · FORBIDDEN MEMORIES</div></div></div></section>
 <div class="metrics"><div class="metric"><span class="corner">▣</span><div class="value">722</div><small>Cartas catalogadas</small></div><div class="metric"><span class="corner">✧</span><div class="value">23.334</div><small>Receitas de fusão</small></div><div class="metric"><span class="corner">♟</span><div class="value">39</div><small>Oponentes documentados</small></div><div class="metric"><span class="corner">◉</span><div class="value">3</div><small>Ranks de recompensa</small></div></div>
 ${heading('DROPS & RECOMPENSAS','Três ranks. Três tabelas de drop.','Um mesmo oponente pode oferecer chances diferentes para a mesma carta, conforme a pontuação final.')}
 <div class="grid-three">${teases.map(([r,i,pts,txt,col])=>`<button data-rankhome="${i}" class="panel rank-panel" style="--glow:${col};text-align:left;color:inherit"><span class="chip ${['z','pow','tec'][i]}">${r}</span><div class="rank-title">${pts}</div><div class="rank-sub">${txt}</div><div style="color:${col};margin-top:19px;font-weight:850;font-size:11px">VER PROBABILIDADES →</div></button>`).join('')}</div>
 ${heading('ACESSO RÁPIDO','Comece pela carta que você quer','Explore os drops mais relevantes de alguns adversários do Remaster.')}
 <div class="grid-two"><div class="panel"><div class="row"><strong>Buscar uma carta</strong><span class="tagline"><i></i> 722 registros</span></div><form id="quick-search" class="quick-search"><input required class="input" name="q" placeholder="Ex.: Blue-Eyes White Dragon ou Pyramid Turtle" aria-label="Buscar carta"><button class="btn primary" type="submit">Buscar</button></form><p class="help-small">A busca considera os nomes exatos do Remaster X15.</p></div><div class="panel"><div class="row"><strong>Farming em destaque</strong><span class="chip z">Z-POW</span></div><div style="margin-top:18px;line-height:1.9;font-size:12px;color:#acbed3">Seto 3rd · ${cardLink(1)} <strong style="float:right;color:var(--cyan)">0,8789%</strong><br>Duel Master K · ${cardLink(35)} <strong style="float:right;color:var(--cyan)">4,8828%</strong><br>Jono 2nd · ${cardLink(5)} <strong style="float:right;color:var(--cyan)">4,2969%</strong></div></div></div>
 <div style="margin-top:26px">${infoBox('<strong>Leitura correta:</strong> cada porcentagem é a chance por sorteio da tabela da ISO. Ela não deve ser confundida com a chance de conseguir a carta ao final de um duelo inteiro, que pode oferecer várias recompensas.')}</div>`;
}
function dropsView(){let rows=[];if(S.mode==='op'){
 const ranks=S.rank==='all'?[0,1,2]:[+S.rank];for(const r of ranks)rows.push(...(dropByOp.get(S.opponent+':'+r)||[]));
}else{rows=[...(dropByCard.get(S.selected)||[])];if(S.rank!=='all')rows=rows.filter(r=>r[1]===+S.rank);}
const term=norm(S.dropTerm);if(S.mode==='op'&&term)rows=rows.filter(r=>norm(name(r[2])).includes(term)||String(r[2])===term||(S.opponent===1 && r[2]===142 && term==='143'));
rows.sort((a,b)=>S.dropSort==='name'?name(a[2]).localeCompare(name(b[2])):S.dropSort==='rank'?a[1]-b[1]||b[3]-a[3]:S.dropSort==='atk'?atk(b[2])-atk(a[2])||b[3]-a[3]:S.dropSort==='atk_asc'?atk(a[2])-atk(b[2])||b[3]-a[3]:S.dropSort==='def'?def(b[2])-def(a[2])||b[3]-a[3]:S.dropSort==='def_asc'?def(a[2])-def(b[2])||b[3]-a[3]:b[3]-a[3]||a[1]-b[1]);
const cardSelector=[...db.cards].sort((a,b)=>a[1].localeCompare(b[1])).map(c=>[c[0],`#${c[0]} · ${c[1]}`]);
const fields=`<div class="filter-field"><label class="field-label" for="drop-mode">TIPO DE CONSULTA</label><select id="drop-mode" class="select" data-state="mode">${opts([['op','Drops de um oponente'],['card','Onde conseguir uma carta']],S.mode)}</select></div>`+
 (S.mode==='op'?`<div class="filter-field"><label class="field-label" for="opp-select">OPONENTE</label><select id="opp-select" class="select" data-state="opponent">${opOpts()}</select></div>`:`<div class="filter-field"><label class="field-label" for="drop-card">CARTA</label><select id="drop-card" class="select" data-state="selected">${opts(cardSelector,S.selected)}</select></div>`)+
 `<div class="filter-field"><label class="field-label" for="drop-rank">RANK</label><select id="drop-rank" class="select" data-state="rank">${rankOpts()}</select></div><div class="filter-field"><label class="field-label" for="drop-sort">ORDENAR</label><select id="drop-sort" class="select" data-state="dropSort">${opts([['chance','Maior chance'],['atk','Maior ATK'],['atk_asc','Menor ATK'],['def','Maior DEF'],['def_asc','Menor DEF'],['name','Nome da carta'],['rank','Rank']],S.dropSort)}</select></div>`;
 return `${heading('BIBLIOTECA DE RECOMPENSAS','Drops e probabilidades','Selecione um duelista ou pesquise a melhor rota para conseguir uma carta específica.')}
 <div class="tabs"><button class="tab ${S.mode==='op'?'selected':''}" data-mode="op">◉ Por oponente</button><button class="tab ${S.mode==='card'?'selected':''}" data-mode="card">⌕ Onde conseguir esta carta?</button></div>
 <div class="filter-bar four">${fields}</div>
 ${S.mode==='op'&&S.opponent===1?`<div style="margin:14px 0">${infoBox('Conferência com o jogo: Simon Muran entregou <b>Flame Manipulator</b> em Z-POW. Na ISO a carta aparece como <b>#142</b> (44/2048 = 2,1484%), enquanto o resultado capturado mostrou <b>#143</b>. Pesquise por Flame Manipulator, 142 ou 143. A diferença de numeração ainda não foi explicada e não será aplicada automaticamente às outras cartas.')}</div>`:''}
 ${S.mode==='op'?`<form id="drop-form" class="row" style="gap:12px;margin-bottom:18px"><input class="input" name="query" value="${safe(S.dropTerm)}" placeholder="Filtrar cartas pelo nome ou número..." aria-label="Filtrar resultados"><button type="submit" class="btn">Filtrar</button><button type="button" class="btn" id="clear-drop">Limpar</button></form>`:``}
 <div class="panel"><div class="row wrap" style="margin-bottom:16px"><div><div class="micro-label">${S.mode==='op'?'RECOMPENSAS ENCONTRADAS':'MELHORES ADVERSÁRIOS'}</div><h3 style="font-size:18px;margin:6px 0 0">${rows.length} resultados ${S.mode==='card'?'para '+cardLink(S.selected):'de '+safe(db.opponents[S.opponent-1])}</h3></div><span class="tagline"><i></i> CHANCE POR SORTEIO: PESO / 2048</span></div>
 ${rows.length?`<div class="table-scroll"><table class="data-table"><thead><tr><th>${S.mode==='op'?'Carta':'Oponente · Carta'}</th><th>Rank</th><th class="number">ATK</th><th class="number">DEF</th><th class="number">Probabilidade</th><th class="number">Peso</th></tr></thead><tbody>${rows.slice(0,125).map(r=>S.mode==='op'?cardRow(r):`<tr><td><strong>${safe(db.opponents[r[0]-1])}</strong><div class="hint">#${String(r[0]).padStart(2,'0')} · ${cardLink(r[2])}</div></td><td>${rankChip(r[1])}</td><td class="number stat-atk">${hasStat(r[2])?num(atk(r[2])):'—'}</td><td class="number stat-def">${hasStat(r[2])?num(def(r[2])):'—'}</td><td class="number"><span class="pbar"><span style="width:${Math.min(100,r[3]/220*100)}%"></span></span><strong>${pct(r[3])}</strong></td><td class="number mono">${r[3]}/2048</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state"><span class="big">⌕</span><h3>Nenhum drop encontrado</h3><p>Experimente outro rank, carta ou adversário.</p></div>`}
 <p class="help-small">${rows.length>125?'Mostrando os 125 primeiros resultados. Use os filtros para refinar.':'Dados do arquivo WA_MRG.MRG da ISO do usuário; nenhuma estatística foi inventada.'}</p></div>
 <div style="margin-top:17px">${infoBox('As tabelas Z-POW, S-POW e S-TEC foram separadas pelo seletor de recompensas do X15. Probabilidades exibidas são nominais por sorteio, não a chance final por vitória.')}</div>`;
}
function cardsView(){
 let matches=db.cards;const q=norm(S.cardSearch);
 if(q)matches=matches.filter(c=>norm(c[1]).includes(q)||String(c[0])===q);
 if(S.cardType!=='all')matches=matches.filter(c=>String(c[4])===S.cardType);
 if(S.minAtk>0)matches=matches.filter(c=>c[4]<20&&c[2]>=S.minAtk);
 if(S.minDef>0)matches=matches.filter(c=>c[4]<20&&c[3]>=S.minDef);
 if(S.onlyDocumented)matches=matches.filter(c=>{const x=getText(c[0]);return x.marcadores.effect||x.marcadores.gemini});
 matches=[...matches].sort((a,b)=>S.cardSort==='atk'?b[2]-a[2]||b[3]-a[3]:S.cardSort==='atk_asc'?a[2]-b[2]||a[3]-b[3]:S.cardSort==='def'?b[3]-a[3]||b[2]-a[2]:S.cardSort==='def_asc'?a[3]-b[3]||a[2]-b[2]:S.cardSort==='name'?a[1].localeCompare(b[1]):a[0]-b[0]);
 const pageSize=30,totalPages=Math.max(1,Math.ceil(matches.length/pageSize));S.cardPage=Math.max(0,Math.min(S.cardPage,totalPages-1));const part=matches.slice(S.cardPage*pageSize,(S.cardPage+1)*pageSize);
 const types=[...new Set(db.cards.map(c=>c[4]))].sort((a,b)=>a-b);
 return `${heading('CATÁLOGO DE BATALHA','722 cartas com ATK e DEF da ISO','Pesquise cartas e filtre pela força de ataque, defesa, tipo e notas de efeito documentadas.')}
 <form id="cards-form" class="panel stat-search-form"><div class="stat-filter-grid">
 <div class="filter-field wide"><label class="field-label" for="card-search">CARTA OU ID</label><input id="card-search" class="input" name="q" value="${safe(S.cardSearch)}" placeholder="Ex.: Dark Magician, 35, Mine Golem"></div>
 <div class="filter-field"><label class="field-label" for="card-type">TIPO</label><select id="card-type" class="select" name="cardType">${opts([['all','Todos os tipos'],...types.map(t=>[t,typeName[t]||`Tipo ${t}`])],S.cardType)}</select></div>
 <div class="filter-field"><label class="field-label" for="min-atk">ATK MÍNIMO</label><input id="min-atk" name="minAtk" class="input" type="number" min="0" max="99999" value="${S.minAtk}" placeholder="0"></div>
 <div class="filter-field"><label class="field-label" for="min-def">DEF MÍNIMA</label><input id="min-def" name="minDef" class="input" type="number" min="0" max="99999" value="${S.minDef}" placeholder="0"></div>
 <div class="filter-field"><label class="field-label" for="sort-stat">ORDENAR</label><select id="sort-stat" class="select" name="cardSort">${opts([['id','Número da carta'],['atk','Maior ATK'],['atk_asc','Menor ATK'],['def','Maior DEF'],['def_asc','Menor DEF'],['name','Nome A–Z']],S.cardSort)}</select></div>
 </div><div class="row wrap" style="margin-top:17px"><label class="effect-check"><input type="checkbox" name="onlyDocumented" ${S.onlyDocumented?'checked':''}/> Somente cartas Effect/Gemini</label><button class="btn primary" type="submit">Aplicar filtros</button></div></form>
 <div class="row wrap" style="margin:9px 0 17px"><span class="results-count">${num(matches.length)} cartas encontradas • Página ${S.cardPage+1}/${totalPages}</span><button class="link-button" data-route="efeitos">Ver pesquisa de efeitos do mod</button></div>
 ${matches.length?`<div class="card-grid">${part.map(cardTile).join('')}</div><div class="page-actions"><button class="btn" data-page="prev" ${S.cardPage===0?'disabled':''}>← Anterior</button><span class="results-count">${S.cardPage+1} de ${totalPages}</span><button class="btn" data-page="next" ${S.cardPage+1>=totalPages?'disabled':''}>Próxima →</button></div>`:`<div class="empty-state"><span class="big">▣</span><h3>Nenhuma carta encontrada</h3></div>`}
 <p class="source-credit">ATK e DEF são os valores base da ISO Remaster X15, sem efeitos, equipamentos, terrenos ou bônus em combate. Cartas especiais não têm ATK/DEF aplicáveis.</p>`;
}
const cardList=()=>`<datalist id="card-suggestions">${db.cards.map(c=>`<option value="${safe(label(c[0]))}"></option>`).join('')}</datalist>`;
function parseCard(s){const v=String(s||'').trim();if(!v)return 0;const m=v.match(/^#?(\d{1,3})(?:\s*[·\-]\s*.*)?$/);if(m&&byId.has(+m[1]))return +m[1];const n=norm(v);const c=db.cards.find(c=>norm(c[1])===n);return c?c[0]:0;}
function pathSolver(ids){const list=ids.filter(Boolean);if(!list.length)return [];
 let state=new Map();for(let i=0;i<list.length;i++){state.set((1<<i)+':'+list[i],{mask:1<<i,id:list[i],steps:[]});}
 for(let used=1;used<list.length;used++){
  const snapshots=[...state.values()].filter(x=>countBits(x.mask)===used);
  for(const path of snapshots)for(let k=0;k<list.length;k++){if(path.mask&(1<<k))continue;const id=list[k],kpair=[Math.min(id,path.id),Math.max(id,path.id)].join(':'),out=byPair.get(kpair);if(!out)continue;for(const res of out){const mask=path.mask|(1<<k),hash=mask+':'+res;if(!state.has(hash))state.set(hash,{mask,id:res,steps:[...path.steps,[path.id,id,res]]});}}
 }
 return [...state.values()].filter(x=>x.steps.length).sort((a,b)=>atk(b.id)-atk(a.id)||b.steps.length-a.steps.length).slice(0,15);
}
const countBits=n=>{let x=0;while(n){x+=n&1;n>>=1;}return x;};
function fusionView(){let ra=parseCard(S.fusionA),rb=parseCard(S.fusionB),results=(ra&&rb)?[...(byPair.get([Math.min(ra,rb),Math.max(ra,rb)].join(':'))||[])]:[];
 const handIds=S.hand.map(parseCard),routes=pathSolver(handIds),target=parseCard(S.fusionTarget);let targetRecipes=target?(asResult.get(target)||[]):[];
 targetRecipes=targetRecipes.slice().sort((a,b)=>Math.max(atk(b[0]),atk(b[1]))-Math.max(atk(a[0]),atk(a[1]))).slice(0,30);
 return `${heading('ESTRATÉGIA AVANÇADA','Laboratório de fusões','Verifique combinações exatas do X15 e calcule rotas possíveis a partir de até cinco cartas da sua mão.')}
 <div class="panel"><div class="row wrap"><h3>✧ Simulador de duas cartas</h3><span class="tagline"><i></i> 23.334 receitas da ISO</span></div><form id="fusion-form" class="fuse-pair"><input name="a" list="card-suggestions" class="input" placeholder="Carta A (nome ou ID)" value="${safe(S.fusionA)}" aria-label="Carta A"><div class="fuse-plus">+</div><input name="b" list="card-suggestions" class="input" placeholder="Carta B (nome ou ID)" value="${safe(S.fusionB)}" aria-label="Carta B"><div class="fuse-plus">=</div><div class="fuse-output">${results.length?`<div><strong>${results.map(r=>`${cardLink(r)} <span class="fusion-result-stat">${statLineCard(r)}</span>`).join('<br>')}</strong><br><small>Resultado da combinação</small></div>`:'<small>Escolha duas cartas e clique em Ver fusão.</small>'}</div><button class="btn primary small" style="grid-column:1/-1;justify-self:start" type="submit">Ver fusão →</button></form>${cardList()}</div>
 <div class="panel" style="margin-top:20px"><div class="row wrap"><h3>◈ Otimizador de mão (até 5 cartas)</h3><span class="chip pow">FUSÕES EM SEQUÊNCIA</span></div><p class="hint">Selecione as cartas que estão na sua mão. O algoritmo testa fusões encadeadas e ordena as criaturas finais pelo ATK registrado na ISO.</p><form id="hand-form"><div class="hand-slots">${S.hand.map((v,i)=>`<div class="hand-slot"><span class="slot-num">${i+1}</span><input class="input" name="h${i}" list="card-suggestions" placeholder="Carta ${i+1}" value="${safe(v)}" aria-label="Carta da mão ${i+1}"></div>`).join('')}</div><button class="btn primary" type="submit">✧ Calcular melhores fusões</button><button class="btn" type="button" id="clear-hand">Limpar mão</button></form>
 ${routes.length?`<div class="sep"></div><div class="row wrap"><strong>Combinações encontradas</strong><span class="results-count">${routes.length} melhores rotas</span></div>${routes.map((r,i)=>`<div class="route-result"><div><span class="micro-label">ROTA ${i+1} · ${r.steps.length} FUSÃO(ÕES)</span><div style="margin:6px 0"><strong>${cardLink(r.id)}</strong></div><div class="steps">${r.steps.map(step=>`${cardLink(step[0])} + ${cardLink(step[1])} → <b>${cardLink(step[2])}</b>`).join('<br>')}</div></div><div class="fusion-route-meta"><small class="micro-label">ATK / DEF FINAL</small><div><b>${num(atk(r.id))} / ${num(def(r.id))}</b></div></div></div>`).join('')}`:`<div class="empty-state"><span class="big">✧</span><h3>Defina sua mão</h3><p>As sugestões de fusão aparecerão aqui.</p></div>`}</div>
 <div class="panel" style="margin-top:20px"><div class="row wrap"><h3>⌕ Como criar uma carta?</h3><span class="results-count">Buscar pelas matérias da fusão</span></div><form id="target-form" class="quick-search" style="max-width:none"><input class="input" list="card-suggestions" name="target" placeholder="Qual resultado você quer criar?" value="${safe(S.fusionTarget)}"><button class="btn" type="submit">Buscar receitas</button></form>${target?`<p class="hint">${(asResult.get(target)||[]).length} receitas registradas para <b>${cardLink(target)}</b>. Mostrando até 30.</p><div class="mini-lines">${targetRecipes.map(pair=>`<div class="mini-line"><span>${cardLink(pair[0])} <b>+</b> ${cardLink(pair[1])}</span><small>${statLineCard(pair[0])} | ${statLineCard(pair[1])}</small></div>`).join('')||'<div class="hint">Nenhuma receita registrada como resultado para essa carta.</div>'}</div>`:''}</div>
 <div style="margin-top:17px">${infoBox('As rotas são baseadas exclusivamente nas receitas de fusão extraídas da ISO. Não consideram efeitos especiais, equipamentos nem requisitos de posicionamento do campo.')}</div>`;
}
function effectsView(){
 const classes=[['all','Todas as cartas'],['efeito','Effect'],['gemini','Gemini'],['subtipo','Sub-Type sem Effect/Gemini'],['descricao','Descrição / Magias'],['sem_descricao','Sem descrição']];
 const q=norm(S.effectTerm||'');let matches=db.cards.filter(c=>{const t=getText(c[0]);return (!q||norm(c[1]).includes(q)||String(c[0])===q||(norm(t.en).includes(q)||norm(t.pt).includes(q)))&&(!S.effectKind||S.effectKind==='all'||t.categoria===S.effectKind);});
 matches=matches.slice().sort((a,b)=>S.effectSort==='atk'?b[2]-a[2]:S.effectSort==='def'?b[3]-a[3]:S.effectSort==='name'?a[1].localeCompare(b[1]):a[0]-b[0]);
 const total=Math.max(1,Math.ceil(matches.length/30));S.effectPage=Math.max(0,Math.min(S.effectPage,total-1));const part=matches.slice(S.effectPage*30,S.effectPage*30+30);
 return `${heading('ARQUIVO ORIGINAL DO MOD','Textos e efeitos recuperados da ISO','Descodificação dos 722 registros do executável SLUS_014.11: efeitos, Gemini, Sub-Type e cartas sem descrição.')}
 <div class="panel" style="padding:20px"><form id="effects-form" class="stat-filter-grid"><div class="filter-field wide"><label class="field-label">CARTA OU TEXTO</label><input class="input" name="effectTerm" value="${safe(S.effectTerm||'')}" placeholder="Ex.: Vampire Lord, Zombie, Summoned"></div><div class="filter-field"><label class="field-label">CATEGORIA</label><select class="select" name="effectKind">${opts(classes,S.effectKind)}</select></div><div class="filter-field"><label class="field-label">ORDENAR</label><select class="select" name="effectSort">${opts([['id','ID'],['name','Nome'],['atk','Maior ATK'],['def','Maior DEF']],S.effectSort)}</select></div><button class="btn primary" type="submit">Pesquisar</button></form></div>
 <div class="notice"><strong>${num(matches.length)} cartas encontradas</strong> · 292 com &lt;Effect&gt;, 23 com &lt;Gemini&gt;, 50 descrições apenas de Sub-Type, 132 outras descrições e 225 sem descrição. Os nomes, tipos e atributos continuam em inglês. O inglês original sempre está disponível.</div>
 <div class="iso-effect-list">${part.map(c=>{const t=getText(c[0]);return `<article class="panel iso-effect-card"><div class="row wrap" style="justify-content:space-between"><div><span class="micro-label">#${String(c[0]).padStart(3,'0')} · ${safe(typeName[c[4]]||'Carta')}</span><h3>${cardLink(c[0])}</h3></div><div class="iso-atkdef"><b>ATK</b> ${num(c[2])} <b>DEF</b> ${num(c[3])}</div></div>${textPanel(c[0])}</article>`}).join('')}</div>
 <div class="pagination"><button class="btn" data-effectpage="prev" ${S.effectPage===0?'disabled':''}>Anterior</button><span>Página ${S.effectPage+1} de ${total}</span><button class="btn" data-effectpage="next" ${S.effectPage>=total-1?'disabled':''}>Próxima</button></div>`;
}
function guideView(){return `${heading('COMO USAR','Guia, pontuação e fontes','Entenda o significado das chances e como colocar o site na internet.')}
 <div class="grid-three"><div class="panel"><span class="chip tec">S-TEC</span><h3>0–49 pontos</h3><p class="hint">Usa a terceira tabela de recompensas.</p></div><div class="panel"><span class="chip pow">S-POW</span><h3>50–94 pontos</h3><p class="hint">Usa a segunda tabela de recompensas.</p></div><div class="panel"><span class="chip z">Z-POW</span><h3>95 pontos ou mais</h3><p class="hint">Usa a primeira tabela de recompensas.</p></div></div>
 <div class="grid-two" style="margin-top:18px"><div class="panel"><h3>Como calculamos o drop?</h3><p class="hint">A ISO armazena 39 registros de oponentes. Cada um tem três tabelas de recompensas, cada qual com 722 pesos. A soma dos pesos decodificados é 2.048.</p><div class="notice"><strong>Chance por sorteio = (peso / 2048) × 100.</strong><br>O número total de recompensas efetivamente sorteadas por vitória é uma mecânica separada.</div><p class="hint">Se houver <i>n</i> sorteios independentes da mesma tabela, a chance hipotética de pelo menos uma cópia será 1 − (1 − p)<sup>n</sup>. Isso é apenas uma simulação, não uma regra garantida pelo mod.</p></div>
 <div class="panel"><h3>Artes originais do Remaster X15</h3><p class="hint">As 722 imagens foram extraídas da ISO fornecida e agrupadas em 29 arquivos WebP na pasta <code>images/sprites/</code>. Todas mantêm a resolução original de PS1 (102 × 96 px).</p><div class="notice">As artes são identificadas pelo ID interno da ISO, sem usar imagens ou numeração de outras versões de Yu-Gi-Oh!.</div></div></div>
 ${heading('PERGUNTAS FREQUENTES','Como explorar os dados?','')}
 <div class="checklist"><div><strong>Encontrei uma carta, mas não achei o drop.</strong> Ela pode não estar presente em nenhuma tabela de recompensa. Consulte as receitas de fusão e outras condições de obtenção do mod.</div><div><strong>Uma mesma carta aparece em ranks diferentes?</strong> Sim. Os três conjuntos têm probabilidades independentes, e a melhor classificação para farmar pode variar por carta.</div><div><strong>De onde vêm as artes?</strong> Da ISO X15, preservadas em resolução original do PS1. A publicação pública dessas artes está sujeita aos direitos de seus titulares.</div><div><strong>Posso hospedar o site?</strong> Sim. Depois de popular a pasta de imagens, basta publicar o conteúdo desta pasta em GitHub Pages, Netlify ou Cloudflare Pages. Não é necessário Node.js nem banco de dados.</div></div>
 <p class="source-credit" style="margin-top:23px">Projeto independente • Cartas, nomes, fusões e recompensas: ISO Remaster 1.2.1 X15 fornecida pelo usuário • Regras Z-POW/S-POW/S-TEC: identificação do seletor de ranks no executável • Imagens: artes extraídas da ISO X15 (PlayStation 1), direitos dos titulares originais.</p>`;}
function cardDetailsView(){
 const c=byId.get(+S.detailId);
 if(!c)return `<div class="panel"><h2>Carta não encontrada</h2><p>O identificador informado não existe no catálogo X15.</p><button class="btn" data-route="cartas">Ver enciclopédia</button></div>`;
 const [id,n,a,d,t,l,attr]=c;
 const drops=(dropByCard.get(id)||[]).slice().sort((x,y)=>y[3]-x[3]);
 const fuse=(asIngredient.get(id)||[]).slice().sort((x,y)=>atk(y[1])-atk(x[1])).slice(0,18);
 const mak=(asResult.get(id)||[]).slice().sort((x,y)=>Math.max(atk(y[0]),atk(y[1]))-Math.max(atk(x[0]),atk(x[1]))).slice(0,18);
 const bestDrop=drops.slice(0,12);
 const rankNames=['Z-POW','S-POW','S-TEC'];
 return `<div class="card-detail-head"><div><span class="eyebrow">FICHA DA CARTA · #${String(id).padStart(3,'0')}</span><h1>${safe(n)}</h1><p>${safe(typeName[t]||'Tipo '+t)} · ${safe(attrName[attr]||'Atributo '+attr)} · Nível ${l||'—'} · Remaster X15</p></div><button class="btn" data-route="cartas">⌕ Voltar à enciclopédia</button></div>
 <div class="panel card-detail-panel"><div class="modal-grid"><div class="modal-art card-detail-art">${img(id)}</div><div><div class="stats"><div class="stat"><strong>${hasStat(id)?num(a):'—'}</strong><span>ATK</span></div><div class="stat"><strong>${hasStat(id)?num(d):'—'}</strong><span>DEF</span></div><div class="stat"><strong>${l||'—'}</strong><span>NÍVEL</span></div></div>${effectInfo(id)}
 <div class="card-detail-copy"><span>Link direto desta carta</span><code>${safe(cardHref(id))}</code><button class="btn small" data-copy-card="${id}">Copiar link</button></div>
 <h3 class="mini-section-title">◉ Drops por oponente e classificação</h3>
 ${bestDrop.length?`<div class="mini-lines">${bestDrop.map(x=>`<div class="mini-line"><span>${safe(db.opponents[x[0]-1])} · <b>${rankNames[x[1]]}</b></span><strong>${pct(x[3])}</strong></div>`).join('')}</div><p class="hint">Exibindo os 12 melhores resultados por sorteio.</p>`:'<p class="hint">Esta carta não aparece nas tabelas de drop.</p>'}
 <h3 class="mini-section-title">✧ Fusões usando esta carta</h3>
 ${fuse.length?`<div class="mini-lines">${fuse.map(x=>`<div class="mini-line"><span>+ ${cardLink(x[0])} → <b>${cardLink(x[1])}</b></span><small>${statLineCard(x[1])}</small></div>`).join('')}</div>`:'<p class="hint">Não há fusões diretas registradas.</p>'}
 <h3 class="mini-section-title">⌕ Receitas para criar esta carta</h3>
 ${mak.length?`<div class="mini-lines">${mak.map(x=>`<div class="mini-line"><span>${cardLink(x[0])} + ${cardLink(x[1])}</span></div>`).join('')}</div>`:'<p class="hint">Não há receitas cadastradas para obter esta carta por fusão.</p>'}
 <div class="row wrap" style="justify-content:flex-start;margin-top:20px"><button class="btn primary" data-farm="${id}">Comparar todos os drops</button><button class="btn" data-make="${id}">Ver todas as receitas</button></div>
 </div></div></div>`;
}
function cardModal(id){const c=byId.get(+id);if(!c)return;const [nId,n,a,d,t,l,attr]=c;const drops=(dropByCard.get(nId)||[]).slice().sort((x,y)=>y[3]-x[3]).slice(0,6);const fuse=(asIngredient.get(nId)||[]).slice().sort((x,y)=>atk(y[1])-atk(x[1])).slice(0,7);const mak=(asResult.get(nId)||[]).slice().sort((x,y)=>Math.max(atk(y[0]),atk(y[1]))-Math.max(atk(x[0]),atk(x[1]))).slice(0,6);const layer=document.querySelector('#modal-layer');layer.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-top"><div><span class="eyebrow">REGISTRO DO REMASTER · #${String(nId).padStart(3,'0')}</span><h2 id="modal-title" class="modal-title">${safe(n)}</h2><span class="hint">${safe(typeName[t]||'Tipo '+t)} · Nível ${l} · ${safe(attrName[attr]||'Atributo '+attr)}</span></div><button class="btn small" data-close>Fechar ✕</button></div><div class="modal-grid"><div class="modal-art">${img(nId)}</div><div><div class="stats"><div class="stat"><strong>${num(a)}</strong><span>ATK</span></div><div class="stat"><strong>${num(d)}</strong><span>DEF</span></div><div class="stat"><strong>${l}</strong><span>NÍVEL</span></div></div>${effectInfo(nId)}<h4 class="mini-section-title">◉ Onde conseguir (melhores chances por sorteio)</h4><div class="mini-lines">${drops.length?drops.map(x=>`<div class="mini-line"><span>${safe(db.opponents[x[0]-1])} · <b>${db.rankLabels[x[1]]}</b></span><small>${pct(x[3])}</small></div>`).join(''):'<div class="hint">Sem drops registrados nos 39 oponentes.</div>'}</div><h4 class="mini-section-title">✧ Fusões mais fortes utilizando esta carta</h4><div class="mini-lines">${fuse.length?fuse.map(x=>`<div class="mini-line"><span>+ ${cardLink(x[0])} → <b>${cardLink(x[1])}</b></span><small>${statLineCard(x[1])}</small></div>`).join(''):'<div class="hint">Nenhuma fusão direta registrada.</div>'}</div><h4 class="mini-section-title">⌕ Como criar esta carta</h4><div class="mini-lines">${mak.length?mak.map(x=>`<div class="mini-line"><span>${cardLink(x[0])} + ${cardLink(x[1])}</span></div>`).join(''):'<div class="hint">Nenhuma receita encontrada para criar esta carta.</div>'}</div><div class="row wrap" style="margin-top:18px"><button class="btn primary" data-farm="${nId}">Comparar drops</button><button class="btn" data-make="${nId}">Ver receitas</button></div></div></div></section>`;layer.classList.remove('hidden');layer.setAttribute('aria-hidden','false');}
function closeModal(){const l=document.querySelector('#modal-layer');l.classList.add('hidden');l.setAttribute('aria-hidden','true');l.innerHTML='';}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast._timer);toast._timer=setTimeout(()=>el.classList.remove('show'),2800);}
function render(){root.innerHTML=({inicio:home,drops:dropsView,cartas:cardsView,fusoes:fusionView,efeitos:effectsView,guia:guideView,carta:cardDetailsView}[S.route]||home)();}
document.body.addEventListener('click',e=>{
 const target=e.target.closest('[data-route],[data-card],[data-rankhome],[data-page],[data-mode],[data-close],[data-farm],[data-make],#clear-drop,#clear-hand,#mobile-menu,[data-effectpage],[data-copy-card]');if(!target)return;
 if(target.dataset.copyCard){const link=new URL(cardHref(+target.dataset.copyCard),location.href).href;if(navigator.clipboard?.writeText){navigator.clipboard.writeText(link).then(()=>toast('Link copiado!')).catch(()=>toast('Use a barra do navegador para copiar o link.'));}else{toast('Copie o link na barra do navegador.');}return;}
 if(target.id==='mobile-menu'){document.querySelector('.sidebar').classList.toggle('open');return;}
 if(target.hasAttribute('data-close')){closeModal();return;}
 if(target.dataset.card){cardModal(+target.dataset.card);return;}
 if(target.dataset.route){go(target.dataset.route);return;}
 if(target.dataset.rankhome){S.mode='op';S.rank=target.dataset.rankhome;go('drops');return;}
 if(target.dataset.mode){S.mode=target.dataset.mode;render();return;}
 if(target.dataset.page){S.cardPage+=target.dataset.page==='next'?1:-1;render();window.scrollTo({top:170,behavior:'smooth'});return;}
 if(target.dataset.effectpage){S.effectPage+=target.dataset.effectpage==='next'?1:-1;render();window.scrollTo({top:160,behavior:'smooth'});return;}
 if(target.id==='clear-drop'){S.dropTerm='';render();return;}
 if(target.id==='clear-hand'){S.hand=['','','','',''];render();return;}
 if(target.dataset.farm){S.selected=+target.dataset.farm;S.mode='card';S.rank='all';closeModal();go('drops');return;}
 if(target.dataset.make){S.fusionTarget=label(+target.dataset.make);closeModal();go('fusoes');return;}
});
document.querySelector('#modal-layer').addEventListener('click',e=>{if(e.target.id==='modal-layer')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
document.body.addEventListener('change',e=>{const t=e.target;if(!t.dataset.state)return;S[t.dataset.state]=['opponent','selected'].includes(t.dataset.state)?+t.value:t.value;if(t.dataset.state==='cardType')S.cardPage=0;render();});
document.addEventListener('submit',e=>{let form=e.target;if(!form.id)return;e.preventDefault();const f=new FormData(form);
 if(form.id==='quick-search'){const q=String(f.get('q')||'').trim();S.cardSearch=q;S.cardPage=0;go('cartas');return;}
 if(form.id==='drop-form'){S.dropTerm=String(f.get('query')||'');render();return;}
 if(form.id==='effects-form'){S.effectTerm=String(f.get('effectTerm')||'');S.effectKind=String(f.get('effectKind')||'all');S.effectSort=String(f.get('effectSort')||'id');S.effectPage=0;render();return;}
 if(form.id==='cards-form'){S.cardSearch=String(f.get('q')||'');S.cardType=String(f.get('cardType')||'all');S.cardSort=String(f.get('cardSort')||'id');S.minAtk=Math.max(0,Number(f.get('minAtk')||0));S.minDef=Math.max(0,Number(f.get('minDef')||0));S.onlyDocumented=f.has('onlyDocumented');S.cardPage=0;render();return;}
 if(form.id==='fusion-form'){S.fusionA=String(f.get('a')||'');S.fusionB=String(f.get('b')||'');render();if(!parseCard(S.fusionA)||!parseCard(S.fusionB))toast('Escolha duas cartas válidas pelo nome ou número.');return;}
 if(form.id==='target-form'){S.fusionTarget=String(f.get('target')||'');render();return;}
 if(form.id==='hand-form'){S.hand=Array.from({length:5},(_,i)=>String(f.get('h'+i)||''));render();if(!S.hand.some(parseCard))toast('Selecione pelo menos uma carta válida.');return;}
});
const readRoute=()=>{const r=decodeURIComponent(location.hash.slice(1));const m=r.match(/^carta\/(\d{1,3})$/);if(m&&byId.has(+m[1])){S.detailId=+m[1];return 'carta';}return ['inicio','drops','cartas','fusoes','efeitos','guia'].includes(r)?r:null;};
const firstRoute=readRoute();if(firstRoute)S.route=firstRoute;
window.addEventListener('hashchange',()=>{const r=readRoute();if(r){S.route=r;go(r);}});
// Inspeção possível em testes automatizados, sem disponibilizar API de alteração externa.
window.AtlasX15={getStats:()=>({cartas:db.cards.length,fusoes:db.fusions.length,drops:db.drops.length,oponentes:db.opponents.length}),getDrops:(card)=>dropByCard.get(+card)||[],getFusion:(a,b)=>[...(byPair.get([Math.min(+a,+b),Math.max(+a,+b)].join(':'))||[])]};
go(S.route);
})();
