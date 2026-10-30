(function(root){
 function distance(a,b){
  const rad=x=>x*Math.PI/180,lat=rad(b.latitude-a.latitude),lon=rad(b.longitude-a.longitude);
  const h=Math.sin(lat/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(lon/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
 }
 function accuracy(value){return Number.isFinite(value)&&value>=0?'دقة الموقع التقريبية: '+(value<1000?Math.round(value)+' م':Number((value/1000).toFixed(1))+' كم'):'';}
 const api={distance,accuracy};if(typeof module!=='undefined')module.exports=api;else root.SakinahLocation=api;
})(typeof window!=='undefined'?window:globalThis);
