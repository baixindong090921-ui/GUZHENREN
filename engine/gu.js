/* M4：单只库存为准；state.gu 保留名称集合供 M0–M3 事件与继承兼容。 */
const guById = id => GU.find(g => g.id === Number(id));
const guByName = name => GU.find(g => g.name === name);
const safeCount = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const monthKey = () => state.age * 12 + state.month;
const escapeM4Text = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function validateM4Data(){
  const errors = [], unique = (items,label) => {
    const ids = new Set();
    for (const item of items){
      if (ids.has(item.id)) errors.push(label + '重复 ID：' + item.id);
      ids.add(item.id);
    }
  };
  unique(GU,'蛊虫'); unique(FOODS,'食物'); unique(MATERIALS,'材料'); unique(RECIPES,'配方');
  const foods = new Set(FOODS.map(f=>f.id)), materials = new Set(MATERIALS.map(m=>m.id));
  for (const gu of GU) if (gu.foodId && !foods.has(gu.foodId)) errors.push('食物引用不存在：'+gu.name);
  for (const r of RECIPES){
    if (!guById(r.output.id) || !Number.isInteger(r.output.count) || r.output.count < 1) errors.push('产物无效：'+r.id);
    for (const x of r.inputs) if (!guById(x.id) || !Number.isInteger(x.count) || x.count < 1) errors.push('输入无效：'+r.id);
    if (r.optional && !materials.has(r.optional.id)) errors.push('辅料无效：'+r.id);
    if (!Number.isSafeInteger(r.cost) || r.cost < 0 || !(r.base > 0 && r.base <= 1)) errors.push('费用或概率无效：'+r.id);
  }
  for (const id of M4_EXTRA.pool){
    const gu=guById(id), price=M4_EXTRA.prices[id];
    if (!gu || gu.rank!==1 || !Number.isSafeInteger(price) || price<1 || !M4_EXTRA.uses[id]) errors.push('普通蛊市条目无效：'+id);
  }
  for (const id of Object.keys(M4_EXTRA.uses)){
    const use=M4_EXTRA.uses[id];
    if (!guById(id) || guById(id).rank!==1 || !(use.cost>0 && use.cost<=1) ||
      use.outcomes?.some(o=>!Number.isFinite(o.weight) || o.weight<0) ||
      use.outcomes?.every(o=>o.weight===0)) errors.push('主动用途无效：'+id);
  }
  return errors;
}

function syncLegacyGu(){
  state.gu = new Set(state.guItems.map(item => guById(item.id)?.name).filter(Boolean).concat(state.unknownGu || []));
}
function addGuItem(id, active = false){
  const gu = guById(id);
  if (!gu) return null;
  state.guSeq = safeCount(state.guSeq) + 1;
  const item = {uid:state.guSeq,id:gu.id,active:!!active,missed:0,locked:false};
  state.guItems.push(item);
  state.gu.add(gu.name);
  state.seenGu.add(gu.name);
  return item;
}
function ensureGuItems(){
  if (!Array.isArray(state.guItems)) state.guItems = [];
  if (!Array.isArray(state.unknownGu)) state.unknownGu = [];
  for (const name of state.gu){
    const gu = guByName(name);
    if (gu && !state.guItems.some(x=>x.id===gu.id)) addGuItem(gu.id);
    if (!gu && !state.unknownGu.includes(name)) state.unknownGu.push(name);
  }
  if (!state.foodStock || typeof state.foodStock !== 'object') state.foodStock = {};
  if (!state.materialStock || typeof state.materialStock !== 'object') state.materialStock = {};
  state.guSeq = Math.max(safeCount(state.guSeq),...state.guItems.map(x=>safeCount(x.uid)),0);
}
function initM4Life(){
  state.guItems=[]; state.unknownGu=[]; state.guSeq=0;
  state.seenGu=new Set();
  state.foodStock={}; state.materialStock={}; state.lastFeedMonth=null;
  state.m4ExploreDay=null; state.m4CaptureYear=null; state.m4CaptureCount=0;
  state.m4MarketMonth=null; state.m4MarketIds=[]; state.m4MarketBought=[];
  state.m4Strength={black:0,white:0};
  ensureGuItems();
}
function giveInitialFood(){
  ensureGuItems();
  const amount = M4.initialFood(state.attrs.家境);
  for (const item of state.guItems){
    const gu=guById(item.id);
    if (gu.foodId && FOODS.some(f=>f.id===gu.foodId)){
      state.foodStock[gu.foodId]=safeCount(state.foodStock[gu.foodId])+amount*FOODS.find(f=>f.id===gu.foodId).amount;
    }
  }
}
function isGuUsableByName(name){
  ensureGuItems();
  const id=guByName(name)?.id;
  return !!id && !!usableGuItem(id);
}
function usableGuItem(id){
  ensureGuItems();
  return state.guItems.find(x=>x.id===Number(id) && x.active && x.missed===0 && !x.locked) || null;
}
function toggleGuFeeding(uid){
  if(gameState===GAME.BATTLE||!state.alive)return false;
  ensureGuItems();
  const item=state.guItems.find(x=>x.uid===Number(uid));
  if (!item || item.locked || !item.active&&guById(item.id)?.available===false) return false;
  if (!item.active && state.guItems.filter(x=>x.active).length >= M4.slots(state.attrs.家境)) return false;
  item.active=!item.active;
  saveGame(); renderWarehouse(); renderStatus();
  return true;
}
function settleMonthlyFeeding(){
  ensureGuItems();
  const key=monthKey();
  if (state.lastFeedMonth===key) return [];
  state.lastFeedMonth=key;
  const messages=[];
  for (const item of [...state.guItems]){
    if (!item.active) continue;
    const gu=guById(item.id), food=FOODS.find(f=>f.id===gu?.foodId);
    if (!food) continue; // 春秋蝉等特殊蛊不走普通库存。
    const needed=safeCount(food.amount);
    if (safeCount(state.foodStock[food.id]) >= needed){
      state.foodStock[food.id]-=needed; item.missed=0;
      messages.push(gu.name+'喂养完成');
    } else {
      item.missed=safeCount(item.missed)+1;
      if (item.missed>=2){
        state.guItems=state.guItems.filter(x=>x.uid!==item.uid);
        messages.push(gu.name+'连续缺粮，已死亡');
      } else messages.push(gu.name+'缺粮，进入饥饿状态');
    }
  }
  syncLegacyGu();
  return messages;
}
function buyFood(id){
  if(gameState===GAME.BATTLE||!state.alive)return false;
  ensureGuItems();
  const food=FOODS.find(f=>f.id===id);
  if (food?.available===false)return false;
  if(food?.grade==='immortal'){if(typeof buyShopGood==='undefined')return false;const result=buyShopGood('food_'+id);if(result.ok){saveGame();renderWarehouse();renderStatus();}return result.ok;}
  if (!food || !Number.isSafeInteger(state.money) || state.money<food.price) return false;
  state.money-=food.price;
  state.foodStock[id]=safeCount(state.foodStock[id])+food.amount;
  saveGame(); renderWarehouse(); renderStatus();
  return true;
}
function buyMaterialGu(id){
  if(gameState===GAME.BATTLE||!state.alive)return false;
  ensureGuItems();
  const cost=MATERIAL_GU_PRICES[id];
  if (!cost || state.money<cost) return false;
  state.money-=cost; addGuItem(Number(id));
  saveGame(); renderWarehouse(); renderStatus();
  return true;
}
function buyMaterial(id){
  if(gameState===GAME.BATTLE||!state.alive)return false;
  const material=MATERIALS.find(m=>m.id===id);
  if(material?.available===false || material?.grade==='unknown')return false;
  if(material?.grade==='immortal'){if(typeof buyShopGood==='undefined')return false;const result=buyShopGood('material_'+id);if(result.ok){saveGame();renderWarehouse();renderStatus();}return result.ok;}
  if (!material || state.money<material.price) return false;
  state.money-=material.price;
  state.materialStock[id]=safeCount(state.materialStock[id])+1;
  saveGame(); renderWarehouse(); renderStatus();
  return true;
}
function m4ActionReady(){ return state.alive && state.rank >= 1 && state.资质 && gameState !== GAME.CHOOSING && gameState !== GAME.ENDED && gameState !== GAME.BATTLE; }
function refreshM4Market(){
  if (!m4ActionReady()) return;
  const key=monthKey();
  if (state.m4MarketMonth===key && state.m4MarketIds.length) return;
  const pool=[...M4_EXTRA.pool];
  state.m4MarketIds=[];
  while (pool.length && state.m4MarketIds.length<2){
    state.m4MarketIds.push(pool.splice(Math.floor(rng()*pool.length),1)[0]);
  }
  state.m4MarketBought=[]; state.m4MarketMonth=key;
  saveGame();
}
function buyCommonGu(id){
  refreshM4Market();
  id=Number(id);
  const price=M4_EXTRA.prices[id];
  if (!m4ActionReady() || !state.m4MarketIds.includes(id) || state.m4MarketBought.includes(id) || !Number.isSafeInteger(price) || state.money<price) return false;
  state.money-=price;
  state.m4MarketBought.push(id);
  addGuItem(id);
  addLog('蛊市购得 '+escapeM4Text(guById(id).name)+'。已入仓库，供养后可催动。');
  saveGame(); renderWarehouse(); renderStatus();
  return true;
}
function exploreForGu(){
  if (!m4ActionReady()) return {ok:false,reason:'尚未开窍'};
  if (state.resources.体力 < state.resourceMax.体力*M4_EXTRA.exploreCost) return {ok:false,reason:'体力不足'};
  if (state.m4ExploreDay!==null && gameDayNumber()-state.m4ExploreDay<M4_EXTRA.exploreCooldown) return {ok:false,reason:'尚在冷却'};
  if (state.m4CaptureYear!==state.age){ state.m4CaptureYear=state.age; state.m4CaptureCount=0; }
  if (state.m4CaptureCount>=M4_EXTRA.captureYearCap) return {ok:false,reason:'本年捕获已达上限'};
  state.m4ExploreDay=gameDayNumber();
  applyEffect({体力:-M4_EXTRA.exploreCost});
  let result={ok:true,found:false,caught:false};
  if (rng()<M4_EXTRA.findChance(state.attrs.运气)){
    result.found=true;
    if (rng()<M4_EXTRA.catchChance(state.attrs.体质)){
      const id=M4_EXTRA.pool[Math.floor(rng()*M4_EXTRA.pool.length)];
      addGuItem(id); state.m4CaptureCount++;
      result={ok:true,found:true,caught:true,id};
      addLog('寻蛊成功：获得 '+escapeM4Text(guById(id).name)+'。已入仓库，供养后可催动。');
    } else {
      applyEffect({血条:-(.05+rng()*.07)});
      addLog('发现野蛊，但捕获失败，受到轻伤。');
    }
  } else addLog('野外寻蛊：没有发现可捕获的蛊虫。');
  const death=checkDeath();
  if (death) endGame('寻蛊时伤重陨落。',death);
  else {saveGame();renderWarehouse();renderAttrs();renderStatus();}
  return result;
}
function canUseGuAction(id){
  const config=M4_EXTRA.uses[id], last=state.cooldowns['m4use_'+id];
  return !!config && state.alive && state.rank>=1 && !!state.资质 && gameState!==GAME.ENDED && !!usableGuItem(id) &&
    (id!==2 || state.rank===1) &&
    (!Number.isFinite(last) || gameDayNumber()-last>=M4_EXTRA.useCooldown) &&
    state.resources.真元>=state.resourceMax.真元*config.cost &&
    (!config.strength || state.m4Strength[config.strength]<M4_EXTRA.strengthCap);
}
function useGuAction(id,uid=null){
  id=Number(id);
  if (!m4ActionReady() || !M4_EXTRA.uses[id]) return false;
  const config=M4_EXTRA.uses[id], gu=guById(id);
  const selected=uid===null?usableGuItem(id):state.guItems.find(x=>x.uid===uid&&x.id===id&&x.active&&!x.missed&&!x.locked);
  if(!selected)return false;
  const ready=()=>canUseGuAction(id)&&state.guItems.some(x=>x.uid===selected.uid&&x.id===id&&x.active&&!x.missed&&!x.locked);
  closeWarehouse();
  show('screen-play');
  fireChoice({id:'m4_use_'+id,text:config.title+'：是否催动'+gu.name+'？',choices:[
    {id:'m4_use_'+id+'_yes',text:'催动（真元 -'+Math.round(config.cost*100)+'%）'+(config.consume||config.strength?'，消耗这只蛊':''),need:ready,needText:'需供养中的健康蛊、真元及冷却完成',cost:{真元:-config.cost},
      effect:config.effect,outcomes:config.outcomes,result:config.desc,act:()=>{
        state.cooldowns['m4use_'+id]=gameDayNumber();
        if (config.strength)state.m4Strength[config.strength]++;
        if(config.strength||config.consume){state.guItems=state.guItems.filter(x=>x.uid!==selected.uid);syncLegacyGu();}
        if ([9,11,12].includes(id)) applyEffect({体力:Math.min(.05,(state.m4Strength.black+state.m4Strength.white)*.01)});
      }},
    {id:'m4_use_'+id+'_no',text:'暂不催动',result:'你收起蛊虫，保留真元。'},
  ]});
  return true;
}
function recipeChance(recipe, useOptional=false){
  return M4.recipeChance(recipe.base+(useOptional&&recipe.optional?.bonus||0),state.attrs.智力);
}
function recipeInputs(recipe){
  return recipe.inputs.map(req=>({req,items:state.guItems.filter(x=>x.id===req.id&&!x.locked).slice(0,req.count)}));
}
function recipeAvailability(recipe,useOptional=false){
  ensureGuItems();
  if (!recipe) return '配方不存在';
  if (state.rank<recipe.minRank) return '境界不足';
  if (state.money<recipe.cost) return '元石不足';
  if (useOptional && (!recipe.optional || safeCount(state.materialStock[recipe.optional.id])<1)) return '辅料不足';
  if ((recipe.materials||[]).some(m=>safeCount(state.materialStock[m.id])<m.count))return '炼制材料不足';
  if (recipeInputs(recipe).some(x=>x.items.length<x.req.count)) return '蛊虫材料不足';
  return '';
}
function renderM4Panels(){
  const foodPanel=document.getElementById('warehouseFood');
  const recipesPanel=document.getElementById('warehouseRecipes');
  if (!foodPanel || !recipesPanel) return;
  refreshM4Market();
  const demand={};
  for (const item of state.guItems){
    const food=FOODS.find(f=>f.id===guById(item.id)?.foodId);
    if (item.active && food) demand[food.id]=(demand[food.id]||0)+food.amount;
  }
  const needs=FOODS.filter(f=>demand[f.id]).map(f=>f.name+' '+demand[f.id]+' '+f.unit).join('、') || '无';
  const shortages=FOODS.filter(f=>demand[f.id]>safeCount(state.foodStock[f.id])).map(f=>f.name).join('、') || '无';
  foodPanel.innerHTML='<h3>食物与补给</h3><p>供养位 '+state.guItems.filter(x=>x.active).length+'/'+M4.slots(state.attrs.家境)+' · 元石 '+state.money+'。每月仅扣正在供养的蛊虫。</p>'+
    '<p>下月需求：'+needs+'；当前不足：'+shortages+'。</p>'+
    '<h3>获取蛊虫</h3><p>野外寻蛊每 30 日一次，消耗 8% 体力；本年已捕获 '+state.m4CaptureCount+'/'+M4_EXTRA.captureYearCap+'。蛊市每月刷新。</p>'+
    '<div class="m4-row"><button onclick="exploreForGu()" '+(!m4ActionReady() || state.resources.体力<state.resourceMax.体力*M4_EXTRA.exploreCost || state.m4CaptureYear===state.age && state.m4CaptureCount>=M4_EXTRA.captureYearCap || state.m4ExploreDay!==null && gameDayNumber()-state.m4ExploreDay<M4_EXTRA.exploreCooldown?'disabled':'')+'>野外寻蛊</button></div>'+
    state.m4MarketIds.map(id=>'<div class="m4-row"><span>'+escapeM4Text(guById(id).name)+' · '+M4_EXTRA.prices[id]+' 元石</span><button onclick="buyCommonGu('+id+')" '+(!m4ActionReady() || state.money<M4_EXTRA.prices[id] || state.m4MarketBought.includes(id)?'disabled':'')+'>'+(state.m4MarketBought.includes(id)?'本月已购':'购买')+'</button></div>').join('')+
    '<p>永久气力：黑豕 '+state.m4Strength.black+' 层 · 白豕 '+state.m4Strength.white+' 层（每类最多 '+M4_EXTRA.strengthCap+' 层）</p>'+
    FOODS.filter(f=>f.available!==false).map(f=>`<div class="m4-row"><span>${f.name}：${safeCount(state.foodStock[f.id])} ${f.unit}</span><button onclick="buyFood('${f.id}')" ${(f.grade==='immortal'?(state.rank<6||upgradeState().immortalMoney<f.price):state.money<f.price)?'disabled':''}>购入 ${f.amount}${f.unit} · ${f.price}${f.grade==='immortal'?'仙元':'元石'}</button></div>`).join('')+
    '<h3>合炼输入蛊</h3>'+Object.entries(MATERIAL_GU_PRICES).map(([id,price])=>`<div class="m4-row"><span>${guById(id).name} · ${state.guItems.filter(x=>x.id===Number(id)).length} 只</span><button onclick="buyMaterialGu(${id})" ${state.money<price?'disabled':''}>购入 · ${price}元石</button></div>`).join('')+
    MATERIALS.filter(m=>m.available!==false).map(m=>`<div class="m4-row"><span>${m.name}：${safeCount(state.materialStock[m.id])}</span><button onclick="buyMaterial('${m.id}')" ${state.money<m.price?'disabled':''}>购入 · ${m.price}元石</button></div>`).join('');
  if(typeof renderForgeEntry==='function')renderForgeEntry();
}
