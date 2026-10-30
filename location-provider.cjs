const {execFile}=require('node:child_process'),path=require('node:path');
module.exports=()=>new Promise((resolve,reject)=>{
 execFile(path.join(process.env.SystemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoProfile','-NonInteractive','-Command',require('node:fs').readFileSync(path.join(__dirname,'device-location.ps1'),'utf8')],{windowsHide:true,timeout:16000},(error,out)=>{
  try{const data=JSON.parse(out.replace(/^\uFEFF/,''));if(error||data.error||!Number.isFinite(data.latitude)||!Number.isFinite(data.longitude)||Math.abs(data.latitude)>90||Math.abs(data.longitude)>180)throw Error(data.error||'LOCATION_UNAVAILABLE');resolve(data);}catch(e){reject(e);}
 });
});
