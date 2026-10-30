// City-centre coordinates; all supported locations use Saudi Arabia's timezone.
const rows=[
['riyadh','الرياض','الرياض',24.7136,46.6753],['alkharj','الخرج','الرياض',24.1556,47.312],['dawadmi','الدوادمي','الرياض',24.5077,44.3924],
['makkah','مكة المكرمة','مكة المكرمة',21.3891,39.8579],['jeddah','جدة','مكة المكرمة',21.4858,39.1925],['taif','الطائف','مكة المكرمة',21.2703,40.4158],
['madinah','المدينة المنورة','المدينة المنورة',24.5247,39.5692],['yanbu','ينبع','المدينة المنورة',24.0895,38.0618],['alula','العلا','المدينة المنورة',26.6085,37.9232],
['dammam','الدمام','الشرقية',26.4207,50.0888],['khobar','الخبر','الشرقية',26.2172,50.1971],['hofuf','الهفوف','الشرقية',25.3836,49.586],['jubail','الجبيل','الشرقية',27.0046,49.646],['hafr','حفر الباطن','الشرقية',28.4328,45.9708],
['buraydah','بريدة','القصيم',26.3592,43.9818],['unayzah','عنيزة','القصيم',26.0843,43.9935],
['abha','أبها','عسير',18.2164,42.5053],['khamis','خميس مشيط','عسير',18.3,42.7333],
['tabuk','تبوك','تبوك',28.3838,36.555],['hail','حائل','حائل',27.5114,41.7208],
['arar','عرعر','الحدود الشمالية',30.9753,41.0381],['rafha','رفحاء','الحدود الشمالية',29.6264,43.4906],
['jazan','جازان','جازان',16.8892,42.5511],['najran','نجران','نجران',17.5656,44.2289],
['baha','الباحة','الباحة',20.0129,41.4677],['sakaka','سكاكا','الجوف',29.9697,40.2064],['qurayyat','القريات','الجوف',31.3318,37.3428]
];
const english=['Riyadh','Al Kharj','Dawadmi','Makkah','Jeddah','Taif','Madinah','Yanbu','AlUla','Dammam','Khobar','Hofuf','Jubail','Hafr Al Batin','Buraydah','Unaizah','Abha','Khamis Mushait','Tabuk','Hail','Arar','Rafha','Jazan','Najran','Al Baha','Sakaka','Qurayyat'];
const cities=rows.map(([id,name,region,latitude,longitude],i)=>({id,name,nameEn:english[i],region,latitude,longitude}));
const cityById=id=>cities.find(c=>c.id===id);
module.exports={cities,cityById};
