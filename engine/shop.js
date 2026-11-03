/* 独立商店页面；临时筛选不存档，货币、实物、仙蛊限售记录随本世存档。 */
const newShopView=()=>({grade:'mortal',category:'gu',page:0,message:'',query:'',rank:'all',sort:'default',selected:null,quantity:1});
let shopView=newShopView();
let shopReturnWarehouse=false;
function resetShopView(){shopView=newShopView();shopReturnWarehouse=false;}
function openShop(){
  if(gameState===GAME.BATTLE||upgradeState().battle)return false;
  if(!state.alive || gameState===GAME.ENDED){storageNotice('本世已经结束，无法进入宝黄天。');return false;}
  if($('warehouse').classList.contains?.('hidden')===false&&warehouseView.origin==='screen-shop'){closeWarehouse();return true;}
  shopReturnWarehouse=$('warehouse').classList.contains?.('hidden')===false;
  stopTimer();paused=true;warehouseResumeTimer=false;updateControls();
  $('warehouse').classList.add('hidden');$('activityPanel').classList.add('hidden');
  // 抉择与战斗中仍可浏览，但交易在结算完成前禁止。
  $('battlePanel').classList.add('hidden');
  shopView.message='';$('screen-shop').classList.remove('detail-open');
  $('shopReturnForge')?.classList.add('hidden');
  show('screen-shop');renderShop();return true;
}
function closeShop(){
  if(shopReturnWarehouse){shopReturnWarehouse=false;returnWarehouse();return;}
  show('screen-play');renderStatus();updateControls();
  if(gameState===GAME.BATTLE && upgradeState().battle)renderBattle();
  // 返回人生后保持暂停，由玩家决定何时继续。
}
function shopSelectGrade(grade){
  if(!['mortal','immortal'].includes(grade) || grade==='immortal' && state.rank<6)return false;
  shopView.grade=grade;shopView.category='gu';shopView.rank='all';shopView.page=0;shopView.message='';shopView.selected=null;shopView.quantity=1;$('screen-shop').classList.remove('detail-open');renderShop();return true;
}
function shopSelectCategory(category){
  if(!Object.hasOwn(SHOP_CATEGORIES,category) || shopView.grade==='immortal' && category==='recipe')return false;
  shopView.category=category;shopView.rank='all';shopView.page=0;shopView.message='';shopView.selected=null;shopView.quantity=1;$('screen-shop').classList.remove('detail-open');renderShop();return true;
}
function shopChangePage(offset){shopView.page+=offset;shopView.selected=null;renderShop();}
function shopFilter(key,value){if(!['query','rank','sort'].includes(key))return;shopView[key]=value;shopView.page=0;shopView.selected=null;renderShop();}
function shopFiltered(){const goods=SHOP_GOODS.filter(g=>g.grade===shopView.grade&&g.category===shopView.category&&g.name.includes(shopView.query||'')&&(shopView.rank==='all'||guById(g.guId)?.rank===Number(shopView.rank)));if(shopView.sort==='priceAsc')goods.sort((a,b)=>a.price-b.price);if(shopView.sort==='priceDesc')goods.sort((a,b)=>b.price-a.price);return goods;}
function selectShopGood(id){if(!shopFiltered().some(g=>g.id===id))return false;shopView.selected=id;shopView.quantity=1;$('screen-shop').classList.add('detail-open');renderShop();return true;}
function shopQuantity(value){shopView.quantity=Number(value);renderShopDetail();}
function shopBackToList(){$('screen-shop').classList.remove('detail-open');}
function shopOwned(g){
  if(g.guId)return state.guItems.filter(x=>x.id===g.guId).length;
  if(g.recipeId)return recipeKnown(g.recipeId)?1:0;
  return safeCount(g.stock?state[g.stock]?.[g.key]:upgradeState().shopStock[g.id]);
}
function shopBuyIssue(g,quantity){
  if(!g)return '商品不存在';
  if(!Number.isSafeInteger(quantity)||quantity<1||quantity>99)return '购买数量须为1至99';
  if(!state.alive || gameState===GAME.ENDED)return '本世已经结束';
  if(saveReadBlocked)return '存档损坏尚未处理，暂不能交易';
  if(gameState===GAME.CHOOSING)return '请先返回人生完成当前抉择';
  if(gameState===GAME.BATTLE || upgradeState().battle)return '请先返回战斗完成当前回合事件';
  if(g.grade==='immortal' && state.rank<6)return '六转成仙后才可交易';
  if(g.unique && quantity!==1)return '该商品每次仅可购买一份';
  if(g.guId && g.unique && (shopOwned(g)>0 || upgradeState().treasureBought.includes(g.id)))return '本世已拥有或已购得';
  if(g.recipeId && recipeKnown(g.recipeId) && recipeIsClear(g.recipeId))return '已掌握完整蛊方';
  const balance=g.grade==='immortal'?upgradeState().immortalMoney:state.money;
  if(!Number.isSafeInteger(balance)||balance<g.price*quantity)return g.grade==='immortal'?'仙元不足':'元石不足';
  if(shopOwned(g)+g.amount*quantity>Number.MAX_SAFE_INTEGER)return '库存数量已达上限';
  return '';
}
function buyShopGood(id,quantity=1){
  const g=SHOP_GOODS.find(x=>x.id===id),issue=shopBuyIssue(g,quantity);
  if(issue)return {ok:false,reason:issue};
  ensureGuItems();const u=upgradeState(),cost=g.price*quantity;
  // 知识保存失败不扣费，其余商品统一在验证通过后一次结算。
  if(g.recipeId && !learnRecipe(g.recipeId))return {ok:false,reason:'蛊方保存失败，未扣费'};
  if(g.grade==='immortal')u.immortalMoney-=cost;else state.money-=cost;
  if(g.guId){for(let i=0;i<quantity;i++)addGuItem(g.guId);if(g.unique)u.treasureBought.push(g.id);}
  else if(!g.recipeId){
    const stock=g.stock?state[g.stock]:u.shopStock,key=g.stock?g.key:g.id;
    stock[key]=safeCount(stock[key])+g.amount*quantity;
  }
  const message='购得'+g.name+' × '+g.amount*quantity+g.unit+'，花费'+cost+(g.grade==='immortal'?'仙元':'元石')+'。';
  addLog(message);const saved=saveGame();
  return {ok:true,saved,message:message+(saved?'已保存。':'保存失败，请保持页面打开。')};
}
function uiBuyShopGood(id){
  const quantity=(shopView.selected===id?shopView.quantity:Number($('shopQty_'+id)?.value||1)),result=buyShopGood(id,quantity);
  shopView.message=result.ok?result.message:result.reason;renderShop();renderStatus();
}
function renderShop(){
  ensureGuItems();const u=upgradeState();
  $('shopReturnMain').textContent=shopReturnWarehouse?'返回仓库':'返回人生';
  if(state.rank<6 && shopView.grade==='immortal'){shopView.grade='mortal';shopView.category='gu';shopView.rank='all';shopView.page=0;}
  const immortal=shopView.grade==='immortal',currency=immortal?'仙元':'元石';
  const goods=shopFiltered();
  $('shopSearch').value=shopView.query;$('shopRank').value=shopView.rank;$('shopRank').disabled=shopView.category!=='gu';$('shopSort').value=shopView.sort;
  const pages=Math.max(1,Math.ceil(goods.length/SHOP_PAGE_SIZE));
  shopView.page=Math.max(0,Math.min(pages-1,shopView.page));
  $('shopBalance').textContent='元石 '+state.money+(state.rank>=6?' · 仙元 '+u.immortalMoney:'');
  $('shopGrades').innerHTML='<button onclick="shopSelectGrade(\'mortal\')" aria-pressed="'+!immortal+'" class="'+(!immortal?'active':'')+'">凡蛊区</button>'+
    (state.rank>=6?'<button onclick="shopSelectGrade(\'immortal\')" aria-pressed="'+immortal+'" class="'+(immortal?'active':'')+'">仙蛊区</button>':'');
  $('shopCategories').innerHTML=Object.entries(SHOP_CATEGORIES).filter(([id])=>!immortal || id!=='recipe').map(([id,label])=>
    '<button onclick="shopSelectCategory(\''+id+'\')" aria-pressed="'+(id===shopView.category)+'" class="'+(id===shopView.category?'active':'')+'">'+label+'</button>').join('');
  $('shopIntro').textContent=(immortal?'仙蛊区 · 仙元结算':'凡蛊区 · 元石结算')+' · '+SHOP_CATEGORIES[shopView.category]+' · 共'+goods.length+'种商品';
  $('shopMessage').textContent=shopView.message;
  $('shopGrid').innerHTML=goods.slice(shopView.page*SHOP_PAGE_SIZE,(shopView.page+1)*SHOP_PAGE_SIZE).map(g=>{
    const issue=shopBuyIssue(g,1),owned=shopOwned(g);
    return '<article class="shop-card '+(shopView.selected===g.id?'selected':'')+'"><small>'+SHOP_CATEGORIES[g.category]+(g.guId?' · '+guById(g.guId).rank+'转':'')+'</small><h2>'+escapeM4Text(g.name)+'</h2><p class="shop-desc">'+escapeM4Text(g.guId?guUseLabel(guById(g.guId)):g.category==='recipe'?'学习配方或补全记忆':g.desc)+'</p><p>持有 '+owned+g.unit+'</p><p class="shop-price">'+g.price+' '+currency+' / '+g.amount+g.unit+'</p><button onclick="selectShopGood(\''+g.id+'\')">查看详情</button></article>';
  }).join('') || '<p>此分类暂无商品。</p>';
  $('shopPage').textContent=(shopView.page+1)+' / '+pages;
  $('shopPrev').disabled=shopView.page===0;$('shopNext').disabled=shopView.page===pages-1;
  renderShopDetail();
}
