/* ============================================================
   engine/condition.js · 事件条件 DSL 解析器（当前未启用）
   现有事件条件都用箭头函数（e.cond），此解析器保留备用。
   若日后启用，需对齐蛊真人的 flag / 蛊虫 / 境界 模型再扩展。

   支持语法：
   - EVT?[id1,id2]   触发过这些事件之一（本局，id 为字符串，如 'auto_1'）
   - AEVT?[id1,id2]  同上（跨局，这里等同 EVT?）
   - EVT![id1,id2]   未触发过
   - (STR>100)       属性比较（STR 等英文名映射为中文属性）
   - & | ! ()        逻辑运算
   注：原版 TLT?/ATLT?（天赋）在蛊真人中无对应概念，已移除。
   ============================================================ */

const ATTR_MAP = { CHR:'颜值', INT:'智力', STR:'体质', MNY:'家境', SPR:'运气' };

function compileCondition(cond){
  if (!cond) return () => true;

  let expr = cond;
  // EVT?[id1,id2] / AEVT?[...] → s.fired.has('id')（事件 id 现为字符串）
  expr = expr.replace(/([A-Z]+)\?\[([^\]]+)\]/g, (m, kind, ids) => {
    if (kind !== 'EVT' && kind !== 'AEVT') return 'false';
    const list = ids.split(',').map(s => s.trim());
    return `(${list.map(id => `s.fired.has(${JSON.stringify(id)})`).join('||')})`;
  });
  // EVT![id1,id2] → 未触发过
  expr = expr.replace(/([A-Z]+)!\[([^\]]+)\]/g, (m, kind, ids) => {
    if (kind !== 'EVT' && kind !== 'AEVT') return 'true';
    const list = ids.split(',').map(s => s.trim());
    return `!(${list.map(id => `s.fired.has(${JSON.stringify(id)})`).join('||')})`;
  });
  // 属性比较 (STR>100) → (s.attrs.体质 > 100)；单 = 归一化为 ==，避免生成赋值
  expr = expr.replace(/(CHR|INT|STR|MNY|SPR)\s*(>=|<=|==|>|<|=)\s*(-?\d+)/g,
    (m, p, op, v) => `(s.attrs.${ATTR_MAP[p]} ${op === '=' ? '==' : op} ${v})`);

  const fn = new Function('s', 'return (' + expr + ');');
  return s => { try { return !!fn(s); } catch (e) { return false; } };
}
