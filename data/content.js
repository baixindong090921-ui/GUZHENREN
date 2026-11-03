/* 本轮补录：转数/用途取自已核实事实；价格、月度食量、技能数值为项目设定。 */
const CONTENT_GU = [
  {
    "id": 100,
    "name": "刀翅血蝠蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "攻击",
    "grade": "凡蛊",
    "desc": "以血液喂养，刀翅可用于攻击",
    "food": "",
    "foodId": "blood",
    "pickable": false,
    "available": true,
    "factIds": [
      13
    ]
  },
  {
    "id": 101,
    "name": "吞毒蛙",
    "rank": 4,
    "流派": "待核实",
    "定位": "治疗",
    "grade": "凡蛊",
    "desc": "吸出体内毒素，用于解毒治疗",
    "food": "",
    "foodId": "toxin",
    "pickable": false,
    "available": true,
    "factIds": [
      19
    ]
  },
  {
    "id": 102,
    "name": "态度蛊",
    "rank": 8,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "仙蛊",
    "desc": "可消耗心力催动；特殊心力机制尚未接入",
    "food": "",
    "foodId": "lightFruit",
    "pickable": false,
    "available": true,
    "factIds": [
      34
    ]
  },
  {
    "id": 103,
    "name": "慧剑蛊",
    "rank": 8,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "仙蛊",
    "desc": "所述阶段需要八转仙元催动；特殊技能尚未接入",
    "food": "",
    "foodId": "kingFlower",
    "pickable": false,
    "available": true,
    "factIds": [
      123
    ]
  },
  {
    "id": 104,
    "name": "智慧蛊",
    "rank": 9,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "仙蛊",
    "desc": "九转时期以寿蛊为食；特殊推演机制尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      37
    ]
  },
  {
    "id": 105,
    "name": "加",
    "rank": 8,
    "流派": "律道",
    "定位": "辅助",
    "grade": "仙蛊",
    "desc": "以珠线水为食；特殊律道机制尚未接入",
    "food": "",
    "foodId": "pearlWater",
    "pickable": false,
    "available": true,
    "factIds": [
      41
    ]
  },
  {
    "id": 106,
    "name": "草人蛊",
    "rank": 1,
    "流派": "待核实",
    "定位": "防御",
    "grade": "凡蛊",
    "desc": "草人傀儡，具有轻微自愈能力",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      65
    ]
  },
  {
    "id": 107,
    "name": "大肚蛙",
    "rank": 2,
    "流派": "待核实",
    "定位": "储存",
    "grade": "凡蛊",
    "desc": "肚内可存储工具；额外仓库容量机制尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      67
    ]
  },
  {
    "id": 108,
    "name": "生机叶",
    "rank": 1,
    "流派": "待核实",
    "定位": "治疗",
    "grade": "凡蛊",
    "desc": "九叶生机草产出的叶片，各是一转蛊",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      68
    ]
  },
  {
    "id": 109,
    "name": "御鹤蛊",
    "rank": 5,
    "流派": "奴道",
    "定位": "控制",
    "grade": "凡蛊",
    "desc": "可驾驭万兽王级鹤王；驭兽系统尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      74
    ]
  },
  {
    "id": 110,
    "name": "狂针蜂蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "攻击",
    "grade": "凡蛊",
    "desc": "具有穿透攻击能力，效果受战斗条件影响",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      76
    ]
  },
  {
    "id": 111,
    "name": "游龙蝶蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "原文明确三转珍稀蛊，具体能力待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      77
    ]
  },
  {
    "id": 112,
    "name": "赶尸蛊",
    "rank": 2,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "僵心蛊可产出此蛊，具体使用规则待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      81
    ]
  },
  {
    "id": 113,
    "name": "炎心蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "寄托心脏，增强火类蛊虫攻击",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      84
    ]
  },
  {
    "id": 114,
    "name": "冰刀蛊",
    "rank": 2,
    "流派": "待核实",
    "定位": "攻击",
    "grade": "凡蛊",
    "desc": "冰刃蛊的前阶，冰刀攻击",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      85
    ]
  },
  {
    "id": 115,
    "name": "狗胆蛊",
    "rank": 2,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "抵抗百兽王威慑",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      88
    ]
  },
  {
    "id": 116,
    "name": "狗胆包山蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "抵抗千兽王威慑",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      88
    ]
  },
  {
    "id": 117,
    "name": "狗胆包海蛊",
    "rank": 4,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "抵抗万兽王威慑",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      88
    ]
  },
  {
    "id": 118,
    "name": "狗胆包天蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "使犬兽敢面对犬皇",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      88
    ]
  },
  {
    "id": 119,
    "name": "一心二用蛊",
    "rank": 2,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "分化心神，辅助指挥；多目标操控尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      89
    ]
  },
  {
    "id": 120,
    "name": "食金飞蚁蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "攻击",
    "grade": "凡蛊",
    "desc": "可用于破坏铁柜蛊围困",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      91
    ]
  },
  {
    "id": 121,
    "name": "搜锁蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认五转，具体能力待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      92
    ]
  },
  {
    "id": 122,
    "name": "匿迹隐形蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认五转，具体能力待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      92
    ]
  },
  {
    "id": 123,
    "name": "百无一失蛊",
    "rank": 6,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "仙蛊",
    "desc": "用于回收贵重蛊虫；回收系统尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      95
    ]
  },
  {
    "id": 124,
    "name": "为山九仞蛊",
    "rank": 5,
    "流派": "土道",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "增加炼蛊成功可能；专属炼蛊加成尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      97
    ]
  },
  {
    "id": 125,
    "name": "破釜沉舟蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "爆发大量真元，事后损失修为；代价机制尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      103
    ]
  },
  {
    "id": 126,
    "name": "狼图蛊",
    "rank": 5,
    "流派": "奴道",
    "定位": "储存",
    "grade": "凡蛊",
    "desc": "收藏兽群；兽群系统尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      104
    ]
  },
  {
    "id": 127,
    "name": "飞魂蛊",
    "rank": 3,
    "流派": "魂道",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "令魂魄离体，相关魂魄操作尚未接入",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      106
    ]
  },
  {
    "id": 128,
    "name": "魂链蛊",
    "rank": 3,
    "流派": "魂道",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "用魂链连接魂魄",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      106
    ]
  },
  {
    "id": 129,
    "name": "合魂蛊",
    "rank": 4,
    "流派": "魂道",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "三魂相连，魄体合一",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      106
    ]
  },
  {
    "id": 130,
    "name": "闷雷土豆蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认三转，攻击方式待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      107
    ]
  },
  {
    "id": 131,
    "name": "炸雷土豆蛊",
    "rank": 4,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认四转，攻击方式待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      107
    ]
  },
  {
    "id": 132,
    "name": "漫天飞雪蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "攻击",
    "grade": "凡蛊",
    "desc": "发动暴雪形成冰寒区域",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      110
    ]
  },
  {
    "id": 133,
    "name": "小魂蛊",
    "rank": 1,
    "流派": "魂道",
    "定位": "材料",
    "grade": "凡蛊",
    "desc": "基础魂道蛊，后续合炼完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      115
    ]
  },
  {
    "id": 134,
    "name": "泥蛊",
    "rank": 1,
    "流派": "土道",
    "定位": "材料",
    "grade": "凡蛊",
    "desc": "倪家基本蛊，具体用途待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      132
    ]
  },
  {
    "id": 135,
    "name": "清风轮蛊",
    "rank": 1,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "原文确认一转",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      128
    ]
  },
  {
    "id": 136,
    "name": "碧风轮蛊",
    "rank": 2,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "原文确认二转",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      128
    ]
  },
  {
    "id": 137,
    "name": "鬼火蛊",
    "rank": 2,
    "流派": "魂道",
    "定位": "攻击",
    "grade": "凡蛊",
    "desc": "魂道攻杀蛊；可进阶鬼炎、鬼焱，完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      59
    ]
  },
  {
    "id": 138,
    "name": "鬼炎蛊",
    "rank": 3,
    "流派": "魂道",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "鬼火蛊进阶路线，完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      59
    ]
  },
  {
    "id": 139,
    "name": "鬼焱蛊",
    "rank": 4,
    "流派": "魂道",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "鬼炎蛊进阶路线，完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      59
    ]
  },
  {
    "id": 140,
    "name": "空仓蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "可进阶苍空蛊，完整辅料待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      56
    ]
  },
  {
    "id": 141,
    "name": "苍空蛊",
    "rank": 4,
    "流派": "待核实",
    "定位": "材料",
    "grade": "凡蛊",
    "desc": "与天井蛊合炼苍空井蛊，天井蛊转数待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      56
    ]
  },
  {
    "id": 142,
    "name": "苍空井蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "苍空蛊和天井蛊的合炼产物",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      56
    ]
  },
  {
    "id": 143,
    "name": "金杯银盏蛊",
    "rank": 4,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "金杯蛊、银盏蛊的产物，投入数量待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      57
    ]
  },
  {
    "id": 144,
    "name": "月霓裳",
    "rank": 2,
    "流派": "待核实",
    "定位": "防御",
    "grade": "凡蛊",
    "desc": "月光蛊与玉皮蛊合炼，形成防御",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      49
    ]
  },
  {
    "id": 145,
    "name": "四味酒虫",
    "rank": 2,
    "流派": "食道",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "精炼二转真元，提升一个小境界",
    "food": "",
    "foodId": "wine",
    "pickable": false,
    "available": true,
    "factIds": [
      50
    ]
  },
  {
    "id": 146,
    "name": "七香酒虫",
    "rank": 3,
    "流派": "食道",
    "定位": "辅助",
    "grade": "凡蛊",
    "desc": "精炼真元；合炼所需七种香料品名不全",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      51
    ]
  },
  {
    "id": 147,
    "name": "白虫茧",
    "rank": 2,
    "流派": "待核实",
    "定位": "材料",
    "grade": "凡蛊",
    "desc": "酒虫进阶分支，此阶段没有能力",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": true,
    "factIds": [
      53
    ]
  },
  {
    "id": 148,
    "name": "蒙汗蝶",
    "rank": 3,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "白虫茧后续路线，完整蛊方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      53
    ]
  },
  {
    "id": 149,
    "name": "宝月光王蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "月霓裳路线终点，完整中间步骤待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      49
    ]
  },
  {
    "id": 150,
    "name": "一星半点蛊",
    "rank": 1,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      111
    ]
  },
  {
    "id": 151,
    "name": "二星辉映蛊",
    "rank": 2,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      111
    ]
  },
  {
    "id": 152,
    "name": "三星在天蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      111
    ]
  },
  {
    "id": 153,
    "name": "四星立方蛊",
    "rank": 4,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      111
    ]
  },
  {
    "id": 154,
    "name": "五星连珠蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      111
    ]
  },
  {
    "id": 155,
    "name": "单窍火炭蛊",
    "rank": 1,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      122
    ]
  },
  {
    "id": 156,
    "name": "双窍火炉蛊",
    "rank": 2,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      122
    ]
  },
  {
    "id": 157,
    "name": "三窍火屋蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      122
    ]
  },
  {
    "id": 158,
    "name": "四窍火楼蛊",
    "rank": 4,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      122
    ]
  },
  {
    "id": 159,
    "name": "五窍火塔蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      122
    ]
  },
  {
    "id": 160,
    "name": "游僵蛊",
    "rank": 2,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      75
    ]
  },
  {
    "id": 161,
    "name": "毛僵蛊",
    "rank": 3,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      75
    ]
  },
  {
    "id": 162,
    "name": "跳僵蛊",
    "rank": 4,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      75
    ]
  },
  {
    "id": 163,
    "name": "飞僵蛊",
    "rank": 5,
    "流派": "待核实",
    "定位": "待核实",
    "grade": "凡蛊",
    "desc": "已确认系列转数；具体能力与完整配方待核实",
    "food": "",
    "foodId": null,
    "pickable": false,
    "available": false,
    "factIds": [
      75
    ]
  }
];
GU.push(...CONTENT_GU);
// 保留旧编号和旧库存；未核实的旧条目停止出售，不删除持有记录。
GU.find(g=>g.id===90).available=false;
GU.find(g=>g.id===90).desc='名称在现有主文本中尚未命中，原有说明撤回，待核实；旧库存保留。';
GU.find(g=>g.id===64).available=false;
const CONTENT_FOODS = [
  {
    "id": "blood",
    "name": "血液",
    "price": 2,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "toxin",
    "name": "毒素",
    "price": 4,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "lightFruit",
    "name": "流光果",
    "price": 12,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "kingFlower",
    "name": "斑斓霸王花",
    "price": 16,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "pearlWater",
    "name": "珠线水",
    "price": 20,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "brocadeCloud",
    "name": "九转锦绣云",
    "price": 30,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "teaBrick",
    "name": "蓝海云茶砖",
    "price": 5,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "springWater",
    "name": "元泉之水",
    "price": 3,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "ginsengRoot",
    "name": "参须",
    "price": 3,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "crocMeat",
    "name": "鳄肉",
    "price": 3,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "crocBlood",
    "name": "新鲜鳄血",
    "price": 3,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "ash",
    "name": "灰烬",
    "price": 1,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "milk",
    "name": "奶水",
    "price": 2,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "snakeBlood",
    "name": "六头大蛇黑血",
    "price": 12,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "laughStone",
    "name": "笑石",
    "price": 8,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "netherJelly",
    "name": "幽冥水母",
    "price": 8,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "deepEel",
    "name": "深海闪电鳗鱼",
    "price": 8,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "cloudScale",
    "name": "云龙龙鳞",
    "price": 12,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "windEye",
    "name": "风镰鸟眼珠",
    "price": 8,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "silkwormFlesh",
    "name": "白莲巨蚕蛊血肉",
    "price": 12,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "gullSand",
    "name": "天地沙鸥栖息地沙土",
    "price": 12,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "starFish",
    "name": "刺脊星龙鱼肉",
    "price": 10,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "darkKelp",
    "name": "暗星海带",
    "price": 8,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "flameStone",
    "name": "炎鸿石",
    "price": 8,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "reverseWater",
    "name": "逆流河水",
    "price": 18,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "timeWater",
    "name": "光阴河水",
    "price": 12,
    "amount": 1,
    "unit": "份",
    "grade": "immortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  },
  {
    "id": "heartGrass",
    "name": "知心草",
    "price": 2,
    "amount": 1,
    "unit": "份",
    "grade": "mortal",
    "source": "食物名称据已核实事实；分区、价格、每月一份为项目设定；组合食谱未完整接入时仅作储备"
  }
];
FOODS.push(...CONTENT_FOODS);
GU.find(g=>g.id===93).foodId='brocadeCloud';
for(const g of CONTENT_GU){const f=FOODS.find(f=>f.id===g.foodId);if(f)g.food=f.name;}
const CONTENT_MATERIALS = [
  {
    "id": "bayberryWine",
    "name": "杨梅酒",
    "price": 3,
    "grade": "mortal",
    "available": true,
    "source": "已核实事实第51条；每种一份及费用为项目设定"
  },
  {
    "id": "honeyWine",
    "name": "黄金蜜酒",
    "price": 3,
    "grade": "mortal",
    "available": true,
    "source": "已核实事实第51条；每种一份及费用为项目设定"
  },
  {
    "id": "bitterWine",
    "name": "苦贝酒",
    "price": 3,
    "grade": "mortal",
    "available": true,
    "source": "已核实事实第51条；每种一份及费用为项目设定"
  },
  {
    "id": "grainWine",
    "name": "白粮液",
    "price": 3,
    "grade": "mortal",
    "available": true,
    "source": "已核实事实第51条；每种一份及费用为项目设定"
  },
  {
    "id": "horseHoof",
    "name": "地马蹄",
    "price": 6,
    "grade": "unknown",
    "available": false,
    "source": "部分主材关系已核实；等级与完整配方待核实，暂不出售"
  },
  {
    "id": "horseEye",
    "name": "地马眼",
    "price": 6,
    "grade": "unknown",
    "available": false,
    "source": "部分主材关系已核实；等级与完整配方待核实，暂不出售"
  },
  {
    "id": "horseTail",
    "name": "地马尾毛",
    "price": 4,
    "grade": "unknown",
    "available": false,
    "source": "部分主材关系已核实；等级与完整配方待核实，暂不出售"
  },
  {
    "id": "leopardBone",
    "name": "绝影豹骨",
    "price": 6,
    "grade": "unknown",
    "available": false,
    "source": "部分主材关系已核实；等级与完整配方待核实，暂不出售"
  },
  {
    "id": "leopardEye",
    "name": "绝影豹眼珠",
    "price": 6,
    "grade": "unknown",
    "available": false,
    "source": "部分主材关系已核实；等级与完整配方待核实，暂不出售"
  },
  {
    "id": "wisdomGrass",
    "name": "智珠草",
    "price": 5,
    "grade": "unknown",
    "available": false,
    "source": "部分主材关系已核实；等级与完整配方待核实，暂不出售"
  },
  {
    "id": "fishScale",
    "name": "沉鱼鳞片",
    "price": 5,
    "grade": "unknown",
    "available": false,
    "source": "部分主材关系已核实；等级与完整配方待核实，暂不出售"
  }
];
MATERIALS.push(...CONTENT_MATERIALS);
RECIPES.push(
 {id:'moonCloth',name:'合炼月霓裳',inputs:[{id:1,count:1},{id:96,count:1}],output:{id:144,count:1},cost:5,base:.65,minRank:1,source:'原文7633、8282行；费用概率为游戏值'},
 {id:'fourWine',name:'合炼四味酒虫',inputs:[{id:2,count:2}],materials:['bayberryWine','honeyWine','bitterWine','grainWine'].map(id=>({id,count:1})),output:{id:145,count:1},cost:8,base:.62,minRank:1,source:'原文9649—9665行；各酒一份、费用概率为游戏值'}
);
// 已确认能力的简化回合映射；没有明确能力的条目不套用通用攻击。
const CONTENT_BATTLE = {
 100:{kind:'attack',power:32,cost:.12},106:{kind:'defend',power:.45,cost:.08},
 108:{kind:'heal',power:.25,cost:.04,consume:true},110:{kind:'attack',power:32,cost:.14,pierce:true},
 114:{kind:'attack',power:27,cost:.10},120:{kind:'attack',power:30,cost:.13,pierce:true},
 132:{kind:'attack',power:48,cost:.20},137:{kind:'attack',power:26,cost:.10},144:{kind:'defend',power:.7,cost:.12},
 145:{kind:'restore',power:.25,cost:.03,onlyRank:2},146:{kind:'restore',power:.25,cost:.03,onlyRank:3}
};

const CONTENT_REFERENCE_MATERIALS = [
  {
    "entryId": "reference_0",
    "name": "真诚",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "竹君子的食物，属于特殊条件，非普通货物；已核实事实第7条"
  },
  {
    "entryId": "reference_1",
    "name": "水与阳光",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "九叶生机草的存活条件，非打包食物；已核实事实第11条"
  },
  {
    "entryId": "reference_2",
    "name": "水",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "吞江蟾的食物；已核实事实第12条"
  },
  {
    "entryId": "reference_3",
    "name": "土",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "千里地狼蛛的食物；已核实事实第15条"
  },
  {
    "entryId": "reference_4",
    "name": "僵尸",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "僵心蛊的食物，等级与供应待核实；已核实事实第22条"
  },
  {
    "entryId": "reference_5",
    "name": "刀",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "单刀蛊寄居并吃刀，规格待核实；已核实事实第23条"
  },
  {
    "entryId": "reference_6",
    "name": "山气",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "乐山乐水蛊组合食料之一；已核实事实第26条"
  },
  {
    "entryId": "reference_7",
    "name": "水气",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "乐山乐水蛊组合食料之一；已核实事实第26条"
  },
  {
    "entryId": "reference_8",
    "name": "妇人心脏",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "妇人心蛊食料，未接入供应；已核实事实第31条"
  },
  {
    "entryId": "reference_9",
    "name": "石人身躯",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "星光仙蛊食料，未接入供应；已核实事实第33条"
  },
  {
    "entryId": "reference_10",
    "name": "光照",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "斑斓霸王花生长条件，不是慧剑蛊直接食料；已核实事实第37条"
  },
  {
    "entryId": "reference_11",
    "name": "甜气",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "斑斓霸王花生长条件，不是慧剑蛊直接食料；已核实事实第37条"
  },
  {
    "entryId": "reference_12",
    "name": "珍珠土",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "斑斓霸王花生长条件，不是慧剑蛊直接食料；已核实事实第37条"
  },
  {
    "entryId": "reference_13",
    "name": "寿蛊",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "九转智慧蛊食料，属于蛊虫，不复制成普通库存材料；已核实事实第38条"
  },
  {
    "entryId": "reference_14",
    "name": "希望蛊",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "爱意/爱情的食料相关蛊虫，不复制成普通库存材料；已核实事实第40条"
  },
  {
    "entryId": "reference_15",
    "name": "恐惧蛊",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "爱意/爱情的食料相关蛊虫，不复制成普通库存材料；已核实事实第40条"
  },
  {
    "entryId": "reference_16",
    "name": "七种香料",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "七香酒虫的配方缺项，具体品名未列全；已核实事实第52条"
  },
  {
    "entryId": "reference_17",
    "name": "九种百兽王眼珠",
    "type": "资料线索",
    "grade": "unknown",
    "available": false,
    "source": "九眼酒虫的配方缺项，具体兽王品名未列全；已核实事实第52条"
  }
];

// 本轮回查主TXT上下文新增核对（价格、回合效果不属于原文事实）。
Object.assign(GU.find(g=>g.id===108),{sourceLines:[7958,8328],desc:'一转消耗型治疗草蛊，用后消失；原文一小时内再次使用无治疗效果。游戏按每场一次处理。'});
Object.assign(GU.find(g=>g.id===144),{sourceLines:[7633,8080,8282]});
Object.assign(GU.find(g=>g.id===145),{sourceLines:[8174,9678,17261]});
Object.assign(GU.find(g=>g.id===146),{sourceLines:[8174,29803]});

for(const [id,lines] of Object.entries({"blood": [15522, 15523, 15524], "toxin": [17741], "lightFruit": [98271, 98273], "kingFlower": [98321, 98322, 98326], "pearlWater": [162990, 162991, 162992, 162993, 162997], "brocadeCloud": [211991, 211993], "teaBrick": [2863], "springWater": [14640], "ginsengRoot": [17266], "crocMeat": [17520], "crocBlood": [17520], "ash": [17721], "milk": [19233], "snakeBlood": [61283, 98344], "laughStone": [61284], "netherJelly": [61285, 61891], "deepEel": [61285, 61891], "cloudScale": [61286], "windEye": [61286], "silkwormFlesh": [61287, 73211], "gullSand": [61288, 63048], "starFish": [76109], "darkKelp": [76111], "flameStone": [98281, 98282], "reverseWater": [118522], "timeWater": [134176], "heartGrass": [2868, 2869, 2870]})){const item=CONTENT_FOODS.find(x=>x.id===id);item.sourceLines=lines;item.source+="；主TXT第"+lines.join("、")+"行";}

for(const [id,lines] of Object.entries({"bayberryWine": [9649, 9650, 9654, 9661, 9665, 29803], "honeyWine": [9649, 9650, 9654, 9661, 9665, 29803], "bitterWine": [9649, 9650, 9654, 9661, 9665, 29803], "grainWine": [9649, 9650, 9654, 9661, 9665, 29803], "horseHoof": [61946], "horseEye": [61946], "horseTail": [61946], "leopardBone": [65181], "leopardEye": [65181], "wisdomGrass": [194968], "fishScale": [206296]})){const item=CONTENT_MATERIALS.find(x=>x.id===id);item.sourceLines=lines;item.source+="；主TXT第"+lines.join("、")+"行";}
