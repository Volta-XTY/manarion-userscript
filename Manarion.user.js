// ==UserScript==
// @name         Manarion Chinese Translation
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Manarion Chinese Translation and Quest notification
// @author       VoltaXTY
// @match        https://manarion.com/*
// @icon         http://manarion.com/favicon.ico
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==
const DoTranslate = true; // 把这里的true改成false就可以关闭翻译，反之亦然。
const DEBUG = true;
const GetItem = (key) => JSON.parse(window.localStorage.getItem(key) ?? "null");
const SetItem = (key, value) => window.localStorage.setItem(key, JSON.stringify(value));
const css = 
`
:root{
    font-variant: none;
    font-family: Times New Roman;
    font-weight: 500;
}
`;
const InsertStyleSheet = (style) => {
    const s = new CSSStyleSheet();
    s.replaceSync(style);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, s];
};
InsertStyleSheet(css);
const HTML = (tagname, attrs, ...children) => {
    if(attrs === undefined) return document.createTextNode(tagname);
    const ele = document.createElement(tagname);
    if(attrs) for(const [key, value] of Object.entries(attrs)){
        if(value === null || value === undefined) continue;
        if(key.charAt(0) === "_"){
            const type = key.slice(1);
            ele.addEventListener(type, value);
        }
        else if(key === "eventListener"){
            for(const listener of value){
                ele.addEventListener(listener.type, listener.listener, listener.options);
            }
        }
        else ele.setAttribute(key, value);
    }
    for(const child of children) if(child) ele.append(child);
    return ele;
};
const popupSelector = 'div[data-slot="tooltip-content"]:not([translated])';
const Translation = new Map([
    // #region stat panel
    ["Battle Level:", "战斗等级:"],
    ["Experience:", "经验值:"],
    ["Actions:", "行动计数:"],
    ["Mana Dust:", "魔法尘:"],
    ["Elemental Shards:", "元素碎片:"],
    ["Codex:", "法典:"],
    ["Intellect:", "智力:"],
    ["Stamina:", "耐力:"],
    ["Spirit:", "精神:"],
    ["Focus:", "集中:"],
    ["Mana:", "魔力:"],
    ["Nature Mastery:", "自然增幅:"],
    ["Fire Mastery:", "火系增幅:"],
    ["Water Mastery:", "水系增幅:"],
    ["Total Spellpower:", "总法强:"],
    ["Total Ward:", "总抗性:"],
    ["Battle Level", "战斗等级"],
    ["Experience", "经验值"],
    ["Mana Dust", "魔法尘"],
    ["Elemental Shards", "元素碎片"],
    ["Codex", "法典"],
    ["Intellect", "智力"],
    ["Stamina", "耐力"],
    ["Spirit", "精神"],
    ["Focus", "集中"],
    ["Mana", "魔力"],
    ["Nature Mastery", "自然增幅"],
    ["Fire Mastery", "火系增幅"],
    ["Water Mastery", "水系增幅"],
    ["Total Spellpower", "总法强"],
    ["Total Ward", "总抗性"],
    ["Quest Progress:", "任务进度:"],
    ["Defeat:", "击败:"],
    ["Enemies:", "个敌人:"],
    ["Increases your spell damage", "增强你的法术伤害"],
    ["Increases your health", "增加你的生命值"],
    ["Increases your mana pool", "增加你的魔力值"],
    ["Decreases enemy ward strength", "降低敌人的防御强度"],
    ["Increases your mana regeneration", "增加你的魔法回复"],
    // #endregion
    // #region item names
    ["[Mana Dust]", "[魔法尘]"],
    ["Mana Dust", "魔法尘"],
    ["[Elemental Shards]", "[元素碎片]"],
    ["Elemental Shards", "元素碎片"],
    ["[Codex]", "[法典]"],
    ["Codex", "法典"],
    ["[Bound Codex]", "[绑定法典]"],
    ["[Fish]", "[鱼]"],
    ["[Wood]", "[木]"],
    ["[Iron]", "[铁]"],
    ["[Tome of Fire]", "[火之书]"],
    ["[Tome of Water]", "[水之书]"],
    ["[Tome of Nature]", "[自然之书]"],
    ["[Tome of Mana Shield]", "[魔法盾之书]"],
    ["[Orb of Power]", "[强化球]"],
    ["[Orb of Chaos]", "[混沌球]"],
    ["[Orb of Divinity]", "[神圣球]"],
    ["[Sunpetal]", "[太阳花瓣]"],
    ["[Sageroot]", "[智慧之根]"],
    ["[Bloomwell]", "[Bloomwell]"],
    ["[Fire Essence]", "[火之精华]"],
    ["[Water Essence]", "[水之精华]"],
    ["[Nature Essence]", "[自然精华]"],
    ["[Asbestos]", "[火绒]"],
    ["[Ironbark]", "[铁桉]"],
    ["[Fish Scales]", "[鱼鳞]"],
    ["[Elderwood]", "[古树枝干]"],
    ["[Lodestone]", "[磁石]"],
    ["[White Pearl]", "[白色珍珠]"],
    ["[Four-leaf Clover]", "[四叶草]"],
    ["[Enchanted Droplet]", "[神秘结露]"],
    ["[Infernal Heart]", "[熔岩之心]"],
    ...[
        ["Fire Resistance", "火系抗性"],
        ["Water Resistance", "水系抗性"],
        ["Nature Resistance", "自然抗性"],
        ["Inferno", "地狱烈焰"],
        ["Tidal Wrath", "狂潮"],
        ["Wildheart", "野性之心"],
        ["Insight", "洞察"],
        ["Bountiful Harvest", "丰饶"],
        ["Prosperity", "富饶"],
        ["Fortune", "幸运"],
        ["Growth", "成长"],
        ["Vitality", "活力"],
    ].flatMap(([key, value]) => [
        [key, value],
        [`Formula: ${key}`, `术式：${value}`],
        [`[Formula: ${key}]`, `[术式：${value}]`],
    ]),
    // #endregion
    // #region tab
    ["Base Power", "基础能力值"],
    ["Combat Skills", "战斗加成"],
    ["Enchants", "附魔技能"],
    ["Gathering", "采集升级"],
    ["Farm", "农场"],
    ["Potions", "药水"],
    // #endregion
    // #region market
    ["Quantity", "数量"],
    ["Unit Price", "单价"],
    ["Sell", "出售"],
    ["Buy", "购买"],
    ["Level", "等级"],
    ["Rarity", "稀有度"],
    ["Skill", "对应技能"],
    ["Slot", "部位"],
    ["Secondary Boost", "次要加成"],
    ["Max Price", "最高售价"],
    ["Buy Orders", "购买挂单"],
    ["Sell Orders", "出售挂单"],
    [" each", " 每个"],
    ["View your orders", "查看我的挂单"],
    ["Marketplace", "市场"],
    ["All prices are in Mana Dust", "所有价格的单位都是魔法尘"],
    ["Back to market", "回到市场"],
    // #endregion
    // #region guild
    ["Create", "创建"],
    ["Guild Name", "公会名"],
    ["Level", "等级"],
    ["Upgrades", "公会加成"],
    ["Roster", "成员列表"],
    ["Armory", "装备库"],
    ["Ranks", "公会职位"],
    ["Log", "日志"],
    ["Name", "名称"],
    ["Active", "状态"],
    ["Rank", "职位"],
    ["Borrow", "借出"],
    // #endregion
    // #region button 
    ["Transfer", "赠送"],
    ["Seller", "出售者"],
    ["Quality", "品质"],
    ["Boost", "加成"],
    ["Price", "售价"],
    ["Reset", "重置"],
    ["Search", "搜索"],
    ["Equipment", "装备"],
    ["Equip", "装备"],
    ["View other items", "查看其他物品"],
    ["Unequip", "卸下"],
    ["Refresh Actions", "刷新行动计数"],
    ["Stop", "中止"],
    ["Max", "最大"],
    ["Confirm", "确定"],
    ["OK", "确定"],
    ["Cancel", "取消"],
    ["Edit", "修改"],
    ["Donate", "捐赠"],
    ["Upgrade", "升级"],
    ["Load More", "查看更多"],
    ["Select Enemy", "选择敌人"],
    ["← Prev", "← 上一页"],
    ["Next →", "下一页 →"],
    ["Brew", "制作"],
    ["Collect", "采摘"],
    // #endregion
    // #region chat chan
    ["All", "所有"],
    ["Whispers", "私信"],
    // #endregion
    // #region research 
    ["Staff (Damage)", "法杖（元素伤害）"],
    ["Cloak (Resistance)", "斗篷（元素抗性）"],
    ["Head (Base XP)", "头部（基础经验值）"],
    ["Neck (Base Resources)", "项链（基础资源量）"],
    ["Chest (Base Mana Dust)", "衣服（基础魔法尘）"],
    ["Hands (Drop Boost)", "手部（掉落加成）"],
    ["Feet (Multistat)", "脚部（多重属性掉落）"],
    ["Ring (All stat boost)", "戒指（全属性增幅）"],
    ["Spell Tomes", "法术之书"],
    ["Spellpower", "法术强度"],
    ["Ward", "抗性"],
    ["Fire Spell Rank", "火魔法等级"],
    ["Water Spell Rank", "水魔法等级"],
    ["Nature Spell Rank", "自然魔法等级"],
    ["Mana Shield Rank", "魔法盾等级"],
    ["Damage", "伤害"],
    ["Multicast", "多重施法"],
    ["Crit Chance", "暴击几率"],
    ["Crit Damage", "暴击伤害"],
    ["Haste", "技能急速"],
    ["Health", "生命值"],
    ["Focus", "集中"],
    ["Mana", "魔力"],
    ["Overload", "过载"],
    ["Time Dilation", "时间膨胀"],
    ["Mining", "采矿"],
    ["Fishing", "捕鱼"],
    ["Woodcutting", "伐木"],
    ["Base Experience", "基础经验值"],
    ["Base Resource", "基础资源量"],
    ["Base Mana Dust", "基础魔法尘"],
    ["Drop Boost", "掉落加成"],
    ["Multistat", "多重属性掉落"],
    ["Actions", "行动次数"],
    // #endregion
    // #region equip detail 
    ["Link", "链接至聊天"],
    ["Quality", "品质"],
    ["Currently Equipped", "已被装备"],
    ["Battle Level", "战斗等级"],
    ["Gather Level", "采集等级"],
    // #endregion
    // #region equip
    ["Common", "普通"], ["Uncommon", "稀有"], ["Rare", "罕见"], ["Epic", "史诗"], ["Legendary", "传说"],
    ["Ward Boost", "抗性增幅"],
    ["Battle Experience", "战斗经验"],
    ["Chest", "身体"],
    ["Health Boost", "生命值增幅"],
    ["Any", "任意"],
    ["Weapon", "武器"],
    ["Head", "头部"],
    ["Neck", "项链"],
    ["Back", "背部"],
    ["Hands", "手部"],
    ["Feet", "脚部"],
    ["Ring", "戒指"],
    ["Stat Drop", "属性值掉落率"],
    ["Base Resource Amount", "基础资源量"],
    ["Focus Boost", "集中增幅"],
    ["Mana Boost", "魔力增幅"],
    // #endregion
    // #region label
    ["Stat Drop Tracker", "属性值掉落记录"],
    ["Item Drop Tracker", "掉落物记录"],
    ["Step Size", "步幅"],
    ["Strength", "强度等级"],
    ["Upgrade:", "升级:"],
    ["Type", "种类"],
    ["Mass Disenchant", "批量分解"],
    ["Amount", "数量"],
    ["Tier", "等级"],
    // #endregion
    // #region dropdown
    ["Mining Level", "采矿等级"],
    ["Fishing Level", "捕鱼等级"],
    ["Woodcutting Level", "伐木等级"],
    ["Strongest Enemy", "击败敌人最高强度"],
    ["Total Actions", "总行动数"],
    ["Battle Quest #", "战斗任务 #"],
    ["Gather Quest #", "采集任务 #"],
    ["Enchanting", "附魔"],
    // #endregion
    // #region battle text
    ["Are you sure you want to reset your codex boosts?", "确定要重置所有法典升级吗？"],
    ["You have invested ", "你已经投入了 "],
    [" will be deducted as a reset cost.", " 将作为重置费用被扣除。"],
    ["You won, you gained ", "战斗胜利，你获得了 "],
    ["You lost.", "战斗失败。"],
    ["experience.", "点经验。"],
    ["You attacked ", "你攻击了 "],
    [" times. Casting ", " 次。释放了 "],
    [" spells, critting ", " 次法术，造成暴击伤害 "],
    [" times.", " 次。"],
    ["Enemy attacked you ", "敌人对你攻击了 "],
    ["You found the following loot:", "你获得的战利品有："],
    // #endregion
    // #region research text
    ["Increases base spellpower.", "增加基础法术强度。"],
    ["Increases base ward strength.", "增加基础抗性。"],
    ["Provides a base damage multiplier to fire spells.", "为火系法术提供基础伤害增幅。"],
    ["Provides a base damage multiplier to water spells.", "为水系法术提供基础伤害增幅。"],
    ["Provides a base damage multiplier to nature spells.", "为自然系法术提供基础伤害增幅。"],
    ["Mana shield converts a percentage of mana into health at the start of combat.", "魔法盾会在战斗开始时将一部分魔力转化为生命值。"],
    ["Increases all damage done.", "增加最终伤害。"],
    ["Increases the chance of casting multiple spells during a single attack.", "增加单次攻击释放多次法术的概率。"],
    ["Increases the chance of dealing critical damage. Base value of 5%.", "增加造成暴击伤害的概率，基础值 5%。超过 100% 的暴击率可以造成多次暴击。"],
    ["Increases the damage of critical hits. Base value of 50%", "增加暴击伤害，基础值 50%。"],
    ["Causes you to cast spells more often during combat.", "使你在战斗中更频繁地释放法术。"],
    ["Increases your health pool.", "增加你的最大生命值。"],
    ["Provides a multiplier to your ward strength.", "提供抗性增幅。"],
    ["Provides a multiplier to your focus stat. This decreases enemy ward strength.", "提供集中增幅。集中可以在战斗中削弱敌人的实际抗性。"],
    ["Provides a multiplier to your mana pool and mana regeneration. If you run out of mana, you deal half damage.", "提供魔力值和魔力回复增幅。魔力耗尽后，你只能造成50%的伤害。"],
    ["Consume more mana to deal more damage.", "消耗额外魔力以造成更多伤害。"],
    ["Slows down enemy attacks.", "降低敌人的攻击速度。"],
    ["Lets you enchant staves with a higher level of Inferno.", "使你可以附魔法杖更高等级的地狱烈焰。"],
    ["Lets you enchant staves with a higher level of Tidal Wrath.", "使你可以附魔法杖更高等级的狂潮。"],
    ["Lets you enchant staves with a higher level of Wildheart.", "使你可以附魔法杖更高等级的野性之心。"],
    ["Lets you enchant cloaks with stronger fire resistance.", "使你可以附魔斗篷更高等级的火系抗性。"],
    ["Lets you enchant cloaks with stronger water resistance.", "使你可以附魔斗篷更高等级的水系抗性。"],
    ["Lets you enchant cloaks with stronger nature resistance.", "使你可以附魔斗篷更高等级的自然抗性。"],
    ["Lets you enchant hoods with base experience.", "使你可以附魔兜帽更高等级的基础经验值。"],
    ["Lets you enchant amulets with base resource gain.", "使你可以附魔项链更高等级的基础资源量。"],
    ["Lets you enchant robes with base mana dust", "使你可以附魔法袍更高等级的基础魔法尘。"],
    ["Lets you enchant gloves with drop boost", "使你可以附魔手套更高等级的掉落加成。"],
    ["Lets you enchant boots with multistat", "使你可以附魔鞋子更高等级的多重属性掉落。"],
    ["Lets you enchant rings with vitality, increasing all stats", "使你可以附魔戒指更高等级的活性，提升全属性。"],
    ["Increases resources harvested while mining.", "增加挖矿获取的资源。"],
    ["Increases resources harvested while fishing.", "增加捕鱼获取的资源"],
    ["Increases resources harvested while woodcutting.", "增加伐木获取的资源。"],
    ["Provides a multiplier to base experience.", "增幅基础经验值。"],
    ["Increases the base amount of resources you get while gathering.", "增加采集获取的基础资源量。"],
    ["Provides a multiplier to enemy base Mana Dust drop.", "增幅敌人掉落的基础魔法尘数量。"],
    ["Increases your chance to get additional stat rolls and mastery.", "提升获得额外属性值和法系增幅值的概率。"],
    ["Increases the maximum amount of actions you can do.", "增加最大行动次数。"],
    ["Increases your chance to find nearly any item drop.", "提升获得绝大多数掉落物的概率。"],
    // #endregion
    // #region guild text
    ["Manage Ranks (Admin)", "调整职位（管理员）"],
    ["Invite Members", "邀请成员"],
    ["Kick Members", "踢出成员"],
    ["Promote Members", "晋升成员"],
    ["Edit Description", "编辑介绍"],
    ["Donate Items", "捐赠物品"],
    ["Borrow Items", "借出物品"],
    ["Retrieve Items", "收回物品"],
    ["Revoke Items", "强制归还"],
    ["Withdraw Funds", "提取资金"],
    ["Upgrades", "升级"],
    ["Edit Taxes", "修改税率"],
    ["Taxes: XP ", "税率：经验值 "],
    ["%, Mana Dust", "%，魔法尘"],
    ["%, Elemental Shards", "%，元素碎片"],
    ["%, Resources", "%，资源"],
    ["Guild Level", "公会等级"],
    ["+0.5% resources per level", "每级使成员资源获取 +0.5%"],
    ["Council Chamber", "会议厅"],
    ["Increases the maximum amount of guild members by 1 per level", "每级 +1 最大成员数"],
    ["Level ", "等级 "],
    ["Cloakroom", "衣帽间"],
    ["Increases the capacity of the armory by 50 items per level", "每级 +50 装备库容量"],
    ["Nexus Crystal", "连结水晶"],
    ["Amplifies the power of all Elemental Shards Research boosts by 1% per level", "每级使成员所有元素碎片升级效果 +1%"],
    ["Magical Accounting", "魔法账簿"],
    ["Increases the amount of resources contributed through guild taxes by 1% per level", "每级使通过税收获取的资源额外 +1%"],
    ["Mana Conduit", "魔力回路"],
    ["Reduces the mana cost of all spells by 4% per level", "每级使成员所有法术魔力消耗 x96%"],
    ["Study Room", "学习室"],
    ["Increases base experience gains by 1% per level", "每级使成员基础经验值 +1%"],
    ["Sleeping Quarters", "睡眠区"],
    ["Increases maximum actions by 1% per level", "每级使成员最大行动次数 +1%"],
    // #endregion
    // #region update text
    ["The first type of event has been added: Rift of Power. Randomly opens every 3-6 hours for 10 minutes.", "新增第一种事件：力量洪流。活动将间隔随机 3 到 6 小时开启，每次持续 10 分钟。"],
    [" When you siphon it you have a chance each action (starting at 100% each rift dropping to 10% as you siphon more) to apply the effect of an", " 当你汲取力量洪流时，每次行动都有一定概率（初始值 100%，每次成功降低 10%，最低 10%）施加一个"],
    [" ", " "],
    [" to your lowest quality equipped item.", " 的效果，作用于你装备的最低品质的物品上。"],
    ["Added new notification setting for this event.", "新增适用该事件的通知设置。"],
    [" now preserves the quality % of an item, bumping up all modifier values.", " 现在保留物品的品质百分比，将会相应增幅所有的属性值。"],
    ["Quests after 1000 completions now have a chance to give extra", "超过 1000 次行动的任务现在有几率给予额外的"],
    [", with 2 being guaranteed at 2000 etc. Also applies to the extra guild proc. Retroactively awarded some missed", "，到达 2000 行动任务时必定奖励 2 个法典，依此类推。此效果对公会额外任务法典同样有效。为任务进度超过 1000 的玩家相应补发了"],
    [" to the players past 1000 quests already.", ""],
    ["Doubled chance of guild receiving ", "公会从成员任务中获得额外 "],
    [" on quest completions and retroactively awarded", " 的概率加倍，并且为公会相应补发了"],
    [" to guilds", ""],
    ["Doubled amount of ", "公会每次升级获得的 "],
    [" awarded for each guild level. (retroactive)", " 加倍。（相应补发）"],
    ["Display admin/mod roles in chat", "聊天中标记管理员角色"],
    ["Parse and show links in chat", "聊天消息会处理并显示链接"],
    ["Discarding potions now works one at a time", "现在销毁药水每次只会销毁一瓶"],
    ["Wire command supports comma separated items", "Wire指令现在支持逗号分隔的多个物品"],
    ["Randomize order of maxed enchanting leaderboards every restart", "每次重启时，附魔等级排行榜的同等排名间顺序随机变化。"],
    ["Add in game News section", "游戏内加入新闻区"],
    ["Fixed an issue that was causing unintended variance with high time dilation/haste in combination with crit chance", "修复了高时间膨胀/技能急速和暴击几率共存时，造成意外的波动的问题。"],
    ["Market cooldown no longer applies when not over/undercutting the best price or doing it by at least 1%", "市场挂牌冷却在以下情况不再触发：不对当前最佳价格压价，或者对当前最佳价格至少压价 1%"],
    ["Added guild levels and battle xp tax option, providing a resource boost and increasing amounts of Codex", "新增公会等级以及战斗经验税收选项，提供采集提升，和更多法典"],
    ["Actions on most gathering equipment replaced by base resource amount (a quarter of the amount that tools have). Tools unchanged", "大多数采集装备的行动计数被替换为基础资源量（相当于原数值的四分之一）。工具不受影响"],
    ["Adjusted resource cost scaling for higher level guild upgrades", "调整了高等级公会升级的资源花费曲线"],
    ["Adjusted gatherer xp past level 750", "调整了 750 级以后的采集经验"],
    [" now preserves the quality % of items", " 现在保留物品的品质百分比"],
    [" infusion system for equipment, increasing power by 5% per infusion for exponentially increasing cost", " 装备强化系统，每次强化提升装备 5% 的各项数值，消耗指数级增加"],
    ["Mastery Codex boost removed and refunded as", "法系增幅法典升级移除，相应消耗返还为"],
    [". Mastery drops now benefit from multistat", "。法系增幅掉落现在受多重属性掉落增益"],
    ["Mana Conduit now gives 4% mana cost reduction per upgrade", "魔力回路现在每级提供 4% 的魔力消耗削减"],
    ["Mana Research boost now also boosts mana regeneration", "魔力研究升级现在还会增幅魔力回复"],
    ["Added another scaling factor to enemies past 5000", "为超过 5000 强度的敌人增加了额外的成长因素"],
    ["Market cooldown no longer applies if cancelled order was older than 1 hour", "取消 1 小时以前的市场挂单时，不再触发市场挂牌冷却"],
    ["Increased actions from 3 to 5 per Codex", "行动计数法典升级每级提升由 3 增加至 5"],
    ["Cancelling an order prevents new order for same item for 10 minutes. Limit to 1 open order per item", "取消市场挂单将使得接下来 10 分钟内无法对同一物品创建新挂单。每种物品只能创建 1 个活跃订单"],
    ["Added max price filter and reset filter button in equipment market", "为装备市场新增最大售价过滤选项，以及重置过滤按钮"],
    ["Added pulsing animation to potion icon 10 minutes before potion expires", "当药水效果仅余少于 10 分钟时，为药水图标新增闪烁动画"],
    ["Potions from belt only consumed when matching current action type", "现在只会从药水带中使用对应于当前行动的药水"],
    ["Added notification option for potion expiring", "新增药水耗尽通知选项"],
    ["Added extra confirmation to potion belt purchases and spellpower/ward when gathering", "为药水腰带容量升级和采集时法术强度/抗性升级新增二次确认"],
    ["Pushed down loot tracker sooner on smaller layouts", "提高下沉掉落跟踪面板的屏幕尺寸阈值"],
    ["Changed number formatting to be independent of browser localisation", "现在数值格式化不随浏览器本地化设置而改变"],
    ["Reduced battle xp needed per level by 50%", "升级所需战斗经验减少 50%"],
    ["Increased weight of battle levels in shard drop calculation, slowed scaling based on total level", "提高了元素碎片掉落数量计算时战斗等级的权重，降低基于总等级的增长速度"],
    ["Can now upgrade/discard potions in potion belt", "现在可以升级/丢弃药水腰带中的药水了"],
    ["Added extra confirmation for brewing potion not matching active action type", "制作不符合当前行动的药水时，新增二次确认"],
    ["Added farming + potions", "新增农场和药水"],
    ["Next guild upgrade can now be marked for anyone to complete", "下一个公会升级现在可以被标记，任何成员均可完成"],
    ["Added field for internal guild info", "新增公会内部信息功能"],
    ["Added guild message of the day", "新增公会当日消息功能"],
    ["Remember mass disenchant option", "保存批量分解选项"],
    ["Increased ", "增加 "],
    [" drop rate by 50%", " 掉落率 50%"],
    [" drop rate by 25%", " 掉落率 25%"],
    ["Added option to filter items for any gathering skill in market, armory, inventory", "新增在市场、装备库、仓库过滤指定采集技能装备的选项"],
    ["Equipment order prices can now be edited", "装备出售挂牌价格现在可以编辑了"],
    ["Added Quality column and secondary boost filter for combat skills to equipment market", "为装备市场增加了品质列和战斗第二加成过滤选项"],
    ["Fixed notification going through when player is ignored", "修复玩家被屏蔽时通知不生效的问题"],
    ["Scroll to top when switching chat tabs, don't clear selected chat channel", "切换聊天频道时自动滚动至顶端，并且不会清除选中频道的聊天记录"],
    ["Player profile and research pages now show correct totals including Nexus Crystal and base crit chance/damage", "玩家简介和研究页面现在会正确显示连结水晶升级后以及计算基础暴击率/暴击伤害后的加成值"],
    ["Added equipment market", "新增装备市场"],
    ["Show chance to upgrade each specific boost on upgrade page", "在强化页面显示每项装备属性获得升级的概率"],
    ["Rare items now have same amount of modifiers as epics, with lower values", "稀有物品的属性数现在和史诗物品一样，但是数值更低"],
    ["Increased average/maximum roll values for non-legendary items", "增加了非传说物品属性值的平均值/最大值"],
    ["Significantly buffed mana regeneration from spirit", "极大增加了精神属性提供的魔力回复"],
    ["Can leave price field blank in market to sell/buy at market price", "在价格输入框留空可以直接以当前市场价出售/购买"],
    ["Can click funds in guild to prefill", "可以在公会页中点击仓库剩余数量填充捐赠输入框"],
    ["Added /ignored, /wire, /afk, /profile commands", "新增 /ignored, /wire, /afk, /profile 命令"],
    ["Added ability to add text on profile page", "新增主页自定义文字功能"],
    ["Allowed line breaks in guild description", "公会介绍现在可以换行了"],
    ["Added clear button to loot tracker", "为掉落追踪栏新增清除按钮"],
    [" rerolls if all boosts are same, 50% chance to pick active mastery on staffs", " 重新随机，如果所有加成均为相同类型，对于法杖，有 50% 的概率依然为相同元素"],
    ["Added activity log for players and guilds", "新增玩家和公会的活动记录"],
    ["Added cap of level 22 on enchanting skills, increasing by 1 every Monday", "所有附魔等级新增 22 级上限，每周一上限增加 1"],
    ["Added leaderboards for enchanting", "新增附魔等级排行榜"],
    ["Changed weights of equipment drops, less weighted toward weapons", "改变了装备掉落的权重，减少了武器的权重"],
    ["Increased chance of epic gear and legendary jewelry drops", "增加了史诗装备和传说首饰的掉落概率"],
    ["Increased chatbox size, decreased line spacing", "增加了聊天框的大小，减少了行间距"],
    ["Added ctrl + click item linking", "新增 Ctrl + 点击物品链接至聊天的功能"],
    ["Reset enchanting skills, refunded formulas, cancelled market orders for formulas", "重置所有附魔等级，返回相应术式，取消所有术式的市场挂牌"],
    ["Added option to reset codex boosts, cost based on non-action boosts", "新增重置法典升级的选项，重置消耗基于行动次数以外的升级计算"],
    ["Can enchant items from profiles", "可以在个人主页附魔装备"],
    ["Added ignore functionality and /help command", "新增屏蔽功能和 /help 命令"],
    ["Guilds can tax ", "公会可以对 "],
    [", withdraw", " 收税，凭借新增的公会权限回收"],
    ["/", "/"],
    [" with new rank permission", ""],
    ["Slightly nerfed enemy ward/focus scaling in final areas", "略微削弱了最终区域敌人的抗性/集中增长率"],
    ["Changed battle xp curve, reducing by up to 11% under level 160, increasing later", "调整了战斗经验曲线，160 等级以下所需经验最高减少 11%，在之后"],
    ["Armory shows if borrowed items are unequipped", "装备库现在显示借出但未被装备的物品"],
    ["Reverted part of enemy scaling due to error", "由于报错，回退了一部分敌人成长调整"],
    ["Display online/active player count", "显示在线/活动玩家数量"],
    ["Display last active time in guild roster", "在公会名单中显示上次活动时间"],
    ["Added detailed notification settings, support for multiple devices", "新增详细通知设置，支持多设备"],
    ["Updated battle code, slightly reduced randomness of enemy damage", "更新战斗代码，稍微降低了敌人伤害的随机性"],
    ["Added color options for theme and chat colors in settings", "在设置中新增主题颜色和聊天颜色选项"],
    ["Added /transferguild command", "新增 /transferguild 命令"],
    ["Enchanting reagent cost scaling changed to 3 per level", "附魔材料消耗调整至每级 3 个"],
    ["Fire/Water/Nature Essence added to gathering skill drop tables", "火/水/自然精华加入采集技能掉落表中"],
    ["Adjusted droprates of some reagents", "调整了某些附魔材料的掉落率"],
    ["Added leaderboard for strongest enemy defeated in final zones", "新增最终区域击败的最强敌人排行榜"],
    ["Leaderboards filtered to remove admins/inactive players", "排行榜现在会过滤管理员和不活跃玩家"],
    ["Can favorite items to prevent mass disenchant", "可以保护物品，防止其被批量分解"],
    ["Mass disenchant only applies to filtered item list", "批量分解现在只会分解过滤后的物品清单"],
    ["Fixed issues with item links in chat input", "修复了聊天输入框关于物品链接的问题"],
    ["Can no longer transfer items to banned/guest accounts", "无法再向封禁/访客账号发送物品"],
    ["Added leaderboards for different categories", "新增不同类别的排行榜"],
    ["Added gather actions count to profile, some early data missing", "个人资料页新增采集行动数统计，一些早期数据已丢失"],
    ["Added guild upgrade for increased actions", "新增可以增加最大行动数的公会升级"],
    ["3 actions per codex (retroactive)", "每本法典提升 3 行动数（溯及既往）"],
    ["Gather gear more likely to roll for active skill", "掉落的采集装备现在更有可能对应于当前行动"],
    ["Item transfers now show in whispers for persistence", "物品收发记录现在在私聊栏中长期显示"],
    ["Whisper tab shows unread count, including in All tab", "私聊栏现在显示未读数量，包括「所有」栏"],
    ["Manual refresh may be needed to see changes", "改动可能需要手动刷新生效"],
    ["New guild upgrade: Study Room +1% base experience per level for gatherers and battlers", "新的公会升级：学习室。每级使战斗和采集成员基础经验值 +1%"],
    ["Banned players’ names struck through on guild roster and profile", "封禁玩家的名字会在个人资料页和公会名单上用删除线划去"],
    [" logic updated to preserve existing modifier types", " 机制变为保留已有的属性"],
    [" from quest rewards changed to", " 在任务奖励中变为"],
    [" until quest counter reaches 1000", "，直至任务数字到达 1000"],
    ["Normal tradeable codex drop rates buffed to 1/4k base", "普通的可交易法典掉落率增加至 1/4000 基础值"],
    ["Closed 50 accounts for multi farming/botting", "封禁了 50 个小号/脚本"],
    // #endregion
    // #region town text
    ["Welcome to Manarion", "欢迎来到 Manarion"],
    ["Battle Zones", "战斗区"],
    ["Radiant Grove (Beginner)", "辉光树林（新手）"],
    ["The Smoldering Marsh (Intermediate)", "烟尘湿地（进阶）"],
    ["Worldshaper's Domain ", "创世领域"],
    ["Maelstrom's Eye ", "风暴之眼"],
    ["Blazing Core ", "炙热核心"],
    ["Gathering Zones", "采集区"],
    ["Ironclad Mines (Mining)", "覆铁矿洞（采矿）"],
    ["Azure Lake (Fishing)", "蔚蓝湖泊（捕鱼）"],
    ["Elderwood Grove (Woodcutting)", "古树之林（伐木）"],
    ["Other Places", "其他区域"],
    ["The Market", "市场"],
    ["Guild", "公会"],
    ["Hall of Fame", "荣耀大厅"],
    ["Notice Board (Rules)", "告示板（游戏规则）"],
    ["News Board", "新闻栏"],
    // #endregion
    // #region label 
    ["Adjust personal contribution", "调整个人上税"],
    ["Example", "示例"],
    ["Sign in with Discord", "使用 Discord 登录"],
    ["Sign in with Twitch", "使用 Twitch 登录"],
    ["Join Us on Discord", "加入我们的 Discord"],
    ["Quest Timer:", "任务计时器："],
    ["Time to Level:", "升级倒计时："],
    ["XP / Hr:", "XP / 小时:"],
    ["XP / Day:", "XP / 天:"],
    ["Mana Dust / Hr:", "魔法尘 / 小时:"],
    ["Mana Dust / Day:", "魔法尘 / 天:"],
    ["Resource / Hr:", "资源 / 小时:"],
    ["Resource / Day:", "资源 / 天:"],
    ["Shards / Hr:", "碎片 / 小时:"],
    ["Shards / Day:", "碎片 / 天:"],
    ["Intellect gained:", "获得智力:"],
    ["Stamina gained:", "获得耐力:"],
    ["Spirit gained:", "获得精神:"],
    ["Focus gained:", "获得集中:"],
    ["Mana gained:", "获得魔力:"],
    ["Mastery gained:", "获得法系增幅:"],
    ["Tracked time:", "记录时间:"],
    ["Total stats:", "总获得属性点:"],
    ["Unlink", "解除绑定"],
    ["Logout", "登出"],
    // #endregion
    // #region battle text
    ["Your guild received:", "你的公会获得了："],
    ["Battle XP", "战斗经验"],
    ["Player", "玩家"],
    ["Ward Strength: ", "抗性强度："],
    ["Average Damage Per Spell:", "每次施法平均伤害："],
    ["You spent ", "你消耗了 "],
    [" mana", " 点魔力"],
    [".", "."],
    ["Kills: ", "击杀数："],
    ["Deaths: ", "死亡数："],
    ["Winrate:", "胜率："],
    ["Enemy", "敌人"],
    ["Average Damage Per Attack:", "每次攻击平均伤害："],
    ["You went ", "你进行了一次"],
    ["mining", "采矿"],
    ["fishing", "捕鱼"],
    ["woodcutting", "伐木"],
    [" and gained", "，获得了"],
    [" experience", " 点经验"],
    ["You received the following loot:", "你获得了以下物品："],
    // #endregion
    ["Set name", "设置名称"],
    // #region rule text
    ["1. Respect Others", "1. 尊重他人"],
    ["No harassment, personal attacks, or targeted insults.", "禁止羞辱行为，人身攻击，或者有针对的侮辱。"],
    ["2. Keep It Safe For Everyone", "2. 为所有人维护适宜的环境"],
    ["No NSFW content, racism, sexism, or hate speech of any kind.", "禁止不适宜工作展示 (NSFW) 的内容，种族歧视，性别歧视，或者任何形式的仇恨言论。"],
    ["3. No Automation", "3. 禁止自动化"],
    ["Any form of botting, scripting, or macroing is forbidden.", "禁止任何形式的自动机器人、脚本、宏。"],
    ["4. No Scamming", "4. 禁止欺诈"],
    ["All trade agreements must be honored. Scamming wastes moderator time and will result in bans.", "所有的交易约定都应得到遵守。欺诈行为浪费管理员的时间，将会导致封禁。"],
    ["5. One Account Per Person", "5. 一人一号"],
    ["If multiple people play from the same location, they may not play in a way that provides excessive benefit to any account other than their own.", "如果多个人在同一地点游玩，他们不能以任意形式为彼此提供利益。"],
    ["6. No Account Sharing", "6. 禁止共享账号"],
    ["Do not share your account. You are responsible for all activity on your account.", "不要分享你的账号。你为你账号的左右行动负责。"],
    ["7. No Bug Abuse", "7. 禁止恶意利用漏洞"],
    ["If you find an exploit, report it privately to a staff member. Abusing bugs will result in a ban.", "如果你发现了一个漏洞，请私下向制作人员反馈。恶意利用漏洞将会导致封禁。"],
    // #endregion
    // #region siphon text
    ["You are currently siphoning power into your lowest quality equipped item...", "正在汲取力量至装备的最低品质物品..."],
    ["Siphoning power into ", "汲取力量至 "],
    ["You don't have any items equipped.", "你没有装备任何物品。"],
    // #endregion
    ["Currencies", "通用物品"],
    ["Resources", "资源"],
    ["Orbs", "特殊球"],
    ["Herbs", "药草"],
    ["Enchanting Reagents", "附魔材料"],
    ["Enchanting Formulas", "附魔术式"],
    // nav link
    ["Combat", "战斗"],
    ["Town", "城镇"],
    ["Research", "研究"],
    ["Inventory", "仓库"],
    ["Market", "市场"],
    ["Rankings", "排行榜"],
    ["Battle", "战斗"],
    ["Rules", "规则"],
    ["News", "新闻"],
    ["Settings", "设置"],
]);
const SettingsTranslation = new Map([
    ["Referrer Link", "推荐链接"],
    ["Guild Taxes", "公会税收"],
    ["Push Notifications", "推送通知"],
    ["Customize Colors", "自定义颜色"],
    ["Theme", "主题"],
    ["Whispers", "私信消息"],
    ["General", "通用频道"],
    ["Trade", "交易频道"],
    ["Guild", "公会频道"],
    ["Help", "帮助频道"],
    ["Identity Providers", "身份验证服务"],
    ["Quest Complete", "任务完成"],
    ["Fatigue", "行动计数归零"],
    ["Whisper", "私信"],
    ["Potion expired", "药水耗尽"],
    ["Rift of Power (Event)", "力量洪流（事件）"],
    ["Added on", "添加于"],
    ["Refer your friends to the game and get an additional 5% of any", "将游戏推荐给朋友，然后额外获得他们掉落的"],
    [" they find.", " 的5%。"],
    ["You must both verify your account by linking an identity provider to earn rewards.", "双方均需绑定账号以获取奖励。"],
    ["Other devices", "其他设备"],
    ["任务完成", "任务完成"],
    ["行动计数归零", "行动计数归零"],
    ["私信", "私信"],
    ["药水耗尽", "药水耗尽"],
    ["力量洪流（事件）", "力量洪流（事件）"],
]);
// #region FarmTrans
const FarmTranslation = new Map([
    ["", ""],
    ["Your farm has been growing for ", "你的农场已经生长了 "],
    ["Your farm has been growing for less than a minute", "你的农场已经生长了不到一分钟"],
    [" hours", " 小时"],
    [" hours ", " 小时 "],
    [" hour", " 小时"],
    [" hour ", " 小时 "],
    [" minutes", " 分钟"],
    [" minute", " 分钟"],
    [" herbs/hour)", "药草/小时)"],
    ["(Your farm continues to grow for up to 24 hours)", "(你的农场可以持续生长 24 小时)"],
    ["Upgrades", "升级"],
    ["Harvest Golems", "收割傀儡"],
    ["Fertilizer", "肥料"],
    ["Plots", "地块"],
    ["Improves growth, increasing the yield of all plots.", "促进生长，增加所有地块产出。"],
    ["Constantly tends to your plots, increasing the yield of all plots.", "不间断地照料田地，增加所有地块产出。"],
    ["Expands your farming area, increasing the yield.", "扩大你的田地，增加产出。"],
    ["Current Boost: ", "当前加成："],
    ["Increase ", "提升 "],
    [" times (+", " 级 (+"],
    [") for ", "), 消耗 "],
    ["Potion of Renewal", "刷新药水"],
    ["Potion of Wisdom", "智慧药水"],
    ["Potion of Harvesting", "收获药水"],
    ["Restores 200 actions when you run out.", "当行动次数不足时回复 200 次数"],
    ["当行动次数不足时回复 ", "当行动次数不足时回复 "],
    [" 200 次数", " 200 次数"],
    [" Battle Experience for 1 hour.", " 战斗经验，持续 1 小时。"],
    [" Base Resource Amount for 1 hour.", " 基础资源量，持续 1 小时。"],
    ["Potion Belt", "药水腰带"],
    ["Potion belt", "药水腰带"],
    ["Brewing", "酿药"],
    ["Increases the maximum amount of potions you can store.", "增加你最多可以保存的药水数量。"]
]);
[...FarmTranslation.values()].forEach(value => FarmTranslation.set(value, value));
// #endregion FarmTrans
if(!DEBUG) [...Translation.values()].forEach(value => Translation.set(value, value));
// #region EquipTrans
const EquipTranslation = new Map([
    // quality
    ["Worn", "破旧的"], ["Refined", "精制的"], ["Runed", "铭文的"], ["Ascended", "进阶的"], ["Eternal", "永恒的"],
    // type
    ["Initiate", "初始"], ["Novice", "新手"], ["Apprentice", "学徒"], ["Acolyte", "助手"], ["Adept", "熟手"], ["Scholar", "专家"], ["Magus", "术士"], ["Invoker", "祈求者"], ["Archmage", "大巫师"], ["Eldritch", "异界"], ["Primordial", "原初"], ["Celestial", "星辉"], ["Lumberjack's", "伐木工"], ["Tidecaller's", "唤潮人"], ["Prospector's", "探矿者"],
    // part
    ["Staff", "法杖"], ["Hood", "兜帽"], ["Pendant", "项链"], ["Cloak", "斗篷"], ["Robes", "法袍"], ["Gloves", "手套"], ["Sandals", "鞋子"], ["Ring", "戒指"], [" of Water", "水"], [" of Fire", "火"], [" of Nature", "自然"], ["Helmet", "头盔"], ["Pickaxe", "镐子"], ["Axe", "斧头"], ["Rod", "鱼竿"], ["Jacket", "夹克"], ["Cape", "披风"], ["Boots", "靴子"], ["Hat", "帽子"], ["Tunic", "外衣"],
]);
// #endregion
const equipRegex = /(?<lbracket>\[?)(?<quality>Worn|Refined|Runed|Ascended|Eternal) (?<type>[A-Za-z']+) (?<part>[A-Za-z]+)(?<elementType> of Water| of Fire| of Nature)?(?<upgradeLevel> \+[0-9]+)? \((?<level>[0-9]+)\)(?<rbracket>\]?)/;
const EquipTranslate = (ele) => {
    const equip = equipRegex.exec(ele.textContent);
    if(equip){
        const group = equip.groups;
        ele.textContent = `${group.lbracket ?? ""}${EquipTranslation.get(group.quality)}${EquipTranslation.get(group.type)}${group.elementType ? EquipTranslation.get(group.elementType) : ""}${EquipTranslation.get(group.part) ?? group.part}${group.upgradeLevel ?? ""} (${group.level})${group.rbracket ?? ""}`;
    }
    else{
        console.log("could not translate item: ", ele.textContent);
    }
}
const researchSelector = ["-content-mana-dust", "-content-combat-skills", "-content-enchants", "-content-gathering", "-content-codex"].map(id => `div[data-state="active"][id$="${id.replaceAll(":", "\\:")}"]:not([data-state="translated"])`).join(",");
const _FailedTranslate = new Set();
const __TypedTranslation = new Map([
    ["equipment", EquipTranslation],
    ["settings", SettingsTranslation],
    ["farm", FarmTranslation],
    ["default", Translation],
]);
const _Translate = (ele, type = "default") => {
    if(ele.nodeType !== Node.TEXT_NODE && (!ele.textContent || ele.childNodes.length !== 1 || ele.childNodes[0].nodeType !== Node.TEXT_NODE)) return;
    const text = ele.textContent;
    const translation = __TypedTranslation.get(type) ?? Translation;
    ele.textContent = (translation.get(text) ?? (console.log("未翻译", type, ele.outerHTML), "未翻译"));
    if(ele.textContent === "未翻译"){
        _FailedTranslate.add({
            type: type,
            text: text
        });
        return false;
    }
    else return true;
};
const _TypedTranslate = (type) => {
    return (ele) => _Translate(ele, type);
};
unsafeWindow.ExportFailedTranslate = (nocomment = true) => {
    console.log([..._FailedTranslate.keys()].map(data => `    ["${data.text}", ""],${nocomment ? ` // ${data.type}` : ""}`).join("\n"));
};
const CheckTranslation = (scope, selector, callback) => {
    scope.querySelectorAll(`${scope === document ? "" : ":scope "}${selector}:not([translated])`).forEach(ele => {
        ele.setAttribute("translated", "");
        callback(ele);
    });
};
const FindAndReplaceText = () => {try {
    switch(window.location.pathname){
        // #region /town
        case "/town":{
            document.querySelectorAll("main > div:not([translated]):nth-child(1)").forEach(div => {
                div.setAttribute("translated", "");
                [
                    div.children[0]/* title */,
                    div.children[1]/* panels */.children[0]/* battle panel */.children[0]/* battle panel title*/,
                    div.children[1].children[0].children[1]/* battle panel content */.children[0],
                    div.children[1].children[0].children[1].children[1],
                    div.children[1].children[0].children[1].children[2].childNodes[0],
                    div.children[1].children[0].children[1].children[3].childNodes[0],
                    div.children[1].children[0].children[1].children[4].childNodes[0],
                    div.children[1].children[1]/* gather panel */.children[0]/* gather panel title */,
                    div.children[1].children[1].children[1]/* gather panel content */.children[0],
                    div.children[1].children[1].children[1].children[1],
                    div.children[1].children[1].children[1].children[2],
                    div.children[1].children[2]/* others panel */.children[0]/* others panel title */,
                    div.children[1].children[2].children[1]/* others panel content */.children[0],
                    div.children[1].children[2].children[1].children[1],
                    div.children[1].children[2].children[1].children[2],
                    div.children[1].children[2].children[1].children[3],
                    div.children[1].children[2].children[1].children[4],
                ].forEach(_Translate);
            })
            break;
        }
        // #endregion
        // #region /market/*
        case "/market/my-orders":
        case "/market":{
            document.querySelectorAll(`div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap main.grow.p-2.lg\\:w-1.lg\\:p-4 div.min-h-100 div.flex.flex-col.gap-2 div.flex-1.outline-none.flex.items-center.gap-2 div:not([translated])`).forEach(div => {
                div.setAttribute("translated", "");
            });
            document.querySelectorAll(`div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap main.grow.p-2.lg\\:w-1.lg\\:p-4 div.min-h-100 div.mt-4.flex.flex-wrap:not([translated])`).forEach(div => {
                div.setAttribute("translated", "");
                div.querySelectorAll(":scope label").forEach(label => _Translate(label));
                div.querySelectorAll(":scope th:nth-child(-n+2)").forEach(th => _Translate(th));
                div.querySelectorAll(":scope h2.text-lg").forEach(h2 => _Translate(h2));
            });
            document.querySelectorAll(`div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap main.grow.p-2.lg\\:w-1.lg\\:p-4 div.min-h-100 div.mt-4.flex.flex-wrap div.w-1\\/2.min-w-80.p-2 table.w-full.table-auto.text-left tbody tr.even\\:bg-primary\\/30.mb-2.cursor-pointer.items-center td:not([translated]):nth-child(2)`).forEach(td =>{
                td.setAttribute("translated", "");
                _Translate(td.childNodes[1])
            });
            break;
        }
        // #endregion
        // #region /research
        case "/research":{
            document.querySelectorAll('div[data-slot="dialog-header"]:not([translated])').forEach(div => {
                div.setAttribute("translated", "");
                [div.children[0], div.children[1].children[0].childNodes[0], div.children[1].children[1].childNodes[3]].forEach(_Translate);
            })
            break;
        }
        // #endregion
        // #region /log
        case "/guild/log":
        case "/activity-log":{
            document.querySelectorAll("div.space-x-1.text-sm.leading-4:not([translated])").forEach(div => {
                div.setAttribute("translated", "");
            })
            break;
        }
        // #endregion
        // #region /guild/*
        case "/guild/ranks":{
            document.querySelectorAll('div.hover\\:bg-primary\\/20:not([translated])').forEach(div => {
                div.setAttribute("translated", '');
                div.children[1].textContent = div.children[1].textContent.split(", ").map(word => Translation.get(word) ?? "未翻译").join(", ");
                [
                    div.children[2].childNodes[0],
                    div.children[2].childNodes[2],
                    div.children[2].childNodes[5],
                    div.children[2].childNodes[8],
                ].forEach(_Translate);
            })
            break;
        }
        case "/guild/upgrades":{
            document.querySelectorAll("div.border-primary.flex.w-full.flex-col.border.p-2.md\\:w-80:not([translated])").forEach(div => {
                div.setAttribute("translated", "");
                [
                    div.children[0],
                    div.children[1],
                    div.children[2].children[0].childNodes[0],
                    ...[...div.children[3].children].map(ele => ele.childNodes[1]),
                ].forEach(_Translate);
                const text201 = div.children[2].children[0].childNodes[1].textContent;
                const result201 = /([^ ]+) (.*)/.exec(text201);
                text201.textContent = `${result201[1]} ${Translation.get(result201[2])}`;
            })
            break;
        }
        // #endregion
        // #region /news
        case "/news":{
            document.querySelectorAll(`html.dark.notranslate body div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap main.grow.p-2.lg\\:w-1.lg\\:p-4 div.space-y-4.p-2 div div ul.ml-6.list-disc li span:not([translated])`).forEach(span => {
                span.setAttribute("translated", "");
                [...span.childNodes].forEach(node => {
                    if(node.nodeType !== Node.TEXT_NODE) return;
                    _Translate(node);
                })
            })
            break;
        }
        // #endregion
        // #region /
        case "/":{
            // main translation 1
            document.querySelectorAll("html.dark.notranslate body div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap main.grow.p-2.lg\\:w-1.lg\\:p-4 div.space-y-2 div.bg-primary\\/20.mt-4.rounded.p-3:nth-child(3):not([translated])").forEach(div => {
                div.setAttribute("translated", "");
                [
                    div.children[0]?.childNodes[0],
                    div.children[0]?.childNodes[3],
                    div.children[1]?.childNodes[0],
                    div.children[1]?.childNodes[2],
                    div.children[1]?.childNodes[4],
                    div.children[1]?.childNodes[6],
                    div.children[2]?.childNodes[0],
                    div.children[2]?.childNodes[2],
                ].filter(ele => ele).forEach(_Translate);
            });
            // main translation 2
            document.querySelectorAll("html.dark.notranslate body div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap main.grow.p-2.lg\\:w-1.lg\\:p-4 div.space-y-2 div.bg-primary\\/20.mt-4.rounded.p-3:nth-child(4):not([translated])").forEach(div => {
                div.setAttribute("translated", "");
                [
                    div.childNodes[0],
                    div.children[1]?.childNodes[0],
                ].filter(ele => ele).forEach(_Translate);
                /* TODO
                if(div.children[1]){
                    const temp = div.children[1].children[0];
                    console.log(temp);
                    const temp1 = temp[temp.length - 1];
                    if(temp1 && temp1.childNodes[2]) _Translate(temp1.childNodes[2]);
                }
                */
            });
            document.querySelectorAll("html.dark.notranslate body div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap main>div:not([class]):not([translated])").forEach(div => {
                div.setAttribute("translated", "");
                [
                    div?.children[0]?.children[0]?.childNodes[0],
                    div?.children[0]?.children[0]?.childNodes[1],
                    div?.children[0]?.children[0]?.childNodes[2],
                    div?.children[0]?.children[0]?.childNodes[5],
                    div?.children[1]?.childNodes[0],
                    div?.children[1]?.children[1]?.childNodes[0],
                ].filter(ele => ele).forEach(_Translate);
            });
            // main translation 3
            document.querySelectorAll("html.dark.notranslate body div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap main.grow.p-2.lg\\:w-1.lg\\:p-4 div.space-y-2 div.mt-4.grid.grid-cols-2.gap-4:nth-child(5)").forEach(div => {
                if(div.hasAttribute("translated", "")){
                    const lackMana = div.children[0].children[3].childNodes[3];
                    if(lackMana.textContent !== "."){
                        const result = /[0-9]+/.exec(lackMana.textContent);
                        //, and lacked 1684 mana
                        lackMana.textContent = `，缺少了 ${result[0]} 点魔力`;
                    }
                    return;
                }
                div.setAttribute("translated", "");
                [
                    div.children[0].children[0],
                    div.children[0].children[1].childNodes[0],
                    div.children[0].children[2].childNodes[0],
                    ...[...div.children[0].children[3].childNodes].filter(node => node.nodeType === Node.TEXT_NODE && !/[0-9]/.exec(node.textContent)),
                    div.children[0].children[4].children[0].childNodes[0],
                    div.children[0].children[4].children[1].childNodes[0],
                    div.children[0].children[4].children[2].childNodes[0],
                    div.children[1].children[0],
                    div.children[1].children[1].childNodes[0],
                    div.children[1].children[2].childNodes[0],
                ].forEach(_Translate);
            }); 
            break;
        }
        // #endregion
        // #region /rules
        case "/rules":{
            document.querySelectorAll("main h2.text-lg:not([translated]), main p.text-md:not([translated]), main h1:not([translated])").forEach(p => {
                p.setAttribute("translated", "")
                _Translate(p);
            });
            break;
        }
        // #endregion
        // #region /inventory
        case "/inventory":{
            document.querySelectorAll("main div.mt-2.mb-1.text-xl:not([translated]), main span.text-2xl:not([translated]), main div.text-2xl:not([translated]), main div.space-y-1 div.text-md div.w-15:not([translated])").forEach(div => {
                div.setAttribute("translated", "");
                _Translate(div);
            })
            break;
        }
        // #endregion
        // #region /settings
        case "/settings":{
            document.querySelectorAll("main>div:not([translated])").forEach((div) => {
                div.setAttribute("translated", "");
                [
                    div.children[1].childNodes[0],
                    div.children[1].childNodes[3],
                    div.children[3],
                ].filter(div => div).forEach((div) => _Translate(div, "settings"));
            });
            document.querySelectorAll("main h2.text-2xl:not([translated]), main label:not([translated]), main span.w-20.text-lg:not([translated]), main div.text-xl:not([translated])").forEach(div => {
                div.setAttribute("translated", "");
                _Translate(div, "settings");
            });
            document.querySelectorAll(`main div.space-y-2 div div div.flex.flex-wrap.items-center.justify-between.gap-2.p-2 div div.space-x-2 span.text-xs:not([translated])`).forEach(span => {
                span.setAttribute("translated", "");
                _Translate(span.childNodes[0], "settings");
            });
            document.querySelectorAll(`main div.space-y-2 div.ml-2 div.ml-4:not([translated])`).forEach(div => {
                div.setAttribute("translated", "");
                div.replaceChildren(...div.textContent.split(", "));
                [...div.childNodes].forEach(node => _Translate(node, "settings"));
            })
            break;
        }
        // #endregion
        // #region /farm
        case "/farm":{
            const farmId = `div[id$="\\:-content-farm"]`;
            const potionsId = `div[id$="\\:-content-potions"]`;
            CheckTranslation(document, `${farmId}>div.flex.flex-wrap.items-center.justify-between>div.space-x-1`, (div) => {
                console.log("here");
                const growTime = div.children[0];
                const growTimeTranslation = (multlist, observer) => {
                    observer?.disconnect();
                    const text = growTime.textContent;
                    const result = /([A-Za-z ]+)([0-9]+)?([A-Za-z ]+)?([0-9]+)?([A-Za-z ]+)?/.exec(text);
                    console.log(result);
                    growTime.textContent = result.slice(1).map(part => FarmTranslation.get(part ?? "") ?? part).join("");
                    observer?.observe(growTime, {subtree: true, childList: true, characterData: true});
                };
                growTimeTranslation();
                new MutationObserver(growTimeTranslation).observe(growTime, {subtree: true, childList: true, characterData: true});
                _Translate(div.children[1].childNodes[2], "farm");
            });
            CheckTranslation(document, `${farmId}>div.flex.flex-wrap.items-center.justify-between>div.space-x-2`, (div) => {
                const growTime = div.children[0];
                const growTimeTranslation = (mutlist, observer) => {
                    observer?.disconnect();
                    const text = growTime.textContent;
                    const result = /([A-Za-z ]+)([0-9]+)?([A-Za-z ]+)?([0-9]+)?([A-Za-z ]+)?/.exec(text);
                    console.log(result);
                    growTime.textContent = result.slice(2).map(part => FarmTranslation.get(part ?? "") ?? part).join("") + "后可再次采摘";
                    observer?.observe(growTime, {subtree: true, childList: true, characterData: true});
                };
                growTimeTranslation();
                new MutationObserver(growTimeTranslation).observe(growTime, {subtree: true, childList: true, characterData: true});
                _Translate(div.children[1], "farm");
            });
            CheckTranslation(document, `${farmId}>div.mt-1.text-2xl`, _TypedTranslate("farm"));
            const TranslateNotation = (ele) => ele.textContent = ele.textContent.replace("potions", "药水").replace("potion", "药水");
            const UpgradeTranslation =  (div) => {
                [
                    div.children[0].children[0].children[0],
                    div.children[0].children[0].children[1],
                    div.children[1].childNodes[0],
                    div.children[3].childNodes[0],
                    div.children[3].childNodes[2],
                    div.children[3].childNodes[4],
                ].forEach(_TypedTranslate("farm"));
            };
            CheckTranslation(document, `${farmId}>div.flex.flex-col.gap-2.rounded-lg.p-3`, UpgradeTranslation);
            CheckTranslation(document, `${potionsId}>div.flex.flex-col.gap-2.rounded-lg.p-3`, UpgradeTranslation);
            CheckTranslation(document, `${potionsId} div.text-2xl`, _TypedTranslate("farm"));
            CheckTranslation(document, `${potionsId} div.space-y-1 div.flex.items-center`, (div) => {
                _Translate(div.children[0].childNodes[2], "farm");
                const node04 = div.children[0].childNodes[4];
                if(node04.nodeType === Node.TEXT_NODE){
                    node04.textContent = node04.textContent.replace("Tier", "等级");
                }
                else _Translate(node04, "farm");
            });
            CheckTranslation(document, `${potionsId} span.text-sm`, (span) => {
                const text = span.textContent;
                if(!text.startsWith("+")){
                    console.log("direct", text);
                    span.textContent = FarmTranslation.get(text);
                    return;
                }
                const splitPos = text.indexOf(" ");
                const prefix = text.substring(0, splitPos);
                span.textContent = `${prefix}${FarmTranslation.get(text.substring(splitPos))}`;
            });
            CheckTranslation(document, `${potionsId} div.space-x-2>span:nth-child(1)`, _TypedTranslate("farm"));
            break;
        }
        // #endregion
    }
    document.querySelectorAll('main a[href^="/market"]:not([translated])').forEach(a => {
        a.setAttribute("translated", "");
        _Translate(a);
        _Translate(a.parentElement.children[0]);
        _Translate(a.parentElement.children[1]);
    });
    // #region nav
    document.querySelectorAll(`html body div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden nav.bg-card.small-caps.border-primary.z-1.w-full.max-w-screen.border-b.shadow-md div.flex.items-center.px-4.py-2 div.ml-auto.flex.w-full.max-w-full.items-center.gap-2 div.flex.w-0.flex-shrink.flex-grow.justify-end.gap-1.overflow-x-hidden a.text-muted-foreground.hover\\:bg-primary\\/50.ring-primary.mx-1.my-1.flex.flex-shrink-0.items-center.gap-2.rounded-lg.px-1.py-1.transition.hover\\:ring:not([translated])`).forEach(a => {
        a.setAttribute("translated", "")
        _Translate(a.children[1]);
    });
    document.querySelectorAll(`html body div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden nav.bg-card.small-caps.border-primary.z-1.w-full.max-w-screen.border-b.shadow-md div.border-primary.bg-background.absolute.w-full.border-b a.text-muted-foreground.hover\\:bg-primary\\/20.flex.w-full.items-center.gap-3.px-4.py-2.text-left.transition:not([translated])`).forEach(a => {
        a.setAttribute("translated", "")
        _Translate(a.childNodes[2]);
    })
    // #endregion
    // #region label
    document.querySelectorAll("label:not([translated])").forEach((label) => {
        label.setAttribute("translated", "");
        _Translate(label);
    });
    // #endregion
    // #region stat panel
    document.querySelectorAll(`body div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap div.border-primary.w-full.max-lg\\:border-b.lg\\:w-60.lg\\:border-r div.grid.grid-cols-4.gap-x-4.p-2.text-sm.lg\\:grid-cols-2 div.col-span-2.flex.justify-between span:not([translated]):nth-child(1)`).forEach(span => {
        span.setAttribute("translated", "");
        _Translate(span);

    });
    // #endregion
    // #region popup
    document.querySelectorAll(popupSelector).forEach(div => {
        div.setAttribute("translated", "")
        if(DEBUG) document.body.append(div.cloneNode(true));
        if(div.childNodes[0].nodeType === Node.TEXT_NODE){
            _Translate(div.childNodes[0]);
            return;
        }
    });
    // #endregion
    // #region item
    document.querySelectorAll("span.rarity-common:not([translated]), span.rarity-uncommon:not([translated]), span.rarity-rare:not([translated]), span.rarity-epic:not([translated]), span.rarity-legendary:not([translated])").forEach(span => {
        span.setAttribute("translated", "");
        const itemName = span.textContent;
        if(Translation.has(itemName)) {
            span.textContent = Translation.get(itemName);
            return;
        }
        EquipTranslate(span);
    });
    // #endregion
    // #region equip detail
    document.querySelectorAll("div.rarity-common.bg-popover:not([translated]), div.rarity-uncommon.bg-popover:not([translated]), div.rarity-rare.bg-popover:not([translated]), div.rarity-epic.bg-popover:not([translated]), div.rarity-legendary.bg-popover:not([translated])").forEach(div => {
        div.setAttribute("translated", "");
        div.querySelectorAll(":scope div.font-bold.text-lg").forEach(div => EquipTranslate(div));
        div.querySelectorAll(":scope div.text-foreground.flex.justify-between:not(.gap-2)").forEach(div => _Translate(div.children[0]));
        div.querySelectorAll(":scope div.text-foreground\\/70.flex").forEach(div => _Translate(div.children[0]));
        div.querySelectorAll(":scope div.text-foreground\\/70.text-sm").forEach(div => _Translate(div));
        div.querySelectorAll(":scope .text-sm.underline.select-none").forEach(div => _Translate(div));
        div.querySelectorAll(":scope div.text-foreground.mb-2.flex.justify-between.gap-2").forEach(div => {console.log(div.outerHTML); _Translate(div.children[0].childNodes[0]), _Translate(div.children[1].childNodes[0]), _Translate(div.children[1].childNodes[2])});
        // Enchantment
        div.querySelectorAll(":scope div.flex.justify-between.text-green-500").forEach(div => _Translate(div.children[0]));
    });
    // #endregion
    // #region tab button
    document.querySelectorAll('button[role="tab"]:not([translated]), button[data-slot="button"]:not([translated])').forEach(button => {
        button.setAttribute("translated", "");
        _Translate(button);
    });
    // #endregion
    // #region research 
    document.querySelectorAll(researchSelector).forEach(div => {
        div.dataset.state = "translated";
        div.querySelectorAll(":scope h2.my-4.text-2xl").forEach(h2 => _Translate(h2.childNodes[0]));
        div.querySelectorAll(":scope div.small-caps.text-xl:nth-child(1)").forEach(div => {
            _Translate(div.children[0]);
        })
        div.querySelectorAll(":scope div.text-sm:nth-child(2)").forEach(div => {
            div.childNodes[0].textContent = "当前加成等级：";
        });
        div.querySelectorAll(":scope div.text-sm:nth-child(4)").forEach(div => {
            div.childNodes[0].textContent = "提升 ";
            div.childNodes[2].textContent = " 级 (+";
            div.childNodes[4].textContent = ")，消耗 ";
        });
    });
    // #endregion
    // #region select
    document.querySelectorAll(`div[role="option"][data-slot="select-item"] span[id^="radix-"]:not([translated])`).forEach(span => {
        span.setAttribute("translated", "");
        _Translate(span);
    });
    // #endregion
    document.querySelectorAll('button[role="combobox"][aria-controls^="radix-"] span[data-slot="select-value"]:nth-child(1):not([translated])').forEach(span => {
        if(DEBUG) document.body.append(span.cloneNode(true));
        span.setAttribute("translated", "")
        if(span.parentElement.title === "Attack with magic type"){
            span.parentElement.title = "选择用于攻击的元素类型";
            return;
        }
        if(span.querySelector(":scope div.flex.items-center.gap-2") && span.children[0].children[1].childNodes[3]){
            return;
            const toTranslate = span.children[0].children[1].childNodes[3];
            const wrapper = toTranslate.parentElement;
            const clone = wrapper.cloneNode(true);
            wrapper.insertAdjacentElement("afterend", clone);
            wrapper.setAttribute("hidden", "")
            _Translate(clone.childNodes[3]);
            new MutationObserver(() => {const _clone = wrapper.cloneNode(true); clone.replaceWith(_clone); _Translate(_clone.childNodes[3])}).observe(wrapper, {childList: true, subtree: true, characterData: true});
        }
        const clone = span.cloneNode(true);
        span.insertAdjacentElement("afterend", clone);
        _Translate(clone);
        span.setAttribute("hidden", "")
        new MutationObserver(() => {const _clone = span.cloneNode(true); _Translate(_clone); _clone.removeAttribute("hidden"); span.nextElementSibling.replaceWith(_clone)}).observe(span, {childList: true, subtree: true, characterData: true});
    });
} catch(e) {console.error(e);}};
const WatchEvent = () => {

};
const WatchQuest = () => {
    const progressDiv = document.querySelector("div.border-primary.w-full.max-lg\\:border-b.lg\\:w-60.lg\\:border-r p.text-foreground.text-sm:not([watching])");
    if(!progressDiv || progressDiv.childNodes[0].textContent !== "Defeat ") return;
    progressDiv.setAttribute("watching", "");
    const title = progressDiv.parentElement.children[0];
    if(false && DoTranslate){
        _Translate(title);
        _Translate(progressDiv.childNodes[0]);
        _Translate(progressDiv.childNodes[4]);
    }
    const OnQuestProgress = () => {
        const current = Number(progressDiv.childNodes[1].textContent);
        const target = Number(progressDiv.childNodes[3].textContent);
        console.log(`${current} / ${target}`);
        if(current === target) {
            new Notification("Quest Complete", { requireInteraction: true, });
        }
    };
    new MutationObserver(OnQuestProgress).observe(progressDiv, {childList: true, subtree: true, characterData: true});
};
const UserStat = {
    Lv: 0, MEx: 0, Typ: "Water", Int: 0, Sta: 0, Spi: 0, Foc: 0, Mna: 0, Mas: 0, // % Spl: 0, Wrd: 0,
    // boosts
    SpR: 0, Dmg: 0, Mul: 0, CCh: 0, CDm: 0, Has: 0, HeB: 0, WaB: 0, FoB: 0, MaB: 0, Ove: 0, TiD: 0,
};
const RecordExpTable = (() => {
    let lastLv = 0;
    return (curLv, curMEx) => {
        if(curLv === lastLv) return;
        lastLv = curLv;
        const expTable = GetItem("ExpTable") ?? {};
        expTable[curLv] = curMEx;
        SetItem("ExpTable", expTable);
    }
})();
unsafeWindow.PrintExpTable = (start = 0, end = Number.MAX_SAFE_INTEGER, diff = false) => {
    const expTable = Object.entries(GetItem("ExpTable") ?? {}).filter(a => a[0] >= start && a[0] < end).sort((a, b) => a[0] - b[0]);
    if(!diff){
        expTable.forEach(a => console.log(a[0], a[1]));
        return;
    }
    for(let i = 1; i < expTable.length; i++){
        for(let j = 1; j <= i; j++){
            expTable[i].push(expTable[i][j] - expTable[i - 1][j]);
        }
    }
    expTable.forEach(a => console.log(a.join(" ")));
};
const UpdateUserStat = () => {
    [...document.querySelectorAll("div#root div.flex.max-h-screen.min-h-screen.flex-col.overflow-x-hidden div.flex.max-w-screen.grow.flex-col.overflow-y-scroll.lg\\:flex-row.lg\\:flex-wrap div.border-primary.w-full.max-lg\\:border-b.lg\\:w-60.lg\\:border-r div.grid.grid-cols-4.gap-x-4.p-2.text-sm.lg\\:grid-cols-2 div.col-span-2.flex.justify-between")].forEach(div => {
        const key = div.children[0].textContent;
        const val = div.children[1];
        switch(key){
            case "Battle Level:": UserStat.Lv = Number(val.textContent); break;
            case "Experience:": UserStat.MEx = Number(val.children[1].getAttribute("title").replaceAll(",", "")); RecordExpTable(UserStat.Lv, UserStat.MEx); break;
            case "Intellect:": UserStat.Int = Number(val.textContent); break;
            case "Stamina:": UserStat.Sta = Number(val.textContent); break;
            case "Spirit:": UserStat.Spi = Number(val.textContent); break;
            case "Focus:": UserStat.Foc = Number(val.textContent); break;
            case "Mana:": UserStat.Mna = Number(val.textContent); break;
            case "Water Mastery:": UserStat.Mas = Number(val.childNodes[0].textContent.replaceAll(/\.|\%/g, "")); UserStat.Typ = "Water"; break;
            case "Fire Mastery:": UserStat.Mas = Number(val.childNodes[0].textContent.replaceAll(/\.|\%/g, "")); UserStat.Typ = "Fire"; break;
            case "Nature Mastery:": UserStat.Mas = Number(val.childNodes[0].textContent.replaceAll(/\.|\%/g, "")); UserStat.Typ = "Nature"; break;
            case "Total Spellpower:": UserStat.Spl = Number(val.children[0].getAttribute("title").replaceAll(",", "")); break;
            case "Total Ward:": UserStat.Spl = Number(val.children[0].getAttribute("title").replaceAll(",", "")); break;
        }
    })
}
const OnMutate = (mutlist, observer) => {
    observer.disconnect();
    if(DoTranslate) FindAndReplaceText();
    UpdateUserStat();
    WatchQuest();
    observer.observe(document, {subtree: true, childList: true});
};
new MutationObserver(OnMutate).observe(document, {subtree: true, childList: true});