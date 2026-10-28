/* ============================================================
   蛊真人 · 修炼数值表（占位，全部集中在此一处调平衡）
   单位约定：资源（血条/真元/体力）存绝对值，effect 里用占上限比例(|v|≤1)
   ============================================================ */
const CULT = {
  /* 小境界修炼需求（修炼日）：[转数-1][小境界 初/中/高/巅] */
  need: [
    [120, 180, 240, 300],        // 一转
    [1200, 1800, 2400, 3000],    // 二转（×3，拉慢二转节奏）
    [1200, 1800, 2400, 3000],    // 三转
  ],

  /* 真元容量（按转数，index 0 = 未开窍为 0） */
  essenceCapacity: [0, 100, 160, 250],
  /* 小境界系数（真元上限 ×，初/中/高/巅） */
  subFactor: [1, 1.25, 1.5, 1.75],

  /* 血条上限 = hpBase + 体质 × hpPer */
  hpBase: 60, hpPer: 4,
  /* 体力上限 */
  staminaMax: 100,

  /* 每日恢复（占各自上限的比例） */
  recover: { 血条: 0.01, 体力: 0.08, 真元: 0.02 },
  /* 血条每日恢复里随体质递增的部分 */
  recoverHpPer: 0.0005,

  /* 每日自动修炼基础（C3 调参：使到二转约 甲2~3年 / 乙3.5年 / 丙5年 / 丁9年） */
  baseCult: 0.5,
  /* 修炼速度的智力加成（每日修炼用，独立于突破的 breakIntPer） */
  cultIntPer: 0.01,
  /* 事件修炼值系数：事件给的修炼值 = 原始值 × 资质速度 × 此系数 */
  cultEventScale: 0.15,

  /* 疲劳：体力低于此比例时，疲劳系数从 1 线性降到 fatigueFloor */
  fatigueLow: 0.30, fatigueFloor: 0.30,

  /* 寿元（按转数，index 0 = 未开窍默认） */
  lifespan: [70, 70, 90, 110],

  /* 突破成功率 */
  breakBase: 0.55,
  breakIntPer: 0.01, breakIntCap: 0.30,
  breakLuckPer: 0.005, breakLuckCap: 0.20,
  breakRankPenalty: 0.10,
  breakClampMin: 0.10, breakClampMax: 0.90,
  breakEssenceReq: 0.70,          // 突破要求真元 ≥ 70%
  breakEssenceAfter: 0.30,        // 成功突破后真元回到新上限的比例

  /* 蓄力 */
  prepMax: 3, prepBonus: 0.08, prepDays: 15,
  /* 保底（连续失败加成） */
  pityPer: 0.05, pityMax: 0.20,
  /* 酒虫（一转每世一次） */
  wineBonus: 0.10,

  /* 失败三档：重档固定比例；致命档按连续失败递增（轻档取剩余） */
  failHeavy: 0.35,
  fatalStartFail: 1,   // 前 1 次失败无致命风险
  fatalPer: 0.30,      // 每次额外连续失败 +30%
  fatalMax: 0.60,      // 致命概率上限
};
