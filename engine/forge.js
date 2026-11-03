/* 实际投入决定炼制，知识只影响界面提示。 */
function forgeMaterials(){
  return MATERIALS.map(m=>({id:m.id,name:m.name,grade:m.grade||'mortal',stock:safeCount(state.materialStock?.[m.id])})).concat(
    typeof SHOP_GOODS==='undefined'?[]:SHOP_GOODS.filter(g=>g.category==='material'&&!g.stock).map(g=>({id:g.id,name:g.name,grade:g.grade,stock:safeCount(upgradeState().shopStock[g.id])})));
}
function forgeMaterialCount(id){return forgeMaterials().find(m=>m.id===id)?.stock||0;}
function selectedRecipe(uids,materials={}){
  const counts={};for(const uid of uids){const x=state.guItems.find(i=>i.uid===uid);if(!x)return null;counts[x.id]=(counts[x.id]||0)+1;}
  return RECIPES.find(r=>r.inputs.length===Object.keys(counts).length&&r.inputs.every(x=>counts[x.id]===x.count)&&
    (r.materials||[]).every(x=>materials[x.id]===x.count)&&Object.entries(materials).every(([id,n])=>n===0||(r.materials||[]).some(x=>x.id===id&&x.count===n)||r.optional?.id===id&&n===1))||null;
}
function forgeInputsIssue(uids,materials={}){
  if(saveReadBlocked)return '存档损坏尚未处理，无法炼制';
  if(!activityReady())return '需开窍且不在战斗或抉择中';
  if(!Array.isArray(uids)||new Set(uids).size!==uids.length)return '请选择不重复的实际蛊虫';
  if(!materials||typeof materials!=='object'||Array.isArray(materials))return '材料输入无效';
  if(!uids.length&&!Object.values(materials).some(n=>n>0))return '请先投入蛊虫或材料';
  for(const uid of uids){const x=state.guItems.find(x=>x.uid===uid);if(!x||x.locked)return '投入的蛊虫不存在或被占用';if(guById(x.id).available===false)return '此蛊资料待核实，暂不能炼制';if(x.id===60)return '春秋蝉不可作为普通炼制材料';if(guById(x.id).rank>state.rank)return '投入蛊虫转数超过当前境界';}
  for(const [id,n] of Object.entries(materials)){const m=forgeMaterials().find(x=>x.id===id);if(!m||!Number.isSafeInteger(n)||n<0||n>m.stock)return '材料不足或数量无效';if(n&&m.grade==='unknown')return '材料等级待核实';if(n&&m.grade==='immortal'&&state.rank<6)return '六转后才可处理仙材';}
  return '';
}
function forgeQuote(uids=[],materials={}){
  const u=upgradeState(),predict=cost=>{const loss=soulRisk(cost)?Math.min(UPGRADE.soulDamage,u.soulMax-1):0,cap=u.soulMax-loss,value=Math.min(cap,u.soul-cost);return {soul:value,soulMax:cap,dead:value<0,capacityLoss:loss};};
  return {cost:2+uids.reduce((sum,uid)=>sum+(guById(state.guItems.find(x=>x.uid===uid)?.id)?.rank||0),0)+Object.values(materials).reduce((s,n)=>s+safeCount(n),0),days:1,
    soulSuccess:UPGRADE.forgeSoul,soulFailure:UPGRADE.forgeSoul+UPGRADE.forgeFailureSoul,
    successState:predict(UPGRADE.forgeSoul),failureState:predict(UPGRADE.forgeSoul+UPGRADE.forgeFailureSoul)};
}
function forgeChance(recipe,useOptional){return Math.min(.9,Math.max(.1,recipeChance(recipe,useOptional)*(.7+.3*Math.max(0,upgradeState().soul)/upgradeState().soulMax)));}
function forgeSelection(uids,materials={}){
  ensureGuItems();const issue=forgeInputsIssue(uids,materials);if(issue)return {ok:false,reason:issue};
  const q=forgeQuote(uids,materials);if(!Number.isSafeInteger(q.cost)||state.money<q.cost)return {ok:false,reason:'元石不足'};
  const r=selectedRecipe(uids,materials),u=upgradeState();
  const success=!!r&&state.rank>=r.minRank&&rng()<forgeChance(r,!!r.optional&&materials[r.optional.id]===1);
  const receipt={success,output:success?r.output.id:null,inputs:uids.map(uid=>({id:state.guItems.find(x=>x.uid===uid).id,count:1})),materials:{...materials},cost:q.cost,days:q.days,soulSpent:success?q.soulSuccess:q.soulFailure,soulBefore:u.soul,maxBefore:u.soulMax};
  state.money-=q.cost;state.guItems=state.guItems.filter(x=>!uids.includes(x.uid));
  for(const [id,n] of Object.entries(materials)){if(MATERIALS.some(m=>m.id===id))state.materialStock[id]=safeCount(state.materialStock[id])-n;else u.shopStock[id]=safeCount(u.shopStock[id])-n;}
  syncLegacyGu();u.attempt={inputs:receipt.inputs,materials:{...materials},day:gameDayNumber(),used:false};
  if(u.forgeDraft){u.forgeDraft.uids=[];u.forgeDraft.materials={};}
  spendSoul(receipt.soulSpent);if(state.alive)upgradeTime(q.days);
  receipt.dead=!state.alive;receipt.soulAfter=u.soul;receipt.maxAfter=u.soulMax;
  if(!state.alive){receipt.success=false;receipt.output=null;u.forgeResult=receipt;return {ok:true,...receipt};}
  if(success)for(let i=0;i<r.output.count;i++)addGuItem(r.output.id);
  u.forgeResult=receipt;
  addLog(success?'炼成'+guById(r.output.id).name+'，已收入仓库。':'炼蛊失败，本次投入全部损失；可另行推演。');
  const saved=saveGame();renderStatus();return {ok:true,...receipt,saved};
}
function performRecipe(id,useOptional=false){
  const r=RECIPES.find(x=>x.id===id);if(!r)return {ok:false,reason:'配方不存在'};
  const issue=recipeAvailability(r,useOptional);if(issue)return {ok:false,reason:issue};
  return forgeSelection(recipeInputs(r).flatMap(x=>x.items.map(i=>i.uid)),{...Object.fromEntries((r.materials||[]).map(x=>[x.id,x.count])),...(useOptional?{[r.optional.id]:1}:{})});
}
function tryRecipe(id){if(typeof openForge==='function'&&recipeKnown(id)){openForge();chooseForgeTarget(id);forgeAutofill();return true;}return false;}

function inferRecipe(fromAttempt=false){
  if(saveReadBlocked||!activityReady())return {ok:false,reason:'当前无法推演'};
  const u=upgradeState(),a=u.attempt;
  const bonus=fromAttempt&&a&&!a.used&&gameDayNumber()-a.day<=UPGRADE.inferBonusDays;
  if(fromAttempt&&!bonus)return {ok:false,reason:'本次尝试的推演机会已用完或过期'};
  let candidates=RECIPES.filter(r=>!recipeKnown(r.id)||!recipeIsClear(r.id));
  if(!candidates.length)return {ok:false,reason:'当前可推演的配方已完整掌握'};
  if(bonus){
    const score=r=>a.inputs.reduce((s,x)=>s+(r.inputs.some(y=>y.id===x.id)?1:0),0)+Object.keys(a.materials||{}).reduce((s,id)=>s+((r.materials||[]).some(m=>m.id===id)||r.optional?.id===id?1:0),0);
    const best=Math.max(...candidates.map(score));
    if(best===0)return {ok:false,reason:'该组合没有可用的相关配方线索，可尝试独立推演'};
    candidates=candidates.filter(r=>score(r)===best);
    a.used=true; // 先消耗机会，失败、读档均不能重复取得加成。
  }
  const target=candidates[Math.min(candidates.length-1,Math.floor(rng()*candidates.length))];
  const p=Math.min(.85,Math.max(.1,UPGRADE.inferBase+(bonus?UPGRADE.inferBonus:0)+(state.attrs.智力-10)*.01));
  if(!spendSoul(UPGRADE.inferSoul))return {ok:true,dead:true};
  upgradeTime(1);if(!state.alive)return {ok:true,dead:true};
  const success=rng()<p&&learnRecipe(target.id);
  addLog(success?'推演成功，补全了'+guById(target.output.id).name+'的蛊方。':'本次推演没有取得完整蛊方。');
  saveGame();renderStatus();return {ok:true,success};
}
function uiInfer(attempt=false){
  if(typeof confirm==='function'&&!confirm('推演需一天。'+soulRiskText(UPGRADE.inferSoul)))return;
  const r=inferRecipe(attempt);if(state.alive){activityMessage(!r.ok?r.reason:r.success?'推演成功，蛊方知识已补全。':'本次推演未取得完整蛊方。');renderActivities();}
}

