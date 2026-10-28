/* ============================================================
   蛊真人 · 抉择事件（开窍后触发）
   outcomes：随机结果（加权）；need/cost 支持资源条件与消耗
   效果三类：属性(整数) / 资源(占上限比例,|v|≤1) / 修炼(修炼日)
   ============================================================ */
const CHOICE_EVENTS = [
  { id:'choice_1', phase:'cultivation', text:'你发现了一株罕见的草药，是否借此炼蛊？', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'炼蛊（赌一把）', outcomes:[
          { effect:{体质:2, 运气:1}, result:'炼蛊成功，你的蛊虫更强了！', weight:1, weightByAttr:['智力'] },
          { effect:{运气:-2, 血条:-0.1}, result:'炼蛊失败，蛊虫受了轻伤。', weight:1, weightByAttr:['运气'] },
        ] },
      { text:'稳妥起见，不炼', effect:{运气:1}, result:'你选择稳扎稳打。' },
    ] },

  { id:'choice_2', phase:'cultivation', text:'一个散修想拉你入伙，同去闯一处秘境。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'同去闯秘境', outcomes:[
          { effect:{体力:-0.2, 修炼:30, 家境:2}, result:'你在秘境里得了大机缘！', weight:1, weightByAttr:['运气'] },
          { effect:{血条:-0.35, 体力:-0.3}, result:'秘境凶险，你负伤逃回。', weight:1, weightByAttr:['体质'] },
        ] },
      { text:'花 4 元石购入秘境情报', cost:{元石:-4}, outcomes:[
          { effect:{修炼:20}, result:'你凭借情报找到一处灵材，修为有所精进。', weight:1, weightByAttr:['颜值','家境'] },
          { effect:{体力:-0.1}, result:'情报真假参半，你空耗了些时间。', weight:1 },
        ] },
      { text:'独自行动', effect:{运气:1}, result:'你习惯独来独往。' },
    ] },

  { id:'choice_3', phase:'cultivation', text:'你的春秋蝉忽然微微颤动，仿佛要引动时光。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'催动春秋蝉（消耗运气）', effect:{运气:-3, 体质:2}, result:'你窥见了未来的一角。' },
      { text:'按兵不动', effect:{运气:1}, result:'你压下心中的悸动。' },
    ] },

  /* ---- 5.2 新增：演示 need / cost 机制 ---- */
  { id:'choice_4', phase:'cultivation', text:'月夜，你于崖边参悟功法，心有所动。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'静心参悟', cost:{体力:-0.3}, outcomes:[
          { effect:{修炼:40}, result:'你顿悟功法，修为大进！', weight:1, weightByAttr:['智力'] },
          { effect:{血条:-0.25, 真元:-0.3}, result:'你走火入魔，气血翻涌。', weight:1 },
        ] },
      { text:'压下杂念，回去安睡', effect:{体力:0.2}, result:'你安睡一夜，神清气爽。' },
    ] },

  { id:'choice_5', phase:'cultivation', text:'野外，你遭遇了一伙歹人袭击！', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'催动月光蛊御敌',
        need: s => s.gu.has('月光蛊') && s.resources.真元/s.resourceMax.真元 >= 0.15,
        needText: '需月光蛊且真元≥15%',
        cost: {真元:-0.15},
        result: '你催动月光蛊，月刃斩退来敌！' },
      { text:'硬拼一场', effect:{血条:-0.3}, result:'你浴血搏杀，负伤而退。' },
      { text:'转身逃走', effect:{体力:-0.2}, result:'你且战且退，逃出生天。' },
    ] },

  // 事件链一：家族比试（报名/回避 → 比试 → 结果）
  { id:'choice_6', phase:'cultivation', chainId:'family_contest', chainStep:1, text:'族中宣布月底比试，胜者可进入藏经阁挑选一卷功法。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'报名参赛', flags:['contest_entered'], outcomes:[
          { weight:1, weightByAttr:['颜值'], result:'管事记下你的名字，给了你一张参赛木牌。' },
          { weight:1, result:'报名人太多，你被排在了候补位。' },
        ] },
      { text:'回避比试，专心修炼', flags:['contest_avoided'], effect:{修炼:5}, result:'你让出名额，转身回到自己的住处。' },
    ] },
  { id:'choice_7', phase:'cultivation', chainId:'family_contest', chainStep:2, text:'比试开始，你的对手抢先催动蛊虫，台下族人屏住呼吸。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'报名后正面迎击', need:s=>s.flags.has('contest_entered'), needText:'需报名参赛', cost:{体力:-0.1}, outcomes:[
          { weight:1, weightByAttr:['体质'], effect:{修炼:8}, result:'你稳住阵脚，抓住空隙反击，赢得一阵喝彩。' },
          { weight:1, effect:{血条:-0.12}, result:'你硬接一击后落下擂台，手臂一阵发麻。' },
        ] },
      { text:'报名后观察招式寻找破绽', need:s=>s.flags.has('contest_entered'), needText:'需报名参赛', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:6}, result:'你识破对手的虚招，险险扳回一局。' },
          { weight:1, effect:{体力:-0.08}, result:'你判断慢了一拍，只能避开锋芒。' },
        ] },
      { text:'回避擂台，旁听族老讲解', need:s=>s.flags.has('contest_avoided'), needText:'需先回避比试', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{智力:1}, result:'你没有上台，反而从族老讲解中学到一处破绽。' },
          { weight:1, effect:{修炼:2}, result:'你听完讲解后回去练习，所得不多但也没有受伤。' },
        ] },
      { text:'请管事安排下一轮补测', need:s=>s.flags.has('contest_avoided'), needText:'需先回避比试', effect:{颜值:1}, result:'管事答应替你留意下一次比试机会。' },
    ] },
  { id:'choice_8', phase:'cultivation', chainId:'family_contest', chainStep:3, text:'比试尘埃落定，族中管事按表现分发奖励。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'领取奖励并记下对手的招式', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{元石:3, 修炼:4}, result:'你得到三枚元石，也把对手的出招顺序记在心里。' },
          { weight:1, effect:{元石:1}, result:'管事按例给了你一枚元石。' },
        ] },
      { text:'婉拒奖励，请族老指点', outcomes:[
          { weight:1, weightByAttr:['颜值'], effect:{智力:1}, result:'族老对你的态度缓和，额外讲了一处修炼误区。' },
          { weight:1, result:'族老只点点头，让你先回去休息。' },
        ] },
    ] },

  // 事件链二：解石得蛊（南疆发现原石 → 付费解石 → 处理收获）
  { id:'choice_9', phase:'cultivation', region:'南疆', chainId:'stone_gamble', chainStep:1, text:'南疆石市里，一块带着淡淡蛊息的原石被摆上木台。', min:15, max:200, once:true, poolWeight:2, cond:s=>!!s.资质,
    choices:[
      { text:'花 2 元石请摊主保留原石', cost:{元石:-2}, flags:['stone_reserved'], result:'摊主收下元石，把原石放进柜中等你回来。' },
      { text:'记下摊位位置，先去筹钱', flags:['stone_deferred'], result:'你记下摊位位置，打算稍后再来。' },
    ] },
  { id:'choice_10', phase:'cultivation', chainId:'stone_gamble', chainStep:2, text:'摊主取出原石，薄薄的石皮下隐约透出异色。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'花 4 元石当场解石', need:s=>s.money>=4 && (s.flags.has('stone_reserved') || s.flags.has('stone_deferred')), needText:'需原石凭据且有 4 元石', cost:{元石:-4}, outcomes:[
          { weight:1, weightByAttr:['运气'], gu:'星镖蛊', result:'石皮剥落，一只完整的一转星镖蛊显露出来！' },
          { weight:1, weightByAttr:['智力'], effect:{元石:2}, result:'里面没有蛊虫，却藏着两枚旧元石。' },
          { weight:1, effect:{体力:-0.08}, result:'原石碎成粉末，解石费也打了水漂。' },
        ] },
      { text:'不赌这块原石', effect:{运气:1}, result:'你收回手，决定把元石留给更稳妥的用途。' },
    ] },
  { id:'choice_11', phase:'cultivation', chainId:'stone_gamble', chainStep:3, text:'石市散场前，摊主把解出的碎料和收据交到你手里。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'仔细检查碎料', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:5}, result:'你从碎料里辨出一丝残余道痕，回去后尝试参悟。' },
          { weight:1, effect:{元石:1}, result:'碎料不值钱，摊主退还了一枚押金。' },
        ] },
      { text:'把收据留作凭证', effect:{家境:1}, result:'你收好收据，日后或许能在石市换取一点信任。' },
    ] },

  // 事件链三：野外斗蛊（发现目标 → 交手 → 脱身或得利）
  { id:'choice_12', phase:'cultivation', chainId:'wild_gu', chainStep:1, text:'巡山时，你发现一只野生蛊虫正被两名散修围堵。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'从侧面追上去', flags:['wild_pursued'], effect:{体力:-0.04}, result:'你绕开正面冲突，跟上了其中一名散修。' },
      { text:'上前交涉，提出分取收获', flags:['wild_talked'], result:'你亮出身份，要求散修停手谈条件。' },
      { text:'趁乱撤离', flags:['wild_retired'], effect:{运气:1}, result:'你记下方向后迅速离开，没有贸然卷入争斗。' },
    ] },
  { id:'choice_13', phase:'cultivation', chainId:'wild_gu', chainStep:2, text:'林中传来一声爆响，散修和野蛊都失去了平衡。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'追击时趁势制住野蛊', need:s=>s.flags.has('wild_pursued'), needText:'需选择追击', cost:{体力:-0.08}, outcomes:[
          { weight:1, weightByAttr:['体质'], effect:{修炼:5}, result:'你压住野蛊的冲势，迫使散修暂时退开。' },
          { weight:1, effect:{血条:-0.12}, result:'野蛊反扑，你被擦伤，只能拉开距离。' },
        ] },
      { text:'交涉时观察散修的配合方式', need:s=>s.flags.has('wild_talked'), needText:'需选择交涉', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{运气:1}, result:'你看出两人配合中的空当，安全地绕到上风处。' },
          { weight:1, effect:{体力:-0.05}, result:'烟尘遮住视线，你没能判断出局势。' },
        ] },
      { text:'撤退时借地形退到高处', need:s=>s.flags.has('wild_retired'), needText:'需选择撤退', outcomes:[
          { weight:1, weightByAttr:['运气'], effect:{体力:-0.02}, result:'你踩着树根攀上高处，避开了混战。' },
          { weight:1, effect:{血条:-0.05}, result:'碎石滚落，你在后退时被划伤。' },
        ] },
    ] },
  { id:'choice_14', phase:'cultivation', chainId:'wild_gu', chainStep:3, text:'散修退去后，林间只剩下破损的蛊囊和一串新鲜脚印。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'检查蛊囊与脚印', outcomes:[
          { weight:1, weightByAttr:['运气'], effect:{元石:2, 修炼:2}, result:'你找到两枚元石和一条通往旧营地的线索。' },
          { weight:1, effect:{体力:-0.03}, result:'蛊囊已空，你只确认了散修逃离的方向。' },
        ] },
      { text:'不追踪，回到巡山路线', effect:{智力:1}, result:'你不为小利冒险，记下了事件经过便离开。' },
    ] },

  // 独立抉择：修炼、交易、家族、人情和风险选择
  { id:'choice_15', phase:'cultivation', text:'一页残缺蛊方在旧书摊出售，摊主只肯留到日落。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'花 3 元石买下抄本', need:s=>s.money>=3, needText:'需 3 元石', cost:{元石:-3}, outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:8}, result:'你补出蛊方缺失的一笔，理解了其中的运转思路。' },
          { weight:1, effect:{智力:1}, result:'抄本有误，但你从错处看出一种常见炼蛊手法。' },
        ] },
      { text:'只记下封皮上的书名', effect:{智力:1}, result:'你没有花钱，只把书名记在心里。' },
    ] },
  { id:'choice_16', phase:'cultivation', text:'一名商贩请你替他辨认一批来路不明的药材。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'当场验货并谈报酬', outcomes:[
          { weight:1, weightByAttr:['颜值','家境'], effect:{元石:3}, result:'你谈下合理报酬，商贩也承认货里混了次品。' },
          { weight:1, effect:{元石:1}, result:'你只辨出一部分，商贩按约给了一枚元石。' },
        ] },
      { text:'拒绝接手陌生货物', effect:{运气:1}, result:'你不愿惹上来路不明的麻烦，转身离开。' },
    ] },
  { id:'choice_17', phase:'cultivation', text:'演武场上的对手提出切磋，周围人都等着看结果。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'接受切磋', cost:{体力:-0.06}, outcomes:[
          { weight:1, weightByAttr:['体质'], effect:{修炼:6}, result:'你顶住数轮攻势，摸清了自己的短处。' },
          { weight:1, effect:{血条:-0.08}, result:'对手一招得手，你带着淤青结束比试。' },
        ] },
      { text:'先观察对方的惯用招式', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:3}, result:'你记住了对方的起手动作，没有急着应战。' },
          { weight:1, result:'对方很快收招，你没看出更多门道。' },
        ] },
    ] },
  { id:'choice_18', phase:'cultivation', text:'族中管事请你替一位受伤族人送药，路程要穿过夜林。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'亲自送药', outcomes:[
          { weight:1, weightByAttr:['体质'], effect:{颜值:1}, result:'你准时送到药包，伤者家人记下了这份情。' },
          { weight:1, effect:{体力:-0.08}, result:'夜路难行，你绕远后才把药送到。' },
        ] },
      { text:'请管事另派人手', effect:{家境:1}, result:'你说明自己的难处，管事没有勉强你。' },
    ] },
  { id:'choice_19', phase:'cultivation', text:'你的蛊虫气息忽强忽弱，附近正好有位炼蛊师坐堂。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'花 2 元石请他查看', need:s=>s.money>=2, needText:'需 2 元石', cost:{元石:-2}, outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:4}, result:'炼蛊师指出一处气息滞涩，你照着建议调息。' },
          { weight:1, effect:{运气:1}, result:'问题并不严重，蛊虫很快恢复平稳。' },
        ] },
      { text:'自行观察蛊虫变化', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{智力:1}, result:'你从细微变化里找到了原因。' },
          { weight:1, effect:{体力:-0.03}, result:'你没看出异样，只好暂时作罢。' },
        ] },
    ] },
  { id:'choice_20', phase:'cultivation', text:'山道旁有人留下求救标记，附近却没有打斗声。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'循标记前去查看', outcomes:[
          { weight:1, weightByAttr:['运气'], effect:{元石:2}, result:'你找到被困的采药人，对方送给你两枚元石。' },
          { weight:1, effect:{血条:-0.07}, result:'标记是诱饵，你及时脱身但仍被擦伤。' },
        ] },
      { text:'先在远处观察', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{智力:1}, result:'你发现标记方向不自然，识破了诱饵。' },
          { weight:1, result:'观察许久也没发现异常，你选择绕开。' },
        ] },
    ] },
  { id:'choice_21', phase:'cultivation', text:'一名年长蛊师愿意传授吐纳诀窍，但要求你陪练一整日。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'答应陪练', cost:{体力:-0.12}, outcomes:[
          { weight:1, weightByAttr:['体质'], effect:{修炼:8}, result:'你挨了几次重手，也学会了如何稳定气息。' },
          { weight:1, effect:{血条:-0.1}, result:'陪练强度超出预料，你带伤结束训练。' },
        ] },
      { text:'只请教关键要点', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:4}, result:'你问清了吐纳的节奏，省下大半日时间。' },
          { weight:1, result:'蛊师不愿多说，你只记住一句口诀。' },
        ] },
    ] },
  { id:'choice_22', phase:'cultivation', text:'商队夜间缺一名护卫，报酬比平日高出一枚元石。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'接下护卫差事', outcomes:[
          { weight:1, weightByAttr:['体质'], effect:{元石:3, 体力:-0.08}, result:'夜路平安，你拿到三枚元石。' },
          { weight:1, effect:{元石:1, 血条:-0.06}, result:'途中遇上劫匪，你负伤后只拿到约定底薪。' },
        ] },
      { text:'留在住处修炼', effect:{修炼:4}, result:'你放弃报酬，继续稳步修炼。' },
    ] },
  { id:'choice_23', phase:'cultivation', text:'一处安静石室可租用一旬，主人要求先付三枚元石。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'花 3 元石租下石室', need:s=>s.money>=3, needText:'需 3 元石', cost:{元石:-3}, outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:9}, result:'石室灵气平稳，你专心修炼了数日。' },
          { weight:1, effect:{修炼:3}, result:'隔壁传来喧闹声，石室并不如主人承诺的安静。' },
        ] },
      { text:'在山林里自行找地方', outcomes:[
          { weight:1, weightByAttr:['运气'], effect:{修炼:5}, result:'你找到一处背风石隙，修炼没有受到打扰。' },
          { weight:1, effect:{体力:-0.04}, result:'露水浸湿衣物，你折腾半夜才安顿下来。' },
        ] },
    ] },
  { id:'choice_24', phase:'cultivation', text:'年轻族人请你帮忙检查一份修炼心得，报酬可以当面商量。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'认真指出问题', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{元石:2, 修炼:2}, result:'你指出关键错误，族人付了报酬并记下你的建议。' },
          { weight:1, effect:{元石:1}, result:'你只看出一处小错，得到一枚元石。' },
        ] },
      { text:'收下心得，改日再看', effect:{修炼:2}, result:'你把心得带回住处，留待有空时细读。' },
    ] },
  { id:'choice_25', phase:'cultivation', text:'你发现一株灵草被妖兽守着，附近还有一道狭窄退路。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'趁妖兽转身时采摘', outcomes:[
          { weight:1, weightByAttr:['运气'], effect:{元石:2, 修炼:3}, result:'你采到灵草后从退路脱身，卖出两枚元石。' },
          { weight:1, effect:{血条:-0.1}, result:'妖兽及时回头，你只好丢下灵草逃走。' },
        ] },
      { text:'绕路离开', effect:{体力:-0.02}, result:'你不为一株灵草冒险，按原路返回。' },
    ] },
  { id:'choice_26', phase:'cultivation', text:'月夜里，月光蛊的光芒忽然变得格外明亮。', min:15, max:200, once:true, cond:s=>!!s.资质 && s.gu.has('月光蛊'),
    choices:[
      { text:'试着引导月光蛊的气息', cost:{真元:-0.08}, outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:6}, result:'你找到更顺畅的催动节奏，收住了外泄的真元。' },
          { weight:1, effect:{体力:-0.05}, result:'月光散去，你只记下了短暂的光纹变化。' },
        ] },
      { text:'停止催动，先观察', effect:{运气:1}, result:'你没有继续消耗真元，等光芒自行平复。' },
    ] },
  { id:'choice_27', phase:'cultivation', text:'同门急需三枚元石疗伤，提出月底连本带息归还。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'借出 3 元石', need:s=>s.money>=3, needText:'需 3 元石', cost:{元石:-3}, outcomes:[
          { weight:1, weightByAttr:['颜值'], effect:{颜值:1}, result:'同门按时还清欠款，还记下了你这份人情。' },
          { weight:1, effect:{家境:-1}, result:'对方拖延还款，你的元石暂时没有着落。' },
        ] },
      { text:'只帮忙寻找药材', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{修炼:2}, result:'你找到合用药材，既帮上忙也没动用元石。' },
          { weight:1, result:'药材已经售罄，你只能送对方回住处。' },
        ] },
    ] },
  { id:'choice_28', phase:'cultivation', text:'有人高价兜售一张秘境地图，地图边缘缺了半块。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'花 2 元石买下残图', need:s=>s.money>=2, needText:'需 2 元石', cost:{元石:-2}, outcomes:[
          { weight:1, weightByAttr:['智力','运气'], effect:{运气:1, 元石:2}, result:'你补全了地图上的缺口，按标记找回两枚元石。' },
          { weight:1, effect:{体力:-0.03}, result:'残图路线早已变更，你白跑了一趟。' },
        ] },
      { text:'要求卖家先解释路线', outcomes:[
          { weight:1, weightByAttr:['颜值'], effect:{智力:1}, result:'卖家被你问得露出破绽，你看出地图是旧图。' },
          { weight:1, result:'对方不肯多说，你没有买下残图。' },
        ] },
    ] },
  { id:'choice_29', phase:'cultivation', text:'一位外族女蛊师愿与你交换修炼心得，也提出一笔额外交易。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'以礼相待，交换心得', outcomes:[
          { weight:1, weightByAttr:['颜值'], effect:{修炼:4}, result:'交谈顺利，你们互换了几条实用的修炼心得。' },
          { weight:1, effect:{修炼:1}, result:'话题很快冷下来，你只换到一条常见建议。' },
        ] },
      { text:'花 2 元石购买她的情报', need:s=>s.money>=2, needText:'需 2 元石', cost:{元石:-2}, outcomes:[
          { weight:1, weightByAttr:['家境','颜值'], effect:{运气:1}, result:'她补充了情报中的关键细节，你避开一处危险路段。' },
          { weight:1, result:'情报没有提到近期变化，你决定自行核实。' },
        ] },
    ] },
  { id:'choice_30', phase:'cultivation', text:'洞府入口将要坍塌，你只能带走一件东西。', min:15, max:200, once:true, cond:s=>!!s.资质,
    choices:[
      { text:'抱起沉重的石匣', cost:{体力:-0.08}, outcomes:[
          { weight:1, weightByAttr:['体质'], effect:{元石:3}, result:'你把石匣拖出洞口，里面有三枚旧元石。' },
          { weight:1, effect:{血条:-0.1}, result:'石匣卡在裂缝中，你脱身时被碎石划伤。' },
        ] },
      { text:'记下洞府结构后撤离', outcomes:[
          { weight:1, weightByAttr:['智力'], effect:{智力:1}, result:'你记住了通道走向，决定日后准备充分再来。' },
          { weight:1, effect:{运气:1}, result:'你及时找到稳固出口，毫发无损地离开。' },
        ] },
    ] },
];
