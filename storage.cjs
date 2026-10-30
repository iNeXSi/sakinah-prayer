const fs=require('node:fs'),path=require('node:path');
const legacy=path.join(__dirname,'data');
const dataDir=process.versions.electron?require('electron').app.getPath('userData'):legacy;
fs.mkdirSync(dataDir,{recursive:true});
if(dataDir!==legacy&&!fs.existsSync(path.join(dataDir,'data-migration.json'))){
 // Move only persistent application data, not screenshots or development tools.
 const names=['settings.json','sent.json','audio.json','adhan.mp3','adhan.wav','background.log','background.log.1','desktop-events.jsonl','desktop-events.jsonl.1'];
 for(const name of names){
  const from=path.join(legacy,name),to=path.join(dataDir,name);
  if(fs.existsSync(from)&&!fs.existsSync(to)){fs.copyFileSync(from,to);if(fs.readFileSync(from).equals(fs.readFileSync(to)))fs.unlinkSync(from);}
 }
 fs.writeFileSync(path.join(dataDir,'data-migration.json'),JSON.stringify({completedAt:new Date().toISOString(),version:1}));
}
function appendLog(name,text){
 const file=path.join(dataDir,name),entry=String(text);
 if(fs.existsSync(file)&&fs.statSync(file).size+Buffer.byteLength(entry)>1024*1024){
  const old=file+'.1';if(fs.existsSync(old))fs.unlinkSync(old);fs.renameSync(file,old);
 }
 fs.appendFileSync(file,entry);
}
module.exports={dataDir,appendLog};
