/* ============================================================
   蛊真人 · 属性系统
   属性：颜值 / 体质 / 智力 / 家境 / 运气（5项，基础值5 + 开局10点自由分配）
   资源：血条 / 真元 / 体力（绝对值，上限由 recalcMax 重算）
   展示：右侧竖排圆形能量环；左侧状态栏（境界/真元/修炼/资源/蛊虫）
   阈值：初始20，值超过时每次 +30（永不溢出）
   ============================================================ */

const ALLOC_KEYS = ['颜值', '体质', '智力', '家境', '运气'];
const ATTR_KEYS  = ALLOC_KEYS;

/* 每项属性的基础值：加点在此基础上叠加 */
const BASE_ATTRS = {颜值:5, 体质:5, 智力:5, 家境:5, 运气:5};

const G_COLOR = ['var(--g0)','var(--g1)','var(--g2)','var(--g3)'];

const state = {
  attrs: {颜值:0, 体质:0, 智力:0, 家境:0, 运气:0},
  thresholds: {颜值:20, 体质:20, 智力:20, 家境:20, 运气:20},   // 圆形阈值（新尺度）
  resources: {血条:100, 真元:0, 体力:100},        // 资源当前值（绝对值）
  resourceMax: {血条:100, 真元:0, 体力:100},      // 资源上限（recalcMax 重算）
  rank: 0, sub: 0, cult: 0,          // 境界：转数 / 小境界 / 修炼值
  breakPrep: 0, breakCooldown: 0, breakPity: 0, breakFails: 0,   // 突破蓄力 / 冷却 / 保底 / 连续失败
  money: 0,                          // 元石（整数，开局 = M3.moneyBase + 家境 × M3.moneyPer家境）
  cooldowns: {},                     // 事件 id → 最近触发的游戏日
  chainProgress: {},                 // 事件链 id → 下一阶段序号
  age: 10, month: 1, day: 1,
  region: '', 资质: null, alive: true,
  gu: new Set(), flags: new Set(), fired: new Set(),
  guItems: [], guSeq: 0, unknownGu: [], seenGu: new Set(), foodStock: {}, materialStock: {}, lastFeedMonth: null,
  m4ExploreDay: null, m4CaptureYear: null, m4CaptureCount: 0,
  m4MarketMonth: null, m4MarketIds: [], m4MarketBought: [], m4Strength: {black:0,white:0},
};

let showValueMode = new Set();

/* 属性数值 → 等级颜色（灰/蓝/紫/金），按新尺度分档（占位） */
function gradeColor(v){
  return v <= 8 ? G_COLOR[0] : v <= 14 ? G_COLOR[1] : v <= 20 ? G_COLOR[2] : G_COLOR[3];
}

/* 阈值同步：值超过阈值时，每次 +30，直到阈值高于值 */
function syncThreshold(){
  for (const k of ATTR_KEYS){
    while (state.attrs[k] > state.thresholds[k]){
      state.thresholds[k] += 30;
    }
  }
}

/* 按 M3 公式修正结果权重；weightByAttr 只列出参与本结果的属性。 */
function getModifiedWeight(baseWeight, weightByAttr, attrs = state.attrs){
  const base = Number(baseWeight ?? 1);
  if (!Number.isFinite(base) || base < 0) return 0;
  if (!Array.isArray(weightByAttr) || weightByAttr.length === 0 || base === 0) return base;
  let multiplier = 1;
  for (const key of weightByAttr){
    const value = Number(attrs[key] ?? M3.attrNeutral);
    const coef = M3.attrCoefs[key] ?? M3.attrCoef;
    multiplier *= 1 + (value - M3.attrNeutral) * coef;
  }
  multiplier = Math.min(M3.attrMultMax, Math.max(M3.attrMultMin, multiplier));
  return base * multiplier;
}

function getOutcomeWeights(outcomes, attrs = state.attrs){
  return (outcomes || []).map(outcome => getModifiedWeight(outcome.weight, outcome.weightByAttr, attrs));
}

function initialMoney(attrs = state.attrs){
  return Math.max(0, Math.trunc(M3.moneyBase + Math.max(0, Number(attrs.家境) || 0) * M3.moneyPer家境));
}

function applyMoneyDelta(delta){
  const amount = Number(delta);
  if (!Number.isSafeInteger(amount)) return;
  state.money = Math.max(0, state.money + amount);
}

/* 应用效果：三类 key —— 属性(整数点数) / 资源(占上限比例,|v|≤1) / 修炼(修炼日) */
function choiceCostReady(cost){
  return Object.entries(cost||{}).every(([k,v])=>v>=0 || (k==='元石'?state.money>=-v:k in state.resourceMax?state.resources[k]>=-v*state.resourceMax[k]:true));
}
function applyEffect(effect){
  for (const [k, v] of Object.entries(effect || {})){
    if (k in state.attrs){
      state.attrs[k] = Math.max(0, state.attrs[k] + v);
    } else if (k === '元石'){
      applyMoneyDelta(v);
    } else if (k === '修炼'){
      const sp = (state.资质 && state.资质.speed) || 1;   // 事件修炼值 ×资质速度 ×事件系数
      state.cult = Math.max(0, state.cult + v * sp * CULT.cultEventScale);
    } else if (k in state.resourceMax){
      if (Math.abs(v) > 1) console.warn('资源变化疑似误用点数单位:', k, v);
      const max = state.resourceMax[k];
      state.resources[k] = Math.min(max, Math.max(0, state.resources[k] + v * max));
    }
  }
  syncThreshold();
  recalcMax();   // 体质/转数变化后重算上限并夹值
}

/* 点击圆环：切换显示 名称 ↔ 阈值:值 */
function toggleValue(k){
  if (showValueMode.has(k)) showValueMode.delete(k);
  else showValueMode.add(k);
  renderAttrs();
}

/* 左侧五项属性：数值常显，按钮切换阈值说明。 */
function renderAttrs(){
  document.getElementById('attrs').innerHTML = ATTR_KEYS.map(k => {
    const v=state.attrs[k], t=state.thresholds[k], show=showValueMode.has(k);
    const progress=Math.max(0,Math.min(100,v/t*100));
    return `<li><button class="attribute-row" onclick="toggleValue('${k}')" aria-expanded="${show}" style="--attribute-progress:${progress}%">
      <span>${k}</span><strong>${v}</strong>${show?`<small>下一成长阈值 ${t}</small>`:''}
    </button></li>`;
  }).join('');
}

/* 渲染左侧状态栏：年月日 + 境界 + 真元 + 修炼进度 + 资源条 + 蛊虫图标 */
function renderStatus(){
  let html = `<div class="status-date">${state.age}岁${state.month}月${state.day}日</div>`;

  // 境界
  html += `<div class="realm">${realmLabel()}</div>`;

  // 真元名称·颜色（未开窍灰显）
  if (state.rank > 0 && state.资质){
    const es = ESSENCE[state.rank - 1];
    const cname = es.colors[state.sub] || es.colors[0];
    html += `<div class="realm-essence">${es.name} · ${cname}</div>`;
  } else {
    html += `<div class="realm-essence realm-off">未开窍</div>`;
  }

  // 修炼进度 + 小境界点
  if (state.rank > 0){
    const need = cultNeed(state.rank, state.sub);
    const prog = (need === Infinity) ? 1 : Math.min(1, state.cult / need);
    const pips = [0,1,2,3].map(i => `<i class="pip${i <= state.sub ? ' on' : ''}"></i>`).join('');
    html += `<div class="realm-cult">
      <div class="bar"><div class="bar-fill" style="width:${(prog * 100).toFixed(1)}%"></div></div>
      <span class="pips">${pips}</span>
    </div>`;
  }

  if (state.rank === CULT.maxRank && state.sub === 3 && state.cult >= cultNeed(state.rank,3)) html += '<div class="realm-essence">九转巅峰圆满 · 已达境界上限</div>';

  // 三条资源
  html += ['血条','真元','体力'].map(k => {
    const v = state.resources[k], m = state.resourceMax[k];
    if (m <= 0) return `<div class="status-bar"><div class="status-name">${k}</div><div class="status-empty">未开窍</div></div>`;
    const pct = Math.min(100, (v / m) * 100);
    return `<div class="status-bar"><div class="status-name">${k}</div><div class="bar"><div class="bar-fill" style="width:${pct.toFixed(1)}%"></div></div></div>`;
  }).join('');

  html += `<div class="status-bar"><div class="status-name">元石</div><div class="status-money">${state.money}</div></div>`;
  if (state.rank >= 6 && typeof upgradeState === 'function') html += `<div class="status-bar"><div class="status-name">仙元储备</div><div class="status-money">${upgradeState().immortalMoney}</div></div><div class="realm-essence">每月 +${CULT.immortalMonthly[state.rank]} · 用于宝黄天交易，与资源条分开</div>`;
  if (typeof ensureGuItems === 'function'){
    ensureGuItems();
    html += `<div class="status-bar"><div class="status-name">供养</div><div class="status-money">${state.guItems.filter(x=>x.active).length}/${M4.slots(state.attrs.家境)}</div></div>`;
  }

  if(state.upgrade)html+='<div class="status-bar"><div class="status-name">魂魄</div><div>'+Math.ceil(state.upgrade.soul)+' / '+state.upgrade.soulMax+'</div></div>';
  document.getElementById('status').innerHTML = html;
}
