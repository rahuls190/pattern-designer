const sharp=require('C:/Users/Rahul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path=require('node:path');
(async()=>{
 const {data,info}=await sharp(path.resolve(__dirname,'../tmp/pdfs/circles/circles-crop-2.png')).resize({width:500}).greyscale().raw().toBuffer({resolveWithObject:true});
 const scores=[];
 for(let r=115;r<=140;r+=1)for(let y=120;y<570;y+=2)for(let x=120;x<380;x+=2){
  let score=0;
  for(let a=0;a<120;a++){let px=Math.round(x+r*Math.cos(a*Math.PI/60)),py=Math.round(y+r*Math.sin(a*Math.PI/60));let val=255;
   for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)val=Math.min(val,data[(py+j)*info.width+px+i]??255);
   if(val<130)score++;
  } if(score>85)scores.push({x,y,r,score});
 }
 scores.sort((a,b)=>b.score-a.score);const peaks=[];
 for(const p of scores)if(!peaks.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<20)){peaks.push(p);if(peaks.length===12)break;}
 console.log(peaks);
})();
