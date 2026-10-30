(() => {
  const $=id=>document.getElementById(id);let TZ='Asia/Riyadh';
  const defs=[['Fajr','الفجر'],['Sunrise','الشروق'],['Dhuhr','الظهر'],['Asr','العصر'],['Maghrib','المغرب'],['Isha','العشاء']];
  const prayers=defs.filter(x=>x[0]!=='Sunrise');
  const digits=x=>String(x).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const dayKey=(date=new Date())=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(x=>[x.type,x.value]));return `${p.day}-${p.month}-${p.year}`;};
  const target=(data,key)=>{if(data.instants?.[key])return new Date(data.instants[key]);const [d,m,y]=data.date.gregorian.date.split('-');return new Date(`${y}-${m}-${d}T${data.timings[key].slice(0,5)}:00+03:00`);};
  let today=null,tomorrow=null,loaded='',loading=false,lastAttempt=0,active='',status=null,statusBusy=false,changing=false;
  let announcedMinute='';
  let catalog=null,currentCity='riyadh',loadVersion=0,previewId='';
  const audio=new Audio();
  async function request(url,options={}){const r=await fetch(url,{...options,signal:AbortSignal.timeout(16000)});if(!r.ok)throw Error('request failed');return r.json();}
  const post=url=>request(url,{method:'POST'});
  let timeFormat='24',clockConfig='';
  function configureClock(){const language=window.SakinahI18n.language,key=TZ+'|'+timeFormat+'|'+language;if(key===clockConfig)return;clockConfig=key;clockFormat=new Intl.DateTimeFormat(language==='ar'?'ar-SA-u-nu-latn':'en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:timeFormat==='12'?'h12':'h23'});active='';if(today)render();}
  const displayTime=value=>window.SakinahCalendar.formatTime(value,timeFormat,window.SakinahI18n.language);
  let clockFormat=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function upcoming(){if(!today || loaded!==dayKey())return null;for(const [key,name] of prayers){const when=target(today,key);if(when>Date.now())return {key,name,when,data:today};}return tomorrow?{key:'Fajr',name:'الفجر',when:target(tomorrow,'Fajr'),data:tomorrow}:null;}
  function render(){
    const next=upcoming();$('prayerList').replaceChildren();
    for(const [key,name] of defs){const row=document.createElement('div'),label=document.createElement('div'),title=document.createElement('span'),note=document.createElement('span'),time=document.createElement('time');
      const current=next?.data===today&&next.key===key;row.className='prayer-row'+(current?' current':'');if(current)row.setAttribute('aria-current','time');title.className='prayer-name';title.textContent=name;label.append(title);
      note.className='prayer-note';note.textContent=current?'القادمة':'';label.append(note);time.className='prayer-time';time.dateTime=today.timings[key].slice(0,5);time.textContent=displayTime(time.dateTime);row.append(label,time);$('prayerList').append(row);
    }
  }
  function tick(){
    $('clock').textContent=clockFormat.format(new Date());const next=upcoming();
    if(!next){$('nextName').textContent='بانتظار المواقيت';$('nextTime').textContent='—';$('countdown').textContent='--:--:--';$('nextHint').textContent='حدّث المواقيت للمتابعة';return;}
    const id=next.when.toISOString()+'|'+clockConfig;if(id!==active){active=id;$('nextName').textContent=next.name;$('nextTime').textContent=displayTime(next.data.timings[next.key].slice(0,5));$('nextHint').textContent=next.data===today?'موعد الصلاة اليوم':'فجر الغد، بإذن الله';render();}
    const diff=Math.max(0,next.when-Date.now()),s=Math.floor(diff/1000);$('countdown').textContent=digits([Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(x=>String(x).padStart(2,'0')).join(':'));
    const minuteKey=Math.ceil(s/60)+'|'+window.SakinahI18n.language;if(minuteKey!==announcedMinute){announcedMinute=minuteKey;const m=Math.ceil(s/60);$('countdownAnnounce').textContent=window.SakinahI18n.language==='en'?m+' minutes until prayer':'متبقي على الصلاة '+m+' دقيقة';}
    const prev=next.key==='Fajr'?new Date(target(today,'Isha').getTime()-(next.data===today?86400000:0)):target(today,prayers[prayers.findIndex(x=>x[0]===next.key)-1][0]);
    $('countdownRing').style.setProperty('--progress',Math.max(0,Math.min(100,100-diff/Math.max(1,next.when-prev)*100))+'%');
    
  }
  async function load(){if(loading)return;loading=true;const version=loadVersion;lastAttempt=Date.now();$('refreshButton').disabled=true;try{
    const key=dayKey(),city=currentCity;const [a,b]=await Promise.all([request('/api/timings/'+key+'?city='+city),request('/api/timings/'+dayKey(new Date(Date.now()+86400000))+'?city='+city).catch(()=>null)]);if(version!==loadVersion)return;today=a.data;tomorrow=b?.data||null;loaded=key;
    $('connection').textContent='المواقيت محسوبة على جهازك';$('dateLine').textContent=new Intl.DateTimeFormat(window.SakinahI18n.language==='en'?'en-GB':'ar-SA-u-ca-gregory-nu-latn',{timeZone:TZ,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
    const h=today.date.hijri;$('hijriLine').textContent=window.SakinahI18n.language==='en'?new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{timeZone:TZ,day:'numeric',month:'long',year:'numeric'}).format(new Date()):`${digits(h.day)} ${h.month.ar} ${digits(h.year)} هـ`;render();tick();
  }catch{if(version!==loadVersion)return;today=null;tomorrow=null;active='';$('connection').textContent='لا توجد مواقيت متاحة لهذا اليوم';$('prayerList').innerHTML='<p class="loading error">تعذّر حساب المواقيت. اضغط تحديث أو اختر موقعك مجددًا.</p>';tick();}finally{loading=false;$('refreshButton').disabled=false;if(version!==loadVersion)load();}}
  async function refreshStatus(){if(statusBusy||changing)return;statusBusy=true;try{
    status=await request('/api/status');$('alertDuration').value=status.settings.alertDuration||'15';$('startupButton').setAttribute('aria-checked',String(status.startup));timeFormat=status.settings.timeFormat||'24';$('timeFormat').value=timeFormat;window.SakinahI18n.set(status.settings.language||'ar');$('languageSelect').value=status.settings.language||'ar';$('locationMode').textContent=status.settings.locationMode==='auto'?'تلقائي: موقع الجهاز':'يدوي: المدينة المختارة';$('deviceLocationState').textContent=status.locating?'جارٍ تحديد الموقع…':status.locationError||(status.location?.device?window.SakinahLocation.accuracy(status.location.accuracy):'');if(catalog){syncLocation();syncSounds();}configureClock();window.SakinahCalendarUI.update(TZ);$('alertButton').setAttribute('aria-checked',String(status.settings.enabled));$('soundButton').setAttribute('aria-checked',String(status.settings.sound));$('alertButton').disabled=false;$('soundButton').disabled=false;
    $('serviceBadge').textContent=!status.nativeReady?'غير جاهز':status.lastError?'خطأ في التنبيه':status.settings.enabled?'يعمل':'متوقف مؤقتًا';
    $('startupState').textContent=status.startup?'يبدأ تلقائيًا عند تسجيل الدخول':'التشغيل التلقائي غير مثبّت';
    $('alertState').textContent=status.lastError||(!status.nativeReady?status.nativeError||'أداة التنبيه غير متاحة':status.settings.enabled?'التنبيهات تعمل حتى بعد إغلاق النافذة.':'التنبيهات متوقفة حتى تعيد تفعيلها.');
    $('backgroundDescription').textContent=status.nativeReady?'أغلق النافذة وواصل يومك. نذكّرك عند دخول وقت الصلاة.':'خدمة المواقيت تعمل، لكن أداة تنبيه ويندوز غير جاهزة.';
    $('backgroundFooter').textContent=status.nativeReady?'يمكن إغلاق النافذة؛ التنبيهات تستمر ما دام الجهاز يعمل وحسابك مسجّلًا.':'تنبيهات الخلفية غير متاحة حتى تصبح أداة ويندوز جاهزة. يمكنك استخدام المواقيت ومعاينة الأصوات.';
    $('audioRow').hidden=!status.audio;if(status.audio)$('audioName').textContent=status.audio.name;
  }catch{$('serviceBadge').textContent='غير متصل';$('alertState').textContent='تعذّر الاتصال بخدمة الخلفية. أعد فتح سكينة.';$('alertButton').disabled=true;$('soundButton').disabled=true;}finally{statusBusy=false;}}
  async function toggle(field,button){if(!status||changing)return;changing=true;button.disabled=true;try{await post('/api/settings?'+field+'='+!status.settings[field]);}catch{$('alertState').textContent='تعذّر حفظ الإعداد. حاول مجددًا.';}finally{changing=false;button.disabled=false;}await refreshStatus();}
  $('alertButton').onclick=()=>toggle('enabled',$('alertButton'));$('soundButton').onclick=()=>toggle('sound',$('soundButton'));
  $('testSound').onclick=async()=>{const b=$('testSound');b.disabled=true;try{await post('/api/test-alert');$('alertState').textContent='أُرسل تنبيه ويندوز التجريبي. يظهر خارج المتصفح.';}catch{$('alertState').textContent='تعذّر تشغيل التنبيه.';}finally{b.disabled=false;}};
  $('stopSound').onclick=async()=>{audio.pause();try{await post('/api/stop-audio');$('alertState').textContent='تم إيقاف التنبيه الحالي.';}catch{$('alertState').textContent='تعذّر إيقاف تنبيه الخلفية.';}};
  $('adhanFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;const ext=f.name.split('.').pop().toLowerCase();if(!['mp3','wav'].includes(ext)||f.size>20*1024*1024){$('audioNote').textContent='اختر ملف MP3 أو WAV أصغر من ٢٠ ميغابايت.';return;}
    e.target.disabled=true;try{await request('/api/audio?ext='+ext+'&name='+encodeURIComponent(f.name),{method:'POST',body:f});$('audioNote').textContent='حُفظ التسجيل على الجهاز؛ سيُستخدم أيضًا بعد إغلاق النافذة.';await refreshStatus();}catch{$('audioNote').textContent='تعذّر حفظ التسجيل. تحقق من صيغته وحاول مجددًا.';}finally{e.target.disabled=false;e.target.value='';}};
  $('previewAudio').onclick=()=>{audio.src='/api/audio?preview='+Date.now();audio.play().catch(()=>$('audioNote').textContent='تعذّرت معاينة الصوت. جرّب ملفًا آخر.');};
  $('clearAudio').onclick=async()=>{audio.pause();try{await post('/api/audio?clear=true');await refreshStatus();$('audioNote').textContent='تمت إزالة التسجيل. سيُستخدم صوت نسيم.';}catch{$('audioNote').textContent='تعذّرت إزالة التسجيل.';}};
  $('refreshButton').onclick=load;
  const readings=[
    {text:'وَالصَّلَاةُ نُورٌ',source:'صحيح مسلم · ٢٢٣',url:'https://sunnah.com/muslim:223',note:'اجعل للصلاة مساحة هادئة في يومك؛ دع ما يشغلك، وأقبل بقلب حاضر.'},
    {text:'وَأَنَّ أَحَبَّ الأَعْمَالِ أَدْوَمُهَا إِلَى اللَّهِ، وَإِنْ قَلَّ',source:'صحيح البخاري · ٦٤٦٤',url:'https://sunnah.com/bukhari:6464',note:'اختر عملًا صالحًا يسيرًا تستطيع المداومة عليه. دقائق ثابتة للذكر والقراءة خير من خطة تؤجلها كل يوم.'},
    {text:'الصَّلَاةُ عَلَى وَقْتِهَا',source:'صحيح البخاري · ٥٢٧',url:'https://sunnah.com/bukhari:527',note:'استعد للصلاة قبل انشغالك التالي. رتّب وقتك حولها، واترك لنفسك فسحة للوضوء والطمأنينة.'}
  ];
  let readingIndex=Math.floor((Date.now()+10800000)/86400000)%readings.length;
  function reading(){const r=readings[readingIndex];$('hadithText').textContent='«'+r.text+'»';$('hadithSource').textContent=r.source+' · مقتطف من الحديث ↗';$('hadithSource').href=r.url;$('reflectionText').textContent=r.note;}
  $('nextReflection').onclick=()=>{readingIndex=(readingIndex+1)%readings.length;reading();};reading();
  const clockTimer=setInterval(()=>{if(document.hidden)return;tick();if((loaded!==dayKey()||!tomorrow)&&Date.now()-lastAttempt>60000)load();},1000);const statusTimer=setInterval(()=>{if(!document.hidden)refreshStatus();},30000);
  $('quitApp').onclick=async()=>{if(!confirm(window.SakinahI18n.language==='en'?'Quitting stops prayer alerts until Sakinah starts again. Continue?':'إنهاء الخدمة سيوقف تنبيهات الصلاة حتى تفتح سكينة مجددًا أو تسجّل الدخول. هل تريد المتابعة؟'))return;try{await post('/quit');audio.pause();clearInterval(clockTimer);clearInterval(statusTimer);document.body.innerHTML='<main class="shell"><h1>تم إنهاء سكينة</h1><p>التنبيهات متوقفة. يمكنك فتح التطبيق مجددًا من الاختصار.</p></main>';}catch{$('alertState').textContent='تعذّر إنهاء الخدمة.';}};
  
  function cityOptions(region,selected){$('citySelect').replaceChildren(...catalog.cities.filter(c=>c.region===region).map(c=>new Option(c.name,c.id,false,c.id===selected)));}
  function syncLocation(){const c=status.location;if(!c)return;const tz=c.timeZone||'Asia/Riyadh';if(TZ!==tz){TZ=tz;configureClock();}$('cityLabel').textContent=c.name+(c.device?'':' · السعودية');$('clockCaption').textContent='الوقت الآن · '+c.name;$('footerPlace').textContent='سكينة · مواقيت '+c.name;
    if(currentCity!==c.id||(!c.device&&!$('regionSelect').value)){currentCity=c.id;$('regionSelect').value=c.region;cityOptions(c.region,c.id);loadVersion++;today=null;tomorrow=null;loaded='';active='';$('prayerList').textContent='جارٍ تحميل مواقيت '+c.name;tick();if(!loading)load();}}
  $('regionSelect').onchange=()=>cityOptions($('regionSelect').value);
  $('applyLocation').onclick=async()=>{const b=$('applyLocation');b.disabled=true;changing=true;$('locationState').textContent='نحمّل مواقيت المدينة…';try{await post('/api/location?city='+encodeURIComponent($('citySelect').value));changing=false;await refreshStatus();$('locationState').textContent='حُفظ الموقع للمواقيت وتنبيهات الخلفية.';$('locationPicker').open=false;}catch{$('locationState').textContent='تعذّر تحديث الموقع؛ بقي اختيارك السابق.';}finally{changing=false;b.disabled=false;}};
  function syncSounds(){const selected=status.settings.soundId;const track=catalog.library.find(t=>t.id===selected);$('chosenSound').textContent='المختار: '+(track?.name||'تسجيلك الخاص');document.querySelectorAll('[data-sound]').forEach(b=>{const chosen=b.dataset.sound===selected;b.setAttribute('aria-pressed',String(chosen));b.textContent=chosen?'✓ الصوت المختار':'اختيار';});}
  async function selectSound(id){try{await post('/api/sound?id='+id);await refreshStatus();$('libraryState').textContent='تم حفظ صوت التنبيه.';}catch{$('libraryState').textContent='تعذّر حفظ الصوت. حاول مجددًا.';}}
  function stopPreview(){audio.pause();previewId='';document.querySelectorAll('[data-preview]').forEach(b=>b.textContent='استمع');}
  audio.onended=stopPreview;
  function renderLibrary(){for(const t of catalog.library){const card=document.createElement('article');card.className='sound-card';const name=document.createElement('h4');name.textContent=t.name;const note=document.createElement('p');note.textContent=t.description;const row=document.createElement('div');row.className='button-row';const preview=document.createElement('button');preview.className='secondary-button';preview.dataset.preview=t.id;preview.textContent='استمع';preview.setAttribute('aria-label','معاينة '+t.name);preview.onclick=async()=>{const was=previewId===t.id;stopPreview();if(was)return;previewId=t.id;preview.textContent='إيقاف';audio.src='/audio/'+t.file;try{await audio.play();}catch{stopPreview();$('libraryState').textContent='تعذّر تشغيل المعاينة.';}};const choose=document.createElement('button');choose.className='secondary-button';choose.dataset.sound=t.id;choose.setAttribute('aria-label','اختيار '+t.name);choose.onclick=()=>selectSound(t.id);choose.disabled=preview.disabled=!t.available;row.append(preview,choose);card.append(name,note,row);if(t.sourceUrl){const source=document.createElement('a');source.className='source';source.href=t.sourceUrl;source.target='_blank';source.rel='noreferrer';source.textContent='المصدر ↗';card.append(source);}$(t.kind==='tone'?'toneLibrary':(t.group==='makkah'?'makkahLibrary':t.group==='nabawi'?'nabawiLibrary':'otherLibrary')).append(card);}}
  $('selectCustom').onclick=()=>selectSound('custom');
  $('stopSound').addEventListener('click',stopPreview);
  async function init(){try{catalog=await request('/api/catalog');$('regionSelect').replaceChildren(new Option('اختر المنطقة',''),...[...new Set(catalog.cities.map(c=>c.region))].map(r=>new Option(r,r)));renderLibrary();await refreshStatus();if(!today&&!loading)load();}catch{$('locationState').textContent='تعذّر الاتصال. أعد فتح التطبيق.';}}
  $('deviceLocation').onclick=async()=>{const b=$('deviceLocation');b.disabled=true;$('deviceLocationState').textContent='جارٍ تحديد الموقع…';try{await post('/api/location?mode=auto');await refreshStatus();}catch{$('deviceLocationState').textContent='تعذّر تحديد موقع الجهاز. فعّل خدمة الموقع في ويندوز، أو اختر مدينتك يدويًا.';}finally{b.disabled=false;}};
  $('languageSelect').onchange=async e=>{try{await post('/api/settings?language='+e.target.value);window.SakinahI18n.set(e.target.value);configureClock();if(today)load();}catch{await refreshStatus();}};
  const panel=$('settingsPanel');$('openSettings').onclick=()=>{panel.showModal();$('closeSettings').focus();};$('closeSettings').onclick=()=>panel.close();panel.addEventListener('close',()=>{$('openSettings').focus();stopPreview();});panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}});
  $('startupButton').onclick=async()=>{const b=$('startupButton');b.disabled=true;try{await post('/api/startup?enabled='+!status.startup);await refreshStatus();}catch{$('alertState').textContent='تعذّر حفظ الإعداد. حاول مجددًا.';}finally{b.disabled=false;}};
  $('alertDuration').onchange=async e=>{try{await post('/api/settings?alertDuration='+e.target.value);}catch{await refreshStatus();}};
  $('timeFormat').onchange=async e=>{try{await post('/api/settings?timeFormat='+e.target.value);timeFormat=e.target.value;configureClock();tick();}catch{await refreshStatus();}};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshStatus();tick();}else stopPreview();});
  document.addEventListener('pointerdown',e=>{if(!$('locationPicker').contains(e.target))$('locationPicker').open=false;});document.addEventListener('keydown',e=>{if(e.key==='Escape')$('locationPicker').open=false;});
  window.addEventListener('online',load);tick();init();
})();


