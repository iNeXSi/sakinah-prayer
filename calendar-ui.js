(() => {
  const $=id=>document.getElementById(id),cal=window.SakinahCalendar;
  let zone='Asia/Riyadh',offset=0,last='',today,events=[];
  function render(force=false){
    const current=cal.civilDay(new Date(),zone),lang=window.SakinahI18n.language,key=current+'|'+lang+'|'+offset;
    if(!force&&key===last)return;last=key;
    if(today!==current){today=current;events=cal.upcoming(today);}
    const en=lang==='en',locale=en?'en-GB':'ar-SA-u-nu-latn',view=cal.month(today,offset);
    $('calendarHeading').textContent=en?'Hijri calendar':'التقويم الهجري';
    $('calendarMonth').textContent=new Intl.DateTimeFormat(locale,{calendar:'islamic-umalqura',numberingSystem:'latn',timeZone:'UTC',month:'long',year:'numeric'}).format(view.start);
    $('calendarToday').textContent=en?'Today':'اليوم';
    $('calendarPrev').setAttribute('aria-label',en?'Previous month':'الشهر السابق');
    $('calendarNext').setAttribute('aria-label',en?'Next month':'الشهر التالي');
    $('calendarPrev').disabled=offset<=-24;$('calendarNext').disabled=offset>=24;
    const weekdays=en?['Sun','Mon','Tue','Wed','Thu','Fri','Sat']:['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
    $('calendarGrid').replaceChildren();
    for(const name of weekdays){const el=document.createElement('span');el.className='weekday';el.textContent=name;$('calendarGrid').append(el);}
    for(let i=0;i<view.weekday;i++)$('calendarGrid').append(document.createElement('span'));
    for(const item of view.days){
      const cell=document.createElement('span');cell.className='calendar-day'+(item.today?' is-today':'');
      cell.textContent=item.day;cell.title=new Intl.DateTimeFormat(locale,{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(item.date);
      if(item.today)cell.setAttribute('aria-current','date');
      $('calendarGrid').append(cell);
    }
    $('occasionsHeading').textContent=en?'Days to look forward to':'مناسبات نترقبها';
    $('occasionList').replaceChildren();
    for(const event of events){
      const row=document.createElement('div');row.className='occasion-row';
      const info=document.createElement('div'),name=document.createElement('strong'),date=document.createElement('small'),count=document.createElement('span');
      name.textContent=en?event.en:event.ar;
      date.textContent=new Intl.DateTimeFormat(locale,{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'}).format(event.date);
      count.className='occasion-count';count.textContent=event.remaining===0?(en?'Today':'اليوم'):(en?`${event.remaining} days left`:`باقي ${cal.remainingDays(event.remaining)}`);
      info.append(name,date);row.append(info,count);$('occasionList').append(row);
    }
    $('calendarNote').textContent=en?'Umm al-Qura calendar · Dates are estimates; Ramadan and Eid follow the official moon-sighting announcement.':'حسب تقويم أم القرى · المواعيد تقديرية، وبداية رمضان والعيد وفق الإعلان الرسمي لرؤية الهلال.';
  }
  $('calendarPrev').onclick=()=>{offset--;render();};
  $('calendarNext').onclick=()=>{offset++;render();};
  $('calendarToday').onclick=()=>{offset=0;render();};
  window.SakinahCalendarUI={update(timeZone){zone=timeZone;render();}};
  window.addEventListener('sakinah-language',()=>render(true));
  render();
})();
