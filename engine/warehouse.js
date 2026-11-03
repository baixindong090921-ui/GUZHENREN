/* 仓库视图不消费时间、随机数或物品；供养预览遵循 guItems 的真实结算顺序。 */
const WAREHOUSE_PAGE_SIZE=30;
const WAREHOUSE_CATEGORIES={gu:'蛊虫',food:'食料',material:'材料',beast:'野兽'};
const newWarehouseView=()=>({tab:'inventory',category:'gu',grade:'all',status:'all',query:'',selected:null,origin:'screen-play'});
let warehouseView=newWarehouseView();
function resetWarehouseView(){warehouseView=newWarehouseView();warehousePage=0;}
function openWarehouse(){
  if(gameState===GAME.BATTLE||gameState===GAME.ENDED||!state.alive||state.upgrade?.battle)return false;
  if(typeof shopReturnWarehouse!=='undefined'&&shopReturnWarehouse&&$('screen-shop').classList.contains?.('hidden')===false){shopReturnWarehouse=false;returnWarehouse();return true;}
  if(typeof forgeReturnWarehouse!=='undefined'&&forgeReturnWarehouse&&$('screen-forge').classList.contains?.('hidden')===false){forgeReturnWarehouse=false;returnWarehouse();return true;}
  if($('warehouse').classList.contains?.('hidden')!==false)
    warehouseView.origin=['screen-forge','screen-shop','screen-catalog'].find(id=>$(id)?.classList.contains?.('hidden')===false)||'screen-play';
  stopTimer();paused=true;warehouseResumeTimer=false;updateControls();
  $('activityPanel')?.classList.add('hidden');
  returnWarehouse();return true;
}
function returnWarehouse(){show('warehouse');renderWarehouse();}
function closeWarehouse(){
  const back=warehouseView.origin;
  show(back);
  if(back==='screen-forge'&&typeof renderForge==='function')renderForge();
  else if(back==='screen-shop'&&typeof renderShop==='function')renderShop();
  else if(back==='screen-catalog'&&typeof renderCatalog==='function')renderCatalog();
  else {renderStatus();updateControls();}
}
function warehouseTab(tab){if(!['inventory','feeding'].includes(tab))return;warehouseView.tab=tab;$('warehouse').classList.remove('detail-open');renderWarehouse();}
function warehouseFilter(key,value){
  if(!['category','grade','status','query'].includes(key))return;
  warehouseView[key]=value;warehousePage=0;warehouseView.selected=null;
  $('warehouse').classList.remove('detail-open');renderWarehouse();
}
function warehousePrev(){warehousePage--;renderWarehouse();}
function warehouseNext(){warehousePage++;renderWarehouse();}
function warehouseBackToList(){$('warehouse').classList.remove('detail-open');}
function warehouseSelect(key){if(!warehouseFiltered().some(x=>x.key===key))return false;warehouseView.selected=key;$('warehouse').classList.add('detail-open');renderWarehouse();return true;}
function warehouseEntries(){
  const groups=new Map();
  for(const item of state.guItems){
    const g=guById(item.id);if(!g)continue;
    const key='gu_'+g.id;
    if(!groups.has(key))groups.set(key,{key,name:g.name,category:'gu',grade:g.rank>=6?'immortal':'mortal',gu:g,items:[],unit:'只'});
    groups.get(key).items.push(item);
  }
  const rows=[...groups.values()].map(g=>({...g,count:g.items.length}));
  (state.unknownGu||[]).forEach((name,i)=>rows.push({key:'unknown_'+i,name,category:'gu',grade:'unknown',count:1,unit:'只',unknown:true}));
  for(const [data,stock,category] of [[FOODS,state.foodStock,'food'],[MATERIALS,state.materialStock,'material']])
    for(const x of data)if(safeCount(stock?.[x.id]))rows.push({key:category+'_'+x.id,name:x.name,category,grade:x.grade||'mortal',count:stock[x.id],unit:x.unit||'份',data:x});
  if(typeof SHOP_GOODS!=='undefined')for(const g of SHOP_GOODS){
    const count=safeCount(state.upgrade?.shopStock?.[g.id]);
    if(!g.stock&&!g.guId&&!g.recipeId&&count)rows.push({key:g.id,name:g.name,category:g.category,grade:g.grade,count,unit:g.unit,good:g});
  }
  return rows;
}
function warehouseFiltered(){
  const v=warehouseView,q=v.query.trim().toLowerCase();
  return warehouseEntries().filter(e=>e.category===v.category&&(v.grade==='all'||e.grade===v.grade)&&
    (!q||[e.name,e.gu?.流派,e.gu?.定位].join(' ').toLowerCase().includes(q))&&
    (v.category!=='gu'||v.status==='all'||e.items?.some(x=>v.status==='active'?x.active:v.status==='idle'?!x.active:x.missed>0)));
}
function feedingPreview(){
  const remaining={...state.foodStock},totals=new Map(),items=[];
  for(const item of state.guItems){
    if(!item.active)continue;
    const g=guById(item.id),food=FOODS.find(f=>f.id===g?.foodId);
    if(!food){items.push({uid:item.uid,name:g?.name||'未知蛊虫',kind:'unknown',text:g?.id===60?'特殊喂养，未纳入普通食料结算':'食物待核实，暂不结算'});continue;}
    if(!totals.has(food.id))totals.set(food.id,{food,demand:0,stock:safeCount(state.foodStock[food.id])});
    totals.get(food.id).demand+=food.amount;
    const enough=safeCount(remaining[food.id])>=food.amount;
    if(enough)remaining[food.id]-=food.amount;
    const kind=enough?'fed':item.missed>=1?'death':'hungry';
    items.push({uid:item.uid,name:g.name,food,kind,text:enough?'预计喂饱':kind==='death'?'再次缺粮将死亡':'缺粮将进入饥饿'});
  }
  return {items,totals:[...totals.values()].map(x=>({...x,shortage:Math.max(0,x.demand-x.stock)}))};
}
function warehouseUseIssue(item){
  const issue=feedingIssue(item.uid);
  if(issue&&!(issue.startsWith('供养位')))return issue;
  if(!item.active)return '加入供养后才能催动';
  if(item.missed)return '处于饥饿状态，需在跨月喂养后恢复';
  if(!m4ActionReady())return '当前无法催动，请先开窍并完成抉择或战斗';
  if(!canUseGuAction(item.id))return '境界、真元、冷却或效果上限不满足，暂不能催动';
  return '';
}
function warehouseUse(uid){const item=state.guItems.find(x=>x.uid===uid);return !!item&&!warehouseUseIssue(item)&&useGuAction(item.id,uid);}
function warehouseGood(key){return typeof SHOP_GOODS==='undefined'?null:SHOP_GOODS.find(g=>g.id===key);}
function warehouseBuy(key){
  const g=warehouseGood(key);if(!g||g.grade==='immortal'&&state.rank<6||!openShop())return false;
  shopView.grade=g.grade;shopView.category=g.category;shopView.query='';shopView.rank='all';shopView.sort='default';
  shopView.page=Math.floor(shopFiltered().findIndex(x=>x.id===key)/SHOP_PAGE_SIZE);
  return selectShopGood(key);
}
function warehouseBuyButton(key,label='前往宝黄天补货'){
  const g=warehouseGood(key);
  return g?'<button onclick="warehouseBuy(\''+key+'\')" '+(g.grade==='immortal'&&state.rank<6?'disabled':'')+'>'+(g.grade==='immortal'&&state.rank<6?'六转后可购买':label)+'</button>':'<small>宝黄天暂无此物供货</small>';
}
function warehouseCatalog(){
  const e=warehouseEntries().find(x=>x.key===warehouseView.selected);if(!e||!openCatalog())return false;
  catalogView.kind=e.category==='gu'?'gu':'material';catalogView.query=e.name;catalogView.rank='all';catalogView.role='all';catalogView.status='all';catalogView.page=0;
  const target=catalogFiltered().find(x=>x.name===e.name);catalogView.selected=target?.id||target?.entryId||null;
  if(target)$('screen-catalog').classList.add('detail-open');renderCatalog();return true;
}
function warehouseRecipeHints(e){
  if(typeof recipeKnown!=='function')return '';
  const recipes=RECIPES.filter(r=>recipeKnown(r.id)&&recipeIsClear(r.id)&&(e.gu?r.inputs.some(x=>x.id===e.gu.id):(r.materials||[]).some(x=>x.id===e.data?.id)||r.optional?.id===e.data?.id&&!!e.data));
  return '<h3>已掌握的炼制用途</h3><p>'+(recipes.length?recipes.map(r=>escapeM4Text(guById(r.output.id).name)).join('、'):'暂无完整掌握的相关蛊方提示。')+'</p>';
}
function renderWarehouseDetail(){
  const e=warehouseFiltered().find(x=>x.key===warehouseView.selected),el=$('warehouseDetail'),esc=escapeM4Text;
  if(!e){el.innerHTML='<p class="detail-empty">选择物品查看详情。相同蛊虫归为一组，供养与催动仍按单只操作。</p>';return;}
  let html='<button class="detail-back" onclick="warehouseBackToList()">返回库存列表</button><small>'+WAREHOUSE_CATEGORIES[e.category]+' · '+(e.grade==='immortal'?'仙级':e.grade==='unknown'?'待核实':'凡级')+'</small><h2>'+esc(e.name)+'</h2><p>持有 '+e.count+' '+e.unit+'</p>';
  if(e.gu){
    const g=e.gu,food=FOODS.find(f=>f.id===g.foodId),preview=feedingPreview();
    html+='<p>'+esc(typeof publicGuDescription==='function'?publicGuDescription(g):g.desc)+'</p><h3>喂养</h3><p>'+(food?esc(food.name)+' · 每只每月 '+food.amount+' '+food.unit:g.id===60?'特殊喂养规则，不消耗普通库存食料':'食物待核实，暂不结算普通食料')+'</p>';
    if(food)html+=warehouseBuyButton('food_'+food.id,'购买所需食料');
    html+='<h3>逐只管理</h3>'+e.items.map(item=>{
      const issue=feedingIssue(item.uid),useIssue=warehouseUseIssue(item),p=preview.items.find(x=>x.uid===item.uid);
      return '<article class="warehouse-instance"><strong>#'+item.uid+' · '+(item.active?'供养中':'闲置')+(item.missed?' · 饥饿':'')+(item.locked?' · 已占用':'')+'</strong>'+(p?'<p class="feed-'+p.kind+'">'+esc(p.text)+'</p>':'<p>闲置期间不消耗食料；再次供养后按现有饥饿记录结算。</p>')+
        '<button onclick="toggleGuFeeding('+item.uid+')" '+(issue?'disabled':'')+'>'+(item.active?'停止供养':'加入供养')+'</button>'+(issue?'<p class="action-warning">'+esc(issue)+'</p>':'')+
        (M4_EXTRA.uses[g.id]?'<button onclick="warehouseUse('+item.uid+')" '+(useIssue?'disabled':'')+'>催动</button>'+(useIssue?'<small>'+esc(useIssue)+'</small>':''):'')+'</article>';
    }).join('');
    html+=warehouseRecipeHints(e);
  }else if(e.unknown)html+='<p>旧存档未识别名称，原样保留。核实前无法供养、交易或催动。</p>';
  else {
    html+='<p>'+esc(e.good?.desc||e.data?.source||'可用于已开放的喂养或炼制。')+'</p>';
    if(e.category==='food'){
      const row=feedingPreview().totals.find(x=>x.food.id===e.data?.id);
      html+='<p>'+(row?'下月需求 '+row.demand+' '+e.unit+' · 缺口 '+row.shortage+' '+e.unit:e.good?'尚未接入专属喂养，不能替代其他食料。':'当前供养中的蛊虫没有此食料需求。')+'</p>';
    }
    if(e.category==='material')html+=warehouseRecipeHints(e);
    if(e.category==='beast')html+='<p>当前可购买和收藏，尚未开放驭兽战斗。</p>';
    html+=warehouseBuyButton(e.key);
  }
  if(e.category!=='beast'&&!e.unknown&&typeof openCatalog==='function')html+='<button onclick="warehouseCatalog()">查看图鉴与出处</button>';
  if(['gu','material'].includes(e.category)&&!e.unknown&&typeof openForge==='function')html+='<button onclick="openForge()">前往炼蛊坊</button>';
  el.innerHTML=html;
}
function renderWarehouseFeeding(){
  const p=feedingPreview(),esc=escapeM4Text;
  $('warehouseFood').innerHTML='<div class="feeding-intro"><h2>下次跨月供养</h2><p>按取得蛊虫的先后顺序分配食料；只计算供养中的蛊。浏览不会结算或购买食料。</p><p>连续两次跨月缺粮将死亡。停止供养不清除饥饿记录；补货后须等待跨月喂养恢复。</p></div><h3>食料需求</h3>'+p.totals.map(x=>'<article class="feeding-food"><div><strong>下月需求：'+esc(x.food.name)+' '+x.demand+' '+x.food.unit+'</strong><p>库存 '+x.stock+' · 缺口 '+x.shortage+' '+x.food.unit+'</p>'+(x.shortage?'<p class="action-warning">当前不足：'+esc(x.food.name)+'</p>':'<p class="feed-fed">该食料充足</p>')+'</div>'+warehouseBuyButton('food_'+x.food.id)+'</article>').join('')+(!p.totals.length?'<p>没有普通食料需求；特殊喂养与待核实食物另行列出。</p>':'')+'<h3>逐只结算预览</h3>'+p.items.map(x=>'<article class="feeding-row"><div><strong>'+esc(x.name)+' #'+x.uid+'</strong><p class="feed-'+x.kind+'">'+esc(x.text)+'</p></div><button onclick="warehouseLocate('+x.uid+')">管理这只蛊</button></article>').join('')+(!p.items.length?'<p>当前没有供养中的蛊虫。</p>':'');
}
function warehouseLocate(uid){const item=state.guItems.find(x=>x.uid===uid);if(!item)return;Object.assign(warehouseView,{tab:'inventory',category:'gu',grade:'all',status:'all',query:''});const key='gu_'+item.id;warehousePage=Math.floor(warehouseFiltered().findIndex(x=>x.key===key)/WAREHOUSE_PAGE_SIZE);warehouseSelect(key);}
function renderWarehouse(){
  ensureGuItems();
  const v=warehouseView,rows=warehouseFiltered(),pages=Math.max(1,Math.ceil(rows.length/WAREHOUSE_PAGE_SIZE)),esc=escapeM4Text;
  warehousePage=Math.max(0,Math.min(pages-1,warehousePage));
  $('warehouseSummary').textContent='蛊虫 '+state.guItems.length+' 只 · 供养 '+state.guItems.filter(x=>x.active).length+' / '+M4.slots(state.attrs.家境)+' 位';
  $('warehouseReturn').textContent=({'screen-forge':'返回炼蛊坊','screen-shop':'返回宝黄天','screen-catalog':'返回图鉴'})[v.origin]||'返回人生';
  $('warehouseCategories').innerHTML=Object.entries(WAREHOUSE_CATEGORIES).map(([key,label])=>'<button onclick="warehouseFilter(\'category\',\''+key+'\')" aria-pressed="'+(key===v.category)+'">'+label+'</button>').join('');
  for(const [id,key] of [['warehouseSearch','query'],['warehouseGrade','grade'],['warehouseStatus','status']])$(id).value=v[key];
  $('warehouseStatus').disabled=v.category!=='gu';
  $('warehouseCount').textContent='当前分类 '+rows.length+' 种 · 同名蛊归组显示';
  $('warehouseGrid').innerHTML=rows.slice(warehousePage*WAREHOUSE_PAGE_SIZE,(warehousePage+1)*WAREHOUSE_PAGE_SIZE).map(e=>'<button class="warehouse-item '+(e.key===v.selected?'selected':'')+'" onclick="warehouseSelect(\''+e.key+'\')"><small>'+(e.gu?e.gu.rank+'转 · '+esc(e.gu.流派):e.grade==='immortal'?'仙级':e.grade==='unknown'?'待核实':'凡级')+'</small><strong>'+esc(e.name)+'</strong><span class="warehouse-quantity">'+e.count+' <small>'+e.unit+'</small></span><small>'+(e.items?'供养 '+e.items.filter(x=>x.active).length+' · 闲置 '+e.items.filter(x=>!x.active).length+' · 饥饿 '+e.items.filter(x=>x.missed).length:e.unknown?'旧档名称已保留':WAREHOUSE_CATEGORIES[e.category])+'</small></button>').join('')||'<p class="detail-empty">此分类没有符合条件的物品。可调整筛选，或前往宝黄天补货。</p>';
  $('warehousePage').textContent=(warehousePage+1)+' / '+pages;$('warehousePrev').disabled=warehousePage===0;$('warehouseNext').disabled=warehousePage===pages-1;
  $('warehouseInventory').classList.toggle('hidden',v.tab!=='inventory');$('warehouseFood').classList.toggle('hidden',v.tab!=='feeding');
  $('warehouseInventoryTab').classList.toggle('active',v.tab==='inventory');$('warehouseFeedingTab').classList.toggle('active',v.tab==='feeding');
  renderWarehouseDetail();renderWarehouseFeeding();
}
