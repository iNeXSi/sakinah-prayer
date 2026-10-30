const {test}=require('node:test'),assert=require('node:assert/strict');const {due,datePath}=require('./background.cjs');
const data={date:{gregorian:{date:'17-10-2026'}},timings:{Fajr:'04:34',Sunrise:'05:52',Dhuhr:'11:39',Asr:'14:58',Maghrib:'17:25',Isha:'18:55'}};
test('Riyadh date changes at UTC 21:00',()=>{assert.equal(datePath(new Date('2026-10-16T21:00:00Z')),'17-10-2026');});
test('notifies at prayer time with no browser involved',()=>{assert.equal(due(data,new Date('2026-10-17T04:34:00+03:00'),[])[0].key,'Fajr');});
test('never alerts before time',()=>assert.equal(due(data,new Date('2026-10-17T04:33:59+03:00'),[]).length,0));
test('persistent sent token prevents duplicates after restart',()=>assert.equal(due(data,new Date('2026-10-17T04:34:10+03:00'),['2026-10-17:Fajr']).length,0));
test('waking within five minutes delivers missed alert',()=>assert.equal(due(data,new Date('2026-10-17T04:38:59+03:00'),[]).length,1));
test('does not deliver old prayer hours after waking',()=>assert.equal(due(data,new Date('2026-10-17T07:00:00+03:00'),[]).length,0));
test('sunrise never alerts',()=>assert.equal(due(data,new Date('2026-10-17T05:52:00+03:00'),[]).length,0));
test('stale dates cannot trigger prayer alerts',()=>assert.equal(due(data,new Date('2026-10-18T04:34:00+03:00'),[]).length,0));
test('Isha alerts independently from morning sent tokens',()=>assert.equal(due(data,new Date('2026-10-17T18:55:00+03:00'),['2026-10-17:Fajr'])[0].key,'Isha'));
test('failed audio delivery is persisted before notify and never retried',async()=>{
 const {deliverOnce}=require('./background.cjs');let persisted=[],sent=[],calls=0;
 for(let i=0;i<21;i++){
  for(const item of due(data,new Date(new Date('2026-10-17T04:34:00+03:00').getTime()+i*15000),sent)){
   await assert.rejects(deliverOnce(item,sent,value=>{persisted=[...value];},()=>{
    calls++;assert.ok(persisted.includes(item.token));throw Error('audio failed');
   }),/audio failed/);
  }
  sent=[...persisted]; // Simulates reloading state after a restart as well.
 }
 assert.equal(calls,1);assert.deepEqual(persisted,['2026-10-17:Fajr']);
});
