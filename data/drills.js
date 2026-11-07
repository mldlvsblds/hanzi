// Exam-style practice content for HSK 1, lessons 1–9.
// Each list is plain data; add more items in the same format.
window.DRILLS = {
  exam: { name: 'Midterm · HSK 1 L1–L9', date: '2026-11-10' },

  // Section I / VI — pictures (emoji) for words and sentences
  emoji: {
    '猫': '🐱', '狗': '🐶', '米饭': '🍚', '茶': '🍵', '杯子': '🥛', '医院': '🏥', '医生': '🧑‍⚕️',
    '椅子': '🪑', '书': '📖', '学校': '🏫', '商店': '🏪', '妈妈': '👩', '爸爸': '👨', '儿子': '👦',
    '女儿': '👧', '中国': '🇨🇳', '美国': '🇺🇸', '中国菜': '🥟', '钱': '💰', '老师': '🧑‍🏫',
    '学生': '🧑‍🎓', '家': '🏠', '喝': '🥤', '吃': '🍽️', '写': '✍️', '看': '👀', '谢谢': '🙏',
    '你好': '👋', '工作': '💼', '朋友': '🤝', '月': '🌙', '星期': '📅', '下午': '🕒', '大': '🐘', '小': '🐭',
  },
  pictureSentences: [
    ['这是我的女儿。', '👧'], ['中国菜很好吃。', '🥟'], ['我想喝茶。', '🍵'], ['他是医生。', '🧑‍⚕️'],
    ['小猫在椅子下面。', '🐱🪑'], ['我去学校。', '🏫'], ['我去商店买杯子。', '🏪'], ['这是我的小狗。', '🐶'],
    ['我爸爸在医院工作。', '🏥'], ['我会写汉字。', '✍️'], ['我想吃米饭。', '🍚'], ['她是我的汉语老师。', '🧑‍🏫'],
    ['我去学校看书。', '📖'], ['这个杯子多少钱？', '💰'], ['你好！', '👋'], ['谢谢你！', '🙏'],
  ],

  // Section IV — fill in the blank: [sentence with ＿＿, answer, d1, d2, d3]
  fill: [
    ['中国菜很＿＿。', '好吃', '学生', '米饭', '昨天'],
    ['我＿＿说汉语。', '会', '是', '叫', '有'],
    ['你叫什么＿＿？', '名字', '汉字', '朋友', '老师'],
    ['她是我的汉语＿＿。', '老师', '名字', '汉字', '杯子'],
    ['你是＿＿国人？', '哪', '谁', '几', '多'],
    ['你家有＿＿口人？', '几', '多', '哪', '谁'],
    ['她女儿今年二十＿＿了。', '岁', '口', '个', '块'],
    ['你妈妈今年多＿＿了？', '大', '小', '少', '好'],
    ['这个汉字＿＿读？', '怎么', '什么', '多少', '哪儿'],
    ['今天几＿＿？', '号', '岁', '口', '块'],
    ['我想＿＿茶。', '喝', '吃', '看', '写'],
    ['我去商店＿＿杯子。', '买', '喝', '读', '叫'],
    ['这个杯子多少＿＿？', '钱', '岁', '号', '口'],
    ['我的小猫在＿＿？', '哪儿', '什么', '谁', '几'],
    ['他在医院＿＿。', '工作', '学校', '商店', '名字'],
    ['我去学校＿＿书。', '看', '喝', '吃', '叫'],
    ['明天＿＿四。', '星期', '学校', '下午', '医院'],
    ['对不起！——＿＿。', '没关系', '不客气', '谢谢', '你好'],
    ['谢谢你！——＿＿。', '不客气', '没关系', '对不起', '你们'],
    ['我是中国人，你＿＿？', '呢', '吗', '的', '了'],
    ['你是老师＿＿？', '吗', '呢', '的', '几'],
    ['这是我＿＿书。', '的', '吗', '呢', '了'],
    ['我家有三＿＿人。', '口', '个', '岁', '块'],
    ['我有一＿＿中国朋友。', '个', '口', '岁', '号'],
    ['那个杯子二十八＿＿。', '块', '个', '口', '岁'],
    ['小狗在椅子＿＿。', '下面', '哪儿', '什么', '怎么'],
    ['我爸爸是＿＿，他在医院工作。', '医生', '学生', '同学', '商店'],
    ['你＿＿喝什么？', '想', '是', '叫', '有'],
    ['你会写汉＿＿吗？', '字', '语', '国', '人'],
    ['我会说＿＿。', '汉语', '汉字', '米饭', '杯子'],
    ['昨天是8月31号，＿＿是9月1号。', '今天', '昨天', '星期', '下午'],
    ['我们＿＿学校。', '去', '喝', '吃', '读'],
    ['下午我去＿＿买杯子。', '商店', '医院', '学校', '椅子'],
    ['你吃＿＿吗？', '米饭', '茶', '学校', '医生'],
    ['＿＿是谁？——她是我的汉语老师。', '她', '哪', '几', '什么'],
    ['你儿子在＿＿工作？', '哪儿', '什么', '谁', '几'],
  ],

  // Section VII — dialogues: [question/line, response]
  dialogues: [
    ['你好！', '你好！'], ['谢谢！', '不客气！'], ['对不起！', '没关系！'], ['再见！', '再见！'],
    ['你叫什么名字？', '我叫李月。'], ['你是哪国人？', '我是美国人。'], ['你女儿几岁了？', '她四岁了。'],
    ['你会说汉语吗？', '我会说汉语。'], ['今天几号？', '今天9月1号。'], ['你想喝什么？', '我想喝茶。'],
    ['这个杯子多少钱？', '二十八块。'], ['你儿子在哪儿工作？', '他在医院工作。'], ['你家有几口人？', '我家有三口人。'],
    ['中国菜好吃吗？', '很好吃。'], ['她是谁？', '她是我的汉语老师。'], ['明天星期几？', '明天星期四。'],
    ['你去哪儿？', '我去学校。'], ['你妈妈今年多大了？', '她今年五十岁了。'], ['你是老师吗？', '不是，我是学生。'],
    ['我的小猫呢？', '在椅子下面。'],
  ],

  // Section V — sentence types
  sentences: {
    nominal: ['今天九月一号。', '明天星期三。', '她女儿今年二十岁。', '这个杯子二十八块。', '我今年十九岁。', '昨天星期二。'],
    adjective: ['中国菜很好吃。', '我很好。', '这个杯子很小。', '她的小狗很大。', '他的汉语很好。'],
    shi: ['我是学生。', '她是我的汉语老师。', '他是医生。', '这是我的杯子。', '我是美国人。'],
    verb: ['我想喝茶。', '我会说汉语。', '我去学校看书。', '他在医院工作。', '我家有三口人。', '我妈妈会做中国菜。'],
  },

  // Section V — tone changes: [phrase, character asked, correct reading, rule]
  sandhi: [
    ['不是', '不', 'bú', '不 + 4th tone → bú'], ['不去', '不', 'bú', '不 + 4th tone → bú'],
    ['不会', '不', 'bú', '不 + 4th tone → bú'], ['不看', '不', 'bú', '不 + 4th tone → bú'],
    ['不大', '不', 'bú', '不 + 4th tone → bú'], ['不客气', '不', 'bú', '不 + 4th tone (kè) → bú'],
    ['不叫', '不', 'bú', '不 + 4th tone → bú'], ['不好', '不', 'bù', '不 + 1st/2nd/3rd tone stays bù'],
    ['不吃', '不', 'bù', '不 + 1st/2nd/3rd tone stays bù'], ['不喝', '不', 'bù', '不 + 1st/2nd/3rd tone stays bù'],
    ['不学', '不', 'bù', '不 + 1st/2nd/3rd tone stays bù'], ['不想', '不', 'bù', '不 + 1st/2nd/3rd tone stays bù'],
    ['不买', '不', 'bù', '不 + 1st/2nd/3rd tone stays bù'], ['不多', '不', 'bù', '不 + 1st/2nd/3rd tone stays bù'],
    ['一个', '一', 'yí', '一 + 4th tone → yí (个 is originally gè)'], ['一块', '一', 'yí', '一 + 4th tone → yí'],
    ['一号', '一', 'yī', 'Dates, numbers and ordinals keep yī'], ['一月', '一', 'yī', 'Dates, numbers and ordinals keep yī'],
    ['十一', '一', 'yī', 'At the end of a word / in numbers: yī'], ['第一', '一', 'yī', 'Ordinals keep yī'],
    ['一天', '一', 'yì', '一 + 1st/2nd/3rd tone → yì'], ['一年', '一', 'yì', '一 + 1st/2nd/3rd tone → yì'],
    ['一杯', '一', 'yì', '一 + 1st/2nd/3rd tone → yì'], ['一口', '一', 'yì', '一 + 1st/2nd/3rd tone → yì'],
    ['你好', '你', 'ní', '3rd + 3rd tone → the first becomes 2nd tone'], ['很好', '很', 'hén', '3rd + 3rd tone → the first becomes 2nd tone'],
    ['我想', '我', 'wó', '3rd + 3rd tone → the first becomes 2nd tone'], ['小狗', '小', 'xiáo', '3rd + 3rd tone → the first becomes 2nd tone'],
  ],

  // Section V — measure words: [sentence, answer, distractors…]
  measure: [
    ['我家有三＿＿人。', '口', '个', '岁', '块'], ['我有一＿＿中国朋友。', '个', '口', '岁', '号'],
    ['这个杯子十＿＿钱。', '块', '个', '口', '岁'], ['她女儿五＿＿了。', '岁', '口', '个', '块'],
    ['我想买一＿＿杯子。', '个', '口', '岁', '号'], ['你家有几＿＿人？', '口', '个', '块', '号'],
  ],

  // Section III — radicals → characters from lessons 1–9
  radicals: {
    '讠': { name: 'speech', chars: '谢说语请读谁' }, '氵': { name: 'water', chars: '汉没' },
    '口': { name: 'mouth', chars: '叫吗呢哪吃喝' }, '亻': { name: 'person', chars: '你们他什做作' },
    '女': { name: 'woman', chars: '好她妈' }, '木': { name: 'tree, wood', chars: '杯椅校' },
    '艹': { name: 'grass', chars: '菜茶' }, '宀': { name: 'roof', chars: '字客家' },
    '犭': { name: 'animal', chars: '猫狗' }, '日': { name: 'sun', chars: '明昨' },
    '心': { name: 'heart', chars: '您想怎' }, '阝': { name: 'ear / city', chars: '那哪院' },
    '饣': { name: 'food', chars: '饭' }, '钅': { name: 'metal, gold', chars: '钱' },
    '辶': { name: 'walk', chars: '这' }, '门': { name: 'door', chars: '问' }, '彳': { name: 'step', chars: '很' },
  },
  // characters that visually contain a radical but should never be used as a wrong option for it
  radicalBlacklist: { '口': '号名客商国知高', '木': '李茶菜本', '日': '是星', '门': '们', '心': '' },

  // Section III — character structures (only clear-cut cases)
  structures: {
    single: { name: 'Single component 独体', chars: '一二三四五六七八九十口见山小不月心中人儿几水女了大东我西书少个在子工上下本生年米午天面再' },
    lr: { name: 'Left–right 左右', chars: '你好们对没叫什吗师她谁的汉语呢他朋说妈很吃读请期昨明校喝饭杯钱块那猫狗椅作院' },
    lmr: { name: 'Left–middle–right 左中右', chars: '谢哪做' },
    tb: { name: 'Top–bottom 上下', chars: '您客字名是李家岁今多会写怎号星去看想爸' },
    tmb: { name: 'Top–middle–bottom 上中下', chars: '菜茶高' },
    half: { name: 'Half-enclosure 半包围', chars: '这起问店医同' },
    full: { name: 'Full enclosure 全包围', chars: '国' },
  },

  // Pinyin spelling rules (拼音练习): [display, answer with tone number]
  pinyinRules: [
    ['i + a', 'ya1'], ['i + e', 'ye2'], ['i + ao', 'yao3'], ['i + ou', 'you4'], ['i + an', 'yan1'], ['in', 'yin3'],
    ['i + ang', 'yang2'], ['ing', 'ying3'], ['i + ong', 'yong4'], ['u', 'wu1'], ['u + a', 'wa2'], ['u + o', 'wo3'],
    ['u + ai', 'wai1'], ['u + an', 'wan4'], ['u + ang', 'wang3'], ['u + ei', 'wei4'], ['u + en', 'wen2'], ['u + eng', 'weng1'],
    ['ü + e', 'yue1'], ['ü + an', 'yuan2'], ['ü + n', 'yun4'], ['j + ü', 'ju1'], ['j + üe', 'jue2'], ['j + üan', 'juan3'],
    ['j + ün', 'jun4'], ['q + ü', 'qu3'], ['q + üe', 'que1'], ['q + üan', 'quan4'], ['q + ün', 'qun2'], ['x + ü', 'xu4'],
    ['x + üe', 'xue3'], ['x + üan', 'xuan1'], ['x + ün', 'xun2'], ['n + ü', 'nü3'], ['n + üe', 'nüe4'], ['l + ü', 'lü2'],
    ['l + üe', 'lüe4'], ['q + i + an', 'qian1'], ['l + iou', 'liu2'], ['j + iou', 'jiu4'], ['g + uei', 'gui4'], ['d + uei', 'dui4'],
    ['l + uen', 'lun2'], ['m + ing', 'ming4'], ['t + i + an', 'tian1'], ['j + i + an', 'jian3'], ['q + in', 'qin2'], ['x + i + ong', 'xiong2'],
  ],
};

// Cheat sheets shown under Words → Notes
window.NOTES = [
  { title: 'Questions: 吗 · 呢 · 什么 · 谁 · 哪 · 几 · 多少 · 怎么 · 哪儿', html: `
<p><b>吗</b> turns a statement into a yes/no question: 你是老师<b>吗</b>？</p>
<p><b>呢</b> (1) "and you?": 我是学生，你<b>呢</b>？ (2) "where is…?": 我的杯子<b>呢</b>？</p>
<p>Question words stay where the answer goes — no word-order change: 你叫<b>什么</b>名字？→ 我叫李月。</p>
<p><b>几</b> = how many (usually under 10, needs a measure word): 你家有<b>几</b>口人？ · <b>多少</b> = how many/much (any number): 多少钱？</p>
<p><b>怎么</b> + verb = how to do: 这个字<b>怎么</b>读？ · <b>哪儿</b> = where: 你在<b>哪儿</b>工作？ · <b>谁</b> = who · <b>哪</b> = which: 你是<b>哪</b>国人？</p>` },
  { title: 'Sentence types (exam part V)', html: `
<p><b>是-sentence</b>: A 是 B — 我<b>是</b>学生。 Negative: 不是.</p>
<p><b>Adjective predicate (形容词谓语句)</b>: subject + 很 + adjective, <i>no 是</i>: 中国菜<b>很好吃</b>。</p>
<p><b>Nominal predicate (名词谓语句)</b>: the predicate is a noun/number for <b>dates, age, price</b>, <i>no 是</i>: 今天<b>九月一号</b>。她<b>二十岁</b>。这个杯子<b>二十八块</b>。</p>
<p><b>Serial verbs</b>: 去 + place + do something: 我<b>去学校看书</b>。</p>` },
  { title: 'Verbs & particles: 会 · 想 · 在 · 有 · 的 · 了', html: `
<p><b>会</b> + verb = can (learned skill): 我<b>会</b>说汉语。 Negative: 不会.</p>
<p><b>想</b> + verb = would like to: 我<b>想</b>喝茶。</p>
<p><b>在</b> as verb = to be at: 小猫<b>在</b>椅子下面。 As preposition = at/in: 他<b>在</b>医院工作。</p>
<p><b>有</b> = to have: 我家<b>有</b>三口人。 Negative is <b>没有</b> (never 不有).</p>
<p><b>的</b> shows possession: 我<b>的</b>书. Often dropped with family/close relations: 我妈妈.</p>
<p><b>了</b> at the end shows a change/new situation: 她女儿二十岁<b>了</b>。 <b>多大</b> asks age: 你今年多大了？</p>` },
  { title: 'Dates, numbers, money, measure words', html: `
<p>Big → small: 2026年11月10号 星期二. Days: 星期一 … 星期六, 星期天/星期日.</p>
<p>Numbers: 十一 (11), 二十 (20), 二十八 (28), 九十九 (99).</p>
<p>Money: 十<b>块</b> = 10 kuai. 多少钱？ = how much?</p>
<p>Number + <b>measure word</b> + noun: 一<b>个</b>人, 三<b>口</b>人 (family members), 一<b>个</b>杯子.</p>` },
  { title: 'Tone changes: 不 · 一 · 3rd + 3rd', html: `
<p><b>不</b>: normally bù. Before a 4th tone → <b>bú</b>: 不是 bú shì, 不客气 bú kèqi.</p>
<p><b>一</b>: alone, at the end, in numbers/dates/ordinals → <b>yī</b> (一月, 十一, 第一). Before a 4th tone → <b>yí</b> (一个 yí gè). Before 1st/2nd/3rd → <b>yì</b> (一天 yì tiān, 一年 yì nián).</p>
<p><b>3rd + 3rd</b>: the first one becomes 2nd tone: 你好 → <b>ní</b> hǎo, 很好 → <b>hén</b> hǎo.</p>` },
  { title: 'Pinyin spelling rules', html: `
<p>No initial: i → <b>y</b> (ia → ya, ie → ye, iou → you), i/in/ing → yi/yin/ying.</p>
<p>u → <b>w</b> (ua → wa, uo → wo, uei → wei, uen → wen), u alone → wu.</p>
<p>ü → <b>yu</b> (üe → yue, üan → yuan, ün → yun).</p>
<p>After <b>j q x</b> the two dots of ü disappear: jü → ju, xüe → xue. After <b>n l</b> they stay: nǚ, lǜ.</p>
<p>With an initial: iou → <b>iu</b> (liù), uei → <b>ui</b> (guì), uen → <b>un</b> (lùn).</p>
<p>Tone mark: on <b>a</b> or <b>e</b> if present; in <b>ou</b> on o; otherwise on the last vowel (iu → iù, ui → uì).</p>` },
  { title: 'Strokes & stroke order', html: `
<p>Basic strokes: 一 héng (horizontal) · 丨 shù (vertical) · 丿 piě (left-falling) · 丶 diǎn (dot) · ㇏ nà (right-falling) · ㇀ tí (rising) · folds 折 and hooks 钩.</p>
<p>Rules: horizontal before vertical (十) · left-falling before right-falling (人) · top to bottom (三) · left to right (你) · outside before inside (月) · close the frame last (国) · middle before sides (小).</p>` },
  { title: 'Character structures & radicals', html: `
<p><b>Single</b> 独体: 人 大 中 我 · <b>Left–right</b>: 你 好 · <b>Left–middle–right</b>: 谢 哪 做 · <b>Top–bottom</b>: 字 是 · <b>Top–middle–bottom</b>: 菜 茶 高 · <b>Half-enclosure</b>: 这 问 医 · <b>Full enclosure</b>: 国</p>
<p>讠 speech: 说 语 请 读 谢 谁 · 氵 water: 汉 没 · 口 mouth: 吗 呢 叫 吃 喝 哪 · 亻 person: 你 他 们 做 作 · 女: 好 她 妈 · 木: 杯 椅 校 · 艹: 菜 茶 · 宀: 字 家 客 · 犭: 猫 狗 · 心: 您 想 怎 · 阝: 那 哪 院 · 钅: 钱 · 辶: 这 · 门: 问</p>` },
];
