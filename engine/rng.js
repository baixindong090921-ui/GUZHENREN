/* ============================================================
   蛊真人 · 可注入随机数源
   默认 Math.random；测试/平衡模拟用 setRng 注入固定序列
   ============================================================ */
let _rng = Math.random;
function rng(){ return _rng(); }
function setRng(fn){ _rng = fn; }
function resetRng(){ _rng = Math.random; }
