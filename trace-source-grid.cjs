const sharp=require('C:/Users/Rahul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs=require('node:fs');
async function main(){
  const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const {data,info}=await sharp(config.image).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const {origin:o,u,v,repeat:w,bounds,exclude=[]}=config;
  const point=(i,j)=>[o[0]+i*u[0]+j*v[0],o[1]+i*u[1]+j*v[1]];
  const inside=([x,y])=>x>=bounds[0]&&x<=bounds[2]&&y>=bounds[1]&&y<=bounds[3]&&!exclude.some(b=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3]);
  const ink=([x,y])=>{
    let min=255;
    const radius=config.radius||2;
    for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
      const xx=Math.round(x)+dx,yy=Math.round(y)+dy;
      if(xx<0||yy<0||xx>=info.width||yy>=info.height)continue;
      const k=(yy*info.width+xx)*info.channels;
      min=Math.min(min,(data[k]+data[k+1]+data[k+2])/3);
    }
    return min<170;
  };
  const [rw,rh]=Array.isArray(w)?w:[w,w];
  const mod=(n,m)=>((n%m)+m)%m,votes=new Map();
  for(let i=-64;i<=64;i++)for(let j=-64;j<=64;j++)for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1]]){
    const a=point(i,j),b=point(i+di,j+dj);
    if(!inside(a)||!inside(b))continue;
    let count=0;
    for(let k=0;k<15;k++){const t=.15+.7*k/14;if(ink([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]))count++}
    const t=[mod(i,rw),mod(j,rh),mod(i,rw)+di,mod(j,rh)+dj],key=t.join(',');
    if(!votes.has(key))votes.set(key,{t,present:0,samples:0});
    const vote=votes.get(key);vote.samples++;if(count>=13)vote.present++;
  }
  const edges=[...votes.values()].filter(x=>x.samples>=2&&x.present/x.samples>=.65);
  const uncertain=[...votes.values()].filter(x=>x.present>0&&x.present/x.samples<.65);
  console.log(JSON.stringify({segments:edges.map(x=>x.t),support:edges,uncertain},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
