const assert=require('node:assert/strict'),fs=require('fs');
const {calculate}=require('./local-times.cjs'),{cities}=require('./regions.cjs'),{due}=require('./background.cjs');
const a=calculate('20-10-2026',cities[0]),b=calculate('20-10-2026',cities.find(c=>c.id==='jeddah'));
assert.equal(a.local,true);assert.notEqual(a.data.timings.Fajr,b.data.timings.Fajr);
assert.equal(due(a.data,new Date(a.data.instants.Fajr),[])[0].key,'Fajr');
const abroad=calculate('20-10-2026',{latitude:51.5,longitude:-.12,timeZone:'Europe/London'});
assert.equal(due(abroad.data,new Date(abroad.data.instants.Dhuhr),[])[0].key,'Dhuhr');
assert.throws(()=>calculate('31-02-2026',cities[0]));
const library=require('./audio-library.json');assert.equal(library.length,16);assert.equal(new Set(library.map(t=>t.id)).size,library.length);for(const id of ['qatami','daghriri','nafees-2','aqsa-qazzaz'])assert.equal(library.find(t=>t.id===id)?.group,'other');assert.equal(library.find(t=>t.id==='makkah')?.source,'إسلام ويب');
for(const id of ['soft','bell','dawn','pulse'])assert.ok(fs.statSync('audio/'+library.find(t=>t.id===id).file).size>1000);
for(const t of library)if(fs.existsSync('audio/'+t.file))assert.ok(fs.statSync('audio/'+t.file).size>1000);
assert.ok(library.filter(t=>t.downloadUrl).every(t=>t.verifiedSource?.startsWith('https://')));
console.log('PASS: offline calculation, timezone-aware alerts, invalid dates, four distributable tones and source provenance');
if(fs.existsSync('node_modules/jsdom')){
 const {JSDOM}=require('jsdom'),dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'http://127.0.0.1:18741',runScripts:'outside-only'});
 dom.window.eval(fs.readFileSync('i18n.js','utf8'));dom.window.SakinahI18n.set('en');
 assert.equal(dom.window.document.documentElement.dir,'ltr');assert.ok(dom.window.document.body.textContent.includes('Make time for peace'));
 dom.window.SakinahI18n.set('ar');assert.equal(dom.window.document.documentElement.dir,'rtl');assert.ok(dom.window.document.body.textContent.includes('على موعدٍ مع السكينة'));
 assert.ok(!/[٠-٩]/.test(dom.window.document.body.textContent));dom.window.close();
 console.log('PASS: Arabic/English switching, reversible translation, RTL/LTR and 0123 digits');
}
