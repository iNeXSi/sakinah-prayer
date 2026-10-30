const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('sakinah',{onAlert:fn=>ipcRenderer.once('sakinah-alert',(_,data)=>fn(data)),onDeadline:fn=>ipcRenderer.on('sakinah-deadline',(_,ms)=>fn(ms)),ended:()=>ipcRenderer.send('sakinah-ended'),ready:result=>ipcRenderer.send('sakinah-ready',result),close:()=>ipcRenderer.send('sakinah-close')});
