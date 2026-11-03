/* 阅读图鉴不推进时间、不获得蛊虫、不解锁蛊方或前世记忆。 */
let catalogView={query:'',kind:'gu',status:'all',page:0,back:'screen-start'};
const CATALOG_PAGE_SIZE=24;
function catalogGu(entry){return GU.find(g=>g.name===entry.name||entry.aliases.includes(g.name));}
function catalogEntries(){
  if(catalogView.kind==='material')return [
    ...CONTENT_REFERENCE_MATERIALS,
    ...FOODS.map(f=>({...f,entryId:'food_'+f.id,type:'食料',available:f.available!==false})),
    ...MATERIALS.map(m=>({...m,entryId:'material_'+m.id,type:'材料',available:m.available!==false})),
    ...SHOP_GOODS.filter(g=>!g.stock&&['food','material'].includes(g.category)).map(g=>({...g,entryId:g.id,type:g.category==='food'?'食料':'材料',source:g.desc,available:true}))
  ];
  const entries=GU_CATALOG.map(e=>({...e,gu:catalogGu(e)}));
  // 旧库存仍保留，但旧游戏条目不能当作原文证据。
  for(const gu of GU)if(!entries.some(e=>e.gu?.id===gu.id))entries.push({id:'legacy_'+gu.id,name:gu.name,aliases:[],facts:[],gu,note:'旧游戏条目；原文名称或别名待核实。'});
  return entries.map(e=>({...e,available:!!e.gu&&e.gu.available!==false}));
}
function catalogFiltered(){
  const q=catalogView.query.trim().toLowerCase();
  return catalogEntries().filter(e=>
    (catalogView.status==='all'||(catalogView.status==='available'?e.available:!e.available))&&
    (!q||[e.name,...(e.aliases||[]),e.gu?.desc,e.source?.chapter,typeof e.source==='string'?e.source:'',...(e.facts||[]).map(i=>GU_FACTS[i].summary)].join(' ').toLowerCase().includes(q)));
}
function openCatalog(){
  if(gameState===GAME.BATTLE||state.upgrade?.battle)return false;
  catalogView.back=['screen-start','screen-play','screen-shop','screen-forge'].find(id=>!$(id).classList.contains('hidden'))||'screen-play';
  stopTimer();paused=true;updateControls();show('screen-catalog');renderCatalog();return true;
}
function closeCatalog(){show(catalogView.back);if(catalogView.back==='screen-play'){renderStatus();updateControls();}}
function catalogFilter(key,value){if(!['query','kind','status'].includes(key))return;catalogView[key]=value;catalogView.page=0;renderCatalog();}
function catalogPage(delta){catalogView.page+=delta;renderCatalog();}
function renderCatalog(){
  $('catalogSearch').value=catalogView.query;$('catalogKind').value=catalogView.kind;$('catalogStatus').value=catalogView.status;
  const items=catalogFiltered(),pages=Math.max(1,Math.ceil(items.length/CATALOG_PAGE_SIZE));
  catalogView.page=Math.max(0,Math.min(pages-1,catalogView.page));
  $('catalogCount').textContent='原文索引 '+GU_CATALOG.length+' 个名称组（含别名与不同阶段）；当前筛选 '+items.length+' 条';
  $('catalogGrid').innerHTML=items.slice(catalogView.page*CATALOG_PAGE_SIZE,(catalogView.page+1)*CATALOG_PAGE_SIZE).map(e=>{
    const esc=escapeM4Text;
    if(catalogView.kind==='material')return '<article class="shop-card"><h2>'+esc(e.name)+'</h2><p>'+e.type+' · '+(e.available?'已接入':'待核实，暂不出售')+' · '+(e.grade==='immortal'?'仙级':e.grade==='unknown'?'等级待核实':'凡级')+'</p><p>'+esc(e.source||'')+'</p></article>';
    const g=e.gu;
    const facts=(e.facts||[]).map(i=>GU_FACTS[i]);
    // 知识玩法中的完整蛊方仍在炼蛊坊查看，不通过百科免费解锁。
    const visible=facts.filter(f=>!/(合炼|逆炼|进阶|路线|炼制材料)/.test(f.field));
    const origin=e.source?esc(e.source.volume+' · '+e.source.chapter+' · 原文第'+e.source.line+'行'):'原文出处待核实';
    return '<article class="shop-card"><h2>'+esc(e.name)+'</h2><p>'+(e.available?'已接入游戏':'待核实 / 待接入，暂不出售')+'</p><p>'+(g?g.rank+'转 · '+esc(g.流派)+' · '+esc(g.定位):'具体转数、流派：待核实')+'</p>'+
      (g?'<p>'+esc(g.desc)+'</p><p>游戏用途：'+(BATTLE_GU[g.id]?esc(battleEffectText(g.id)):M4_EXTRA.uses[g.id]?esc(M4_EXTRA.uses[g.id].title):'可收录；专属主动机制尚未接入')+'</p>':'')+
      (g?.sourceLines?'<small>本轮原文复核：第'+g.sourceLines.join('、')+'行</small>':'')+
      (e.note?'<p>'+esc(e.note)+'</p>':'')+
      (visible.length?'<details><summary>已核实设定（'+visible.length+'项）</summary>'+visible.map(f=>'<p><strong>'+esc(f.field)+'</strong>：'+esc(f.summary)+(f.caveat?' 注意：'+esc(f.caveat):'')+'<br><small>原文第 '+f.lines.join('、')+' 行</small></p>').join('')+'</details>':'<p>详细属性待核实。</p>')+
      (facts.length>visible.length?'<p>炼制或进阶线索已收录；可用的完整蛊方请在游戏中获取。</p>':'')+'<small>'+origin+'</small></article>';
  }).join('')||'<p>没有匹配条目。</p>';
  $('catalogPage').textContent=(catalogView.page+1)+' / '+pages;
  $('catalogPrev').disabled=catalogView.page===0;$('catalogNext').disabled=catalogView.page===pages-1;
}
