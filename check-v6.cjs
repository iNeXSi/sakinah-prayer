const assert=require('node:assert/strict'),fs=require('node:fs'),cal=require('./calendar.js');
assert.equal(cal.formatTime('00:05','12','ar'),'12:05 ص');
assert.equal(cal.formatTime('12:05','12','ar'),'12:05 م');
assert.equal(cal.formatTime('23:05','12','en'),'11:05 PM');
assert.equal(cal.formatTime('23:05','24'),'23:05');
const today=cal.civilDay(new Date('2026-10-20T23:30:00Z'),'Asia/Riyadh');
assert.equal(new Date(today).toISOString().slice(0,10),'2026-10-21');
for(let offset=-24;offset<=24;offset++){
 const month=cal.month(today,offset),next=cal.month(today,offset+1);
 assert.ok([29,30].includes(month.days.length));
 assert.equal(month.days.at(-1).date+86400000,next.start);
 assert.equal(cal.parts(next.start).day,1);
 assert.equal(month.days.filter(d=>d.today).length,offset===0?1:0);
}
const events=cal.upcoming(today);assert.equal(events.length,6);
assert.ok(events.every((e,i)=>e.remaining>=0&&(!i||e.remaining>=events[i-1].remaining)));
for(const event of events){
 assert.equal(cal.parts(event.date).month,event.month);assert.equal(cal.parts(event.date).day,event.day);
 assert.equal(cal.upcoming(event.date).find(e=>e.ar===event.ar).remaining,0);
 assert.ok(cal.upcoming(event.date+86400000).find(e=>e.ar===event.ar).remaining>300);
}
const library=require('./audio-library.json');
assert.ok(!library.some(t=>['zahrani','ozcan'].includes(t.id)));
for(const id of ['makkah','madinah','nafees','adhan-now']){const t=library.find(t=>t.id===id);assert.ok(t,id);if(fs.existsSync('audio/'+t.file))assert.ok(fs.statSync('audio/'+t.file).size>1000);}
const {JSDOM}=require('jsdom'),dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'http://127.0.0.1:18741',runScripts:'outside-only'});
for(const file of ['i18n.js','calendar.js','calendar-ui.js'])dom.window.eval(fs.readFileSync(file,'utf8'));
const doc=dom.window.document;assert.equal(doc.querySelectorAll('.occasion-row').length,6);
assert.equal(doc.querySelectorAll('[aria-current=date]').length,1);
doc.getElementById('calendarNext').click();assert.equal(doc.querySelectorAll('[aria-current=date]').length,0);
doc.getElementById('calendarToday').click();assert.equal(doc.querySelectorAll('[aria-current=date]').length,1);
dom.window.SakinahI18n.set('en');assert.equal(doc.getElementById('calendarHeading').textContent,'Hijri calendar');
assert.ok(doc.getElementById('occasionList').textContent.includes('Ramadan'));
dom.window.SakinahI18n.set('ar');assert.equal(doc.getElementById('calendarHeading').textContent,'التقويم الهجري');
dom.window.close();
console.log('PASS: 12/24-hour edge cases, timezone date, 49 Hijri months, six occasion rollovers, library corrections, calendar navigation and both languages');

const {validateDuration,durationMs}=require('./alert-policy.cjs');for(const value of ['15','30','60','full'])assert.equal(validateDuration(value),value);for(const value of ['',null,15,'10','0','Full','360','15x'])assert.throws(()=>validateDuration(value));assert.equal(durationMs('full'),360000);assert.equal(durationMs('full','failed'),15000);assert.equal(durationMs('60','silent'),15000);assert.equal(durationMs('30'),30000);console.log('PASS: alert duration validation and silent/failure deadlines');

assert.deepEqual([1,2,3,11,100].map(cal.remainingDays),['يوم واحد','يومان','3 أيام','11 يومًا','100 يوم']);const loc=require('./location-utils.js');assert.equal(loc.accuracy(NaN),'');assert.equal(loc.accuracy(500),'دقة الموقع التقريبية: 500 م');assert.equal(loc.accuracy(1500),'دقة الموقع التقريبية: 1.5 كم');assert.ok(loc.distance({latitude:24,longitude:46},{latitude:24.001,longitude:46})<1000);assert.ok(loc.distance({latitude:24,longitude:46},{latitude:24.02,longitude:46})>1000);
