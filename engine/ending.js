/* ============================================================
   蛊真人 · 结算系统（死亡 → 重生抉择 / 最终结算）
   死亡后先弹出重生抉择面板，最终结算（就此结算 / 重生失败）才出评级
   ============================================================ */

let pendingDeath = null;   // 当前死亡信息 { reason, endingType }

function endGame(reason, endingType){
  if (!state.alive) return;   // guard：避免重复结算导致图鉴/面板重复
  state.alive = false;
  gameState = GAME.ENDED;
  stopTimer();
  clearSave();   // 死亡即作废本世存档，避免刷新后「继续上一世」读回濒死/上一世
  addLog(`<span class="death">☠ ${reason}</span>`);
  pendingDeath = { reason, endingType };

  // 本世见过的事件 / 蛊虫先并入永久图鉴
  const meta = getMeta();
  recordLife(meta);
  saveMeta(meta);

  showDeathPanel(reason);
}

/* 就此结算：按本世死因结算 */
function settleDeath(){
  if (!pendingDeath) return;
  finalizeEnding(pendingDeath.endingType, null);
}

/* 最终结算：记录结局图鉴，清本世存档，出评级 */
function finalizeEnding(endingType, note){
  const meta = getMeta();
  meta.图鉴.endings.push(endingType);
  saveMeta(meta);
  clearSave();
  showSummary(endingType, note);
}

/* 评级（M2 临时：按境界 = 转数×4 + 小境界；M6 改为转数/图鉴/轮回综合） */
function showSummary(endingType, note){
  const score = state.rank * 4 + state.sub;
  let grade, title;
  if (score >= 12){ grade = 'S'; title = '三转蛊师'; }
  else if (score >= 8){ grade = 'A'; title = '二转蛊师'; }
  else if (score >= 4){ grade = 'B'; title = '一转蛊师'; }
  else { grade = 'C'; title = '蝼蚁之命'; }

  const detail = `境界：${realmLabel()}<br>` + ATTR_KEYS.map(k => `${k} ${state.attrs[k]}`).join(' · ');
  const s = document.createElement('div');
  s.className = 'summary';
  s.innerHTML = `<div class="grade">${grade}</div><div class="title">${title}</div>
    <div class="detail">享年 ${state.age} 岁 · 结局：${endingType}<br>${detail}<br>蛊虫：${[...state.gu].join('、')}</div>
    ${note ? `<div class="detail">${note}</div>` : ''}
    <button class="primary" onclick="restartNew()">再来一世</button>`;
  document.getElementById('screen-play').appendChild(s);
  $('deathPanel').classList.add('hidden');
  updateControls();
}

/* 再来一世：重置轮回次数（图鉴永久保留），清本世存档，重新开始 */
function restartNew(){
  const meta = getMeta();
  meta.rebirths = 0;
  saveMeta(meta);
  clearSave();
  location.reload();
}
