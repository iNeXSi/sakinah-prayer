const fs=require('node:fs'),path=require('node:path');
const ROOT=__dirname,library=require('./audio-library.json'),pending=require('./audio-pending.json');
async function download(t){
 const out=path.join(ROOT,'audio',t.file);if(fs.existsSync(out)){const bytes=fs.readFileSync(out);if(bytes.length>10000&&(bytes.toString('ascii',0,3)==='ID3'||bytes[0]===255))return;throw Error('Invalid existing MP3: '+t.file);}
 const r=await fetch(t.downloadUrl,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('HTTP '+r.status);
 const b=Buffer.from(await r.arrayBuffer());if(b.length<10000||!(b.toString('ascii',0,3)==='ID3'||b[0]===255))throw Error('Invalid MP3');
 fs.writeFileSync(out+'.tmp',b);fs.renameSync(out+'.tmp',out);
}
(async()=>{
 // Download URLs for active recordings, including new Kiwifu tracks and Islamweb, live in audio-library.json.
 for(const t of library.filter(t=>t.downloadUrl)){await download(t);console.log(t.id+': ready');}
 if(process.argv.includes('--existing-only'))return;
 for(const t of pending){if(library.some(x=>x.sourceUrl===t.sourceUrl))continue;
  try{
   if(!t.downloadUrl){
    const r=await fetch(t.sourceUrl,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Source HTTP '+r.status);const html=await r.text();
    // Accept only a unique explicit player URL, never guess a CDN path or choose from unrelated links.
    const matches=[...html.matchAll(/(?:mp3\s*:\s*|<source[^>]*src\s*=\s*)["']([^"']+\.mp3(?:\?[^"']*)?)["']/gi)];
    const urls=[...new Set(matches.map(m=>new URL(m[1].replace(/&amp;/g,'&'),t.sourceUrl).href))];if(urls.length!==1)throw Error('Inspect source: no unique MP3 player URL');t.downloadUrl=urls[0];
   }
   await download(t);const {status,...track}=t;track.verifiedSource=t.sourceUrl;
   if(t.id==='haram-mulla'){
    const old=library.find(x=>x.id==='makkah');if(old&&fs.readFileSync(path.join(ROOT,'audio',old.file)).equals(fs.readFileSync(path.join(ROOT,'audio',t.file)))){Object.assign(old,track,{id:'makkah'});}else library.push(track);
   }else library.push(track);
   t.status='downloaded';fs.writeFileSync(path.join(ROOT,'audio-library.json'),JSON.stringify(library,null,2));console.log(t.id+': original added');
  }catch(e){t.status='Pending: '+(e.cause?.code||e.message);console.error(t.id+': '+t.status);process.exitCode=1;}
 }
 fs.writeFileSync(path.join(ROOT,'audio-pending.json'),JSON.stringify(pending,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
