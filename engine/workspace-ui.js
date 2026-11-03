/* 三个独立工作页面的展示辅助；不改变交易、配方与炼制数值。 */
function guUseLabel(g){
  if(g.available===false)return '资料待核实，暂不开放使用';
  if(BATTLE_GU[g.id])return battleEffectText(g.id);
  if(M4_EXTRA.uses[g.id])return M4_EXTRA.uses[g.id].title;
  if(g.id===60)return '重生核心，使用现有重生规则';
  return '可收藏；专属主动玩法尚未开放';
}
function guRouteHtml(id){
  if([2,145,146].includes(id))return '<section class="route-note"><h3>酒虫升炼路线</h3><p>一转酒虫 → 二转四味酒虫：已开放炼制。</p><p>二转四味酒虫 → 三转七香酒虫：材料信息不完整，尚未开放。</p><p>七香酒虫 → 九眼酒虫：材料信息不完整，尚未开放。</p><small>完整投入提示仅在掌握蛊方后显示。</small></section>';
  const recipes=RECIPES.filter(r=>r.output.id===id);
  return recipes.length?'<section class="route-note"><h3>炼制状态</h3>'+recipes.map(r=>'<p>'+escapeM4Text(guById(r.output.id).name)+'：支持炼制 · '+(recipeKnown(r.id)?recipeIsClear(r.id)?'已掌握蛊方':'前世蛊方记忆模糊':'尚未掌握蛊方')+'</p>').join('')+'</section>':'';
}
function renderShopDetail(){
  const g=shopFiltered().find(g=>g.id===shopView.selected),el=$('shopDetail');
  if(!g){el.innerHTML='<p class="detail-empty">选择商品，查看用途和购买明细。</p>';return;}
  const esc=escapeM4Text,gu=g.guId&&guById(g.guId),currency=g.grade==='immortal'?'仙元':'元石';
  const n=shopView.quantity,balance=g.grade==='immortal'?upgradeState().immortalMoney:state.money;
  const issue=shopBuyIssue(g,n),valid=Number.isSafeInteger(n)&&n>=1&&n<=99,total=valid?g.price*n:null;
  const food=gu&&FOODS.find(f=>f.id===gu.foodId);
  el.innerHTML=(shopView.message?'<p class="purchase-message" role="status">'+esc(shopView.message)+'</p>':'')+'<button class="detail-back" onclick="shopBackToList()">返回商品列表</button><small>'+SHOP_CATEGORIES[g.category]+' · '+(g.grade==='immortal'?'仙级':'凡级')+'</small><h2>'+esc(g.name)+'</h2><p>'+esc(gu?publicGuDescription(gu):g.desc)+'</p>'+
    (gu?'<h3>当前游戏用途</h3><p>'+esc(guUseLabel(gu))+'</p><h3>喂养与使用</h3><p>'+(food?esc(food.name)+' · 游戏供养每月 '+food.amount+food.unit:gu.id===60?'特殊喂养规则':'食物信息待核实，暂不结算普通食料')+'</p><p>催动需满足境界、供养及具体技能条件；购入不等于可立即催动。</p>':'')+
    '<p>已持有 '+shopOwned(g)+g.unit+(g.unique?' · 每世限购 / 已掌握后不可重复购买':'')+'</p><label class="quantity-field">购买份数 <input id="shopQty_'+g.id+'" type="number" min="1" max="'+(g.unique?1:99)+'" step="1" value="'+(Number.isFinite(n)?n:1)+'" '+(g.unique?'disabled':'')+' onchange="shopQuantity(this.value)"></label><div class="purchase-summary"><p>单价 <strong>'+g.price+' '+currency+'</strong></p><p>获得数量 <strong>'+(valid?g.amount*n:'—')+' '+g.unit+'</strong></p><p>总价 <strong>'+(total??'—')+' '+currency+'</strong></p><p>购买后余额 <strong>'+(total!==null&&balance>=total?balance-total:'不足或数量无效')+'</strong></p></div><p class="action-warning">'+esc(issue)+'</p><button class="primary" onclick="uiBuyShopGood(\''+g.id+'\')" '+(issue?'disabled':'')+'>购买</button>';
}
function forgeRemoveInput(uid){const d=forgeDraft();d.uids=d.uids.filter(x=>x!==uid);forgeChanged();}
function forgeRemoveMaterial(id){delete forgeDraft().materials[id];forgeChanged();}
function renderForgeInputs(){
  const d=forgeDraft();
  const rows=d.uids.map(uid=>{const x=state.guItems.find(x=>x.uid===uid);return '<li><span>'+escapeM4Text(x?guById(x.id).name:'失效蛊虫')+' <small>#'+uid+(x?.active?' · 供养中':' · 闲置')+'</small></span><button onclick="forgeRemoveInput('+uid+')">撤回</button></li>';})
    .concat(Object.entries(d.materials).filter(([,n])=>n>0).map(([id,n])=>'<li><span>'+escapeM4Text(forgeMaterials().find(m=>m.id===id)?.name||id)+' × '+n+'</span><button onclick="forgeRemoveMaterial(\''+id+'\')">撤回</button></li>'));
  $('forgeInputs').innerHTML=rows.length?'<ul class="forge-list input-ledger">'+rows.join('')+'</ul><button onclick="clearForgeDraft()">全部撤回</button>':'<p class="detail-empty">炼炉为空。选择左侧已掌握蛊方，或从右侧仓库自由投料。</p>';
}

function publicGuDescription(g){
 const r=RECIPES.find(r=>r.output.id===g.id);
 return r&&(!recipeKnown(r.id)||!recipeIsClear(r.id))?guUseLabel(g)+'；完整蛊方需在游戏中获取。':g.desc;
}
