/* ============================================================
   M3 事件引擎：阶段/地域筛选、冷却、事件权重与事件链
   ============================================================ */

function gameDayNumber(){
  return (state.age * 12 + state.month - 1) * 30 + state.day;
}

function currentEventPhase(){
  return state.资质 ? 'cultivation' : 'childhood';
}

function isM3EventEligible(e){
  if (!e || !e.id) return false;
  if (state.age < (e.min ?? 0) || state.age > (e.max ?? 200)) return false;
  if (e.phase && e.phase !== currentEventPhase()) return false;
  if (e.region && e.region !== 'any' && e.region !== state.region) return false;
  if (e.once && state.fired.has(e.id)) return false;
  if (e.cond && !e.cond(state)) return false;
  if (e.requiresFlags && !e.requiresFlags.every(flag => state.flags.has(flag))) return false;
  if (e.excludesFlags && e.excludesFlags.some(flag => state.flags.has(flag))) return false;
  if (e.cooldown){
    const last = state.cooldowns[e.id];
    if (Number.isFinite(last) && gameDayNumber() - last < e.cooldown) return false;
  }
  if (e.chainId){
    const nextStep = state.chainProgress[e.chainId] ?? 1;
    if (e.chainStep !== nextStep) return false;
  }
  return true;
}

function markM3EventTriggered(e){
  if (!e || !e.id) return;
  state.fired.add(e.id);
  if (e.cooldown) state.cooldowns[e.id] = gameDayNumber();
  if (e.chainId) state.chainProgress[e.chainId] = e.chainStep + 1;
}

function pickM3Event(autoEvents, choiceEvents, random = rng){
  const pool = [];
  const collect = (events, defaultWeight, chanceScale) => {
    for (const e of events){
      if (!isM3EventEligible(e)) continue;
      const chance = (e.chance ?? 1) * chanceScale;
      if (chance <= 0 || (chance < 1 && random() >= chance)) continue;
      const weight = getModifiedWeight(e.poolWeight ?? defaultWeight, e.weightByAttr);
      if (weight > 0) pool.push({event:e, weight});
    }
  };
  collect(autoEvents, 3, 1);
  collect(choiceEvents, 15, M3.choiceDensity);
  if (!pool.length) return null;

  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  if (!Number.isFinite(total) || total <= 0) return null;
  let roll = random() * total;
  for (const item of pool){
    roll -= item.weight;
    if (roll < 0) return item.event;
  }
  return pool[pool.length - 1].event;
}
