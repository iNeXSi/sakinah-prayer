# مصادر المكتبة الصوتية

النغمات soft.wav وbell.wav وdawn.wav وpulse.wav مولدة خصيصًا لسكينة عبر build-tones.cjs.

تسجيلات الأذان مأخوذة من صفحة التنزيل العامة:
https://aladhan.com/download-adhans

- afasy.mp3: مشاري راشد العفاسي — https://cdn.aladhan.com/audio/adhans/a9.mp3
- nafees.mp3: أحمد النفيس — https://cdn.aladhan.com/audio/adhans/a1.mp3
- zahrani.mp3: منصور الزهراني — https://cdn.aladhan.com/audio/adhans/a11-mansour-al-zahrani.mp3
- ozcan.mp3: مصطفى أوزجان — https://cdn.aladhan.com/audio/adhans/a2.mp3

أُرفقت للاستخدام المحلي المطلوب. نسب التسجيلات إلى أصحابها لا يمنح ترخيصًا تجاريًا جديدًا؛ يُرجع للمصدر قبل إعادة نشرها أو توزيعها تجاريًا.

إضافات 20 أكتوبر 2026، والأسماء كما يوردها المصدر نفسه:
- afasy-dubai.mp3: مشاري راشد العفاسي، تسجيل تلفزيون دبي — https://cdn.aladhan.com/audio/adhans/a4.mp3
- afasy-alt.mp3: تسجيل آخر لمشاري راشد العفاسي — https://cdn.aladhan.com/audio/adhans/a7.mp3
- takbir.wav: مقطع من بداية تسجيل أحمد النفيس nafees.mp3، من 9.2 إلى 26.4 ثانية، مع تدرج قصير عند الحواف. نسبة الصوت تعتمد على المصدر الأصلي، وليست تحققًا صوتيًا مستقلًا من الهوية.

## تصحيح المكتبة — 20 أكتوبر 2026
أُزيلت النسبة السابقة لمنصور الزهراني من المكتبة النشطة بناءً على تصحيح المستخدم، وأزيل مصطفى أوزجان. لا يُقدّم التوثيق السابق أعلاه كإثبات مستقل لهوية التسجيلين. حزمة ZIP الجديدة تتضمن الأصوات النشطة فقط.
- كان makkah.mp3 منسوبًا إلى ملف Ali_Ibn_Ahmad_Mala_1 من مكتبة https://github.com/Kiwifu/adhan-mp3 ؛ الاسم كما في الملف. صفحة إسلام ويب توثق اسم المؤذن.
- madinah.mp3: الأذان المدني، ملف Adhan_Al_Haram_Al_Madani_-_Al_Madinah_1 من المكتبة نفسها. لا نضيف اسم مؤذن غير منصوص عليه في المصدر. الروابط الدقيقة للملفين محفوظة في audio-library.json وتظهر في الواجهة.
- nafees.mp3: أحمد النفيس، كما تسميه صفحة AlAdhan المشار إليها أعلاه.
- adhan-now.mp3: عبارة «حَانَ الْآنَ وَقْتُ الْأَذَانِ.» مولدة آليًا باستخدام صوت Microsoft ar-SA-HamedNeural العام عبر edge-tts 7.3.1؛ ليست تسجيلًا منسوبًا لمؤذن. توليد مرة واحدة ثم تشغيل محلي؛ لا اتصال مطلوب عند التنبيه.


## إسلام ويب — مراجعة المصدر
الحقوق محفوظة لشبكة إسلام ويب. الاستخدام محلي شخصي فقط، ولا تتضمن الملفات ترخيصًا لإعادة النشر.

- makkah.mp3: علي بن أحمد ملا، الحرم المكي — https://audio.islamweb.net/audio/index.php?audioid=1&page=audioinfo . قورن makkah.mp3 بملف نُزّل مباشرة من https://audio.islamweb.net/audio/downloadmp3.php?audioid=1 بتاريخ 20 أكتوبر 2026: الحجم 492,824 بايت في الملفين، وبصمة MD5 متطابقة (تبدأ بـ 3e6d8945cffd).
- aqsa-qazzaz.mp3: ناجي قزاز، المسجد الأقصى — https://audio.islamweb.net/audio/index.php?audioid=7&page=audioinfo . الملف موجود محليًا، وفُحص تشغيله؛ اسم المؤذن والصفحة بحسب إسلام ويب.

بقيت خمسة تسجيلات من إسلام ويب في audio-pending.json؛ لم تُضف إلى المكتبة حتى تتوفر ملفاتها. اسم نايف كما تذكره صفحته: نايف صالح فيده.

## تسجيلات Kiwifu المضافة
الأسماء التالية مأخوذة من أسماء الملفات في مستودع Kiwifu / adhan-mp3، وليست تحققًا مستقلًا من هوية الصوت. الاستخدام محلي شخصي؛ راجع حقوق المصدر قبل إعادة التوزيع. الروابط الدقيقة للملفات محفوظة أيضًا في audio-library.json ويقرأها download-audio.cjs.

- qatami.mp3: ناصر القطامي — https://github.com/Kiwifu/adhan-mp3/blob/main/Nasser_Al_Qatami_1_-_Saudi_Arabia_%28%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A_-_%D8%A7%D9%84%D9%85%D9%85%D9%84%D9%83%D8%A9_%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9_%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9%29.mp3
- daghriri.mp3: حمد الدغريري — https://github.com/Kiwifu/adhan-mp3/blob/main/Hamad_Al_Daghriri_%28%D8%AD%D9%85%D8%AF_%D8%A7%D9%84%D8%AF%D8%BA%D8%B1%D9%8A%D8%B1%D9%8A%29.mp3
- nafees-2.mp3: أحمد النفيس، تسجيل آخر — https://github.com/Kiwifu/adhan-mp3/blob/main/Ahmad_Al_Nafees_%28%D8%A3%D8%AD%D9%85%D8%AF_%D8%A7%D9%84%D9%86%D9%81%D9%8A%D8%B3%29.mp3
