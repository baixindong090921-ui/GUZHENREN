/* M4 的购买与月度消耗是游戏平衡值；食物名称来自已核实原文。 */
const M4 = {
  slots: home => Math.min(5, Math.max(1, 2 + Math.floor((Number(home) || 0) / 5))),
  recipeChance: (base, int) => Math.min(.9, Math.max(.5, base + ((Number(int) || 0) - 10) * .01)),
  initialFood: home => Math.max(1, 1 + Math.floor((Number(home) || 0) / 5)),
};
const FOODS = [
  {id:'moonPetal',name:'月兰花瓣',price:1,amount:4,unit:'份',source:'原文食物；月度数量为游戏值'},
  {id:'wine',name:'青竹酒',price:2,amount:1,unit:'坛',source:'原文食物；月度数量为游戏值'},
  {id:'mud',name:'腐泥冻土',price:1,amount:1,unit:'份',source:'原文食物；月度数量为游戏值'},
  {id:'pork',name:'猪肉',price:2,amount:1,unit:'份',source:'原文食物；月度数量为游戏值'},
  {id:'honey',name:'蜂蜜',price:2,amount:1,unit:'份',source:'原文食物；月度数量为游戏值'},
  {id:'jade',name:'玉石',price:3,amount:1,unit:'份',source:'原文食物；月度数量为游戏值'},
];
const MATERIALS = [{id:'snowTusk',name:'野猪王雪獠牙',price:8,source:'白玉蛊可选成功率辅料'}];
