const audio=document.getElementById('audio');
let full=false,deadline=Infinity,fadeTimer;
window.sakinah.onDeadline(ms=>{deadline=performance.now()+ms;});
window.sakinah.onAlert(async data=>{
 document.documentElement.lang=data.language||'ar';document.documentElement.dir=data.language==='en'?'ltr':'rtl';
 document.getElementById('close').textContent=data.language==='en'?'Done · Stop audio':'تم · إيقاف الصوت';
 document.getElementById('title').textContent=data.title;document.getElementById('message').textContent=data.message;
 full=data.alertDuration==='full';
 if(data.sound&&data.file){
  audio.src='file:///'+data.file.replace(/\\/g,'/').split('/').map(encodeURIComponent).join('/');
  let reported=false;
  const report=result=>{if(reported)return;reported=true;window.sakinah.ready(result);};
  audio.onerror=()=>{if(reported)window.sakinah.ready('failed');else report('failed');};
  try{await audio.play();report('playing');}catch{report('failed');}
 }else window.sakinah.ready('silent');
 fadeTimer=setInterval(()=>{
  const remaining=Math.min(deadline-performance.now(),full&&Number.isFinite(audio.duration)?(audio.duration-audio.currentTime)*1000:Infinity);
  audio.volume=Math.max(0,Math.min(1,remaining/2000));
 },100);
});
audio.onended=()=>{if(full)window.sakinah.ended();};
document.getElementById('close').onclick=()=>{audio.pause();clearInterval(fadeTimer);window.sakinah.close();};
window.addEventListener('unload',()=>clearInterval(fadeTimer));
