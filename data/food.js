/* M4 的购买与月度消耗是游戏平衡值；食物名称来自已核实原文。 */
const M4 = {
  slots: home => Math.min(5, Math.max(1, 2 + Math.floor((Number(home) || 0) / 5))),
  recipeChance: (base, int) => Math.min(.9, Math.max(.5, base + ((Number(int) || 0) - 10) * .01)),
  initialFood: home => Math.max(1, 1 + Math.floor((Number(home) || 0) / 5)),
};
/* M4 补充：以下概率、价格和效果均为项目平衡值，不代表原文数值。 */
const M4_EXTRA = {
  pool:[1,2,3,6,11], prices:{1:10,2:12,3:9,6:11,11:8},
  exploreCooldown:30, exploreCost:.08, captureYearCap:3,
  findChance:luck=>Math.min(.60,Math.max(.20,.35+(Number(luck)-10)*.015)),
  catchChance:body=>Math.min(.70,Math.max(.25,.45+(Number(body)-10)*.02)),
  useCooldown:30, strengthCap:5,
  uses:{
    1:{title:'林间开路',desc:'以月刃切开障碍',cost:.06,effect:{体力:.06}},
    2:{title:'酒虫提纯',desc:'一转时以真元换修炼收益',cost:.05,effect:{修炼:5}},
    3:{title:'驱赶小兽',desc:'以星镖尝试驱散小兽（项目设定，能力待核实）',cost:.06,outcomes:[
      {weight:3,weightByAttr:['体质'],effect:{体力:.05},result:'小兽退去，你少走了一段险路。'},
      {weight:1,effect:{血条:-.06},result:'星镖没有逼退小兽，你被擦伤。'},
    ]},
    4:{title:'避开追踪',desc:'以异味扰乱追踪（项目设定，能力待核实）',cost:.04,effect:{体力:.04}},
    5:{title:'交易辨伪',desc:'观察其伪装，识破冒名交易（项目设定）',cost:.03,effect:{元石:1}},
    6:{title:'商队记事',desc:'记录线索辅助谈判（项目设定，能力待核实）',cost:.04,outcomes:[
      {weight:2,weightByAttr:['智力'],effect:{元石:2},result:'你凭记录找到商队账目差错，得到报酬。'},
      {weight:1,effect:{体力:-.03},result:'线索不足，你花时间核查却没有得到报酬。'},
    ]},
    7:{title:'黑豕增力',desc:'消耗单只蛊，永久增加一层黑豕气力（项目数值）',cost:.05,strength:'black'},
    8:{title:'白豕增力',desc:'消耗单只蛊，永久增加一层白豕气力（项目数值）',cost:.05,strength:'white'},
    9:{title:'力量对抗',desc:'催动熊力减少负担（项目设定）',cost:.06,effect:{体力:.06}},
    10:{title:'溪流攻势',desc:'催动蛊虫威慑野兽（项目设定，能力待核实）',cost:.05,effect:{体力:.04}},
    11:{title:'搬开落石',desc:'借临时增力开路',cost:.05,effect:{体力:.05}},
    12:{title:'短时搬运',desc:'消耗这只蛮力天牛蛊，借一牛之力完成搬运',cost:.05,consume:true,effect:{元石:1}},
  },
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
