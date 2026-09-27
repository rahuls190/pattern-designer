const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const runtime='C:/Users/Rahul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(runtime+'/playwright');
const sharp=require(runtime+'/sharp');
const entries=require('./reference-data/circles.json');
const out=path.resolve(__dirname,'../tmp/pdfs/circles');
const parse=s=>s?s.split(';').map(t=>t.split(',').map(Number)):[];
async function main(){
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
 const audit=[];
 for(let k=0;k<entries.length;k++){
  const e=entries[k],s=e.s;
  for(const [field,length] of [['gData',4],['gCirc',3],['gArcs',7]])for(const row of parse(s[field])){
   if(row.length!==length||!row.every(Number.isFinite))throw Error(e.id+' invalid '+field);
  }
  for(const [cx,cy,sx,sy,ex,ey] of parse(s.gArcs)){
   const distance=(x,y)=>s.gType==='iso'?Math.hypot(x+y/2,y*Math.sqrt(3)/2):Math.hypot(x,y);
   if(Math.abs(distance(sx-cx,sy-cy)-distance(ex-cx,ey-cy))>1e-9)throw Error('Arc endpoint radius mismatch');
  }
  const size=[25,17.5,40,27.5,30,30,42][k];
  const svg=await page.evaluate(({s,size})=>gridThumb({...s,gSize:size,gShowCell:false},600,450),{s,size});
  if(/NaN|Infinity/.test(svg))throw Error('Invalid rendered coordinates');
  const drawing=await sharp(Buffer.from(svg)).png().toBuffer();
  await sharp(drawing).toFile(path.join(out,e.id+'.png'));
  const source=await sharp(path.join(out,`circles-crop-${k+1}.png`)).resize(600,450,{fit:'contain',background:'#fff'}).png().toBuffer();
  const label=Buffer.from(`<svg width="1220" height="45"><rect width="1220" height="45" fill="white"/><text x="10" y="27" font-size="18" font-family="Arial">${e.name} | source left; app rendering right</text></svg>`);
  await sharp({create:{width:1220,height:495,channels:3,background:'#fff'}}).composite([{input:label,left:0,top:0},{input:source,left:0,top:45},{input:drawing,left:620,top:45}]).png().toFile(path.join(out,`circles-comparison-${k+1}.png`));
  audit.push({id:e.id,circles:parse(s.gCirc).length,arcs:parse(s.gArcs).length,lines:parse(s.gData).length,arcEndpointRadii:'checked',comparison:`circles-comparison-${k+1}.png`});
 }
 await browser.close();if(errors.length)throw Error(errors.join('\n'));
 fs.writeFileSync(path.join(out,'circles-audit.json'),JSON.stringify({entries:audit,browserErrors:errors,note:'Numerical and rendering checks do not establish source fidelity; comparisons require visual inspection.'},null,2));
 console.log(JSON.stringify(audit,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
