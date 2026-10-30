const {Coordinates,CalculationMethod,PrayerTimes}=require('adhan');
function calculate(date,location){
 const [d,m,y]=date.split('-').map(Number),when=new Date(y,m-1,d,12);
 if(when.getFullYear()!==y||when.getMonth()!==m-1||when.getDate()!==d)throw Error('Invalid date');
 const zone=location.timeZone||'Asia/Riyadh';
 const hijri=new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn',{timeZone:zone,day:'numeric',month:'long',year:'numeric'}).formatToParts(when);
 const part=k=>hijri.find(x=>x.type===k)?.value;
 const params=CalculationMethod.UmmAlQura();
 const month=Number(new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{month:'numeric'}).format(when));
 if(month===9)params.ishaInterval=120;
 const p=new PrayerTimes(new Coordinates(location.latitude,location.longitude),when,params);
 const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const timings={},instants={};
 for(const key of ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha']){const value=p[key.toLowerCase()];if(!Number.isFinite(value.getTime()))throw Error('Unavailable solar timings');timings[key]=fmt.format(value);instants[key]=value.toISOString();}
 return {code:200,cached:true,local:true,location,data:{timeZone:zone,timings,instants,date:{gregorian:{date},hijri:{day:part('day'),year:part('year'),month:{ar:part('month')}}}}};
}
module.exports={calculate};
