const fs=require('node:fs');
const sharp=require('C:/Users/Rahul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
async function main(){
 const es=JSON.parse(fs.readFileSync('pattern-designer/reference-data/stars.json'));
 const {data,info}=await sharp('tmp/pdfs/stars/p23.png').removeAlpha().raw().toBuffer({resolveWithObject:true});
 const e=es[2], segs=e.s.gData.split(';').map(s=>s.split(',').map(Number));
 const failed=[];
 for(let dx=0;dx<=16;dx+=16)for(let dy=0;dy<=16;dy+=16)for(const s of segs){
  const [a,b,c,d]=s.map((v,i)=>v+(i%2?dy:dx));let n=0,hits=0;
  for(let i=1;i<20;i++){
   const t=i/20,x=38+23.45*(a+(c-a)*t),y=39+23.35*(b+(d-b)*t);
   if(x<30||x>980||y<30||y>595||(x<235&&y<235))continue;n++;
   let ink=false;for(let u=-3;u<=3;u++)for(let v=-3;v<=3;v++){
    const k=(Math.round(y+v)*info.width+Math.round(x+u))*info.channels;
    if(data[k]<130)ink=true;
   }if(ink)hits++;
  }
  if(n>6&&hits/n<.75)failed.push({s:[a,b,c,d],support:hits/n});
 }
 console.log(JSON.stringify(failed));
}
main();
