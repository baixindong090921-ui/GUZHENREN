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
  return !!id && state.guItems.some(x=>x.id===id && x.missed===0);
}
function toggleGuFeeding(uid){
  ensureGuItems();
  const item=state.guItems.find(x=>x.uid===Number(uid));
  if (!item || item.locked) return false;
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
  ensureGuItems();
  const food=FOODS.find(f=>f.id===id);
  if (!food || !Number.isSafeInteger(state.money) || state.money<food.price) return false;
  state.money-=food.price;
  state.foodStock[id]=safeCount(state.foodStock[id])+food.amount;
  saveGame(); renderWarehouse(); renderStatus();
  return true;
}
function buyMaterialGu(id){
  ensureGuItems();
  const cost=MATERIAL_GU_PRICES[id];
  if (!cost || state.money<cost) return false;
  state.money-=cost; addGuItem(Number(id));
  saveGame(); renderWarehouse(); renderStatus();
  return true;
}
function buyMaterial(id){
  const material=MATERIALS.find(m=>m.id===id);
  if (!material || state.money<material.price) return false;
  state.money-=material.price;
  state.materialStock[id]=safeCount(state.materialStock[id])+1;
  saveGame(); renderWarehouse(); renderStatus();
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
  if (recipeInputs(recipe).some(x=>x.items.length<x.req.count)) return '蛊虫材料不足';
  return '';
}
function performRecipe(id,useOptional=false){
  const recipe=RECIPES.find(r=>r.id===id);
  const issue=recipeAvailability(recipe,useOptional);
  if (issue) return {ok:false,reason:issue};
  const inputs=recipeInputs(recipe).flatMap(x=>x.items);
  inputs.forEach(x=>x.locked=true);
  let result;
  try {
    state.money-=recipe.cost;
    if (useOptional) state.materialStock[recipe.optional.id]--;
    const success=rng()<recipeChance(recipe,useOptional);
    if (success){
      const ids=new Set(inputs.map(x=>x.uid));
      state.guItems=state.guItems.filter(x=>!ids.has(x.uid));
      for(let i=0;i<recipe.output.count;i++) addGuItem(recipe.output.id);
      syncLegacyGu();
    }
    result={ok:true,success,recipe:recipe.id};
  } finally { inputs.forEach(x=>x.locked=false); }
  saveGame(); renderWarehouse(); renderStatus();
  return result;
}

function renderM4Panels(){
  const foodPanel=document.getElementById('warehouseFood');
  const recipesPanel=document.getElementById('warehouseRecipes');
  if (!foodPanel || !recipesPanel) return;
  const demand={};
  for (const item of state.guItems){
    const food=FOODS.find(f=>f.id===guById(item.id)?.foodId);
    if (item.active && food) demand[food.id]=(demand[food.id]||0)+food.amount;
  }
  const needs=FOODS.filter(f=>demand[f.id]).map(f=>f.name+' '+demand[f.id]+' '+f.unit).join('、') || '无';
  const shortages=FOODS.filter(f=>demand[f.id]>safeCount(state.foodStock[f.id])).map(f=>f.name).join('、') || '无';
  foodPanel.innerHTML='<h3>食物与补给</h3><p>供养位 '+state.guItems.filter(x=>x.active).length+'/'+M4.slots(state.attrs.家境)+' · 元石 '+state.money+'。每月仅扣正在供养的蛊虫。</p>'+
    '<p>下月需求：'+needs+'；当前不足：'+shortages+'。</p>'+
    FOODS.map(f=>`<div class="m4-row"><span>${f.name}：${safeCount(state.foodStock[f.id])} ${f.unit}</span><button onclick="buyFood('${f.id}')" ${state.money<f.price?'disabled':''}>购入 ${f.amount}${f.unit} · ${f.price}元石</button></div>`).join('')+
    '<h3>合炼输入蛊</h3>'+Object.entries(MATERIAL_GU_PRICES).map(([id,price])=>`<div class="m4-row"><span>${guById(id).name} · ${state.guItems.filter(x=>x.id===Number(id)).length} 只</span><button onclick="buyMaterialGu(${id})" ${state.money<price?'disabled':''}>购入 · ${price}元石</button></div>`).join('')+
    MATERIALS.map(m=>`<div class="m4-row"><span>${m.name}：${safeCount(state.materialStock[m.id])}</span><button onclick="buyMaterial('${m.id}')" ${state.money<m.price?'disabled':''}>购入 · ${m.price}元石</button></div>`).join('');
  recipesPanel.innerHTML='<h3>合炼配方</h3>'+RECIPES.map(r=>{
    const inputs=r.inputs.map(x=>`${guById(x.id).name}×${x.count}`).join('＋');
    const issue=recipeAvailability(r);
    return `<div class="m4-recipe"><div>${inputs} → ${guById(r.output.id).name}</div><small>费用 ${r.cost}元石 · 成功率 ${Math.round(recipeChance(r)*100)}% · ${issue||'材料齐备'}；失败仅损失费用</small><button onclick="tryRecipe('${r.id}')" ${issue?'disabled':''}>合炼</button>${r.optional?`<button onclick="tryRecipe('${r.id}',true)" ${recipeAvailability(r,true)?'disabled':''}>用雪獠牙 · ${Math.round(recipeChance(r,true)*100)}%</button>`:''}</div>`;
  }).join('');
}
function tryRecipe(id,useOptional=false){
  const recipe=RECIPES.find(r=>r.id===id), issue=recipeAvailability(recipe,useOptional);
  if (issue) return false;
  const message=recipe.name+'：花费 '+recipe.cost+' 元石，成功率 '+Math.round(recipeChance(recipe,useOptional)*100)+'%。失败仅损失费用。确认合炼？';
  if (typeof confirm==='function' && !confirm(message)) return false;
  const result=performRecipe(id,useOptional);
  if (result.ok) addLog(result.success ? recipe.name+'成功。' : recipe.name+'失败，输入蛊保留。');
  return result.ok;
}
