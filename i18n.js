(() => {
 let language=localStorage.getItem('sakinah-language')||'ar';
 const pairs={
 'سكينة':'Sakinah','للصلاة وقت، وللقلب سكينة':'A time for prayer. A moment of peace.',
 'يومك، على إيقاع الصلاة':'A day shaped by prayer','على موعدٍ مع السكينة':'Make time for peace',
 'تغيير':'Change','تغيير الموقع':'Change location','المنطقة':'Region','المدينة':'City','مواقيت منطقتك':'Your prayer times',
 'اختر المدينة لتحديث المواقيت والتنبيهات':'Choose a city for prayer times and alerts','حفظ الموقع':'Save location',
 'وفق مركز المدينة · حساب أم القرى':'City centre · Umm al-Qura calculation','استخدام موقع الجهاز':'Use device location',
 'تلقائي: موقع الجهاز':'Automatic: device location','يدوي: المدينة المختارة':'Manual: selected city',
 'يُحسب محليًا؛ لا تُرسل إحداثياتك لخدمة المواقيت.':'Calculated locally; coordinates are not sent to a prayer-times service.',
 'تعذّر تحديد موقع الجهاز. فعّل خدمة الموقع في ويندوز، أو اختر مدينتك يدويًا.':'Device location unavailable. Enable Windows location services or choose a city manually.',
 'جارٍ تحديد الموقع…':'Finding device location…','المواقيت محسوبة على جهازك':'Prayer times calculated on this device',
 'مواقيت محفوظة على جهازك':'Prayer times saved locally','تم تحديث المواقيت':'Prayer times updated','جارٍ تحميل المواقيت':'Loading prayer times',
 'الصلاة القادمة':'Next prayer','حيّ على الصلاة':'Come to prayer','الفجر':'Fajr','الشروق':'Sunrise','الظهر':'Dhuhr','العصر':'Asr','المغرب':'Maghrib','العشاء':'Isha',
 'موعد الصلاة اليوم':'Prayer time today','فجر الغد، بإذن الله':'Tomorrow’s Fajr, God willing','متبقي على الأذان':'until prayer',
 'مواقيت اليوم':'Today’s prayer times','تحديث المواقيت':'Refresh prayer times','القادمة':'Next','شروق الشمس':'Sunrise',
 'حساب أم القرى':'Umm al-Qura calculation','الشروق للمرجع، دون تنبيه':'Sunrise is shown without an alert',
 'نورٌ للقلب':'Light for the heart','من هدي النبوة':'Prophetic guidance','قال رسول الله ﷺ':'The Prophet ﷺ said',
 '«وَالصَّلَاةُ نُورٌ»':'“Prayer is light.”','«الصَّلَاةُ عَلَى وَقْتِهَا»':'“Prayer at its proper time.”',
 '«وَأَنَّ أَحَبَّ الأَعْمَالِ أَدْوَمُهَا إِلَى اللَّهِ، وَإِنْ قَلَّ»':'“The deeds most loved by Allah are those done consistently, even if small.”',
 'وقفة اليوم':'A moment to reflect','تأمل تحريري، وليس نصّ حديث.':'An editorial reflection, not a hadith quotation.',
 'اجعل للصلاة مساحة هادئة في يومك؛ دع ما يشغلك، وأقبل بقلب حاضر.':'Make a quiet space for prayer in your day. Set distractions aside and bring your heart into the moment.',
 'اختر عملًا صالحًا يسيرًا تستطيع المداومة عليه. دقائق ثابتة للذكر والقراءة خير من خطة تؤجلها كل يوم.':'Choose a small good deed you can sustain. A few regular minutes of remembrance and reading are better than a plan you keep postponing.',
 'استعد للصلاة قبل انشغالك التالي. رتّب وقتك حولها، واترك لنفسك فسحة للوضوء والطمأنينة.':'Prepare for prayer before your next task. Make time for ablution and a peaceful pause.',
 'وقفة أخرى':'Another reflection','رفيقك في الخلفية':'Here in the background','يعمل':'Running','غير جاهز':'Not ready','غير متصل':'Disconnected','خطأ في التنبيه':'Alert error','متوقف مؤقتًا':'Paused',
 'أغلق النافذة وواصل يومك. نذكّرك عند دخول وقت الصلاة.':'Close the window and carry on. We will remind you when prayer begins.',
 'تنبيهات الصلاة':'Prayer alerts','نافذة تنبيه مستقلة عن المتصفح':'A notification window independent of the browser','صوت التنبيه':'Alert sound',
 'نغمة أو تسجيل الأذان الذي تختاره':'Your chosen tone or adhan recording','يبدأ تلقائيًا عند تسجيل الدخول':'Starts automatically at sign-in',
 'التشغيل التلقائي غير مثبّت':'Automatic startup is not installed','التنبيهات تعمل حتى بعد إغلاق النافذة.':'Alerts continue after the window is closed.',
 'التنبيهات متوقفة حتى تعيد تفعيلها.':'Alerts are paused until you enable them.',
 'تخصيص صوت الأذان':'Use your own recording','اختر ملفًا من جهازك':'Choose a file','استمع':'Listen','إيقاف':'Stop','اعتماد':'Use','إزالة':'Remove',
 'MP3 أو WAV، حتى ٢٠ ميغابايت. يُحفظ محليًا ويعمل بعد إغلاق النافذة.':'MP3 or WAV, up to 20 MB. Saved locally for background playback.',
 'جرّب تنبيه الخلفية':'Test background alert','إيقاف الصوت':'Stop audio','أصوات محفوظة على جهازك':'Audio stored on your device',
 'مكتبة التنبيهات':'Sound library','استمع، ثم اختر الصوت الذي يرافق موعد الصلاة، حتى بعد إغلاق النافذة.':'Preview and choose a sound for prayer alerts, even when the window is closed.',
 'نغمات قصيرة':'Short tones','أصوات المؤذنين':'Muezzin recordings','نسيم':'Breeze','جرس هادئ':'Gentle bell','إشراقة':'Dawn','تذكير':'Reminder',
 'نغمة ناعمة ومتدرجة':'A soft, gentle tone','رنين واضح وقصير':'A clear, short chime','ثلاث نغمات متتابعة':'Three gentle notes','نبضتان خفيفتان':'Two gentle pulses',
 'اختيار':'Select','✓ الصوت المختار':'✓ Selected','تسجيل أذان':'Adhan recording','تسجيل أذان من تركيا':'Adhan recording from Türkiye',
 'مشاري راشد العفاسي':'Mishary Rashid Alafasy','أحمد النفيس':'Ahmad al-Nafees','منصور الزهراني':'Mansour Al-Zahrani','مصطفى أوزجان':'Mustafa Özcan',
 'مشاري العفاسي — تلفزيون دبي':'Mishary Alafasy — Dubai TV','مشاري العفاسي — تسجيل آخر':'Mishary Alafasy — alternate recording',
 'الله أكبر الله أكبر':'Allahu Akbar, Allahu Akbar','تكبيرتان من أذان أحمد النفيس':'Two takbirs from Ahmad al-Nafees’s adhan',
 'مصدر تسجيلات الأذان: AlAdhan ↗':'Adhan recordings: AlAdhan ↗','مصدر المواقيت: AlAdhan ↗':'Calculation: Adhan JS ↗',
 'يمكن إغلاق النافذة؛ التنبيهات تستمر ما دام الجهاز يعمل وحسابك مسجّلًا.':'You can close the window. Alerts continue while the computer is awake and you are signed in.',
 'إنهاء الخدمة':'Quit Sakinah','السعودية':'Saudi Arabia','الرياض':'Riyadh','الخرج':'Al Kharj','الدوادمي':'Dawadmi','مكة المكرمة':'Makkah','جدة':'Jeddah','الطائف':'Taif','المدينة المنورة':'Madinah','ينبع':'Yanbu','العلا':'AlUla','الشرقية':'Eastern Province','الدمام':'Dammam','الخبر':'Khobar','الهفوف':'Hofuf','الجبيل':'Jubail','حفر الباطن':'Hafr Al Batin','القصيم':'Qassim','بريدة':'Buraydah','عنيزة':'Unaizah','عسير':'Asir','أبها':'Abha','خميس مشيط':'Khamis Mushait','تبوك':'Tabuk','حائل':'Hail','الحدود الشمالية':'Northern Borders','عرعر':'Arar','رفحاء':'Rafha','جازان':'Jazan','نجران':'Najran','الباحة':'Al Baha','الجوف':'Al Jawf','سكاكا':'Sakaka','القريات':'Qurayyat',
 'اختر المنطقة':'Choose a region','موقع الجهاز':'Device location','تم حفظ صوت التنبيه.':'Alert sound saved.','حُفظ الموقع للمواقيت وتنبيهات الخلفية.':'Location saved for prayer times and background alerts.',
 'تم إيقاف التنبيه الحالي.':'Current alert stopped.','أُرسل تنبيه ويندوز التجريبي. يظهر خارج المتصفح.':'Test alert sent. It appears outside the browser.',
 'بانتظار المواقيت':'Waiting for prayer times','حدّث المواقيت للمتابعة':'Refresh prayer times to continue',
 'نحمّل مواقيت المدينة…':'Loading city prayer times…','تعذّر تحديث الموقع؛ بقي اختيارك السابق.':'Could not update location. Your previous choice was kept.',
 'تسجيلك الخاص':'Your recording','المصدر ↗':'Source ↗','حساب محلي: Adhan JS ↗':'Local calculation: Adhan JS ↗','مقطع تكبير من أذان أحمد النفيس':'Takbir excerpt from Ahmad al-Nafees’s adhan'
 };
 Object.assign(pairs,{'الإعدادات':'Settings','إغلاق الإعدادات':'Close settings','العرض واللغة':'Display and language','اللغة':'Language','حالة الخدمة':'Service status','Language / اللغة':'Language','خدمة المواقيت تعمل، لكن أداة تنبيه ويندوز غير جاهزة.':'Prayer times work, but Windows alerts are not ready.','تعذّر تشغيل أداة التنبيه.':'Could not start the notification helper.','تنبيهات الخلفية غير متاحة حتى تصبح أداة ويندوز جاهزة. يمكنك استخدام المواقيت ومعاينة الأصوات.':'Background alerts are unavailable until the Windows helper is ready. Prayer times and audio previews remain available.','التشغيل مع ويندوز':'Start with Windows','الحرم المكي':'Makkah Grand Mosque','الحرم النبوي':'Prophet’s Mosque','مؤذنون آخرون':'Other muezzins','مدة التنبيه':'Alert duration','متى يتوقف الصوت وتختفي النافذة':'When the sound stops and the alert closes','15 ثانية':'15 seconds','30 ثانية':'30 seconds','دقيقة':'1 minute','حتى نهاية الأذان':'Until the adhan ends','صيغة الوقت':'Time format','12 ساعة':'12-hour','24 ساعة':'24-hour','علي بن أحمد ملا':'Ali ibn Ahmad Mulla','ناصر القطامي':'Nasser Al Qatami','حمد الدغريري':'Hamad Al Daghriri','أحمد النفيس — تسجيل آخر':'Ahmad Al Nafees — another recording','ناجي قزاز':'Naji Qazzaz','المسجد الأقصى':'Al-Aqsa Mosque','الأذان المكي':'Makkah adhan','الأذان المدني':'Madinah adhan','حان الآن وقت الأذان':'It is time for adhan','تنبيه منطوق · صوت مولّد آليًا':'Spoken reminder · AI-generated voice','أذان الحرم المكي — علي أحمد ملا':'Makkah Grand Mosque — Ali Ahmad Mulla','أذان من الحرم المدني':'Adhan from the Prophet’s Mosque','مصادر التسجيلات موضحة بجانب كل صوت':'Recording sources are linked beside each sound'});
 const digits=s=>s.replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
 function translate(s){const trimmed=s.trim();if(language==='ar')return digits(s);let v=pairs[trimmed];if(v===undefined){
  if(trimmed.startsWith('دقة الموقع التقريبية: ')){const match=trimmed.match(/[0-9]+(?:\.[0-9]+)?/);v=match?'Approximate location accuracy: '+match[0]+(trimmed.endsWith('كم')?' km':' m'):'';}
  else if(trimmed.startsWith('المختار: '))v='Selected: '+translate(trimmed.slice(9));
  else if(trimmed.startsWith('الوقت الآن · '))v='Local time · '+translate(trimmed.slice(12));
  else if(trimmed.startsWith('سكينة · مواقيت '))v='Sakinah · '+translate(trimmed.slice(14));
  else if(trimmed.startsWith('قرب '))v='Near '+translate(trimmed.slice(4));
  else if(trimmed.includes(' · السعودية'))v=translate(trimmed.replace(' · السعودية',''))+' · Saudi Arabia';
  else if(trimmed.includes('صحيح البخاري'))v=digits(trimmed).replace('صحيح البخاري','Sahih al-Bukhari').replace('مقتطف من الحديث','Hadith excerpt');
  else if(trimmed.includes('صحيح مسلم'))v=digits(trimmed).replace('صحيح مسلم','Sahih Muslim').replace('مقتطف من الحديث','Hadith excerpt');
  else if(trimmed.startsWith('معاينة '))v='Preview '+translate(trimmed.slice(7));
  else if(trimmed.startsWith('اختيار '))v='Select '+translate(trimmed.slice(7));
  else v=trimmed;
 }return s.replace(trimmed,digits(v));}
 const originals=new WeakMap(),attrs=new WeakMap();
 function paint(){observer.disconnect();if(document.documentElement.lang!==language)document.documentElement.lang=language;const direction=language==='ar'?'rtl':'ltr';if(document.documentElement.dir!==direction)document.documentElement.dir=direction;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=walker.nextNode()){if(['SCRIPT','STYLE'].includes(n.parentElement?.tagName)||n.parentElement?.closest('[data-i18n-ignore]'))continue;const old=originals.get(n);const src=old&&old.output===n.nodeValue?old.source:n.nodeValue;const output=translate(src);originals.set(n,{source:src,output});if(n.nodeValue!==output)n.nodeValue=output;}
  for(const el of document.querySelectorAll('[aria-label],[title]')){if(el.closest('[data-i18n-ignore]'))continue;const saved=attrs.get(el)||{};for(const a of ['aria-label','title'])if(el.hasAttribute(a)){const old=saved[a],value=el.getAttribute(a),source=old?.output===value?old.source:value,output=translate(source);saved[a]={source,output};if(value!==output)el.setAttribute(a,output);}attrs.set(el,saved);}
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});}
 const observer=new MutationObserver(records=>{if(records.some(r=>{const el=r.target.nodeType===1?r.target:r.target.parentElement;return !el?.closest('#clock,#countdown,[data-i18n-ignore]');}))paint();});
 window.SakinahI18n={get language(){return language},translate,set(value){const next=value==='en'?'en':'ar';if(next===language)return;language=next;localStorage.setItem('sakinah-language',language);paint();window.dispatchEvent(new Event('sakinah-language'));}};
 paint();
})();
