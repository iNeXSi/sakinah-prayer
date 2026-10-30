const {app}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const {dataDir}=require('./storage.cjs');

const script=path.join(__dirname,'startup-task.ps1');
const options=()=>({path:process.execPath,args:app.isPackaged?['--no-open']:[path.join(__dirname,'desktop.cjs'),'--no-open']});

function task(mode){
 const args=['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,'-Mode',mode];
 if(mode==='enable')args.push('-Executable',process.execPath,'-Entry',app.isPackaged?'':path.join(__dirname,'desktop.cjs'),'-WorkingDirectory',__dirname);
 const result=spawnSync('powershell.exe',args,{encoding:'utf8',windowsHide:true,timeout:15000});
 if(result.error||result.status!==0)throw Error('Windows startup task failed: '+(result.error?.message||result.stderr||result.stdout||result.status));
 return result.stdout.trim()==='true';
}

function state(){return task('status');}
function set(enabled){
 task(enabled?'enable':'disable');
 app.setLoginItemSettings({...options(),openAtLogin:false});
 const actual=state();
 if(actual!==enabled)throw Error('Windows startup task did not retain the requested state');
 return actual;
}
function migrate(){
 const marker=path.join(dataDir,'startup-task-migration.json');
 if(fs.existsSync(marker))return;
 const shortcut=path.join(process.env.APPDATA,'Microsoft','Windows','Start Menu','Programs','Startup','Sakinah Prayer.lnk');
 const legacy=app.getLoginItemSettings(options()).openAtLogin||fs.existsSync(shortcut);
 if(legacy&&!state())set(true);
 if(state()){
  app.setLoginItemSettings({...options(),openAtLogin:false});
  if(fs.existsSync(shortcut))fs.renameSync(shortcut,shortcut+'.migrated');
 }
 fs.writeFileSync(marker,JSON.stringify({completedAt:new Date().toISOString()}));
}
module.exports={state,set,migrate};
