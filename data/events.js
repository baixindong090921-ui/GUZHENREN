/* ============================================================
   蛊真人 · 自动事件（无选择，自动发生）
   开窍前（10~15岁）：童年事件；开窍后（15岁+）：修炼/资源事件
   M2：消除属性膨胀——属性主要由开局加点决定，一世内小幅成长
   效果三类：属性(整数) / 资源(占上限比例,|v|≤1) / 修炼(修炼日)
   ============================================================ */
const AUTO_EVENTS = [
  // 童年（开窍前）
  { id:'auto_1', phase:'childhood', text:'你在山寨里习武强身。', min:10, max:14, cooldown:180, cond:s=>!s.资质, effect:{体质:1} },
  { id:'auto_2', phase:'childhood', text:'你跟着族老识字读书。', min:10, max:14, cooldown:180, cond:s=>!s.资质, effect:{智力:1} },

  // 开窍后：修炼
  { id:'auto_3', phase:'cultivation', text:'你盘坐修炼，温养体内真元。', min:15, max:200, cond:s=>!!s.资质, effect:{修炼:3, 体力:-0.05} },
  { id:'auto_4', phase:'cultivation', once:true, text:'你在山野间游历，寻得一线机缘。', min:15, max:200, chance:0.01, cond:s=>!!s.资质, effect:{运气:1} },
  { id:'auto_5', phase:'cultivation', text:'你与人切磋斗蛊，各有所得。', min:15, max:200, cond:s=>!!s.资质 && s.attrs.体质>=4, effect:{血条:-0.05, 真元:-0.10, 体力:-0.10, 修炼:5} },
  { id:'auto_6', phase:'cultivation', text:'你研读蛊经，参悟炼蛊之道。', min:15, max:200, cond:s=>!!s.资质, effect:{修炼:2} },

  // 开窍后：资源恢复（按需触发）
  { id:'auto_7', phase:'cultivation', text:'你上山采药，调养伤势。', min:15, max:200, cond:s=>!!s.资质 && s.resources.血条/s.resourceMax.血条 < 0.6, effect:{血条:0.3} },
  { id:'auto_8', phase:'cultivation', text:'你静坐调息，恢复真元。', min:15, max:200, cond:s=>!!s.资质 && s.resources.真元/s.resourceMax.真元 < 0.5, effect:{真元:0.3} },
  { id:'auto_9', phase:'cultivation', text:'你与同窗对练，进步神速。', min:15, max:200, cond:s=>!!s.资质, effect:{体力:-0.10, 修炼:4} },
  { id:'auto_10', phase:'cultivation', text:'你感到瓶颈将至，只差真元圆满便可冲击境界。', min:15, max:200, once:true, cond:s=>!!s.资质 && s.rank < 3 && s.sub===3 && s.resources.真元/s.resourceMax.真元 < CULT.breakEssenceReq },

  // 童年专属：训练、读书、家族关系与线索（M3 按月推进）
  { id:'auto_11', phase:'childhood', text:'你替药房搬运草筐，认得几味常见药草。', min:10, max:14, cooldown:180, effect:{智力:1, 体力:-0.03} },
  { id:'auto_12', phase:'childhood', text:'同族孩子邀你爬上寨墙，你摔了一跤才学会稳住脚步。', min:10, max:14, cooldown:180, effect:{体质:1, 血条:-0.03} },
  { id:'auto_13', phase:'childhood', text:'你把族中旧账册送回祠堂，族老记住了你的名字。', min:10, max:14, cooldown:180, effect:{颜值:1, 家境:1} },
  { id:'auto_14', phase:'childhood', text:'夜里你听见偏院有人争论一批失踪的元石。', min:10, max:14, cooldown:180, effect:{运气:1} },
  { id:'auto_15', phase:'childhood', text:'你抄写蛊经时漏掉一行，被先生罚着重抄。', min:10, max:14, cooldown:180, effect:{智力:1, 体力:-0.02} },
  { id:'auto_16', phase:'childhood', text:'你把练习用的木刀让给年幼的族弟，长辈夸你知礼。', min:10, max:14, cooldown:180, effect:{颜值:1} },
  { id:'auto_17', phase:'childhood', text:'你清晨跟着护寨人跑山，腿脚渐渐有力。', min:10, max:14, cooldown:180, effect:{体质:1, 体力:-0.04} },
  { id:'auto_18', phase:'childhood', text:'你在藏书架后发现一张标着旧矿洞的残图。', min:10, max:14, cooldown:180, effect:{智力:1, 运气:1} },
  { id:'auto_19', phase:'childhood', text:'你替母亲跑腿采买，商贩多找了你一枚小钱。', min:10, max:14, cooldown:180, effect:{家境:1} },
  { id:'auto_20', phase:'childhood', text:'你和同龄人争抢练功场，最后各退一步轮流使用。', min:10, max:14, cooldown:180, effect:{颜值:1, 体质:1} },
  { id:'auto_21', phase:'childhood', text:'你观察蛊师催动月光，记下他换气的节奏。', min:10, max:14, cooldown:180, effect:{智力:1, 运气:1} },
  { id:'auto_22', phase:'childhood', text:'你在雨夜守着仓房，听见屋檐下有窸窣声，却没敢开门。', min:10, max:14, cooldown:180, effect:{体质:1} },
  { id:'auto_23', phase:'childhood', text:'家族祭礼上你端稳供盘，几位族人对你露出笑意。', min:10, max:14, cooldown:180, effect:{颜值:1, 家境:1} },

  // 修炼期通用事件，共 40 条（含前 8 条）
  { id:'auto_24', phase:'cultivation', text:'你沿着山溪吐纳，水声让心神渐定。', min:15, max:200, cond:s=>!!s.资质, effect:{修炼:4, 体力:-0.03} },
  { id:'auto_25', phase:'cultivation', once:true, text:'你替同门校正一处蛊阵，换来几句有用心得。', min:15, max:200, cond:s=>!!s.资质, effect:{智力:1, 修炼:2} },
  { id:'auto_26', phase:'cultivation', once:true, text:'山路塌方，你护住药篓后才避开滚石。', min:15, max:200, cond:s=>!!s.资质, effect:{体质:1, 体力:-0.08} },
  { id:'auto_27', phase:'cultivation', once:true, text:'一名族人认出你的善意，替你在管事面前说了好话。', min:15, max:200, cond:s=>!!s.资质, effect:{颜值:1} },
  { id:'auto_28', phase:'cultivation', text:'你清点行囊时发现夹层里多了一块旧元石。', min:15, max:200, chance:0.08, cond:s=>!!s.资质, effect:{元石:1} },
  { id:'auto_29', phase:'cultivation', once:true, text:'你看破一处伪装成灵材的陷阱，反手记下布置手法。', min:15, max:200, cond:s=>!!s.资质, effect:{智力:1, 运气:1} },
  { id:'auto_30', phase:'cultivation', once:true, text:'你在林间追踪妖兽留下的足迹，绕开了它的巢穴。', min:15, max:200, cond:s=>!!s.资质, effect:{体质:1, 修炼:2} },
  { id:'auto_31', phase:'cultivation', text:'你把多余的药材卖给熟识的药商，价格尚算公道。', min:15, max:200, cond:s=>!!s.资质, effect:{元石:2} },
  { id:'auto_32', phase:'cultivation', text:'闭关时你数错了周天，真元运行一滞。', min:15, max:200, cond:s=>!!s.资质, effect:{真元:-0.05, 修炼:1} },
  { id:'auto_33', phase:'cultivation', text:'你在演武场坚持练完最后一轮，气息比昨日更稳。', min:15, max:200, cond:s=>!!s.资质, effect:{体力:-0.05, 修炼:5} },
  { id:'auto_34', phase:'cultivation', once:true, text:'一位同门借走你的笔记，归还时附上了自己的批注。', min:15, max:200, cond:s=>!!s.资质, effect:{智力:1} },
  { id:'auto_35', phase:'cultivation', once:true, text:'你替商队辨出掺假的货物，掌柜给了少量谢礼。', min:15, max:200, cond:s=>!!s.资质, effect:{家境:1, 元石:1} },
  { id:'auto_36', phase:'cultivation', text:'你在石缝中找到一株灵草，采摘时却划伤手臂。', min:15, max:200, cond:s=>!!s.资质, effect:{修炼:4, 血条:-0.04} },
  { id:'auto_37', phase:'cultivation', once:true, text:'你听闻附近有蛊师斗法，赶到时只见一道残痕。', min:15, max:200, cond:s=>!!s.资质, effect:{运气:1} },
  { id:'auto_38', phase:'cultivation', text:'你替族中看守库门半日，管事按例付了酬劳。', min:15, max:200, cond:s=>!!s.资质, effect:{元石:2, 体力:-0.03} },
  { id:'auto_39', phase:'cultivation', once:true, text:'你试着复刻一页残缺蛊方，终于补出关键一笔。', min:15, max:200, cond:s=>!!s.资质, effect:{智力:1, 修炼:3} },
  { id:'auto_40', phase:'cultivation', once:true, text:'巡山时遭遇毒虫，你及时屏息退开，没有吸入毒雾。', min:15, max:200, cond:s=>!!s.资质, effect:{体质:1, 体力:-0.04} },
  { id:'auto_41', phase:'cultivation', once:true, text:'你把一枚元石借给急需疗伤的同门，对方留下了人情。', min:15, max:200, cond:s=>!!s.资质 && s.money>0, effect:{元石:-1, 颜值:1} },
  { id:'auto_42', phase:'cultivation', once:true, text:'你在夜市听到一段关于古洞的传闻，真假难辨。', min:15, max:200, cond:s=>!!s.资质, effect:{运气:1, 元石:-1} },
  { id:'auto_43', phase:'cultivation', once:true, text:'你练习催蛊时真元外泄，及时收手才没有伤到经脉。', min:15, max:200, cond:s=>!!s.资质, effect:{真元:-0.04, 智力:1} },
  { id:'auto_44', phase:'cultivation', once:true, text:'你陪族中长辈复盘一次败仗，听懂了一个常被忽略的破绽。', min:15, max:200, cond:s=>!!s.资质, effect:{智力:1, 修炼:2} },
  { id:'auto_45', phase:'cultivation', once:true, text:'你在训练中被木桩绊倒，爬起来后继续练完。', min:15, max:200, cond:s=>!!s.资质, effect:{血条:-0.03, 体质:1} },
  { id:'auto_46', phase:'cultivation', once:true, text:'你为蛊虫清理器皿，发现一处残留气息与昨日不同。', min:15, max:200, cond:s=>!!s.资质, effect:{运气:1, 智力:1} },
  { id:'auto_47', phase:'cultivation', text:'你将一份多余的修炼札记卖给低阶蛊师。', min:15, max:200, cond:s=>!!s.资质, effect:{元石:2} },
  { id:'auto_48', phase:'cultivation', once:true, text:'你整夜守着受伤的族人，第二天修炼时有些疲惫。', min:15, max:200, cond:s=>!!s.资质, effect:{颜值:1, 体力:-0.08} },
  { id:'auto_49', phase:'cultivation', text:'你在山洞中找到一处安静石室，闭关时少受了打扰。', min:15, max:200, cond:s=>!!s.资质, effect:{修炼:5} },
  { id:'auto_50', phase:'cultivation', once:true, text:'你判断错了风向，吸入少量烟尘后才发现火堆的位置。', min:15, max:200, cond:s=>!!s.资质, effect:{血条:-0.03, 智力:1} },
  { id:'auto_51', phase:'cultivation', once:true, text:'你在族学讲解时提出一个准确的问题，先生多说了几句。', min:15, max:200, cond:s=>!!s.资质, effect:{智力:1, 修炼:2} },
  { id:'auto_52', phase:'cultivation', text:'你替邻近小族修复篱墙，对方送来一份干粮和谢礼。', min:15, max:200, cond:s=>!!s.资质, effect:{元石:1, 体力:-0.04} },
  { id:'auto_53', phase:'cultivation', once:true, text:'你沿旧路返回时发现标记被人移动，幸而没有贸然深入。', min:15, max:200, cond:s=>!!s.资质, effect:{运气:1} },
  { id:'auto_54', phase:'cultivation', once:true, text:'你模仿前辈步法练习半日，双腿酸痛但动作更稳。', min:15, max:200, cond:s=>!!s.资质, effect:{体质:1, 体力:-0.05} },
  { id:'auto_55', phase:'cultivation', once:true, text:'你把一处灵材的生长周期记在册中，日后或许派得上用场。', min:15, max:200, cond:s=>!!s.资质, effect:{智力:1, 运气:1} },

  // 五域专属事件：每域至少一条，共六条
  { id:'auto_56', phase:'cultivation', once:true, region:'南疆', text:'南疆山民指给你一处旧矿坑，石屑中夹着奇异纹路。', min:15, max:200, poolWeight:2, cond:s=>!!s.资质, effect:{运气:1, 修炼:3} },
  { id:'auto_57', phase:'cultivation', once:true, region:'北原', text:'北原部族的勇士邀你在寒风中比试耐力，你咬牙撑到最后。', min:15, max:200, poolWeight:2, cond:s=>!!s.资质, effect:{体质:1, 体力:-0.08} },
  { id:'auto_58', phase:'cultivation', region:'西漠', text:'西漠绿洲商队临时缺少护卫，你护送货箱穿过一段沙路。', min:15, max:200, poolWeight:2, cond:s=>!!s.资质, effect:{元石:2, 体力:-0.05} },
  { id:'auto_59', phase:'cultivation', once:true, region:'东海', text:'东海渔村的蛊师带你辨认潮汐灵材，退潮前采到一份。', min:15, max:200, poolWeight:2, cond:s=>!!s.资质, effect:{修炼:4, 智力:1} },
  { id:'auto_60', phase:'cultivation', once:true, region:'中州', text:'中州古派外门弟子讲解蛊阵布局，你记下阵眼的变化。', min:15, max:200, poolWeight:2, cond:s=>!!s.资质, effect:{智力:1, 修炼:3} },
  { id:'auto_61', phase:'cultivation', once:true, region:'北原', text:'北原风雪忽至，你借毡帐躲过一夜，清晨才找到归路。', min:15, max:200, poolWeight:2, cond:s=>!!s.资质, effect:{体质:1, 运气:1} },

  // 一转蛊相关事件：以显式蛊虫引用和持有条件保证内容对应
  { id:'auto_62', phase:'cultivation', gu:'月光蛊', text:'你催动月光蛊切开藤蔓，月刃在石面留下浅痕。', min:15, max:200, cond:s=>s.gu.has('月光蛊'), effect:{真元:-0.05, 修炼:3} },
  { id:'auto_63', phase:'cultivation', gu:'酒虫', text:'酒虫绕着酒坛飞了一圈，坛底残液被它吸得一干二净。', min:15, max:200, cond:s=>s.gu.has('酒虫'), effect:{修炼:4} },
  { id:'auto_64', phase:'cultivation', once:true, gu:'星镖蛊', text:'星镖蛊钉住一只窜出的山鼠，你从它携带的草籽认出附近灵草。', min:15, max:200, cond:s=>s.gu.has('星镖蛊'), effect:{运气:1, 修炼:2} },
  { id:'auto_65', phase:'cultivation', once:true, gu:'臭屁蛊', text:'臭屁蛊的气味驱散了洞口的野兽，也熏得你不得不换一处修炼地。', min:15, max:200, cond:s=>s.gu.has('臭屁蛊'), effect:{体力:-0.03, 运气:1} },
  { id:'auto_66', phase:'cultivation', once:true, gu:'臭屁肥虫', text:'臭屁肥虫钻进腐泥，你顺着它拱出的痕迹找到一小块药土。', min:15, max:200, cond:s=>s.gu.has('臭屁肥虫'), effect:{修炼:3, 家境:1} },
  { id:'auto_67', phase:'cultivation', once:true, gu:'铭心蛊', text:'铭心蛊记下了商队暗号，你据此避开一次重复收费。', min:15, max:200, cond:s=>s.gu.has('铭心蛊'), effect:{元石:1, 智力:1} },
  { id:'auto_68', phase:'cultivation', once:true, gu:'黑豕蛊', text:'黑豕蛊改造身躯时带来一阵剧痛，你咬牙熬过了这次反噬。', min:15, max:200, cond:s=>s.gu.has('黑豕蛊'), effect:{体质:1, 血条:-0.03} },
  { id:'auto_69', phase:'cultivation', gu:'白豕蛊', text:'白豕蛊吸收猪肉后气息稳定，你趁机完成了一轮锻炼。', min:15, max:200, cond:s=>s.gu.has('白豕蛊'), effect:{体力:-0.03, 修炼:3} },
  { id:'auto_70', phase:'cultivation', gu:'熊力蛊', text:'熊力蛊催出的力道震落枯枝，枝下露出一枚遗失的元石。', min:15, max:200, cond:s=>s.gu.has('熊力蛊'), effect:{元石:1, 体力:-0.04} },
  { id:'auto_71', phase:'cultivation', gu:'溪流蛊', text:'溪流蛊引来一缕清泉，你用泉水洗净伤口并静心吐纳。', min:15, max:200, cond:s=>s.gu.has('溪流蛊'), effect:{血条:0.08, 修炼:2} },
  { id:'auto_72', phase:'cultivation', once:true, gu:'花豕蛊', text:'花豕蛊的力道让你搬开挡路巨石，石后藏着一株灵草。', min:15, max:200, cond:s=>s.gu.has('花豕蛊'), effect:{体质:1, 运气:1} },
  { id:'auto_73', phase:'cultivation', gu:'蛮力天牛蛊', text:'蛮力天牛蛊的力量只维持片刻，你趁势完成了沉重的搬运差事。', min:15, max:200, cond:s=>s.gu.has('蛮力天牛蛊'), effect:{元石:2, 体力:-0.06} },
];
