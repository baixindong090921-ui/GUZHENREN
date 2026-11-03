/* 炼蛊坊只管理准备和展示，实际炼制统一交给 forgeSelection。 */
let forgeReturnWarehouse=false;
let forgeView={category:'gu',search:'',pending:null,inferPending:null,message:''};
function resetForgeView(){forgeReturnWarehouse=false;forgeView={category:'gu',search:'',pending:null,inferPending:null,message:''};}
function forgeDraft(){
  const u=upgradeState();
  if(!u.forgeDraft)u.forgeDraft={uids:[],materials:{},target:''};
  return u.forgeDraft;
}
function openForge(){
  if(gameState===GAME.BATTLE||upgradeState().battle)return false;
  if(!state.alive || gameState===GAME.ENDED){storageNotice('本世已结束，无法炼蛊。');return false;}
  if($('warehouse').classList.contains?.('hidden')===false&&warehouseView.origin==='screen-forge'){closeWarehouse();return true;}
  forgeReturnWarehouse=$('warehouse').classList.contains?.('hidden')===false;
  stopTimer();paused=true;warehouseResumeTimer=false;updateControls();
  for(const id of ['warehouse','activityPanel','battlePanel'])$(id).classList.add('hidden');
  forgeView.pending=null;forgeView.inferPending=null;forgeView.message='';
  show('screen-forge');renderForge();return true;
}
function closeForge(){
  forgeView.pending=null;forgeView.inferPending=null;
  if(forgeReturnWarehouse){forgeReturnWarehouse=false;returnWarehouse();return;}
  show('screen-play');renderStatus();updateControls();
  if(gameState===GAME.BATTLE && upgradeState().battle)renderBattle();
}
function forgeChanged(){forgeView.pending=null;forgeView.inferPending=null;forgeView.message='';saveGame();renderForge();}
function forgeToggleGu(uid){
  const d=forgeDraft(),item=state.guItems.find(x=>x.uid===uid);
  if(d.uids.includes(uid))d.uids=d.uids.filter(x=>x!==uid);
  else if(item&&!item.locked&&item.id!==60&&guById(item.id)?.available!==false)d.uids.push(uid);
  else return false;
  forgeChanged();return true;
}
function forgeSetMaterial(id,n){
  const material=forgeMaterials().find(x=>x.id===id);
  if(!material||n>0&&material.grade==='unknown'||!Number.isSafeInteger(n)||n<0||n>material.stock){forgeView.message='材料数量不足或输入无效。';renderForge();return false;}
  if(n)forgeDraft().materials[id]=n;else delete forgeDraft().materials[id];
  forgeChanged();return true;
}
function clearForgeDraft(){forgeDraft().uids=[];forgeDraft().materials={};forgeChanged();}
function chooseForgeTarget(id){
  if(id && (!recipeKnown(id)||!RECIPES.some(r=>r.id===id)))return false;
  forgeDraft().target=id;forgeChanged();return true;
}
function forgeAutofill(){
  const d=forgeDraft(),r=RECIPES.find(x=>x.id===d.target);
  if(!r||!recipeKnown(r.id)||!recipeIsClear(r.id)){forgeView.message='只有完整掌握的配方才能自动填入。';renderForge();return false;}
  d.uids=[];d.materials={};
  for(const req of r.inputs)d.uids.push(...state.guItems.filter(x=>x.id===req.id&&!x.active&&!x.locked&&x.id!==60).slice(0,req.count).map(x=>x.uid));
  for(const req of r.materials||[])d.materials[req.id]=Math.min(req.count,forgeMaterialCount(req.id));
  forgeChanged();forgeView.message='已按配方重填现有闲置材料。供养中的蛊与可选辅料需要手动添加；请检查缺口。';renderForge();return true;
}
function forgeSelectCategory(category){if(!['gu','material'].includes(category))return;forgeView.category=category;renderForgeInventory();}
function forgeSearch(value){forgeView.search=value;renderForgeInventory();}
function openForgeShop(){
  forgeView.pending=null;forgeView.inferPending=null;saveGame();
  openShop();$('shopReturnForge').classList.remove('hidden');
}
function forgeSnapshot(){
  const d=forgeDraft();return JSON.stringify({draft:d,rank:state.rank,attrs:state.attrs,money:state.money,
    soul:upgradeState().soul,cap:upgradeState().soulMax,day:gameDayNumber(),
    items:d.uids.map(uid=>state.guItems.find(x=>x.uid===uid)||null),
    stock:Object.keys(d.materials).map(id=>[id,forgeMaterialCount(id)])});
}
function prepareForge(){
  const d=forgeDraft(),issue=forgeInputsIssue(d.uids,d.materials),quote=forgeQuote(d.uids,d.materials);
  forgeView.inferPending=null;
  if(issue || state.money<quote.cost){forgeView.pending=null;forgeView.message=issue||'元石不足。';renderForge();return false;}
  forgeView.pending=forgeSnapshot();forgeView.message='请核对炼炉中的完整清单与下方风险，确认后将消耗投入。';renderForge();return true;
}
function cancelForge(){forgeView.pending=null;forgeView.inferPending=null;forgeView.message='已取消，材料没有消耗。';renderForge();}
function confirmForge(){
  if(!forgeView.pending)return false;
  const expected=forgeView.pending;forgeView.pending=null;
  if(expected!==forgeSnapshot()){forgeView.message='材料或角色状态已变化，请重新检查并确认。';renderForge();return false;}
  const d=forgeDraft(),result=forgeSelection([...d.uids],{...d.materials});
  forgeView.message=result.ok?(result.saved===false?'炼制已结算，但保存失败，请保持页面打开。':'炼制已结算。'):result.reason;
  if(state.alive){renderForge();renderStatus();}else show('screen-play');
  return result.ok;
}
function uiForge(){return prepareForge();}
function prepareForgeInference(fromAttempt=true){
  forgeView.pending=null;
  if(!activityReady()){forgeView.message='当前无法推演，请先完成抉择或战斗，并确保已经开窍。';renderForge();return false;}
  forgeView.inferPending={fromAttempt,snapshot:forgeSnapshot()};renderForge();return true;
}
function confirmForgeInference(){
  const pending=forgeView.inferPending;if(!pending)return false;
  forgeView.inferPending=null;
  if(pending.snapshot!==forgeSnapshot()){forgeView.message='角色状态已变化，请重新确认推演风险。';renderForge();return false;}
  const result=inferRecipe(pending.fromAttempt);
  forgeView.message=!result.ok?result.reason:result.success?'推演成功，已获得或补全蛊方。':'本次推演未得到完整蛊方。';
  if(state.alive){renderForge();renderStatus();}else show('screen-play');return result.ok;
}
function forgeInputNames(d){
  const materials=forgeMaterials();
  return d.uids.map(uid=>{const x=state.guItems.find(x=>x.uid===uid);return x?guById(x.id).name+(x.active?'（供养中）':''):'已失效的蛊虫';})
    .concat(Object.entries(d.materials).filter(([,n])=>n>0).map(([id,n])=>(materials.find(x=>x.id===id)?.name||'已失效的材料')+' × '+n));
}
function renderForgeInventory(){
  const d=forgeDraft(),q=forgeView.search.trim();$('forgeSearch').value=forgeView.search;
  $('forgeGuTab').classList.toggle('active',forgeView.category==='gu');$('forgeMaterialTab').classList.toggle('active',forgeView.category==='material');
  if(forgeView.category==='gu'){
    const items=state.guItems.filter(x=>guById(x.id)?.name.includes(q));
    $('forgeInventory').innerHTML=items.map(x=>{const g=guById(x.id),disabled=x.locked||x.id===60||g.available===false;return '<label class="forge-item"><input type="checkbox" '+(d.uids.includes(x.uid)?'checked ':'')+(disabled?'disabled ':'')+'onchange="forgeToggleGu('+x.uid+')"><span class="forge-item-info"><strong>'+escapeM4Text(g.name)+'</strong><small>'+g.rank+'转 · #'+x.uid+' · '+(g.available===false?'资料待核实，暂不使用':x.id===60?'重生核心，不可投入':x.locked?'被占用':x.active?'供养中，投入将消耗此蛊':'闲置')+(x.missed?' · 饥饿':'')+'</small></span></label>';}).join('')||'<p class="forge-hint">没有符合条件的蛊虫，可前往宝黄天购入。</p>';
  }else{
    $('forgeInventory').innerHTML=forgeMaterials().filter(m=>m.name.includes(q)&&(m.stock>0||d.materials[m.id]>0)).map(m=>'<label class="forge-item"><span class="forge-item-info"><strong>'+escapeM4Text(m.name)+'</strong><small>持有 '+m.stock+' 份 · '+(m.grade==='immortal'?'仙级':m.grade==='unknown'?'等级待核实，暂不使用':'凡级')+'</small></span><span class="forge-qty">投入 <input aria-label="'+escapeM4Text(m.name)+'投入数量" type="number" min="0" max="'+m.stock+'" step="1" value="'+(d.materials[m.id]||0)+'" onchange="forgeSetMaterial(\''+m.id+'\',Number(this.value))"></span></label>').join('')||'<p>没有符合条件的材料。</p>';
  }
}
function renderForgeRecipe(){
  const d=forgeDraft(),known=RECIPES.filter(r=>recipeKnown(r.id)),r=known.find(r=>r.id===d.target);
  let html='<label>参考目标 <select aria-label="参考配方" onchange="chooseForgeTarget(this.value)"><option value="">自由投入</option>'+known.map(x=>'<option value="'+x.id+'" '+(x===r?'selected':'')+'>'+escapeM4Text(guById(x.output.id).name)+'</option>').join('')+'</select></label>';
  if(!r)html+='<p class="forge-hint">选择已拥有的配方作为参考，或直接自由投入。配方有无不会改变相同投入的炼制结果。</p>';
  else if(!recipeIsClear(r.id)){
    const hint=r.inputs.map(x=>guById(x.id).name+' × '+x.count).concat((r.materials||[]).map(x=>(forgeMaterials().find(m=>m.id===x.id)?.name||'材料')+' × '+x.count)).join('＋');
    html+='<p class="forge-hint">前世记忆不完整</p><p>'+escapeM4Text(remembered('recipe:'+r.id,hint))+'</p><p class="forge-hint">未知部分不显示缺料、自动填入或成功率。可通过购方或推演补全。</p>';
  }else{
    html+='<ul class="forge-list">'+r.inputs.map(req=>{const owned=state.guItems.filter(x=>x.id===req.id&&!x.locked&&x.id!==60).length;return '<li>'+guById(req.id).name+' × '+req.count+' · 持有 '+owned+(owned<req.count?' · 缺 '+(req.count-owned):'')+'</li>';}).join('')+(r.materials||[]).map(req=>'<li>'+escapeM4Text(forgeMaterials().find(m=>m.id===req.id)?.name||'材料')+' × '+req.count+' · 持有 '+forgeMaterialCount(req.id)+(forgeMaterialCount(req.id)<req.count?' · 缺 '+(req.count-forgeMaterialCount(req.id)):'')+'</li>').join('')+'</ul>';
    html+='<p>需 '+r.minRank+' 转。'+(r.optional?'可选辅料：'+escapeM4Text(forgeMaterials().find(m=>m.id===r.optional.id)?.name||'材料')+' × 1。':'')+'</p><button onclick="forgeAutofill()">按配方重填闲置材料</button>';
    if(state.rank<r.minRank)html+='<p class="forge-warning">当前境界不足，不能炼成该配方。</p>';
    else if(selectedRecipe(d.uids,d.materials)?.id===r.id)html+='<p class="forge-preview">当前组合成功率 '+Math.round(forgeChance(r,!!r.optional&&d.materials[r.optional.id]===1)*100)+'%</p>';
    else html+='<p class="forge-hint">当前投入与参考配方不一致，可以补齐，也可以继续自由尝试。</p>';
  }
  html+='<div class="forge-actions"><button onclick="openForgeShop()">去宝黄天补货 / 购方</button><button onclick="prepareForgeInference(false)">独立推演</button></div>';
  $('forgeRecipe').innerHTML=html+(r?guRouteHtml(r.output.id):'<p class="forge-hint">完整配方只作参考。自由投入也按实际组合结算。</p>');
}
function forgeRiskLine(label,s){return '<p class="'+(s.capacityLoss||s.dead?'forge-warning':'')+'">'+label+'：魂魄 '+s.soul+' / '+s.soulMax+(s.capacityLoss?'，容量损失 '+s.capacityLoss:'')+(s.dead?'；魂魄低于零，将死亡':'')+'。</p>';}
function renderForge(){
  ensureGuItems();const d=forgeDraft(),u=upgradeState(),names=forgeInputNames(d),q=forgeQuote(d.uids,d.materials);
  $('forgeReturnMain').textContent=forgeReturnWarehouse?'返回仓库':'返回人生';
  $('forgeBalance').textContent='元石 '+state.money+' · 魂魄 '+Math.round(u.soul)+' / '+u.soulMax+' · '+state.rank+'转';
  $('forgeMessage').textContent=forgeView.message;
  renderForgeInventory();renderForgeRecipe();
  renderForgeInputs();
  const issue=forgeInputsIssue(d.uids,d.materials);
  $('forgeRisk').innerHTML=names.length?'<p>费用 '+q.cost+' 元石 · 耗时 '+q.days+' 日</p><p class="forge-hint">费用＝2＋投入蛊虫转数之和＋材料份数。成功消耗 '+q.soulSuccess+' 魂魄；失败共消耗 '+q.soulFailure+' 魂魄。</p>'+forgeRiskLine('成功后',q.successState)+forgeRiskLine('失败后',q.failureState)+'<p class="forge-warning">确认后消耗本炉全部投入；失败不会返还材料，也不会直接获得配方。</p>':'<p class="forge-hint">加入材料后显示费用和魂魄风险。</p>';
  $('forgeBegin').disabled=!!issue||state.money<q.cost;
  $('forgeIssue').textContent=issue|| (state.money<q.cost?'元石不足':'');
  let confirm='';
  if(forgeView.pending)confirm='<div class="forge-confirm"><strong>最后确认</strong><p>请核对上方投入与风险，供养中的蛊也会被消耗。</p><div class="forge-actions"><button class="error" onclick="confirmForge()">确认投入并炼制</button><button onclick="cancelForge()">取消</button></div></div>';
  if(forgeView.inferPending)confirm='<div class="forge-confirm"><strong>确认推演</strong><p>消耗 '+UPGRADE.inferSoul+' 魂魄和 1 日。'+escapeM4Text(soulRiskText(UPGRADE.inferSoul))+'</p><p>'+(forgeView.inferPending.fromAttempt?'使用最近相关尝试的一次加成，使用后即使失败也不退还。':'独立推演不使用炼制尝试加成。')+'</p><div class="forge-actions"><button onclick="confirmForgeInference()">确认消耗并推演</button><button onclick="cancelForge()">取消</button></div></div>';
  $('forgeConfirm').innerHTML=confirm;
  $('forgeConfirm').classList.toggle('hidden',!confirm);
  const r=u.forgeResult;
  $('forgeResult').innerHTML=r?'<div class="forge-receipt"><h3>'+ (r.success?'炼制成功':'炼制失败')+'</h3><p>'+(r.success?'炼成 '+escapeM4Text(guById(r.output)?.name||'蛊虫')+'，已收入仓库。':'本次投入全部损失。未获得或补全配方。')+'</p><p>消耗：'+escapeM4Text(r.inputs.map(x=>(guById(x.id)?.name||'蛊虫')+' × '+x.count).concat(Object.entries(r.materials||{}).map(([id,n])=>(forgeMaterials().find(x=>x.id===id)?.name||'材料')+' × '+n)).join('、'))+'</p><p>元石 −'+r.cost+' · 魂魄 −'+r.soulSpent+' · 耗时 '+r.days+' 日</p><p>结算后魂魄 '+r.soulAfter+' / '+r.maxAfter+'；容量损失 '+(r.maxBefore-r.maxAfter)+'。</p><button onclick="prepareForgeInference(true)" '+(!u.attempt||u.attempt.used||gameDayNumber()-u.attempt.day>UPGRADE.inferBonusDays?'disabled':'')+'>是否推演蛊方</button></div>':'';
}
