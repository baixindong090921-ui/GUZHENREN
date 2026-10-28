/* ============================================================
   蛊真人 · 春秋蝉重生系统（M1）
   死亡抉择 → 催动春秋蝉（失败概率）→ 继承（保留一只蛊虫）→ 重来一世
   跨世存档：轮回次数 + 永久图鉴（事件 / 蛊虫 / 结局）
   注：M2 暂停「属性继承」，只保留「保留蛊虫」（属性尺度压缩后 15% 归零，M3 再重做）
   ============================================================ */

const META_KEY = 'gu_game_meta';
const BASE_LUCK = 5;                 // 初始基础运气
const INHERIT_GU_COST = 2;           // 保留一只蛊虫的代价（扣下一世自由加点）

/* ---------- 跨世存档 ---------- */
function getMeta(){
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw){
      const m = JSON.parse(raw);
      m.图鉴 = m.图鉴 || { events:[], gu:[], endings:[] };
      if (typeof m.rebirths !== 'number') m.rebirths = 0;
      if (!m.choiceHistory || typeof m.choiceHistory !== 'object') m.choiceHistory = {};
      return m;
    }
  } catch (e) {}
  return { rebirths:0, 图鉴:{ events:[], gu:[], endings:[] }, choiceHistory:{} };
}
function saveMeta(meta){
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
}

function getChoiceHistory(eventId){
  return getMeta().choiceHistory[eventId] || null;
}

function recordChoiceHistory(eventId, optionId, resultId, optionText, resultText){
  if (!eventId || !optionId) return;
  const meta = getMeta();
  meta.choiceHistory[eventId] = {
    optionId,
    resultId: resultId || null,
    optionText: String(optionText || '').slice(0, 120),
    summary: String(resultText || '').slice(0, 160),
  };
  saveMeta(meta);
}

/* 基础运气随轮回次数永久衰落，最低 0 */
function luckBase(meta){ return Math.max(0, BASE_LUCK - meta.rebirths); }

/* 重生失败率：受当前运气影响（占位公式），春秋必成(M5)后再降为 0 */
function rebirthFailRate(luck){
  return Math.min(0.60, Math.max(0.05, 0.50 - luck * 0.04));
}

/* 把本世见过的事件 / 蛊虫并入永久图鉴（去重） */
function recordLife(meta){
  const g = meta.图鉴;
  for (const id of state.fired) if (!g.events.includes(id)) g.events.push(id);
  for (const name of new Set([...state.gu,...(state.seenGu || [])])) if (!g.gu.includes(name)) g.gu.push(name);
}

/* ---------- 死亡抉择面板 ---------- */
function showDeathPanel(reason){
  const meta = getMeta();
  const sum = `享年 ${state.age} 岁 · ${realmLabel()}<br>` +
    ATTR_KEYS.map(k => `${k} ${state.attrs[k]}`).join(' · ') +
    `<br>蛊虫：${[...state.gu].join('、')}`;
  $('deathContent').innerHTML = `
    <div class="sec">☠ 本世终结</div>
    <div class="death">${reason}</div>
    <div style="color:var(--g0);line-height:1.8;text-align:center">${sum}</div>
    <div style="color:var(--g0);text-align:center">轮回次数：${meta.rebirths} · 当前运气 ${state.attrs.运气}</div>
    <div class="controls" style="flex-direction:column;width:100%">
      <button class="primary" onclick="tryRebirth()">催动春秋蝉 · 重来一世</button>
      <button onclick="settleDeath()">就此结算</button>
    </div>`;
  $('deathPanel').classList.remove('hidden');
}

/* ---------- 催动春秋蝉 ---------- */
function tryRebirth(){
  const luck = state.attrs.运气;
  const failRate = rebirthFailRate(luck);
  if (rng() < failRate){
    finalizeEnding('重生失败',
      `春秋蝉催动失败（成功率约 ${Math.round((1 - failRate) * 100)}%），你的意志消散于光阴长河。`);
    return;
  }
  const meta = getMeta();
  meta.rebirths += 1;
  saveMeta(meta);
  showInheritPanel();
}

/* ---------- 继承面板（M2：只保留蛊虫） ---------- */
function showInheritPanel(){
  const meta = getMeta();
  const owned = [...state.gu].filter(n => n !== '春秋蝉');
  const guOpts = owned.map(n => `<option value="${n}">${n}</option>`).join('') || '<option value="">无可用蛊</option>';

  $('deathContent').innerHTML = `
    <div class="sec">催动春秋蝉 · 选择继承</div>
    <div style="color:var(--g3);text-align:center">重生后基础运气将降为 ${luckBase(meta)}</div>
    <div class="inherit-list">
      <label class="inherit-item${owned.length ? '' : ' disabled'}">
        <span class="inherit-head"><input type="checkbox" id="inhGu" onchange="updateInherit()" ${owned.length ? '' : 'disabled'}> 保留一只蛊虫（春秋蝉始终跟随）</span>
        <select id="inhGuSel">${guOpts}</select>
        <span class="inherit-cost">代价 −${INHERIT_GU_COST} 自由加点</span>
      </label>
    </div>
    <div style="color:var(--g0);text-align:center">下一世自由加点：<span class="choice-picked" id="inhPoints">10</span></div>
    <button class="primary" onclick="doRebirth()">重生</button>`;
  updateInherit();
  $('deathPanel').classList.remove('hidden');
}

function updateInherit(){
  const checked = $('inhGu') && $('inhGu').checked;
  $('inhPoints').textContent = Math.max(0, 10 - (checked ? INHERIT_GU_COST : 0));
}

function doRebirth(){
  const inh = { gu:null, freePointsCost:0 };
  if ($('inhGu') && $('inhGu').checked){
    const sel = $('inhGuSel').value;
    if (sel) inh.gu = sel;
    inh.freePointsCost += INHERIT_GU_COST;
  }
  $('deathPanel').classList.add('hidden');
  startNew(inh);
}
