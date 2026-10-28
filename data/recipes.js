/* 首批仅收录已确认输入蛊与产物的原文路线。费用与概率为游戏值。 */
const RECIPES = [
  {id:'blackBristle',name:'合炼黑鬃蛊',inputs:[{id:95,count:1},{id:7,count:1}],output:{id:20,count:1},cost:4,base:.7,minRank:1},
  {id:'whiteJade',name:'合炼白玉蛊',inputs:[{id:8,count:1},{id:96,count:1}],output:{id:21,count:1},cost:4,base:.68,minRank:1,optional:{id:'snowTusk',bonus:.1}},
  {id:'moonGlow',name:'合炼月芒蛊',inputs:[{id:1,count:1},{id:97,count:2}],output:{id:23,count:1},cost:5,base:.65,minRank:1},
  {id:'moonTrace',name:'合炼月痕蛊',inputs:[{id:1,count:1},{id:98,count:1}],output:{id:24,count:1},cost:4,base:.68,minRank:1},
  {id:'moonSpin',name:'合炼月旋蛊',inputs:[{id:1,count:1},{id:99,count:1}],output:{id:36,count:1},cost:6,base:.58,minRank:2},
];
const MATERIAL_GU_PRICES = {95:3,96:3,97:2,98:3,99:3};
