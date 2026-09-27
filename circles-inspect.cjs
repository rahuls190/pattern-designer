const sharp = require('C:/Users/Rahul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('node:path');
const out = path.resolve(__dirname, '../tmp/pdfs/circles');
const regions = [
  [25, 280,340,400,305], [25,775,68,190,265], [25,986,374,190,218],
  [26,312,33,402,297], [26,306,381,355,267], [26,775,35,396,297], [26,775,379,396,263]
];
module.exports = {regions};
if (require.main === module) (async()=>{
  for(let k=0;k<regions.length;k++){
    const [p,x,y,w,h]=regions[k];
    const file=path.join(out,`circles-source-${p}.jpg`);
    const m=await sharp(file).metadata(); const scale=m.width/1219;
    await sharp(file).extract({left:Math.round(x*scale),top:Math.round(y*scale),width:Math.round(w*scale),height:Math.round(h*scale)})
      .png().toFile(path.join(out,`circles-crop-${k+1}.png`));
  }
})();
