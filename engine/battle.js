/* 每回合：玩家行动、对手回应、状态结算。征兆不消耗随机数。 */
let battlePreview=null;
function battleResourceSnapshot(raw,soul=0){return Object.fromEntries(['血条','真元','体力','soul'].map(k=>[k,Number.isFinite(raw?.[k])?raw[k]:k==='soul'?soul:0]));}
function restoreBattle(b,resources,soul){
  if(!b||typeof b.name!=='string'||!Number.isFinite(b.hp)||b.hp<=0||b.hp>1000||!Number.isSafeInteger(b.turn)||b.turn<1||!Number.isFinite(b.power))return null;
  const kind=Object.hasOwn(BATTLE_TYPES,b.kind)?b.kind:b.lethal?(b.name.includes('野兽')?'beast':'enemy'):'spar';
  const count=(v,max)=>Math.min(max,safeCount(v)),num=(v,f,min,max)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):f;
  return {kind,rank:num(b.rank,Math.round((b.power-7)/3),1,5),name:BATTLE_TYPES[kind].name,hp:b.hp,maxHp:num(b.maxHp,b.hp,b.hp,1000),turn:b.turn,
    power:num(b.power,10,1,100),lethal:BATTLE_TYPES[kind].lethal,focus:num(b.focus,1,1,2),weakTurns:count(b.weakTurns,2),weak:num(b.weak,0,0,.8),
    boostTurns:count(b.boostTurns,3),boost:num(b.boost,0,0,12),wineUsed:!!b.wineUsed,start:battleResourceSnapshot(b.start||resources,soul),
    spent:Object.fromEntries(['真元','体力','soul'].map(k=>[k,Number.isFinite(b.spent?.[k])?Math.max(0,b.spent[k]):0])),consumed:Array.isArray(b.consumed)?b.consumed.filter(x=>typeof x==='string').slice(-100):[],
    log:Array.isArray(b.log)?b.log.filter(x=>typeof x==='string').slice(-40):[]};
}
function restoreBattleResult(r){
  if(!r||typeof r.name!=='string'||typeof r.result!=='string'||!Number.isSafeInteger(r.turn)||r.turn<1)return null;
  return {name:r.name,result:r.result,turn:r.turn,start:battleResourceSnapshot(r.start),end:battleResourceSnapshot(r.end),spent:battleResourceSnapshot(r.spent),
    consumed:Array.isArray(r.consumed)?r.consumed.filter(x=>typeof x==='string'):[],rewards:Array.isArray(r.rewards)?r.rewards.filter(x=>typeof x==='string'):[],log:Array.isArray(r.log)?r.log.filter(x=>typeof x==='string').slice(-40):[]};
}
function battleStartIssue(kind){
  if(saveReadBlocked)return '存档异常尚未处理';
  if(!activityReady()||!Object.hasOwn(BATTLE_TYPES,kind))return '需开窍且不在战斗或抉择中';
  if(!BATTLE_TYPES[kind].lethal&&Number.isFinite(state.cooldowns.spar)&&gameDayNumber()-state.cooldowns.spar<UPGRADE.battleSparCooldown)return '切磋尚在冷却中';
  return '';
}
function battleBrief(kind,rank){const t=BATTLE_TYPES[kind];return t.name+' · 估计'+rank+'转。'+t.reason+' '+(t.lethal?'失败可能死亡；撤退成功率45%，失败会遭到回应。':'危险伤势时对方停手，可以直接认输。')+' '+t.reward;}
function offerBattle(){
  const roll=rng(),kind=roll<.2?'spar':roll<.4?'teacher':roll<.7?'beast':'enemy';if(battleStartIssue(kind))return false;
  const rank=Math.min(5,state.rank+(kind==='enemy'&&rng()<.1?1:0));
  fireChoice({id:'encounter_'+kind,text:battleBrief(kind,rank),choices:[
    {text:'准备交战',act:()=>{gameState=GAME.IDLE;startBattle(kind,rank);}},
    {text:'避开冲突（体力 −2%）',result:'你绕道而行，保留实力。',effect:{体力:-.02}}
  ]});return true;
}
function previewBattle(kind='spar'){
  const issue=battleStartIssue(kind);if(issue){activityMessage(issue);return false;}
  stopTimer();paused=true;closeActivities();$('warehouse').classList.add('hidden');battlePreview={kind,rank:state.rank};show('battlePanel');
  $('battleContent').innerHTML='<h1>交战准备</h1><p>'+battleBrief(kind,state.rank)+'</p><p>按当前血量和真元进入，不自动补满。交战后不能购物、休养或炼蛊。</p><div class="battle-actions"><button onclick="confirmBattlePreview()">确认交战</button><button onclick="closeBattlePage()">暂不交战</button></div>';return true;
}
function confirmBattlePreview(){const p=battlePreview;battlePreview=null;return !!p&&startBattle(p.kind,p.rank);}
function startBattle(kind='spar',enemyRank=state.rank){
  if(battleStartIssue(kind)||!Number.isInteger(enemyRank)||enemyRank<1||enemyRank>5)return false;
  const t=BATTLE_TYPES[kind];closeActivities();$('warehouse').classList.add('hidden');stopTimer();paused=true;gameState=GAME.BATTLE;
  const u=upgradeState();u.battleResult=null;
  u.battle={kind,rank:enemyRank,name:t.name,hp:35+enemyRank*15,maxHp:35+enemyRank*15,power:7+enemyRank*3,
    turn:1,lethal:t.lethal,focus:1,weakTurns:0,weak:0,boostTurns:0,boost:0,wineUsed:false,
    start:{...state.resources,soul:u.soul},spent:{真元:0,体力:0,soul:0},consumed:[],log:[]};
  if(!t.lethal)state.cooldowns.spar=gameDayNumber();
  battleLog(battleBrief(kind,enemyRank));saveGame();renderBattle();updateControls();return true;
}
function battleLog(text){const b=upgradeState().battle;if(b){b.log.push('第'+b.turn+'回合：'+text);b.log=b.log.slice(-40);}addLog(escapeM4Text(text));}
function battleIntent(b){
  const beast=[['扑咬','野兽张口逼近，准备普通扑咬。',1,0],['伏身蓄势','它伏低身体试探，下一回合将猛扑。',.4,0],['猛扑','后腿蹬地，这一击更危险。',1.8,0]];
  const enemy=[['进攻','对手催动攻击蛊，准备进攻。',1,0],['固守','本回合不攻击，受到伤害减少55%。',0,.55],['强攻','真元涌动，即将发动强攻。',1.5,0],['试探','对手谨慎试探，攻势稍弱。',.8,0]];
  const spar=[['试招','对方示意出招，准备较轻的攻击。',.8,0],['示范防守','本回合不攻击，受到伤害减少50%。',0,.5],['重手考验','对方提醒你注意防守，即将加重攻势。',1.5,0]];
  const list=b.kind==='beast'?beast:b.kind==='enemy'?enemy:spar;
  const [name,hint,attack,guard]=list[(b.turn-1)%list.length];return {name,hint,attack,guard};
}
function battleGuIssue(uid){
  const x=state.guItems.find(i=>i.uid===uid),g=x&&guById(x.id),b=upgradeState().battle;
  if(!x||!g||!BATTLE_GU[g.id])return '无战斗用途';
  if(!x.active||x.missed||x.locked)return '需健康供养蛊';
  if(g.rank>state.rank)return '境界不足';
  if(g.id===2&&(state.rank!==1||b?.wineUsed))return state.rank!==1?'仅一转可用':'本场已提纯';
  if([7,8].includes(g.id)&&state.m4Strength[g.id===7?'black':'white']>=M4_EXTRA.strengthCap)return '气力已达上限';
  if(state.resources.真元<state.resourceMax.真元*BATTLE_GU[g.id].cost)return '真元不足';return '';
}
function battleEffectText(id){
  const c=BATTLE_GU[id];if(!c)return '';
  return {attack:'造成'+c.power+'基础伤害'+(c.pierce?'，穿透本回合敌方防守':''),defend:'本回合受到伤害减少'+Math.round(c.power*100)+'%',
    weaken:'敌方伤害降低'+Math.round(c.power*100)+'%，持续'+(c.duration||1)+'回合',focus:'下一次攻击伤害×'+c.power+'（不叠加）；本回合减伤20%',
    restore:'恢复25%真元上限，每场一次，仅一转可用',strength:'消耗这只蛊，永久气力+1，本回合减伤30%',boost:'消耗这只蛊，接下来两回合攻击额外+12（不叠加）'}[c.kind];
}
function requestBattleGu(uid,turn){
  const b=upgradeState().battle;if(!b||turn!==b.turn||battleGuIssue(uid))return false;
  const x=state.guItems.find(x=>x.uid===uid),c=BATTLE_GU[x.id];
  if(c.consume||c.kind==='strength'){b.confirmUid=uid;renderBattle();return true;}return battleAction('gu',uid,turn);
}
function confirmBattleGu(uid,turn){const b=upgradeState().battle;if(!b||b.confirmUid!==uid)return false;delete b.confirmUid;return battleAction('gu',uid,turn);}
function cancelBattleGu(){const b=upgradeState().battle;if(b){delete b.confirmUid;renderBattle();}}
function finishBattle(result){
  const u=upgradeState(),b=u.battle;if(!b||result==='draw'&&b.lethal||!['win','lose','flee','draw','dead'].includes(result))return false;
  u.battle=null;gameState=GAME.IDLE;const rewards=[];
  if(result==='win'){
    const money=b.lethal?(b.kind==='enemy'?5:3):1;applyEffect({元石:money});rewards.push(money+'元石');
    if(b.kind==='teacher'){applyEffect({修炼:3});rewards.push('修炼经验');}
    if(b.kind==='beast'){state.foodStock.pork=safeCount(state.foodStock.pork)+1;rewards.push('猪肉×1');}
    const candidates=RECIPES.filter(r=>!recipeKnown(r.id)||!recipeIsClear(r.id));
    if(b.kind==='enemy'&&candidates.length&&rng()<.3){const r=candidates[Math.floor(rng()*candidates.length)];if(learnRecipe(r.id))rewards.push(guById(r.output.id).name+'蛊方');}
  }
  const label={win:'获胜',lose:'切磋结束',flee:b.lethal?'撤退成功':'认输退出',draw:'切磋平局',dead:'战斗陨落'}[result];
  addLog(label+(rewards.length?'，获得'+rewards.join('、'):'，没有战利品。'));
  if(result!=='dead')upgradeTime(1);
  u.battleResult={name:b.name,result:label,turn:b.turn,start:b.start,end:{...state.resources,soul:u.soul},spent:b.spent,consumed:b.consumed,rewards,log:b.log};
  if(result==='dead'){endGame('战斗中伤重陨落。','战斗陨落');return true;}
  if(state.alive){saveGame();renderStatus();updateControls();renderBattleResult();}return true;
}
function battleAction(action,uid=null,expectedTurn=null){
  const u=upgradeState(),b=u.battle;if(!b||!state.alive||gameState!==GAME.BATTLE||saveReadBlocked||expectedTurn!==null&&expectedTurn!==b.turn)return false;
  if(!['basic','defend','flee','gu'].includes(action))return false;
  if(action==='basic'&&state.resources.体力<state.resourceMax.体力*.06||action==='gu'&&battleGuIssue(uid))return false;
  delete b.confirmUid;const intent=battleIntent(b);let guard=0,damage=0,pierce=false;
  if(action==='flee'){
    if(!b.lethal||rng()<UPGRADE.battleFleeChance){battleLog('离开战场。');return finishBattle('flee');}battleLog('撤退失败，对手按本回合征兆回应。');
  }else if(action==='basic'){
    const cost=state.resourceMax.体力*.06;state.resources.体力-=cost;b.spent.体力+=cost;
    damage=7+state.rank*2+state.m4Strength.black+state.m4Strength.white;battleLog('基础攻击，消耗6%体力。');
  }else if(action==='defend'){guard=.5;applyEffect({体力:.05});battleLog('防御，减伤50%，恢复5%体力。');}
  else{
    const x=state.guItems.find(i=>i.uid===uid),c=BATTLE_GU[x.id],cost=state.resourceMax.真元*c.cost;state.resources.真元-=cost;b.spent.真元+=cost;
    if(c.kind==='attack'){damage=c.power;pierce=!!c.pierce;}
    if(c.kind==='defend')guard=c.power;
    if(c.kind==='weaken'){b.weak=c.power;b.weakTurns=c.duration||1;}
    if(c.kind==='focus'){b.focus=c.power;guard=.2;}
    if(c.kind==='restore'){applyEffect({真元:c.power});b.wineUsed=true;}
    if(c.kind==='boost'){b.boost=c.power;b.boostTurns=3;}
    if(c.kind==='strength'){state.m4Strength[x.id===7?'black':'white']++;guard=.3;}
    if(c.consume||c.kind==='strength'){state.guItems=state.guItems.filter(i=>i.uid!==uid);syncLegacyGu();b.consumed.push(guById(x.id).name);}
    battleLog('催动'+guById(x.id).name+'：'+battleEffectText(x.id)+'。');
  }
  if(damage){damage=Math.round((damage+(b.boostTurns?b.boost:0))*b.focus*(pierce?1:1-intent.guard));b.focus=1;b.hp-=damage;battleLog('对手损失'+damage+'血量。');}
  if(b.hp<=0)return finishBattle('win');
  if(intent.attack){const pressure=b.lethal&&b.turn>=UPGRADE.battleMaxTurns?Math.min(3,1+(b.turn-UPGRADE.battleMaxTurns+1)*.15):1;
    const hit=Math.max(1,Math.round(b.power*intent.attack*pressure*(.8+rng()*.4)*(1-guard)*(b.weakTurns?1-b.weak:1)));
    state.resources.血条-=hit;battleLog(intent.name+'命中，你损失'+hit+'血量。');
  }else battleLog('对手保持守势，没有攻击。');
  if(b.weakTurns>0)b.weakTurns--;if(b.boostTurns>0)b.boostTurns--;
  if(!b.lethal&&state.resources.血条<=state.resourceMax.血条*.15){state.resources.血条=Math.max(1,state.resources.血条);return finishBattle('lose');}
  if(state.resources.血条<=0)return finishBattle('dead');
  if(!b.lethal&&b.turn>=UPGRADE.battleMaxTurns)return finishBattle('draw');
  b.turn++;saveGame();renderStatus();renderBattle();return true;
}
function closeBattlePage(){if(upgradeState().battle)return false;battlePreview=null;show('screen-play');updateControls();return true;}
function renderBattleResult(){
  const r=upgradeState().battleResult;if(!r)return;show('battlePanel');
  $('battleContent').innerHTML='<h1>'+escapeM4Text(r.result)+'</h1><p>'+escapeM4Text(r.name)+' · '+r.turn+'回合 · 战后经过1日</p><div class="battle-card"><h2>战后结算</h2><p>血量 '+Math.ceil(r.start.血条)+' → '+Math.ceil(r.end.血条)+'；真元 '+Math.floor(r.start.真元)+' → '+Math.floor(r.end.真元)+'；体力 '+Math.floor(r.start.体力)+' → '+Math.floor(r.end.体力)+'</p><p>魂魄 '+r.start.soul+' → '+r.end.soul+'</p><p>行动消耗：真元 '+r.spent.真元.toFixed(1)+'，体力 '+r.spent.体力.toFixed(1)+'。</p><p>消耗蛊虫：'+escapeM4Text(r.consumed.join('、')||'无')+'</p><p>奖励：'+escapeM4Text(r.rewards.join('、')||'无')+'</p></div><div class="battle-actions"><button onclick="closeBattlePage()">返回人生</button><button onclick="openActivities(\'rest\')">前往休养</button><button onclick="openForge()">前往炼蛊坊 / 查看配方</button><button onclick="openShop()">购买补给</button></div>';
}
function renderBattle(){
  const b=upgradeState().battle;if(!b)return;show('battlePanel');const intent=battleIntent(b),uid=b.confirmUid,x=uid&&state.guItems.find(x=>x.uid===uid);
  let html='<header class="battle-header"><div><p>第 '+b.turn+' 回合 · '+(b.lethal?'危险战斗':'切磋保护')+'</p><h1>'+escapeM4Text(b.name)+'</h1></div><p>人生时间暂停 · 战斗中无法购物或休养</p></header><div class="battle-columns"><section class="battle-card"><h2>对手 · '+b.rank+'转</h2><p>血量 '+Math.ceil(b.hp)+' / '+b.maxHp+'</p><div class="battle-intent"><strong>'+intent.name+'</strong><p>'+intent.hint+'</p></div>'+(b.lethal&&b.turn>=UPGRADE.battleMaxTurns?'<p class="battle-danger">久战压力上升，敌人攻击逐渐加强；不会自动安全脱战。</p>':'')+'</section><section class="battle-card"><h2>你的状态</h2><p>血量 '+Math.ceil(state.resources.血条)+' / '+state.resourceMax.血条+' · 真元 '+Math.floor(state.resources.真元)+' / '+state.resourceMax.真元+'</p><p>体力 '+Math.floor(state.resources.体力)+' / '+state.resourceMax.体力+' · 魂魄 '+upgradeState().soul+' / '+upgradeState().soulMax+'</p><p>蓄势 ×'+b.focus+' · 增力剩余 '+b.boostTurns+' 回合 · 削弱对手剩余 '+b.weakTurns+' 回合</p></section></div><div class="battle-actions"><button onclick="battleAction(\'basic\',null,'+b.turn+')" '+(state.resources.体力<state.resourceMax.体力*.06?'disabled':'')+'>基础攻击：体力 −6%</button><button onclick="battleAction(\'defend\',null,'+b.turn+')">防御：本回合减伤50%，体力 +5%</button><button onclick="battleAction(\'flee\',null,'+b.turn+')">'+(b.lethal?'撤退：45%成功，失败后对手回应':'认输：直接退出，无战利品')+'</button></div>';
  if(x)html+='<div class="battle-danger"><p>确认消耗这只'+escapeM4Text(guById(x.id).name)+'？'+battleEffectText(x.id)+'</p><button onclick="confirmBattleGu('+uid+','+b.turn+')">确认消耗并催动</button><button onclick="cancelBattleGu()">取消，不消耗回合</button></div>';
  html+='<h2>蛊虫行动</h2><div class="battle-gu-grid">'+state.guItems.filter(x=>BATTLE_GU[x.id]).map(x=>'<article class="battle-card"><h3>'+escapeM4Text(guById(x.id).name)+'</h3><p>'+battleEffectText(x.id)+'</p><p>真元消耗 '+Math.round(BATTLE_GU[x.id].cost*100)+'%</p><button onclick="requestBattleGu('+x.uid+','+b.turn+')" '+(battleGuIssue(x.uid)?'disabled':'')+'>'+(battleGuIssue(x.uid)||'催动')+'</button></article>').join('')+'</div><p class="battle-note">回合效果和数值为游戏设计；已供养、健康且境界允许的蛊才可催动。</p><h2>战斗记录</h2><ol class="battle-log">'+b.log.map(s=>'<li>'+escapeM4Text(s)+'</li>').join('')+'</ol>';
  $('battleContent').innerHTML=html;
}
