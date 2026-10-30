const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {due,datePath,deliverOnce}=require('./background.cjs');
const {cities,cityById}=require('./regions.cjs');
const {calculate}=require('./local-times.cjs');
const {formatTime}=require('./calendar.js');
const dayCache=new Map();
const locate=require('./location-provider.cjs');
const {distance}=require('./location-utils.js');
const cityName=c=>settings.language==='en'?(c.nameEn||(c.name.startsWith('قرب ')?'Near '+(cities.find(x=>x.name===c.name.slice(4))?.nameEn||'device location'):'Device location')):c.name;
const library=require('./audio-library.json');
const {validateDuration}=require('./alert-policy.cjs');
const desktop=process.versions.electron?require('./desktop-bridge.cjs'):null;
const ROOT = __dirname, PORT = 18741, HOST = '127.0.0.1';
const {dataDir:cacheDir,appendLog}=require('./storage.cjs');
fs.mkdirSync(cacheDir, {recursive:true});
const read=(name,fallback)=>{try{return JSON.parse(fs.readFileSync(path.join(cacheDir,name),'utf8'));}catch{return fallback;}};
const write=(name,value)=>{const f=path.join(cacheDir,name);fs.writeFileSync(f+'.tmp',JSON.stringify(value));fs.renameSync(f+'.tmp',f);};
let settings={enabled:true,sound:true,language:'ar',timeFormat:'24',alertDuration:'15',locationMode:'auto',city:'riyadh',soundId:read('audio.json',null)?'custom':'soft',...read('settings.json',{})};
const resolveCity=id=>id===settings.deviceLocation?.id?settings.deviceLocation:cityById(id);
if(!resolveCity(settings.city))settings.city='riyadh';
if(settings.soundId==='custom'){
 const custom=read('audio.json',null);
 if(!custom||!fs.existsSync(path.join(cacheDir,'adhan.'+custom.ext)))settings.soundId='soft';
}else if(!library.some(t=>t.id===settings.soundId&&fs.existsSync(path.join(ROOT,'audio',t.file))))settings.soundId='soft';
const currentDate=(now=new Date())=>datePath(now,resolveCity(settings.city)?.timeZone||'Asia/Riyadh');
let locationError=null,locating=false;
async function updateDevice(){if(locating)return;locating=true;try{const p=await locate();if(settings.locationMode!=='auto')return;const previous=resolveCity(settings.city);if(previous?.device&&distance(previous,p)<=1000){settings.deviceLocation={...previous,accuracy:p.accuracy,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone};write('settings.json',settings);locationError=null;check();return;}const nearest=[...cities].sort((a,b)=>Math.hypot(a.latitude-p.latitude,a.longitude-p.longitude)-Math.hypot(b.latitude-p.latitude,b.longitude-p.longitude))[0];const near=Math.hypot(nearest.latitude-p.latitude,nearest.longitude-p.longitude)<1;const latitude=Number(p.latitude.toFixed(3)),longitude=Number(p.longitude.toFixed(3));const loc={id:'device-'+latitude+'-'+longitude,name:near?'قرب '+nearest.name:'موقع الجهاز',nameEn:near?'Near '+nearest.nameEn:'Device location',region:near?nearest.region:'',latitude,longitude,accuracy:p.accuracy,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,device:true};calculate(currentDate(),loc);settings.deviceLocation=loc;settings.city=loc.id;write('settings.json',settings);locationError=null;check();}catch{locationError='تعذّر تحديد موقع الجهاز. فعّل خدمة الموقع في ويندوز، أو اختر مدينتك يدويًا.';}finally{locating=false;}}

function selectedAudio(){if(settings.soundId==='custom'){const a=read('audio.json',null);const file=a?path.join(cacheDir,'adhan.'+a.ext):'';return file&&fs.existsSync(file)?file:path.join(ROOT,'audio','soft.wav');}const track=library.find(t=>t.id===settings.soundId);const file=track?path.join(ROOT,'audio',track.file):'';return file&&fs.existsSync(file)?file:path.join(ROOT,'audio','soft.wav');}
let sent=read('sent.json',[]), lastCheck=null,lastError=null,lastAlert=null,checking=false,tray=null,nativeError=null;
const nativeChildren=new Set();
const startupPath=path.join(process.env.APPDATA||ROOT,'Microsoft','Windows','Start Menu','Programs','Startup','Sakinah Prayer.lnk');
function log(message){appendLog('background.log',`${new Date().toISOString()} ${message}\n`);}
function notify(title,message){return new Promise((resolve,reject)=>{
  const file=selectedAudio();
  if(desktop){desktop.notify({title,message,file,sound:settings.sound,language:settings.language,alertDuration:settings.alertDuration}).then(()=>{lastAlert={title,at:new Date().toISOString()};resolve();},reject);return;}
  let child;try{child=spawn(path.join(ROOT,'Notifier.exe'),[title,message,file,settings.sound?'sound':'silent'],{stdio:'ignore',windowsHide:false});}catch(e){nativeError='منع ويندوز تشغيل أداة التنبيه. تحتاج نسخة موقّعة موثوقة.';reject(e);return;}
  nativeChildren.add(child);child.once('spawn',()=>{lastAlert={title,at:new Date().toISOString()};log('notification launched: '+title);resolve();});child.once('error',reject);child.once('exit',()=>nativeChildren.delete(child));
});}
async function check(){if(checking)return;checking=true;try{
  const selected=settings.city;const payload=await day(currentDate(),selected);if(selected!==settings.city)return;const now=new Date();lastCheck=now.toISOString();lastError=null;
  if(settings.enabled)for(const item of due(payload.data,now,sent)){
    await deliverOnce(item,sent,value=>write('sent.json',value),()=>notify(settings.language==='en'?'Time for '+item.key+' prayer':'حان وقت صلاة '+item.name,`${cityName(resolveCity(selected))} · ${formatTime(item.time,settings.timeFormat,settings.language)}\n${settings.language==='en'?'Come to prayer':'حيّ على الصلاة'}`));
  }
}catch(e){lastError='تعذّر تحديث المواقيت أو تشغيل التنبيه';log(String(e));}finally{checking=false;}}

function stopAlerts(){if(desktop)desktop.stop();for(const c of nativeChildren)c.kill();nativeChildren.clear();}
async function day(date,selected=settings.city){const city=resolveCity(selected);if(!city)throw Error('Invalid city');const key=[date,city.latitude,city.longitude,city.timeZone].join('|');if(!dayCache.has(key)){if(dayCache.size>=16)dayCache.delete(dayCache.keys().next().value);dayCache.set(key,calculate(date,city));}return dayCache.get(key);}
function openApp() {
  const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
  if(edge) spawn(edge,[`--app=http://${HOST}:${PORT}`, '--window-size=1100,900'],{detached:true,stdio:'ignore'}).unref();
}
const server=http.createServer(async(req,res)=>{
  const send=(code,body,type='application/json; charset=utf-8')=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);};
  if(req.headers.host!==`${HOST}:${PORT}`) return send(403,'{}');
  const url=new URL(req.url,`http://${HOST}:${PORT}`);
  if(req.method==='POST' && req.headers.origin!==`http://${HOST}:${PORT}`) return send(403,'{}');
  if(req.method==='POST' && url.pathname==='/quit') {send(200,'{}');stopAlerts();if(tray)tray.kill();setTimeout(()=>desktop?desktop.quit():process.exit(0),200);return;}
  if(req.method==='POST' && url.pathname==='/api/startup'){const enabled=url.searchParams.get('enabled');if(!['true','false'].includes(enabled))return send(400,'{}');if(!desktop?.setStartup)return send(503,'{}');try{return send(200,JSON.stringify({startup:desktop.setStartup(enabled==='true')}));}catch{return send(500,'{}');}}
  if(req.method==='POST' && url.pathname==='/api/test-alert'){try{await notify(settings.language==='en'?'Sakinah test alert':'اختبار تنبيه سكينة',settings.language==='en'?'This alert works independently of the app window.':'هذا تنبيه مستقل عن نافذة التطبيق.');return send(200,'{}');}catch{return send(500,'{}');}}
  if(req.method==='POST' && url.pathname==='/api/stop-audio'){stopAlerts();return send(200,'{}');}
  if(req.method==='POST' && url.pathname==='/api/location'){
    if(url.searchParams.get('mode')==='auto'){settings.locationMode='auto';write('settings.json',settings);await updateDevice();return send(200,JSON.stringify({error:locationError,location:resolveCity(settings.city)}));}
    const city=url.searchParams.get('city');if(!cityById(city))return send(400,'{}');
    try{await day(datePath(),city);settings.city=city;settings.locationMode='manual';locationError=null;write('settings.json',settings);lastCheck=null;lastError=null;check();return send(200,JSON.stringify({location:cityById(city)}));}catch{return send(503,JSON.stringify({error:'تعذّر جلب مواقيت المدينة؛ احتُفظ باختيارك السابق.'}));}
  }
  if(req.method==='POST' && url.pathname==='/api/sound'){
    const id=url.searchParams.get('id');const track=library.find(t=>t.id===id);if(id==='custom'?!read('audio.json',null):!track||!fs.existsSync(path.join(ROOT,'audio',track.file)))return send(400,'{}');
    settings.soundId=id;write('settings.json',settings);return send(200,JSON.stringify({soundId:id}));
  }
  if(req.method==='POST' && url.pathname==='/api/settings'){
    const alertDuration=url.searchParams.get('alertDuration');try{if(alertDuration!==null)validateDuration(alertDuration);}catch{return send(400,'{}');}
    const timeFormat=url.searchParams.get('timeFormat');if(timeFormat!==null&&!['12','24'].includes(timeFormat))return send(400,'{}');if(timeFormat!==null)settings.timeFormat=timeFormat;
    const language=url.searchParams.get('language');if(language!==null){if(!['ar','en'].includes(language))return send(400,'{}');settings.language=language;}
    const enabled=url.searchParams.get('enabled'),sound=url.searchParams.get('sound');
    if(enabled!==null && !['true','false'].includes(enabled) || sound!==null && !['true','false'].includes(sound))return send(400,'{}');
    if(alertDuration!==null)settings.alertDuration=alertDuration;if(enabled!==null)settings.enabled=enabled==='true';if(sound!==null)settings.sound=sound==='true';write('settings.json',settings);return send(200,JSON.stringify(settings));
  }
  if(req.method==='POST' && url.pathname==='/api/audio'){
    if(url.searchParams.get('clear')==='true'){stopAlerts();write('audio.json',null);if(settings.soundId==='custom'){settings.soundId='soft';write('settings.json',settings);}for(const ext of ['mp3','wav']){try{fs.unlinkSync(path.join(cacheDir,'adhan.'+ext));}catch{}}return send(200,'{}');}
    const ext=url.searchParams.get('ext');if(!['mp3','wav'].includes(ext))return send(400,'{}');
    let size=0,chunks=[];try{for await(const c of req){size+=c.length;if(size>20*1024*1024)return send(413,'{}');chunks.push(c);}}catch{return;}
    const bytes=Buffer.concat(chunks);const valid=ext==='wav'?bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WAVE':bytes.toString('ascii',0,3)==='ID3'||bytes[0]===255&&(bytes[1]&224)===224;
    if(!valid)return send(400,JSON.stringify({error:'صيغة الصوت غير صالحة'}));
    stopAlerts();fs.writeFileSync(path.join(cacheDir,'adhan.'+ext),bytes);write('audio.json',{ext,name:(url.searchParams.get('name')||'تسجيل الأذان').slice(0,150)});settings.soundId='custom';write('settings.json',settings);return send(200,'{}');
  }
  if(req.method!=='GET') return send(405,'{}');
  if(url.pathname==='/health') return send(200,JSON.stringify({app:'sakinah'}));
  if(url.pathname==='/api/catalog')return send(200,JSON.stringify({cities,library:library.map(t=>({...t,available:fs.existsSync(path.join(ROOT,'audio',t.file))}))}));
  if(url.pathname==='/api/status')return send(200,JSON.stringify({settings,location:resolveCity(settings.city),locationError,locating,lastCheck,lastError,lastAlert,startup:desktop?.startupState?desktop.startupState():false,nativeReady:desktop?desktop.ready:!nativeError&&fs.existsSync(path.join(ROOT,'Notifier.exe')),nativeError,audio:read('audio.json',null)}));
  if(url.pathname.startsWith('/audio/')){const track=library.find(t=>'/audio/'+t.file===url.pathname);if(!track)return send(404,'{}');try{return send(200,fs.readFileSync(path.join(ROOT,'audio',track.file)),track.file.endsWith('.mp3')?'audio/mpeg':'audio/wav');}catch{return send(404,'{}');}}
  if(url.pathname==='/api/audio'){const a=read('audio.json',null);if(!a)return send(404,'{}');try{return send(200,fs.readFileSync(path.join(cacheDir,'adhan.'+a.ext)),a.ext==='mp3'?'audio/mpeg':'audio/wav');}catch{return send(404,'{}');}}
  const match=url.pathname.match(/^\/api\/timings\/(\d{2}-\d{2}-\d{4})$/);
  if(match) {const city=url.searchParams.get('city')||settings.city;if(!resolveCity(city))return send(400,'{}');try{return send(200,JSON.stringify(await day(match[1],city)));}catch{return send(503,JSON.stringify({error:'تعذر تحديث المواقيت'}));}}
  const assets={'/':'index.html','/app.js':'app.js','/i18n.js':'i18n.js','/calendar.js':'calendar.js','/location-utils.js':'location-utils.js','/calendar-ui.js':'calendar-ui.js','/enhancements.css':'enhancements.css'};
  if(/^\/assets\/[a-z0-9.-]+$/.test(url.pathname)){const f=path.join(ROOT,url.pathname);if(fs.existsSync(f))return send(200,fs.readFileSync(f),f.endsWith('.woff2')?'font/woff2':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.png')?'image/png':f.endsWith('.webp')?'image/webp':'image/x-icon');}
  if(assets[url.pathname]) return send(200,fs.readFileSync(path.join(ROOT,assets[url.pathname])),url.pathname.endsWith('.js')?'text/javascript; charset=utf-8':url.pathname.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');
  send(404,'{}');
});
server.on('error',async err=>{if(err.code==='EADDRINUSE'){try{const x=await fetch(`http://${HOST}:${PORT}/health`);if((await x.json()).app==='sakinah'&&!process.argv.includes('--no-open')) openApp();}catch{}process.exit(0);}throw err;});
server.listen(PORT,HOST,()=>{if(settings.locationMode==='auto')updateDevice();log('service started');console.log(`http://${HOST}:${PORT}`);check();setInterval(check,15000);if(!desktop)try{tray=spawn(path.join(ROOT,'Notifier.exe'),['--tray'],{stdio:'ignore',windowsHide:true});tray.on('error',e=>{nativeError='تعذّر تشغيل أداة التنبيه.';log(String(e));});}catch(e){nativeError='منع ويندوز تشغيل أداة التنبيه. تحتاج نسخة موقّعة موثوقة.';log(String(e));}if(!desktop&&!process.argv.includes('--no-open'))openApp();});



module.exports={resume:async()=>{if(settings.locationMode==='auto')await updateDevice();await check();}};
