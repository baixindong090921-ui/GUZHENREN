/* ============================================================
   save.js · 存档系统（localStorage）
   每次推进自动存档：属性、境界、资源、蛊虫背包、状态标记
   v2：新增 rank/sub/cult/break* 字段；SAVE_KEY 已换，M1 旧档自然作废
   ============================================================ */

const SAVE_KEY = 'gu_game_save_v2';

function saveGame(){
  try {
    ensureGuItems();
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      ver: 3,
      attrs: state.attrs,
      thresholds: state.thresholds,
      resources: state.resources,
      money: state.money,
      cooldowns: state.cooldowns,
      chainProgress: state.chainProgress,
      age: state.age,
      month: state.month,
      day: state.day,
      region: state.region,
      资质: state.资质 ? state.资质.name : null,
      rank: state.rank,
      sub: state.sub,
      cult: state.cult,
      breakPrep: state.breakPrep,
      breakCooldown: state.breakCooldown,
      breakPity: state.breakPity,
      breakFails: state.breakFails,
      seenGu: [...state.seenGu],
      guItems: state.guItems, guSeq: state.guSeq, unknownGu: state.unknownGu,
      foodStock: state.foodStock, materialStock: state.materialStock, lastFeedMonth: state.lastFeedMonth,
      flags: [...state.flags],
      fired: [...state.fired],
    }));
  } catch (e) { /* 忽略（隐私模式等） */ }
}

function loadGame(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);

    state.attrs = d.attrs || { ...BASE_ATTRS };
    state.money = Number.isInteger(d.money) && d.money >= 0 ? d.money : initialMoney(state.attrs);
    state.cooldowns = d.cooldowns && typeof d.cooldowns === 'object' ? d.cooldowns : {};
    state.chainProgress = d.chainProgress && typeof d.chainProgress === 'object' ? d.chainProgress : {};
    state.thresholds = d.thresholds || {颜值:20, 体质:20, 智力:20, 家境:20, 运气:20};
    state.age = d.age ?? 10;
    state.month = d.month ?? 1;
    state.day = d.day ?? 1;
    state.region = d.region || '';
    state.资质 = d.资质 ? APTITUDE.find(a => a.name === d.资质) : null;
    // 旧档缺字段按规则推导：有资质 → rank=1，否则 rank=0
    state.rank = d.rank ?? (state.资质 ? 1 : 0);
    state.sub = d.sub ?? 0;
    state.cult = d.cult ?? 0;
    state.breakPrep = d.breakPrep ?? 0;
    state.breakCooldown = d.breakCooldown ?? 0;
    state.breakPity = d.breakPity ?? 0;
    state.breakFails = d.breakFails ?? 0;
    state.gu = new Set(d.ver >= 3 ? [] : d.gu || []);
    state.seenGu = new Set(d.seenGu || d.gu || []);
    state.guItems = Array.isArray(d.guItems) ? d.guItems.filter(x=>guById(x.id) && Number.isSafeInteger(x.uid)).map(x=>({uid:x.uid,id:x.id,active:!!x.active,missed:safeCount(x.missed),locked:false})) : [];
    state.guSeq = safeCount(d.guSeq);
    state.unknownGu = Array.isArray(d.unknownGu) ? d.unknownGu.filter(x=>typeof x==='string') : [];
    state.foodStock = Object.fromEntries(FOODS.map(f=>[f.id,safeCount(d.foodStock?.[f.id])]));
    state.materialStock = Object.fromEntries(MATERIALS.map(m=>[m.id,safeCount(d.materialStock?.[m.id])]));
    state.lastFeedMonth = Number.isInteger(d.lastFeedMonth) ? d.lastFeedMonth : null;
    ensureGuItems();
    syncLegacyGu();
    state.flags = new Set(d.flags || []);
    state.fired = new Set(d.fired || []);

    // 资源：不信任存档上限，一律 recalcMax 重算，当前值夹到上限内
    recalcMax();
    if (d.resources){
      for (const k of ['血条', '真元', '体力']){
        state.resources[k] = Math.min(state.resourceMax[k], Math.max(0, d.resources[k] ?? 0));
      }
    }
    return true;
  } catch (e) { return false; }
}

function clearSave(){
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

function hasSave(){
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}
