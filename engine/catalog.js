/* 阅读图鉴不推进时间、不获得蛊虫、不解锁蛊方或前世记忆。 */
let catalogView={query:'',kind:'gu',status:'all',page:0,selected:null,rank:'all',role:'all',back:'screen-start'};
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
    (catalogView.rank==='all'||(catalogView.rank==='unknown'?!e.gu:Number(catalogView.rank)===e.gu?.rank))&&
    (catalogView.role==='all'||e.gu?.定位===catalogView.role)&&
    (catalogView.status==='all'||(catalogView.status==='available'?e.available:!e.available))&&
    (!q||[e.name,...(e.aliases||[]),e.gu?.desc,e.source?.chapter,typeof e.source==='string'?e.source:'',...(e.facts||[]).map(i=>GU_FACTS[i].summary)].join(' ').toLowerCase().includes(q)));
}
function openCatalog(){
  if(gameState===GAME.BATTLE||state.upgrade?.battle)return false;
  catalogView.back=['screen-start','screen-play','screen-shop','screen-forge','warehouse'].find(id=>!$(id).classList.contains('hidden'))||'screen-play';
  stopTimer();paused=true;updateControls();$('screen-catalog').classList.remove('detail-open');show('screen-catalog');renderCatalog();return true;
}
function closeCatalog(){if(catalogView.back==='warehouse'){returnWarehouse();return;}show(catalogView.back);if(catalogView.back==='screen-play'){renderStatus();updateControls();}}
function catalogFilter(key,value){if(!['query','kind','status','rank','role'].includes(key))return;catalogView[key]=value;catalogView.page=0;catalogView.selected=null;if(key==='kind'){catalogView.rank='all';catalogView.role='all';}$('screen-catalog').classList.remove('detail-open');renderCatalog();}
function catalogPage(delta){catalogView.page+=delta;catalogView.selected=null;renderCatalog();}
function renderCatalog(){
  $('catalogSearch').value=catalogView.query;$('catalogKind').value=catalogView.kind;$('catalogStatus').value=catalogView.status;
  $('catalogRank').value=catalogView.rank;$('catalogRole').value=catalogView.role;
  $('catalogRank').disabled=catalogView.kind!=='gu';$('catalogRole').disabled=catalogView.kind!=='gu';
  const items=catalogFiltered(),pages=Math.max(1,Math.ceil(items.length/CATALOG_PAGE_SIZE));
  catalogView.page=Math.max(0,Math.min(pages-1,catalogView.page));
  $('catalogCount').textContent='原文索引 '+GU_CATALOG.length+' 个名称组（含别名与不同阶段）；当前筛选 '+items.length+' 条';
  $('catalogGrid').innerHTML=items.slice(catalogView.page*CATALOG_PAGE_SIZE,(catalogView.page+1)*CATALOG_PAGE_SIZE).map(e=>{
    const id=e.id||e.entryId;
    return '<button class="catalog-row '+(catalogView.selected===id?'selected':'')+'" onclick="selectCatalogEntry(\''+id+'\')"><span><strong>'+escapeM4Text(e.name)+'</strong><small>'+(e.gu?e.gu.rank+'转 · '+escapeM4Text(e.gu.定位):e.type||'转数待核实')+'</small></span><span class="entry-tags"><small>'+((e.facts||[]).length?'部分设定已核实':e.sourceLines?'有原文出处':'资料待完善')+'</small><small>'+catalogPlayLabel(e)+'</small></span></button>';
  }).join('')||'<p>没有匹配条目。</p>';
  const selected=items.find(e=>(e.id||e.entryId)===catalogView.selected);
  $('catalogDetail').innerHTML=selected?'<button class="detail-back" onclick="catalogBackToList()">返回列表</button>'+catalogDetailHtml(selected)+catalogDetailActions(selected):'<p class="detail-empty">选择一个条目，查看用途、喂养与出处。</p>';
  $('catalogPage').textContent=(catalogView.page+1)+' / '+pages;
  $('catalogPrev').disabled=catalogView.page===0;$('catalogNext').disabled=catalogView.page===pages-1;
}

function catalogDetailHtml(e){
    const esc=escapeM4Text;
    if(catalogView.kind==='material')return '<article class="shop-card"><h2>'+esc(e.name)+'</h2><p>'+e.type+' · '+(e.available?'已接入':'待核实，暂不出售')+' · '+(e.grade==='immortal'?'仙级':e.grade==='unknown'?'等级待核实':'凡级')+'</p><p>'+esc(e.source||'')+'</p></article>';
    const g=e.gu;
    const facts=(e.facts||[]).map(i=>GU_FACTS[i]);
    // 知识玩法中的完整蛊方仍在炼蛊坊查看，不通过百科免费解锁。
    const visible=facts.filter(f=>!/(合炼|逆炼|进阶|路线|炼制材料)/.test(f.field));
    const origin=e.source?esc(e.source.volume+' · '+e.source.chapter+' · 原文第'+e.source.line+'行'):'原文出处待核实';
    return '<article class="shop-card"><h2>'+esc(e.name)+'</h2><p>'+(e.available?'已接入游戏':'待核实 / 待接入，暂不出售')+'</p><p>'+(g?g.rank+'转 · '+esc(g.流派)+' · '+esc(g.定位):'具体转数、流派：待核实')+'</p>'+
      (g?'<p>'+esc(publicGuDescription(g))+'</p><p>游戏用途：'+(BATTLE_GU[g.id]?esc(battleEffectText(g.id)):M4_EXTRA.uses[g.id]?esc(M4_EXTRA.uses[g.id].title):'可收录；专属主动机制尚未接入')+'</p>':'')+
      (g?.sourceLines?'<small>本轮原文复核：第'+g.sourceLines.join('、')+'行</small>':'')+
      (e.note?'<p>'+esc(e.note)+'</p>':'')+
      (visible.length?'<details><summary>已核实设定（'+visible.length+'项）</summary>'+visible.map(f=>'<p><strong>'+esc(f.field)+'</strong>：'+esc(f.summary)+(f.caveat?' 注意：'+esc(f.caveat):'')+'<br><small>原文第 '+f.lines.join('、')+' 行</small></p>').join('')+'</details>':'<p>详细属性待核实。</p>')+
      (facts.length>visible.length?'<p>炼制或进阶线索已收录；可用的完整蛊方请在游戏中获取。</p>':'')+'<small>'+origin+'</small></article>';

}

function catalogPlayLabel(e){if(!e.available)return '暂不出售 / 待接入';if(e.gu&&(BATTLE_GU[e.gu.id]||M4_EXTRA.uses[e.gu.id]))return '可购买 · 可催动';return e.gu?'可购买 · 专属玩法未开放':'可购买';}
function selectCatalogEntry(id){if(!catalogFiltered().some(e=>(e.id||e.entryId)===id))return false;catalogView.selected=id;$('screen-catalog').classList.add('detail-open');renderCatalog();return true;}
function catalogBackToList(){$('screen-catalog').classList.remove('detail-open');}
function catalogGood(e){return SHOP_GOODS.find(g=>e.gu?g.guId===e.gu.id:g.id===e.entryId);}
function catalogDetailActions(e){
 const g=catalogGood(e),recipe=e.gu&&RECIPES.find(r=>r.output.id===e.gu.id&&recipeKnown(r.id));
 return (e.gu?guRouteHtml(e.gu.id):'')+'<div class="detail-actions">'+(g&&state.alive&&state.资质&& (g.grade!=='immortal'||state.rank>=6)?'<button onclick="catalogGoShop()">前往购买</button>':'')+(recipe&&state.alive?'<button onclick="catalogGoForge()">查看已掌握蛊方</button>':'')+'</div>';
}
function catalogSelected(){return catalogFiltered().find(e=>(e.id||e.entryId)===catalogView.selected);}
function catalogGoShop(){const e=catalogSelected(),g=e&&catalogGood(e);if(!g||g.grade==='immortal'&&state.rank<6||!openShop())return false;shopView.grade=g.grade;shopView.category=g.category;shopView.query='';shopView.rank='all';shopView.page=Math.floor(shopFiltered().findIndex(x=>x.id===g.id)/SHOP_PAGE_SIZE);selectShopGood(g.id);return true;}
function catalogGoForge(){const e=catalogSelected(),r=e?.gu&&RECIPES.find(r=>r.output.id===e.gu.id&&recipeKnown(r.id));if(!r||!openForge())return false;chooseForgeTarget(r.id);return true;}
