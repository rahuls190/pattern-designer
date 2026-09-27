const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const runtime='C:/Users/Rahul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const sharp=require(runtime+'/sharp');
const {chromium}=require(runtime+'/playwright');
const out=path.resolve(__dirname,'../../tmp/pdfs/hexagons');
async function main(){
  if(process.argv.includes('--crops')){
    for(const [name,p,left,top,width,height] of [
      ['topkapi',27,2420,190,470,660],['gurgan',28,1930,310,420,400],
      ['intro',27,770,260,300,465],['cairo',27,680,875,495,390],
      ['konya',28,1900,720,900,320]]){
      await sharp(path.join(out,`source-${p}.jpg`)).extract({left,top,width,height}).png().toFile(path.join(out,`hexagons-${name}-source.png`));
    }
    return;
  }
  const entries=JSON.parse(fs.readFileSync(path.join(__dirname,'hexagons.json'),'utf8'));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage();
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const audit=[];
  for(const entry of entries){
    const N=entry.s.gW,mod=x=>((x%N)+N)%N;
    const degree=new Map(),lengths=new Set();
    for(const line of entry.s.gData.split(';')){
      const [a,b,c,d]=line.split(',').map(Number);
      if(![a,b,c,d].every(Number.isFinite))throw Error('Invalid endpoint');
      const dx=c-a,dy=d-b;
      lengths.add(dx*dx+dx*dy+dy*dy);
      for(const p of [[a,b],[c,d]]){
        const key=p.map(mod).join(',');degree.set(key,(degree.get(key)||0)+1);
      }
    }
    if([...degree.values()].some(d=>d<2))throw Error('Dangling periodic vertex: '+entry.id);
    const expected=entry.source.diagram==='intro'?3:1;
    if([...lengths].some(q=>q!==expected))throw Error('Unexpected edge metric: '+entry.id);
    const result=await page.evaluate(e=>{
      Object.assign(st,e.s);const G=gGeom();
      const origin=G.P(0,0),u=G.P(1,0),v=G.P(0,1);
      return {svg:gridThumb(e.s,600,500),basis:[u.x-origin.x,u.y-origin.y,v.x-origin.x,v.y-origin.y],translations:[G.Tx,G.Ty]};
    },entry);
    if(/NaN|Infinity/.test(result.svg))throw Error('Invalid geometry');
    const [ux,uy,vx,vy]=result.basis;
    if(Math.abs(ux-40)>1e-9||Math.abs(uy)>1e-9||Math.abs(vx-20)>1e-9||Math.abs(vy-20*Math.sqrt(3))>1e-9)throw Error('Wrong basis');
    const drawing=await sharp(Buffer.from(result.svg)).png().toBuffer();
    await sharp(drawing).toFile(path.join(out,entry.id+'.png'));
    const source=await sharp(path.join(out,`hexagons-${entry.source.diagram}-source.png`)).resize(400,500,{fit:'contain',background:'white'}).png().toBuffer();
    await sharp({create:{width:1000,height:500,channels:3,background:'white'}}).composite([{input:source,left:0,top:0},{input:drawing,left:400,top:0}]).png().toFile(path.join(out,entry.id+'-comparison.png'));
    if(Math.abs(result.translations[0].x-40*N)>1e-9||Math.abs(result.translations[1].x-20*N)>1e-9||Math.abs(result.translations[1].y-20*Math.sqrt(3)*N)>1e-9)throw Error('Wrong repeat translation');
    audit.push({id:entry.id,basis:result.basis,translations:result.translations,segments:entry.s.gData.split(';').length,squaredEdgeLengths:[...lengths],periodicVertexDegrees:[...new Set(degree.values())],danglingVertices:0});
  }
  await browser.close();
  fs.writeFileSync(path.join(out,'hexagons-audit.json'),JSON.stringify(audit,null,2));
  console.log(audit);
}
main().catch(e=>{console.error(e);process.exitCode=1});
