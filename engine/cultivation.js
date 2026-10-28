/* ============================================================
   蛊真人 · 修炼核心逻辑（纯逻辑，不碰 DOM，便于无界面模拟）
   依赖：property.js 的 state / applyEffect / syncThreshold，
         data 的 CULT / SUB_LEVELS / ESSENCE，engine 的 rng()
   ============================================================ */

/* 小境界修炼需求，越界返回 Infinity */
function cultNeed(rank, sub){
  if (rank <= 0) return Infinity;
  const tier = CULT.need[rank - 1];
  if (!tier) return Infinity;
  return (sub >= 0 && sub < tier.length) ? tier[sub] : Infinity;
}

/* 重算三条资源上限；上限变大时当前值同步加差值（避免血条凭空缩水），变小时夹住 */
function recalcMax(){
  const hpMax = CULT.hpBase + state.attrs.体质 * CULT.hpPer;
  let essMax = 0;
  if (state.rank > 0 && state.资质){
    essMax = Math.round(CULT.essenceCapacity[state.rank] * state.资质.share * CULT.subFactor[state.sub]);
  }
  const news = { 血条: hpMax, 真元: essMax, 体力: CULT.staminaMax };
  for (const k of ['血条', '真元', '体力']){
    const diff = news[k] - state.resourceMax[k];
    if (diff > 0) state.resources[k] += diff;
    state.resourceMax[k] = news[k];
    state.resources[k] = Math.min(news[k], Math.max(0, state.resources[k]));
  }
}

/* 开窍时初始化修炼状态（真元从空开始，随每日恢复累积） */
function startCultivation(){
  state.rank = 1; state.sub = 0; state.cult = 0;
  state.breakPrep = 0; state.breakCooldown = 0; state.breakPity = 0; state.breakFails = 0;
  recalcMax();
  state.resources.血条 = state.resourceMax.血条;
  state.resources.体力 = state.resourceMax.体力;
  state.resources.真元 = 0;
}

/* 体力疲劳系数：体力低于 fatigueLow 时线性降到 fatigueFloor */
function fatigueFactor(){
  const ratio = state.resourceMax.体力 > 0 ? state.resources.体力 / state.resourceMax.体力 : 1;
  if (ratio >= CULT.fatigueLow) return 1;
  return CULT.fatigueFloor + (ratio / CULT.fatigueLow) * (1 - CULT.fatigueFloor);
}

/* 每日修炼：冷却递减 + 恢复资源 + 累积修炼值 + 小境界晋升。返回 { promoted, ready } */
function cultivateDay(){
  if (state.breakCooldown > 0) state.breakCooldown--;
  const promoted = [];
  if (state.rank <= 0 || !state.资质) return { promoted, ready:false };

  // 每日恢复
  const hpRec = CULT.recover.血条 + state.attrs.体质 * CULT.recoverHpPer;
  state.resources.血条 = Math.min(state.resourceMax.血条, state.resources.血条 + hpRec * state.resourceMax.血条);
  state.resources.体力 = Math.min(state.resourceMax.体力, state.resources.体力 + CULT.recover.体力 * state.resourceMax.体力);
  state.resources.真元 = Math.min(state.resourceMax.真元, state.resources.真元 + CULT.recover.真元 * state.resourceMax.真元);

  // 累积修炼值（智力加成独立于突破；事件奖励在 applyEffect 里乘速度再乘事件系数）
  const intFix = 1 + Math.min(state.attrs.智力, 30) * CULT.cultIntPer;
  const gain = CULT.baseCult * state.资质.speed * intFix * fatigueFactor();
  state.cult += gain;

  // 小境界晋升（while 跨多级，巅峰封顶）
  while (state.sub < 3){
    const need = cultNeed(state.rank, state.sub);
    if (need === Infinity || state.cult < need) break;
    state.cult -= need;
    state.sub += 1;
    promoted.push(state.sub);
  }
  if (state.sub >= 3){
    const peak = cultNeed(state.rank, 3);
    if (peak !== Infinity) state.cult = Math.min(state.cult, peak);
  }
  recalcMax();   // 小境界变化 → 真元上限变化

  return { promoted, ready: isBreakReady() };
}

/* 是否可触发突破抉择（由状态实时推导，读档后自然重现） */
function isBreakReady(){
  if (state.rank <= 0 || state.rank >= 3) return false;
  if (state.sub < 3) return false;
  if (state.cult < cultNeed(state.rank, state.sub)) return false;
  if (state.breakCooldown > 0) return false;
  const ess = state.resourceMax.真元 > 0 ? state.resources.真元 / state.resourceMax.真元 : 0;
  return ess >= CULT.breakEssenceReq;
}

/* 突破成功率（extra 用于酒虫等额外加成），夹在 [min,max] */
function breakSuccessRate(extra){
  const q = state.资质;
  let p = CULT.breakBase + (q ? q.fix : 0);
  p += Math.min(state.attrs.智力 * CULT.breakIntPer, CULT.breakIntCap);
  p += Math.min(state.attrs.运气 * CULT.breakLuckPer, CULT.breakLuckCap);
  p += state.breakPrep * CULT.prepBonus;
  p += state.breakPity;
  p -= state.rank * CULT.breakRankPenalty;
  p += (extra || 0);
  return Math.min(CULT.breakClampMax, Math.max(CULT.breakClampMin, p));
}

/* 执行突破：返回 { ok, outcome }，outcome ∈ 成功/轻/重/致命/爆体 */
function resolveBreakthrough(rate){
  if (rng() < rate){
    applyBreakthroughSuccess();
    return { ok:true, outcome:'成功' };
  }
  // 失败：十绝体先 roll 爆体（叠加），未爆体再走三档
  if (state.资质 && state.资质.boom > 0 && rng() < state.资质.boom){
    return { ok:false, outcome:'爆体' };
  }
  state.breakFails = (state.breakFails || 0) + 1;   // 连续失败 +1
  const fatal = (state.rank >= 2) ? fatalChance(state.breakFails) : 0;   // 一转无致命（新手保护）
  const heavy = Math.min(CULT.failHeavy, 1 - fatal);
  const r = rng();
  if (r < fatal){
    return { ok:false, outcome:'致命' };
  }
  state.breakPity = Math.min(CULT.pityMax, state.breakPity + CULT.pityPer);   // 保底
  if (r < fatal + heavy){
    state.resources.血条 = Math.max(0, state.resources.血条 - 0.40 * state.resourceMax.血条);
    state.cult = Math.max(0, state.cult * 0.65);
    return { ok:false, outcome:'重' };
  }
  state.resources.真元 = 0.20 * state.resourceMax.真元;
  state.cult = Math.max(0, state.cult * 0.85);
  return { ok:false, outcome:'轻' };
}

/* 致命档概率：连续失败越多越危险（前 fatalStartFail 次失败无致命） */
function fatalChance(fails){
  if (fails <= CULT.fatalStartFail) return 0;
  return Math.min(CULT.fatalMax, (fails - CULT.fatalStartFail) * CULT.fatalPer);
}

/* 突破成功 */
function applyBreakthroughSuccess(){
  state.rank += 1;
  state.sub = 0;
  state.cult = 0;
  state.breakPrep = 0; state.breakPity = 0; state.breakCooldown = 0; state.breakFails = 0;
  recalcMax();
  state.resources.真元 = CULT.breakEssenceAfter * state.resourceMax.真元;
  const k = ATTR_KEYS[Math.floor(rng() * ATTR_KEYS.length)];
  state.attrs[k] += 1;
  syncThreshold();
}

/* 蓄力：+1 层，进入冷却 */
function doPrep(){
  state.breakPrep = Math.min(CULT.prepMax, state.breakPrep + 1);
  state.breakCooldown = CULT.prepDays;
}

/* 寿元（按转数） */
function lifespan(){ return CULT.lifespan[state.rank] ?? 70; }

/* 境界文案 */
function realmLabel(){
  if (state.rank <= 0) return '凡人 · 未开窍';
  return state.rank + '转 · ' + (SUB_LEVELS[state.sub] || '');
}

/* 死亡判定：返回死亡原因（陨落/寿终）或 null */
function checkDeath(){
  if (state.resources.血条 <= 0) return '陨落';
  if (state.age >= lifespan()) return '寿终';
  return null;
}
