/* 宝黄天价格、批量和供货均为项目设定。仙凡按商品性质分区，不按玩家境界混装。
 * 新商品出处：错别字修正版 5.0 TXT 第71834–71845行（荒兽龙鱼及肉），
 * 第72625行（荒玉、月牙结）。辅助食料不等于所有仙蛊的专属食物。
 */
const SHOP_CATEGORIES = {gu:'蛊虫',material:'材料',food:'喂养食物',beast:'野兽',recipe:'蛊方'};
const SHOP_PAGE_SIZE = 12;
const SHOP_GOODS = [
  ...GU.filter(g=>g.grade==='凡蛊' && g.rank<6).map(g=>({
    id:'gu_'+g.id,name:g.name,grade:'mortal',category:'gu',guId:g.id,
    price:MATERIAL_GU_PRICES[g.id]||M4_EXTRA.prices[g.id]||g.rank*18,
    amount:1,unit:'只',desc:g.rank+'转 · '+g.流派+' · '+g.定位
  })),
  ...[61,62,64,70,91,92,93,94].map(id=>{const g=guById(id);return {
    id:'gu_'+id,name:g.name,grade:'immortal',category:'gu',guId:id,
    price:120*(g.rank-5),amount:1,unit:'只',unique:true,
    desc:g.rank+'转 · '+g.流派+' · 每世仅售一只；购买不代表已能催动'
  }}),
  ...FOODS.map(f=>({id:'food_'+f.id,name:f.name,grade:'mortal',category:'food',
    stock:'foodStock',key:f.id,price:f.price,amount:f.amount,unit:f.unit,desc:'购买后加入喂养库存，供养时自动取用'})),
  ...MATERIALS.map(m=>({id:'material_'+m.id,name:m.name,grade:'mortal',category:'material',
    stock:'materialStock',key:m.id,price:m.price,amount:1,unit:'份',desc:m.source})),
  ...RECIPES.map(r=>({id:'recipe_'+r.id,name:guById(r.output.id).name+'蛊方',grade:'mortal',category:'recipe',
    recipeId:r.id,price:5,amount:1,unit:'份',unique:true,desc:'学习配方或补全前世模糊记忆；配方只提供提示'})),
  {id:'beast_boar',name:'野猪',grade:'mortal',category:'beast',price:8,amount:1,unit:'头',desc:'购入后收入野兽库存'},
  {id:'beast_wolf',name:'青狼',grade:'mortal',category:'beast',price:12,amount:1,unit:'头',desc:'购入后收入野兽库存'},
  {id:'material_desolateJade',name:'荒玉',grade:'immortal',category:'material',price:6,amount:1,unit:'份',desc:'仙材，可购入储备；具体炼制用途以已开放配方为准'},
  {id:'material_moonKnot',name:'月牙结',grade:'immortal',category:'material',price:9,amount:1,unit:'份',desc:'仙材，可购入储备；具体炼制用途以已开放配方为准'},
  {id:'food_dragonfish',name:'荒兽龙鱼肉',grade:'immortal',category:'food',price:4,amount:1,unit:'份',desc:'仙级辅助食料储备；暂未接入专属喂养，不能替代任意蛊虫的食物'},
  {id:'beast_dragonfish',name:'荒兽龙鱼',grade:'immortal',category:'beast',price:30,amount:1,unit:'头',desc:'六转层次荒兽，购入后收入野兽库存'}
];
