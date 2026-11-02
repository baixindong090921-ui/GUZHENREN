/* 魂魄、知识、活动入口与交易。规则函数返回结果，界面操作负责提示。 */
let saveReadBlocked=false, metaReadBlocked=false;
function storageNotice(message){
  if(typeof document==='undefined'){console.warn(message);return;}
  const el=document.getElementById('saveNotice');
  if(el){el.textContent=message;el.classList.remove('hidden');}
}
function newUpgradeState(){
  return {soul:UPGRADE.soulMax,soulMax:UPGRADE.soulMax,immortalMoney:0,
    memorySeed:Math.floor(rng()*2147483647),clarity:{},priorChoices:JSON.parse(JSON.stringify(getMeta().choiceHistory||{})),attempt:null,battle:null,
    marketBought:[],marketPeriod:null,treasureBought:[],rewarded:[],shopStock:{},
    forgeDraft:{uids:[],materials:{},target:''},forgeResult:null,battleResult:null};
}
function initUpgrade(){state.upgrade=newUpgradeState();if(typeof resetForgeView==='function')resetForgeView();}
function upgradeState(){if(!state.upgrade)initUpgrade();return state.upgrade;}
function loadUpgrade(raw,resources=state.resources){
  const u=newUpgradeState();
  if(raw && typeof raw==='object'){
    for(const k of ['soulMax','soul','memorySeed','immortalMoney'])if(Number.isFinite(raw[k]))u[k]=raw[k];
    u.soulMax=Math.max(1,u.soulMax);u.soul=Math.min(u.soulMax,u.soul);
    u.immortalMoney=safeCount(u.immortalMoney);
    if(raw.shopStock && typeof raw.shopStock==='object' && !Array.isArray(raw.shopStock))
      u.shopStock=Object.fromEntries(Object.entries(raw.shopStock).filter(([key,value])=>/^(food|material|beast)_[a-zA-Z]+$/.test(key)&&safeCount(value)>0));
    u.clarity=raw.clarity&&typeof raw.clarity==='object'?raw.clarity:{};
    u.priorChoices=raw.priorChoices&&typeof raw.priorChoices==='object'?raw.priorChoices:{};
    u.attempt=raw.attempt&&Array.isArray(raw.attempt.inputs)?raw.attempt:null;
    const draft=raw.forgeDraft;
    if(draft && typeof draft==='object'){
      u.forgeDraft={uids:Array.isArray(draft.uids)?Array.from(new Set(draft.uids.filter(x=>Number.isSafeInteger(x)&&x>0))):[],
        materials: draft.materials&&typeof draft.materials==='object'?Object.fromEntries(Object.entries(draft.materials).filter(([id,n])=>/^[a-zA-Z][a-zA-Z0-9_]*$/.test(id)&&safeCount(n)>0)):{},
        target:RECIPES.some(r=>r.id===draft.target)?draft.target:''};
    }
    const receipt=raw.forgeResult;
    if(receipt && Array.isArray(receipt.inputs) && ['cost','days','soulSpent','soulBefore','soulAfter','maxBefore','maxAfter'].every(k=>Number.isFinite(receipt[k]))){
      u.forgeResult={success:!!receipt.success,output:guById(receipt.output)?.id||null,
        inputs:receipt.inputs.filter(x=>x&&guById(x.id)&&safeCount(x.count)>0).map(x=>({id:x.id,count:x.count})),
        materials:receipt.materials&&typeof receipt.materials==='object'?Object.fromEntries(Object.entries(receipt.materials).filter(([id,n])=>/^[a-zA-Z][a-zA-Z0-9_]*$/.test(id)&&safeCount(n)>0)):{}};
      for(const k of ['cost','days','soulSpent','soulBefore','soulAfter','maxBefore','maxAfter'])u.forgeResult[k]=receipt[k];
    }
    u.marketPeriod=Number.isInteger(raw.marketPeriod)?raw.marketPeriod:null;
    for(const k of ['marketBought','treasureBought','rewarded'])u[k]=Array.isArray(raw[k])?raw[k].filter(x=>typeof x==='string'):[];
    const b=raw.battle;
    if(typeof restoreBattle==='function')u.battle=restoreBattle(b,resources,u.soul);
    if(typeof restoreBattleResult==='function')u.battleResult=restoreBattleResult(raw.battleResult);
  }
  state.upgrade=u;
  if(typeof resetForgeView==='function')resetForgeView();
}
function soulRisk(cost){const u=upgradeState();return u.soul< u.soulMax*UPGRADE.soulWarning || u.soul-cost<u.soulMax*UPGRADE.soulWarning;}
function soulRiskText(cost){const u=upgradeState();return '本次消耗魂魄 '+cost+'。'+(soulRisk(cost)?'低魂魄行动将损伤容量 '+UPGRADE.soulDamage+'。':'')+(u.soul-cost<0?'继续将导致魂魄死亡。':'');}
function spendSoul(cost){
  const u=upgradeState();
  if(!state.alive || !Number.isFinite(cost)||cost<0)return false;
  const risky=soulRisk(cost);u.soul-=cost;
  if(risky)u.soulMax=Math.max(1,u.soulMax-UPGRADE.soulDamage);
  u.soul=Math.min(u.soul,u.soulMax);
  if(u.soul<0){endGame('魂魄耗尽，魂飞魄散。','魂魄死亡');return false;}
  if(u.soul<u.soulMax*UPGRADE.soulWarning)addLog('魂魄预警：继续消耗可能损伤魂魄容量。');
  return true;
}
function upgradeTime(days){
  for(let i=0;i<days&&state.alive;i++){
    const old=monthKey();state.day++;
    if(state.day>30){state.day=1;state.month++;}if(state.month>12){state.month=1;state.age++;}
    if(old!==monthKey())for(const msg of settleMonthlyFeeding())addLog(msg);
    const death=checkDeath();if(death)endGame('行动期间寿尽或伤重陨落。',death);
  }
}
function restSoul(){
  if(!m4ActionReady())return false;
  const u=upgradeState();upgradeTime(UPGRADE.restDays);
  if(!state.alive)return false;
  u.soul=Math.min(u.soulMax,u.soul+UPGRADE.restRecovery);
  applyEffect({血条:.15,体力:.4,真元:.3});addLog('休养五日，恢复魂魄 '+UPGRADE.restRecovery+'；容量不会因此恢复。');
  saveGame();renderStatus();renderActivities();return true;
}
function memoryHash(key){
  let h=upgradeState().memorySeed|0;for(const ch of key)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;
}
function remembered(key,text){
  const u=upgradeState();if(u.clarity[key]===true || getMeta().rebirths===0)return text;
  const mode=memoryHash(key)%3;if(mode===0)return text;if(mode===2)return '████（记忆模糊）';
  return Array.from(text).map((ch,i)=>memoryHash(key+':'+i)%3===0?'█':ch).join('');
}
function recipeKnown(id){return (getMeta().recipes||[]).includes(id);}
function learnRecipe(id){
  if(!RECIPES.some(r=>r.id===id))return false;
  const meta=getMeta();meta.recipes=Array.from(new Set([...(meta.recipes||[]),id]));
  if(!saveMeta(meta))return false;
  upgradeState().clarity['recipe:'+id]=true;return true;
}
function recipeIsClear(id){return upgradeState().clarity['recipe:'+id]===true || getMeta().rebirths===0 || memoryHash('recipe:'+id)%3===0;}
function datedDay(day){const n=day-1;return Math.floor(n/360)+'岁'+(Math.floor(n%360/30)+1)+'月'+(n%30+1)+'日';}
function fairStatus(){const n=gameDayNumber();const period=Math.floor(n/UPGRADE.marketCycle);return {period,open:n%UPGRADE.marketCycle<UPGRADE.marketDuration,next:datedDay((period+1)*UPGRADE.marketCycle)};}
function activityReady(){return m4ActionReady()&&!upgradeState().battle;}
function openActivities(tab='explore'){
  if(tab==='shop' && typeof openShop==='function')return openShop();
  if(tab==='forge' && typeof openForge==='function')return openForge();
  if(!state.alive || gameState===GAME.CHOOSING || gameState===GAME.BATTLE)return false;
  if(state.rank<1){addLog('十五岁开窍后可以开始历练、炼蛊与推演。');return false;}
  stopTimer();paused=true;updateControls();$('warehouse').classList.add('hidden');
  if(typeof openShop==='function')show('screen-play');
  $('activityPanel').classList.remove('hidden');state.activityTab=tab;renderActivities();return true;
}
function closeActivities(){$('activityPanel').classList.add('hidden');}
function activityMessage(message){$('activityMessage').textContent=message;}
function buyRecipe(id){
  if(!activityReady() || !RECIPES.some(r=>r.id===id)||state.money<5)return false;
  if(recipeKnown(id)&&recipeIsClear(id))return false;
  if(!learnRecipe(id))return false;
  state.money-=5;addLog('购得蛊方，补全了相关知识。');saveGame();renderActivities();return true;
}
function buyFairGu(id){
  const f=fairStatus(),u=upgradeState();
  if(u.marketPeriod!==f.period){u.marketPeriod=f.period;u.marketBought=[];}
  id=Number(id);const gu=guById(id),key=String(id),price=gu?.rank*18;
  if(!activityReady()||!f.open||![7,8,9,20,21,23,24,36].includes(id)||gu.rank>state.rank||u.marketBought.includes(key)||state.money<price)return false;
  state.money-=price;u.marketBought.push(key);addGuItem(id);addLog('蛊市购得'+gu.name+'，请在仓库加入供养。');saveGame();renderActivities();return true;
}
function buySoulMedicine(){
  if(!activityReady()||!fairStatus().open||state.money<15)return false;
  const u=upgradeState(),key='soul:'+fairStatus().period;if(u.treasureBought.includes(key))return false;
  // 胆识蛊疗魂壮魂有原文依据；本次蛊市供货方式和恢复量为项目设定。
  state.money-=15;u.treasureBought.push(key);u.soulMax+=10;u.soul=Math.min(u.soulMax,u.soul+30);
  addLog('使用胆识蛊补给，魂魄恢复、容量增加。此交易方式与数量为项目设定。');saveGame();renderStatus();renderActivities();return true;
}
function activityExplore(){if(!activityReady())return;const r=exploreForGu();if(state.alive){activityMessage(!r.ok?r.reason:r.caught?'获得'+guById(r.id).name+'，请在仓库供养。':r.found?'捕获失败，受了轻伤。':'没有发现可以捕获的蛊虫。');renderActivities();}}
function gambleStone(){
  if(!activityReady()||state.money<4)return false;
  if(Number.isFinite(state.cooldowns.stoneSearch)&&gameDayNumber()-state.cooldowns.stoneSearch<30)return false;
  state.money-=4;state.cooldowns.stoneSearch=gameDayNumber();upgradeTime(1);if(!state.alive)return false;
  if(rng()<.25){addGuItem(3);addLog('解石获得一只星镖蛊。');}else addLog('解石没有发现完整蛊虫。');
  saveGame();renderStatus();renderActivities();return true;
}
function renderActivities(){
  if(state.activityTab==='shop' && typeof openShop==='function'){openShop();return;}
  if(state.activityTab==='forge' && typeof openForge==='function'){openForge();return;}
  const u=upgradeState(),tab=state.activityTab||'explore',f=fairStatus();
  const oldMessage=$('activityMessage')?.textContent||'';
  let html='<h2>历练与养成</h2><p>魂魄 '+u.soul.toFixed(0)+' / '+u.soulMax+' · 元石 '+state.money+'</p><div class="activity-actions">'+[['explore','寻蛊'],['forge','炼蛊'],['infer','推演蛊方'],['shop','宝黄天'],['rest','休养']].map(([id,name])=>'<button onclick="openActivities(\''+id+'\')">'+name+'</button>').join('')+'<button onclick="closeActivities()">返回人生</button></div><p id="activityMessage" role="status">'+escapeM4Text(oldMessage)+'</p>';
  if(tab==='explore'){
    const last=state.m4ExploreDay,left=last===null?0:Math.max(0,30-(gameDayNumber()-last));
    html+='<h3>寻蛊与历练</h3><p>寻蛊冷却剩余 '+left+' 日；消耗8%体力。蛊市'+(f.open?'正在开放':'下次开放 '+f.next)+'（开放30日，每两年一次）。</p><div class="activity-actions"><button onclick="activityExplore()" '+(left?'disabled':'')+'>野外捕捉</button><button onclick="gambleStone()" '+(state.money<4?'disabled':'')+'>解石 · 4元石 · 每月一次</button><button onclick="openActivities(\'shop\')">买蛊</button><button onclick="previewBattle(\'spar\')">同门切磋 · 每月一次</button><button onclick="previewBattle(\'teacher\')">请老师指点</button></div>';
    if(f.open)html+='<h3>蛊市限售</h3>'+[7,8,9,20,21,23,24,36].map(id=>'<div class="m4-row"><span>'+guById(id).name+' · '+guById(id).rank*18+'元石 · 需'+guById(id).rank+'转</span><button onclick="buyFairGu('+id+')" '+(guById(id).rank>state.rank||state.money<guById(id).rank*18||u.marketPeriod===f.period&&u.marketBought.includes(String(id))?'disabled':'')+'>购入</button></div>').join('')+'<button onclick="buySoulMedicine()">胆识蛊补给 · 15元石 · 每场蛊市限一次</button><p>本蛊市供货方式和恢复数值为项目设定。</p>';
  }
  if(tab==='infer')html+='<h3>推演蛊方</h3><p>消耗10魂魄与一天时间。可发现未知配方或补全遗忘；相关炼蛊尝试提供一次加成，30日内有效，不叠加。</p><div class="activity-actions"><button onclick="uiInfer(false)">独立推演</button><button onclick="uiInfer(true)">推演最近炼蛊组合</button></div><h3>已获配方</h3>'+RECIPES.filter(r=>recipeKnown(r.id)).map(r=>'<p>'+guById(r.output.id).name+'：'+escapeM4Text(remembered('recipe:'+r.id,r.inputs.map(x=>guById(x.id).name+'×'+x.count).join('＋')))+'</p>').join('');
  if(tab==='rest')html+='<h3>休养</h3><p>休养五日恢复20魂魄，并恢复部分身体资源。休养不能修复容量损伤。</p><button onclick="restSoul()">休养五日</button>';
  $('activityContent').innerHTML=html;
}
