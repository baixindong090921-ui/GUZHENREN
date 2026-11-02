/* 玩法升级首轮参数：均为项目设定；不冒充原文数值。 */
const UPGRADE = {
  soulMax:100, soulWarning:.25, soulDamage:5, restDays:5, restRecovery:20,
  forgeSoul:12, forgeFailureSoul:8, inferSoul:10, inferBase:.30, inferBonus:.25,
  inferBonusDays:30, marketCycle:720, marketDuration:30, battleChance:.025,
  battleMaxTurns:20, battleFleeChance:.45, battleSparCooldown:30,
};
const BATTLE_GU = {
  1:{kind:'attack',power:18,cost:.08},2:{kind:'restore',power:.25,cost:.03},
  3:{kind:'attack',power:17,cost:.07},4:{kind:'weaken',power:.55,cost:.06},
  5:{kind:'weaken',power:.25,cost:.04},6:{kind:'focus',power:1.5,cost:.06},
  7:{kind:'strength',power:1,cost:.05},8:{kind:'strength',power:1,cost:.05},
  9:{kind:'attack',power:21,cost:.10},10:{kind:'attack',power:19,cost:.08},
  11:{kind:'focus',power:1.4,cost:.09},12:{kind:'boost',power:12,cost:.10,consume:true},
  20:{kind:'defend',power:.65,cost:.10},21:{kind:'defend',power:.8,cost:.12},
  23:{kind:'attack',power:32,cost:.12},24:{kind:'weaken',power:.4,cost:.10,duration:2},
  36:{kind:'attack',power:28,cost:.16,pierce:true},
};
/* 以下回合行为、减伤和奖励为项目设计值，不代表原文精确能力。 */
const BATTLE_TYPES={
  spar:{name:'同门切磋',lethal:false,reason:'同门邀你练习攻防。',reward:'胜利获1元石；切磋共用每30日一次的机会。'},
  teacher:{name:'老师指点',lethal:false,reason:'老师通过示范招式检验你的应对。',reward:'胜利获1元石，少量修炼经验；与同门切磋共用冷却。'},
  beast:{name:'拦路野兽',lethal:true,reason:'野兽挡住去路，准备扑击。',reward:'胜利获3元石和猪肉补给；没有必掉蛊虫。'},
  enemy:{name:'敌对蛊师',lethal:true,reason:'敌对蛊师试图截取你的资源。',reward:'胜利获5元石，有机会发现未掌握的蛊方。'}
};
