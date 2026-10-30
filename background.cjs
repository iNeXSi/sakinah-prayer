const PRAYERS=[['Fajr','الفجر'],['Dhuhr','الظهر'],['Asr','العصر'],['Maghrib','المغرب'],['Isha','العشاء']];
function datePath(now=new Date(),timeZone='Asia/Riyadh') { const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone,day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(now).map(x=>[x.type,x.value]));return `${p.day}-${p.month}-${p.year}`; }
function due(data,now,sent){
  if(data.date.gregorian.date!==datePath(now,data.timeZone)) return [];
  const [d,m,y]=data.date.gregorian.date.split('-');
  return PRAYERS.map(([key,name])=>({key,name,time:data.timings[key].slice(0,5),token:`${y}-${m}-${d}:${key}`,when:new Date(data.instants?.[key]||`${y}-${m}-${d}T${data.timings[key].slice(0,5)}:00+03:00`)})).filter(x=>now-x.when>=0 && now-x.when<=300000 && !sent.includes(x.token));
}
async function deliverOnce(item,sent,save,notify){
  if(sent.includes(item.token))return;
  const next=sent.filter(x=>x.slice(0,10)===item.token.slice(0,10));
  next.push(item.token);
  save(next); // Persist before any window/audio side effect, including across restarts.
  sent.splice(0,sent.length,...next);
  await notify(item);
}
module.exports={due,datePath,deliverOnce};
