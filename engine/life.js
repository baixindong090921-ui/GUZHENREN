/* ============================================================
   蛊真人 · 循环 + 状态机 + 事件系统 + 抉择 + 修炼
   流程：方源重生(随机地域) → 选蛊虫(5选1) → 加点(10点) → 对话
   时间：岁/月/日，30日=1月，12月=1岁（初始10岁）
   15岁：开窍大典 → 修炼 → 突破抉择 → 死亡 → 重生
   ============================================================ */

const GAME = { IDLE:'idle', RUNNING:'running', CHOOSING:'choosing', ENDED:'ended' };
let gameState = GAME.IDLE;
let speed = 800, paused = false, timer = null;

const EVENT_RATE = 0.3;       // 每日触发事件概率（节奏改造后每天只结算一次）

let drawnGu = [], pickedGu = null;
let alloc = {颜值:0, 体质:0, 智力:0, 家境:0, 运气:0};
let totalPoints = 10, remainPoints = 10;
let warehousePage = 0;

const $ = id => document.getElementById(id);

/* ---------- 屏幕切换 ---------- */
function show(id){
  ['screen-start','screen-gupick','screen-alloc','screen-play'].forEach(s => $(s).classList.add('hidden'));
  $(id).classList.remove('hidden');
}

/* ---------- 日志输出（显示 岁/月/日） ---------- */
function addLog(html){
  const li = document.createElement('li');
  li.className = 'log';
  li.innerHTML = `<span class="age">${state.age}岁${state.month}月${state.day}日</span><span class="content">${html}</span>`;
  const log = $('log');
  log.appendChild(li);
  while (log.children.length > 200) log.firstChild.remove();   // 只保留最近 200 条
  log.scrollTop = log.scrollHeight;
}

/* ============ 开始：随机地域 → 蛊虫选择 ============ */
/* 纯状态初始化：根据重生继承初始化 state（不碰 DOM，便于测试） */
function initStateFromRebirth(rebirth){
  const meta = getMeta();
  const inh = (rebirth && rebirth.attrs) || {};
  state.attrs = {
    颜值: BASE_ATTRS.颜值 + (inh.颜值 || 0),
    体质: BASE_ATTRS.体质 + (inh.体质 || 0),
    智力: BASE_ATTRS.智力 + (inh.智力 || 0),
    家境: BASE_ATTRS.家境 + (inh.家境 || 0),
    运气: luckBase(meta),   // 运气不参与继承，只随轮回次数衰落
  };
  state.thresholds = {颜值:20, 体质:20, 智力:20, 家境:20, 运气:20};
  showValueMode.clear();
  state.age = 10; state.month = 1; state.day = 1;
  state.region = REGIONS[Math.floor(rng() * REGIONS.length)].name;  // 随机出生地域
  state.资质 = null;
  state.alive = true;
  state.gu = new Set(['春秋蝉']);   // 开局拥有六转仙蛊「春秋蝉」
  if (rebirth && rebirth.gu) state.gu.add(rebirth.gu);   // 继承保留的一只蛊
  initM4Life();
  state.flags = new Set(); state.fired = new Set();
  state.cooldowns = {}; state.chainProgress = {};
  // 修炼状态重置
  state.rank = 0; state.sub = 0; state.cult = 0;
  state.money = 0;
  state.breakPrep = 0; state.breakCooldown = 0; state.breakPity = 0; state.breakFails = 0;
  // 资源：recalcMax 重算上限，血条/体力满，真元空
  recalcMax();
  state.resources.血条 = state.resourceMax.血条;
  state.resources.体力 = state.resourceMax.体力;
  state.resources.真元 = 0;
  drawnGu = []; pickedGu = null;
  alloc = {颜值:0, 体质:0, 智力:0, 家境:0, 运气:0};
  const cost = (rebirth && rebirth.freePointsCost) || 0;
  totalPoints = Math.max(0, 10 - cost);   // 继承越多，自由加点越少
  remainPoints = totalPoints;
}

function startNew(rebirth){
  initStateFromRebirth(rebirth);
  gameState = GAME.IDLE;
  drawGu();
  show('screen-gupick');
}

/* 从所有一转蛊虫里随机抽 5 个 */
function drawGu(){
  const rank1 = GU.filter(g => g.rank === 1 && g.pickable !== false);
  const pool = [...rank1];
  drawnGu = [];
  for (let i = 0; i < 5 && pool.length; i++){
    const idx = Math.floor(rng() * pool.length);
    drawnGu.push(pool[idx]);
    pool.splice(idx, 1);
  }
  $('guList').innerHTML = `<ul class="talent-list">` + drawnGu.map((g, i) =>
    `<li><div class="talent" style="--grade-color:${G_COLOR[1]}" onclick="pickGu(${i})">
      <span class="talent-name">${g.name}</span>
      <span class="talent-description">${g.流派} · ${g.定位} · ${g.desc}</span>
    </div></li>`).join('') + `</ul>`;
}

function pickGu(i){
  pickedGu = drawnGu[i];
  addGuItem(pickedGu.id);
  goAlloc();
}

/* ============ 加点 ============ */
function goAlloc(){
  renderAlloc();
  show('screen-alloc');
}

function renderAlloc(){
  const ok = remainPoints === 0;
  $('btnStart').disabled = !ok;
  $('btnStart').className = ok ? 'primary' : 'error';
  let html = `<ul class="alloc classic">`;
  html += `<li class="left${ok ? ' left-0' : ''}"><span class="name">剩余点数</span><button class="font-mono">${remainPoints}</button></li>`;
  html += ALLOC_KEYS.map(k => {
    const final = state.attrs[k] + alloc[k];
    return `<li class="property" style="--grade-color:${gradeColor(final)}">
      <span class="name">${k}</span>
      <div class="allocation-input">
        <button onclick="chg('${k}',-1)">−</button>
        <input class="font-mono" type="number" value="${alloc[k]}" min="0" onchange="setV('${k}',this.value)">
        <button onclick="chg('${k}',1)">+</button>
      </div>
    </li>`;
  }).join('');
  html += `</ul>`;
  $('allocPanel').innerHTML = html;
}

function chg(k, d){
  const nv = alloc[k] + d;
  const delta = remainPoints - d;
  if (delta < 0 || nv < 0) return;
  alloc[k] = nv; remainPoints = delta;
  renderAlloc();
}
function setV(k, val){
  const nv = Math.max(0, parseInt(val) || 0);
  const diff = nv - alloc[k];
  if (remainPoints - diff < 0) return;
  alloc[k] = nv; remainPoints -= diff;
  renderAlloc();
}
function randomAlloc(){
  alloc = {颜值:0, 体质:0, 智力:0, 家境:0, 运气:0};
  let r = totalPoints;
  while (r > 0){
    const k = ALLOC_KEYS[Math.floor(rng() * ALLOC_KEYS.length)];
    alloc[k]++; r--;
  }
  remainPoints = 0;
  renderAlloc();
}

/* ============ 开始对话 ============ */
function startLife(){
  ALLOC_KEYS.forEach(k => state.attrs[k] += alloc[k]);
  state.money = initialMoney();
  giveInitialFood();
  syncThreshold();
  recalcMax();
  state.resources.血条 = state.resourceMax.血条;
  state.resources.体力 = state.resourceMax.体力;
  show('screen-play');
  renderAttrs();
  renderStatus();
  gameState = GAME.IDLE; paused = false;
  $('log').innerHTML = '';
  addLog('<span class="choice-picked">✦ 你重生于' + state.region + '，前世五百年的记忆如潮水般涌来。</span>');
  addLog('蛊虫：' + [...state.gu].join('、'));
  updateControls();
}

/* 继续上一世（读取本世存档，直接回到剧情页） */
function continueGame(){
  if (!loadGame()) return;
  syncThreshold();
  show('screen-play');
  renderAttrs();
  renderStatus();
  $('log').innerHTML = '';
  addLog('<span class="choice-picked">✦ 你从上次的进度继续。</span>');
  if (state.unknownGu.length) addLog('旧档中有未识别的蛊虫名称，已保留：'+state.unknownGu.map(escapeM4Text).join('、'));
  gameState = GAME.IDLE; paused = false;
  updateControls();
}

/* ============ 开窍大典（15岁，随机资质 → 开始修炼） ============ */
function 开窍大典(){
  state.资质 = drawAptitude();
  startCultivation();   // rank=1、sub=0、cult=0，资源初始化
  addLog('<span class="choice-q">⚡ 十五岁，开窍大典！</span>');
  addLog('你开窍成功，获得了 <span class="choice-picked">' + state.资质.name + '</span> 资质（' + state.资质.desc + '）。');
  addLog('真元「' + state.资质.真元 + '」占据空窍 ' + state.资质.ratio + '。');
}

/* ============ 事件系统 ============ */
function pickEvent(){
  return pickM3Event(AUTO_EVENTS, CHOICE_EVENTS);
}

function fireNormal(e){
  markM3EventTriggered(e);
  applyEffect(e.effect);
  addLog(e.text + effectNote(e.effect));
}

/* 资源变化的日志标注，如“（血条 −20%）” */
function effectNote(effect){
  if (!effect) return '';
  const notes = [];
  for (const [k, v] of Object.entries(effect)){
    if (k in state.resourceMax && v !== 0) notes.push(`${k} ${v > 0 ? '+' : '−'}${Math.round(Math.abs(v) * 100)}%`);
  }
  return notes.length ? ` <span class="choice-picked">（${notes.join('，')}）</span>` : '';
}

function fireChoice(e){
  gameState = GAME.CHOOSING;
  stopTimer();
  addLog('<span class="choice-q">⚡ ' + e.text + '</span>');
  const memory = e.id ? getChoiceHistory(e.id) : null;
  if (memory){
    const escapeText = value => String(value || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    addLog(`<span class="choice-memory">前世记忆：你曾选择“${escapeText(memory.optionText)}”——${escapeText(memory.summary)}</span>`);
  }
  const box = document.createElement('div');
  box.className = 'choice-buttons';
  e.choices.forEach(opt => {
    const b = document.createElement('button');
    b.textContent = opt.text;
    const rawMoneyCost = Number(opt.cost && opt.cost.元石) || 0;
    const moneyCost = rawMoneyCost < 0 ? Math.ceil(-rawMoneyCost) : 0;
    if (moneyCost) b.textContent += `（花费 ${moneyCost} 元石）`;
    const outcomeWeights = opt.outcomes ? getOutcomeWeights(opt.outcomes) : null;
    const outcomeTotal = outcomeWeights ? outcomeWeights.reduce((sum, weight) => sum + weight, 0) : 1;
    // need 不满足则禁用并附原因
    if (!Number.isFinite(outcomeTotal) || outcomeTotal <= 0){
      b.disabled = true;
      b.textContent += '（结果权重无效）';
    } else if (moneyCost > state.money){
      b.disabled = true;
      b.textContent += `（不足，当前 ${state.money}）`;
    } else if (opt.need && !opt.need(state)){
      b.disabled = true;
      b.textContent += '（' + (opt.needText || '条件不足') + '）';
    }
    b.onclick = () => {
      if (gameState !== GAME.CHOOSING) return;      // 已结算/死亡则忽略
      if (moneyCost > state.money) return;         // 执行前再次检查元石
      if (opt.need && !opt.need(state)) return;     // 再次校验
      const currentWeights = opt.outcomes ? getOutcomeWeights(opt.outcomes) : null;
      const currentTotal = currentWeights ? currentWeights.reduce((sum, weight) => sum + weight, 0) : 1;
      if (!Number.isFinite(currentTotal) || currentTotal <= 0) return;
      markM3EventTriggered(e);                      // 先记触发与链进度，再结算结果
      if (opt.cost) applyEffect(opt.cost);          // 扣消耗
      // 掷结果
      let effect = opt.effect, result = opt.result, flags = opt.flags, act = opt.act, gu = opt.gu;
      let resultId = opt.resultId;
      if (opt.outcomes){
        let r = rng() * currentTotal;
        for (let i = 0; i < opt.outcomes.length; i++){
          const o = opt.outcomes[i];
          r -= currentWeights[i];
          if (r <= 0){
            effect = o.effect ?? effect;
            result = o.result ?? result;
            flags = o.flags ?? flags;
            act = o.act ?? act;
            gu = o.gu ?? gu;
            resultId = o.id;
            break;
          }
        }
      }
      applyEffect(effect);
      if (gu && isGuName(gu)) addGuItem(guByName(gu).id);
      if (flags) flags.forEach(f => state.flags.add(f));
      box.remove();
      addLog('<span class="choice-picked">→ ' + opt.text + '</span>');
      if (result) addLog(result);
      if (act) act();                                // 可执行任意逻辑（突破/死亡等）
      if (e.id && opt.id) recordChoiceHistory(e.id, opt.id, resultId, opt.text, result || opt.result || '已完成选择');
      if (gameState === GAME.ENDED) return;          // act 里已 endGame（爆体/致命）
      const d = checkDeath();
      if (d){ endGame(d === '陨落' ? '你油尽灯枯，陨落了。' : '你寿元已尽。', d); return; }
      renderAttrs();
      renderStatus();
      saveGame();
      resume();
    };
    box.appendChild(b);
  });
  $('log').appendChild(box);
  $('log').scrollTop = $('log').scrollHeight;
  updateControls();
}

/* ============ 突破抉择（运行时动态生成） ============ */
function buildBreakthroughEvent(){
  const base = breakSuccessRate();
  const hasWine = isGuUsableByName('酒虫') && state.rank === 1 && !state.flags.has('wineUsed');
  const choices = [];
  choices.push({ text: `立即冲击（成功率 ${Math.round(base * 100)}%）`, act: () => doBreak(base) });
  if (state.breakPrep < CULT.prepMax){
    choices.push({ text: `蓄力再战（+${Math.round(CULT.prepBonus * 100)}%）`, act: doPrepChoice });
  }
  if (hasWine){
    const wp = breakSuccessRate(CULT.wineBonus);
    choices.push({ text: `借酒虫提纯（成功率 ${Math.round(wp * 100)}%，仅此一次）`, act: () => { state.flags.add('wineUsed'); doBreak(wp); } });
  }
  return { text: '你已至「' + realmLabel() + '」圆满，是否冲击下一转？', choices };
}

function doBreak(rate){
  const res = resolveBreakthrough(rate);
  if (res.ok){
    addLog(`<span class="choice-picked">突破成功！你晋入「${realmLabel()}」。</span>`);
  } else if (res.outcome === '爆体'){
    endGame('你突破时道痕反噬，爆体而亡。', '爆体');
  } else if (res.outcome === '致命'){
    endGame('你冲击境界失败，走火入魔而亡。', '突破失败');
  } else if (res.outcome === '重'){
    addLog('突破失败，你受到重创（血条 −40%，修炼值 −35%）。');
  } else {
    addLog('突破失败，真元大损（真元降至 20%，修炼值 −15%）。');
  }
}

function doPrepChoice(){
  doPrep();
  addLog(`你选择蓄力再战，闭关 ${CULT.prepDays} 天（下次成功率 +${Math.round(CULT.prepBonus * 100)}%）。`);
}

/* ============ 循环 + 变速 + 节奏改造 ============ */
function startTimer(){ stopTimer(); timer = setTimeout(tick, speed); }
function stopTimer(){ if (timer){ clearTimeout(timer); timer = null; } }

function tick(){
  if (gameState !== GAME.RUNNING || paused) return;
  advanceDay();
  if (gameState === GAME.RUNNING) startTimer();
}

/* 推进一天，返回这天是否“有看点”（事件/晋升/开窍/死亡/突破） */
function stepChildhoodMonth(){
  state.day = 1;
  state.month++;
  if (state.month > 12){ state.month = 1; state.age++; }
  for (const msg of settleMonthlyFeeding()) addLog(msg);

  // 进入十五岁时只开窍一次，本月不再抽取童年事件。
  if (state.age >= 15 && !state.资质){
    开窍大典();
    return true;
  }

  // 童年每次推进至多一条事件，不经过每日事件率和修炼结算。
  const event = pickM3Event(AUTO_EVENTS, []);
  if (event) fireNormal(event);
  return true;
}

function stepDay(){
  if (!state.资质 && state.age < 15) return stepChildhoodMonth();

  const previousMonth=monthKey();
  state.day++;
  if (state.day > 30){ state.day = 1; state.month++; }
  if (state.month > 12){ state.month = 1; state.age++; }
  if (monthKey()!==previousMonth) for (const msg of settleMonthlyFeeding()) addLog(msg);

  // 死亡判定
  const d = checkDeath();
  if (d){ endGame(d === '陨落' ? '你油尽灯枯，陨落了。' : '你寿元已尽。', d); return true; }

  // 开窍大典
  if (state.age >= 15 && !state.资质){ 开窍大典(); return true; }

  // 每日修炼 + 小境界晋升
  const r = cultivateDay();
  if (r.promoted.length){
    r.promoted.forEach(() => addLog(`修为精进，晋入「${realmLabel()}」小境界。`));
    return true;
  }
  if (r.ready){ fireChoice(buildBreakthroughEvent()); return true; }   // 突破优先，当天不再抽随机事件

  // 随机事件：抉择才打断推进，纯修炼/资源小事件只记日志、不打断
  if (rng() <= EVENT_RATE){
    const e = pickEvent();
    if (e){
      if (e.choices){ fireChoice(e); return true; }
      fireNormal(e);
      const d2 = checkDeath();
      if (d2 && state.alive){ endGame(d2 === '陨落' ? '你油尽灯枯，陨落了。' : '你寿元已尽。', d2); return true; }
    }
  }
  return false;
}

/* 循环推进，直到有看点、满 60 天、或状态不再 RUNNING；渲染与存档每次只做一次 */
function advanceDay(){
  let steps = 0;
  while (steps < 60 && gameState === GAME.RUNNING){
    const notable = stepDay();
    steps++;
    if (notable || gameState !== GAME.RUNNING) break;
  }
  // 抉择弹出时（CHOOSING）也要刷新状态栏日期，只有 RUNNING 才存档
  if (gameState === GAME.RUNNING || gameState === GAME.CHOOSING){
    renderAttrs();
    renderStatus();
  }
  if (gameState === GAME.RUNNING) saveGame();
}

function resume(){ if (gameState === GAME.ENDED) return; gameState = GAME.RUNNING; updateControls(); startTimer(); }

function togglePause(){
  if (gameState === GAME.ENDED) return;
  paused = !paused;
  if (!paused && gameState === GAME.RUNNING) startTimer(); else stopTimer();
  updateControls();
}

function nextStep(){
  if (gameState === GAME.ENDED) return;
  if (gameState === GAME.IDLE){ resume(); return; }
  stopTimer();
  if (gameState === GAME.RUNNING) advanceDay();
  if (gameState === GAME.RUNNING && !paused) startTimer();
}

function setSpeed(ms, id){
  speed = ms;
  ['btn1x','btn2x','btn4x'].forEach(b => $(b).classList.remove('active'));
  $(id).classList.add('active');
  if (gameState === GAME.RUNNING && !paused) startTimer();
}

function updateControls(){
  $('btnPause').textContent = paused ? '▶ 继续' : '⏸ 暂停';
  $('btnPause').classList.toggle('active', paused);
  $('btnPause').disabled = (gameState === GAME.ENDED || gameState === GAME.CHOOSING);
  $('btnNext').disabled = (gameState === GAME.ENDED || gameState === GAME.CHOOSING);
}

/* ============ 蛊虫仓库（5×6 网格，每页 30 格，超出翻页） ============ */
const WAREHOUSE_PAGE_SIZE = 30;
function openWarehouse(){
  warehousePage = 0;
  renderWarehouse();
  $('warehouse').classList.remove('hidden');
}
function closeWarehouse(){
  $('warehouse').classList.add('hidden');
}
function warehousePrev(){ if (warehousePage > 0){ warehousePage--; renderWarehouse(); } }
function warehouseNext(){ warehousePage++; renderWarehouse(); }
function renderWarehouse(){
  ensureGuItems();
  const guList = state.guItems.concat(state.unknownGu.map(name=>({unknownName:name})));
  const totalPages = Math.max(1, Math.ceil(guList.length / WAREHOUSE_PAGE_SIZE));
  if (warehousePage >= totalPages) warehousePage = totalPages - 1;
  const start = warehousePage * WAREHOUSE_PAGE_SIZE;
  const pageGu = guList.slice(start, start + WAREHOUSE_PAGE_SIZE);
  let html = '';
  for (let i = 0; i < WAREHOUSE_PAGE_SIZE; i++){
    const item = pageGu[i], gu = item && guById(item.id);
    const name = gu?.name || item?.unknownName || '';
    const food = gu && FOODS.find(f=>f.id===gu.foodId);
    html += `<div class="gu-cell${name ? ' filled' : ''}">
      <div class="gu-cell-img"></div>
      <div class="gu-cell-name">${escapeM4Text(name)}</div>
      ${gu ? `<small>${gu.rank}转 · ${gu.流派}</small><small>${food ? '食物：'+food.name : '无普通食物'}</small><small>${item.active ? item.missed ? '饥饿' : '供养中' : '仓库中'}</small><button onclick="toggleGuFeeding(${item.uid})">${item.active ? '停止供养' : '加入供养'}</button>` : name ? '<small>旧档未识别，已保留</small>' : ''}
    </div>`;
  }
  $('warehouseGrid').innerHTML = html;
  $('warehousePage').textContent = `${warehousePage + 1} / ${totalPages}`;
  $('warehousePrev').disabled = (warehousePage <= 0);
  $('warehouseNext').disabled = (warehousePage >= totalPages - 1);
  renderM4Panels();
}
