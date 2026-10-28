/* ============================================================
   蛊真人 · M3 规则与配置（属性挂钩与内容扩充）
   - 属性结果权重修正公式与参数
   - 元石格式
   - 事件字段 schema 与数据校验
   命名约定：事件入池权重用 poolWeight，结果权重用 weight，二者语义不同。
   ============================================================ */

const M3 = {
  /* 属性结果权重修正：
     修正后权重 = 基础权重 × clamp(1 + (属性值 − attrNeutral) × attrCoef, attrMultMin, attrMultMax)
     属性 10 为中性基准（倍率 1.0） */
  attrNeutral: 10,
  attrCoef: 0.025,
  attrCoefs: {颜值:0.025, 体质:0.025, 智力:0.025, 家境:0.025, 运气:0.025},
  attrMultMin: 0.5,
  attrMultMax: 1.5,
  choiceDensity: 0.5,

  /* M3 内容最低验收数量；地区事件合计 6 条，五域各至少 1 条。 */
  contentTargets: {childhood:15, cultivation:40, choices:30, regional:6, gu:12, total:103},

  /* 元石：开局 = moneyBase + 家境 × moneyPer家境（整数） */
  moneyBase: 10,
  moneyPer家境: 2,

  /* 事件字段枚举 */
  phases: ['childhood', 'cultivation'],      // phase 字段值；缺省按通用处理
  regions: REGIONS.map(r => r.name),         // region 字段值（'any' 或五域之一）
};

/* 事件字段 schema（供数据校验与后续引擎使用）：
   事件：id / text / phase / region / tags / poolWeight(入池权重) / cooldown / chainId / chainStep
         / min / max / once / chance / cond / effect / choices / gu(显式引用蛊虫)
   结果（choices 元素 / outcomes 元素）：effect / result / weight(结果权重) / weightByAttr(属性名数组) / flags
   选项（choices 元素）：need / needText / cost
   poolWeight 是「事件入池权重」，weight 是「结果权重」，不可混用。 */

/* 是否是 GU 表中已登记的蛊虫名 */
function isGuName(name){
  return GU.some(g => g.name === name);
}

/* 给选择、结果补稳定 id（按事件 id 与静态顺序生成），用于前世记录。 */
for (const event of CHOICE_EVENTS){
  (event.choices || []).forEach((option, oi) => {
    option.id = option.id || `${event.id}_option_${oi + 1}`;
    if (option.outcomes && option.outcomes.length){
      option.outcomes.forEach((outcome, ri) => {
        outcome.id = outcome.id || `${option.id}_result_${ri + 1}`;
      });
    } else {
      option.resultId = option.resultId || `${option.id}_result_1`;
    }
  });
}

/* 数据完整性校验：返回问题数组（空数组 = 通过） */
function validateEvents(){
  const problems = [];
  const all = [...AUTO_EVENTS, ...CHOICE_EVENTS];
  const seen = new Set();
  const choiceIds = new Set();
  const resultIds = new Set();

  for (const e of all){
    let changesPermanentAttribute = Object.keys(e.effect || {}).some(key => Object.prototype.hasOwnProperty.call(M3.attrCoefs, key));
    // id 唯一
    if (!e.id){ problems.push('缺 id：' + (e.text || '(无文本)')); continue; }
    if (seen.has(e.id)) problems.push('重复 id：' + e.id);
    seen.add(e.id);

    // phase / region 枚举
    if (e.phase !== undefined && !M3.phases.includes(e.phase)) problems.push(e.id + ' 无效 phase：' + e.phase);
    if (e.region !== undefined && e.region !== 'any' && !M3.regions.includes(e.region)) problems.push(e.id + ' 无效 region：' + e.region);

    // poolWeight / cooldown 非负
    if (e.poolWeight !== undefined && (!Number.isFinite(e.poolWeight) || e.poolWeight < 0)) problems.push(e.id + ' poolWeight 非法：' + e.poolWeight);
    if (e.cooldown !== undefined && (!Number.isFinite(e.cooldown) || e.cooldown < 0)) problems.push(e.id + ' cooldown 非法：' + e.cooldown);
    if (e.chainStep !== undefined && (!Number.isInteger(e.chainStep) || e.chainStep < 1)) problems.push(e.id + ' chainStep 非法：' + e.chainStep);
    for (const attr of (e.weightByAttr || [])){
      if (!Object.prototype.hasOwnProperty.call(M3.attrCoefs, attr)) problems.push(e.id + ' 无效事件 weightByAttr：' + attr);
    }

    // chainId / chainStep 配对
    if ((e.chainId === undefined) !== (e.chainStep === undefined)) problems.push(e.id + ' chainId/chainStep 未配对');

    // 显式蛊虫引用有效
    if (e.gu !== undefined && !isGuName(e.gu)) problems.push(e.id + ' 无效 gu：' + e.gu);
    else if (e.gu !== undefined && GU.find(g => g.name === e.gu).rank !== 1) problems.push(e.id + ' M3 蛊虫事件必须引用一转蛊：' + e.gu);

    // 结果权重非负
    if (e.choices && e.choices.length < 2) problems.push(e.id + ' 抉择少于两个选项');
    for (const opt of (e.choices || [])){
      if (Object.keys(opt.effect || {}).some(key => Object.prototype.hasOwnProperty.call(M3.attrCoefs, key))) changesPermanentAttribute = true;
      if (!opt.id || choiceIds.has(opt.id)) problems.push(e.id + ' 选择 id 缺失或重复：' + opt.id);
      if (opt.id) choiceIds.add(opt.id);
      if (opt.cost && opt.cost.元石 !== undefined && !Number.isSafeInteger(opt.cost.元石)) problems.push(e.id + ' 元石花费必须为整数');
      if (opt.resultId){
        if (resultIds.has(opt.resultId)) problems.push(e.id + ' 结果 id 重复：' + opt.resultId);
        resultIds.add(opt.resultId);
      }
      for (const o of (opt.outcomes || [])){
        if (Object.keys(o.effect || {}).some(key => Object.prototype.hasOwnProperty.call(M3.attrCoefs, key))) changesPermanentAttribute = true;
        if (!o.id || resultIds.has(o.id)) problems.push(e.id + ' 结果 id 缺失或重复：' + o.id);
        if (o.id) resultIds.add(o.id);
        if (o.weight !== undefined && (!Number.isFinite(o.weight) || o.weight < 0)) problems.push(e.id + ' 结果权重非法：' + o.weight);
        if (o.gu !== undefined && !isGuName(o.gu)) problems.push(e.id + ' 无效结果 gu：' + o.gu);
        for (const attr of (o.weightByAttr || [])){
          if (!Object.prototype.hasOwnProperty.call(M3.attrCoefs, attr)) problems.push(e.id + ' 无效 weightByAttr：' + attr);
        }
      }
      if (opt.outcomes && opt.outcomes.length && opt.outcomes.every(o => (o.weight ?? 1) === 0)) problems.push(e.id + ' 所有结果权重均为零');
    }
    if (changesPermanentAttribute && !e.once && !e.cooldown) problems.push(e.id + ' 永久属性成长事件缺少 once 或 cooldown');
  }

  // 事件链连续性：同一 chainId 的 chainStep 应从 1 连续递增
  const chains = {};
  for (const e of all){
    if (e.chainId !== undefined) (chains[e.chainId] = chains[e.chainId] || []).push(e.chainStep);
  }
  for (const [cid, steps] of Object.entries(chains)){
    steps.sort((a, b) => a - b);
    if (steps[0] !== 1) problems.push('链 ' + cid + ' 未从 step 1 开始：' + steps.join(','));
    for (let i = 1; i < steps.length; i++) if (steps[i] !== steps[i-1] + 1) problems.push('链 ' + cid + ' step 不连续：' + steps.join(','));
  }

  // M3 内容最低线：类别分开计数，避免一条事件重复充数。
  const childhood = AUTO_EVENTS.filter(e => e.phase === 'childhood').length;
  const cultivation = AUTO_EVENTS.filter(e => e.phase === 'cultivation' && !e.region && !e.gu).length;
  const regional = AUTO_EVENTS.filter(e => e.region && e.region !== 'any').length;
  const guEvents = AUTO_EVENTS.filter(e => e.gu && GU.some(g => g.name === e.gu && g.rank === 1)).length;
  const total = all.length;
  if (childhood < M3.contentTargets.childhood) problems.push('童年事件不足：' + childhood);
  if (cultivation < M3.contentTargets.cultivation) problems.push('修炼通用事件不足：' + cultivation);
  if (CHOICE_EVENTS.length < M3.contentTargets.choices) problems.push('抉择事件不足：' + CHOICE_EVENTS.length);
  if (regional < M3.contentTargets.regional) problems.push('地域事件不足：' + regional);
  if (guEvents < M3.contentTargets.gu) problems.push('一转蛊事件不足：' + guEvents);
  if (total < M3.contentTargets.total) problems.push('事件总数不足：' + total);
  for (const region of M3.regions){
    if (!AUTO_EVENTS.some(e => e.region === region)) problems.push('缺少地域事件：' + region);
  }

  return problems;
}
