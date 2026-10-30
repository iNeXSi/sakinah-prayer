const {app,BrowserWindow,ipcMain}=require('electron'),fs=require('fs'),path=require('path');
app.setPath('userData',path.join(__dirname,'data','audio-check'));
app.whenReady().then(()=>{
 const w=new BrowserWindow({show:false,webPreferences:{nodeIntegration:true,contextIsolation:false}});
 const timeout=setTimeout(()=>app.exit(1),60000);
 ipcMain.once('result',(_,result)=>{clearTimeout(timeout);fs.writeFileSync(path.join(__dirname,'data','audio-check.json'),JSON.stringify(result,null,2));app.exit(result.every(x=>!x.error)?0:1);});
 w.loadFile('check-audio.html');
});
