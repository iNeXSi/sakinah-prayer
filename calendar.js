(function(root){
  'use strict';
  const DAY=86400000;
  const hijri=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
  const parts=date=>Object.fromEntries(hijri.formatToParts(new Date(date)).filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,Number(p.value)]));
  function civilDay(now=new Date(),zone='Asia/Riyadh'){
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now).map(x=>[x.type,x.value]));
    return Date.UTC(+p.year,+p.month-1,+p.day,12);
  }
  function month(today,offset=0){
    let start=today-(parts(today).day-1)*DAY;
    for(let n=0;n<Math.abs(offset);n++){
      if(offset<0){const previous=start-DAY;start=previous-(parts(previous).day-1)*DAY;}
      else {let next=start+29*DAY;if(parts(next).day!==1)next+=DAY;start=next;}
    }
    const p=parts(start),days=[];
    for(let n=0;n<30;n++){const date=start+n*DAY,h=parts(date);if(h.month!==p.month)break;days.push({date,day:h.day,today:date===today});}
    return {start,year:p.year,month:p.month,weekday:new Date(start).getUTCDay(),days};
  }
  const occasions=[
    {month:9,day:1,ar:'رمضان',en:'Ramadan'},
    {month:10,day:1,ar:'عيد الفطر',en:'Eid al-Fitr'},
    {month:12,day:9,ar:'يوم عرفة',en:'Day of Arafah'},
    {month:12,day:10,ar:'عيد الأضحى',en:'Eid al-Adha'},
    {month:1,day:1,ar:'بداية السنة الهجرية',en:'Hijri New Year'},
    {month:1,day:10,ar:'عاشوراء',en:'Ashura'}
  ];
  function upcoming(today){
    const found=[];
    for(let n=0;n<=385&&found.length<occasions.length;n++){
      const date=today+n*DAY,p=parts(date);
      for(const event of occasions)if(p.month===event.month&&p.day===event.day&&!found.some(x=>x.ar===event.ar))found.push({...event,date,remaining:n,year:p.year});
    }
    return found;
  }
  function formatTime(value,mode='24',language='ar'){
    const [h,m]=value.split(':').map(Number);
    if(mode==='24')return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    return `${h%12||12}:${String(m).padStart(2,'0')} ${language==='ar'?(h<12?'ص':'م'):(h<12?'AM':'PM')}`;
  }
  const plurals=new Intl.PluralRules('ar');function remainingDays(n){const form=plurals.select(n);return n===0?'اليوم':form==='one'?'يوم واحد':form==='two'?'يومان':form==='few'?n+' أيام':form==='many'?n+' يومًا':n+' يوم';}
  const api={parts,civilDay,month,upcoming,formatTime,remainingDays};
  if(typeof module!=='undefined')module.exports=api;else root.SakinahCalendar=api;
})(typeof window!=='undefined'?window:globalThis);
