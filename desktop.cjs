const {app,BrowserWindow,Tray,Menu,ipcMain,screen,shell,powerMonitor}=require('electron');
// This static prayer interface needs no GPU acceleration; avoid keeping a large
// graphics allocation alive between the five daily alerts.
app.disableHardwareAcceleration();
const fs=require('node:fs'),path=require('node:path');
const bridge=require('./desktop-bridge.cjs');
const {durationMs}=require('./alert-policy.cjs');
const ROOT=__dirname,URL='http://127.0.0.1:18741',popups=new Set();
let main=null,tray;
app.setName('سكينة');app.setAppUserModelId('Sakinah.Local.Prayer');
const log=event=>require('./storage.cjs').appendLog('desktop-events.jsonl',JSON.stringify({at:new Date().toISOString(),...event})+'\n');
function open(){if(main){main.show();main.focus();return;}main=new BrowserWindow({width:1180,height:920,minWidth:380,title:'سكينة',icon:path.join(ROOT,'assets','app-v5.ico'),autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});main.on('closed',()=>{main=null;log({event:'main-closed',backgroundAlive:true});});main.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\/(sunnah\.com|aladhan\.com|github\.com|audio\.islamweb\.net)\//.test(url))shell.openExternal(url);return {action:'deny'};});main.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith(URL+'/'))e.preventDefault();});main.loadURL(URL);}
bridge.stop=()=>{for(const w of popups)if(!w.isDestroyed())w.close();};
bridge.quit=()=>app.quit();
bridge.notify=({title,message,file,sound,language,alertDuration='15'})=>new Promise((resolve,reject)=>{
 const area=screen.getPrimaryDisplay().workArea;
 const w=new BrowserWindow({width:440,height:260,x:area.x+area.width-464,y:area.y+area.height-284,show:false,alwaysOnTop:true,resizable:false,autoHideMenuBar:true,title:'سكينة · '+title,icon:path.join(ROOT,'assets','app-v5.ico'),webPreferences:{preload:path.join(ROOT,'alert-preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false,autoplayPolicy:'no-user-gesture-required'}});
 popups.add(w);let settled=false;const finish=(error)=>{if(settled)return;settled=true;clearTimeout(timeout);error?reject(error):resolve();};
 const onReady=(e,result)=>{if(e.sender!==w.webContents)return;log({event:'alert-ready',title,mainWindowOpen:!!main,visible:w.isVisible(),soundRequested:sound,audio:result});if(result==='failed')log({event:'audio-error',title});schedule(result);finish();};
 ipcMain.on('sakinah-ready',onReady);const timeout=setTimeout(()=>finish(Error('Alert did not become ready')),15000);
 let shownAt=null,dismissTimer;
 const schedule=result=>{clearTimeout(dismissTimer);const ms=Math.max(0,durationMs(alertDuration,result)-(Date.now()-shownAt));w.webContents.send('sakinah-deadline',ms);dismissTimer=setTimeout(()=>{if(!w.isDestroyed())w.close();},ms);};
 const onEnded=e=>{if(e.sender===w.webContents&&alertDuration==='full')w.close();};ipcMain.on('sakinah-ended',onEnded);
 w.on('closed',()=>{ipcMain.removeListener('sakinah-ready',onReady);ipcMain.removeListener('sakinah-ended',onEnded);clearTimeout(dismissTimer);popups.delete(w);log({event:'alert-closed',title,visibleForMs:shownAt===null?null:Date.now()-shownAt});finish(Error('Alert closed before ready'));});
 w.webContents.on('did-finish-load',()=>{w.showInactive();shownAt=Date.now();w.webContents.send('sakinah-alert',{title,message,file:sound?file:'',sound,language,alertDuration});schedule(sound?'playing':'silent');});
 w.loadFile(path.join(ROOT,'alert.html'));
});
ipcMain.on('sakinah-close',e=>{for(const w of popups)if(w.webContents===e.sender)w.close();});
if(!app.requestSingleInstanceLock())app.quit();else{
 app.on('second-instance',(_,argv)=>{if(!argv.includes('--no-open'))open();});app.on('window-all-closed',()=>{});
 app.whenReady().then(()=>{
  const startup=require('./startup.cjs');bridge.startupState=startup.state;bridge.setStartup=startup.set;try{startup.migrate();}catch(e){log({event:'startup-migration-error',error:String(e)});}
  tray=new Tray(path.join(ROOT,'assets','app-v5.ico'));tray.setToolTip('سكينة · تنبيهات الصلاة');tray.setContextMenu(Menu.buildFromTemplate([{label:'فتح سكينة',click:open},{label:'تجربة التنبيه',click:()=>fetch(URL+'/api/test-alert',{method:'POST',headers:{Origin:URL}})},{label:'إنهاء سكينة',click:()=>app.quit()}]));tray.on('double-click',open);
  bridge.ready=true;const service=require('./server.cjs');powerMonitor.on('resume',()=>service.resume());
  if(!process.argv.includes('--no-open'))open();
  log({event:'desktop-started',backgroundOnly:process.argv.includes('--no-open'),mainWindowOpen:!!main});
  if(process.argv.includes('--verify-background')){setTimeout(async()=>{if(main)main.close();await new Promise(r=>setTimeout(r,1500));const r=await fetch(URL+'/api/test-alert',{method:'POST',headers:{Origin:URL}});log({event:'background-test',status:r.status,mainWindowOpen:!!main});},3000);}
 });
}

