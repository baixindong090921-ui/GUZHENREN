/* ============================================================
   蛊真人 · 蛊师资质数据（开窍大典解锁）
   ratio / 真元：开窍大典文案展示用（字符串）
   share：真元占据空窍比例（数值） / speed：修炼速度 / fix：突破修正 / boom：失败时爆体概率
   weight：开窍大典随机抽取的权重
   ============================================================ */
const APTITUDE = [
  { name:'丁等', ratio:'两三成', 真元:'青铜真元', desc:'末等资质，真元稀薄', tier:1, weight:25, share:0.25, speed:0.4,  fix:-0.35, boom:0 },
  { name:'丙等', ratio:'四五成', 真元:'青铜真元', desc:'下等资质',         tier:2, weight:40, share:0.45, speed:0.7,  fix:-0.15, boom:0 },
  { name:'乙等', ratio:'六七成', 真元:'青铜真元', desc:'中等资质',         tier:3, weight:25, share:0.65, speed:1.0,  fix:-0.05, boom:0 },
  { name:'甲等', ratio:'八九成', 真元:'青铜真元', desc:'上等资质，真元充沛', tier:4, weight:9,  share:0.85, speed:1.5,  fix:0.10,  boom:0 },
  { name:'十绝体', ratio:'十成', 真元:'青铜真元', desc:'天赋极高，但易爆体而亡', tier:5, weight:1, share:1.0,  speed:2.0,  fix:0.15,  boom:0.30 },
];

/* 加权随机抽取一个资质 */
function drawAptitude(){
  const total = APTITUDE.reduce((a, x) => a + x.weight, 0);
  let r = rng() * total;
  for (const x of APTITUDE){ r -= x.weight; if (r <= 0) return x; }
  return APTITUDE[1];
}
