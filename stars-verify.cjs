const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const runtime = 'C:/Users/Rahul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const sharp = require(runtime + '/sharp');
const { chromium } = require(runtime + '/playwright');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'tmp/pdfs/stars');
const entries = JSON.parse(fs.readFileSync(path.join(__dirname, 'reference-data/stars.json'), 'utf8'));
const sources = [
  ['p22.png', {left:0,top:30,width:995,height:650}],
  ['p22-lower.png', {left:0,top:0,width:1080,height:710}],
  ['p23.png', {left:0,top:20,width:995,height:585}],
  ['p23.png', {left:0,top:740,width:995,height:675}],
  ['p26.png', {left:0,top:420,width:995,height:565}],
  ['p26.png', {left:0,top:1045,width:995,height:470}],
  ['p27.png', {left:0,top:800,width:995,height:740}]
];

function joinAudit(entry) {
  const size = entry.s.gW;
  const segs = entry.s.gData.split(';').map(s => s.split(',').map(Number));
  assert(segs.every(s => s.length === 4 && s.every(Number.isFinite)));
  assert(segs.every(([x,y,u,v]) => Math.hypot(x-u,y-v) > 1e-9));
  const periodic = [];
  for(let i=-2;i<=2;i++) for(let j=-2;j<=2;j++)
    for(const [x,y,u,v] of segs) periodic.push([x+i*size,y+j*size,u+i*size,v+j*size]);
  const loose = [];
  const vertices = new Map(segs.flatMap(([x,y,u,v]) => [[x,y],[u,v]])
    .map(p => [p.join(','),p]));
  for(const [key,[x,y]] of vertices) {
    const rays = new Set();
    for(const [a,b,c,d] of periodic) {
      const dx=c-a,dy=d-b,L=dx*dx+dy*dy;
      const t=((x-a)*dx+(y-b)*dy)/L;
      if(t < -1e-8 || t > 1+1e-8 || Math.abs((x-a)*dy-(y-b)*dx)>1e-7) continue;
      for(const [u,v] of [[a,b],[c,d]]) if(Math.hypot(u-x,v-y)>1e-8)
        rays.add(Math.atan2(v-y,u-x).toFixed(7));
    }
    if(rays.size<2) loose.push(key);
  }
  assert.deepEqual(loose, [], entry.id + ': dangling endpoint in repeated field');
  // These signatures record actual line intersections at each cell edge.
  const boundary = (axis,value) => {
    const vals = new Set();
    for(const s of periodic) {
      const a=s[axis], b=s[axis+2];
      if(Math.abs(b-a)<1e-9) continue;
      const t=(value-a)/(b-a);
      if(t < -1e-8 || t > 1+1e-8) continue;
      const other=s[1-axis]+t*(s[3-axis]-s[1-axis]);
      if(other>=-1e-8 && other<=size+1e-8) vals.add(Number(other.toFixed(7)));
    }
    return [...vals].sort((a,b)=>a-b);
  };
  const left=boundary(0,0),right=boundary(0,size),top=boundary(1,0),bottom=boundary(1,size);
  assert.deepEqual(left,right); assert.deepEqual(top,bottom);
  return {segments:segs.length,unjoinedEndpoints:loose,left,right,top,bottom};
}

async function main() {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const page = await browser.newPage({viewport:{width:1200,height:850}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
    const audit=[];
    for(let i=0;i<entries.length;i++) {
      const entry=entries[i];
      const joins=joinAudit(entry);
      const svgs=await page.evaluate(e => ({
        field:gridThumb({...e.s,gSize:1010/(3*e.s.gW)},660,450),
        cell:gridThumb({...e.s,gSize:1010/(1.6*e.s.gW)},660,660,{cell:true,grid:true})
      }),entry);
      assert(!/NaN|Infinity/.test(svgs.field));
      const drawing=await sharp(Buffer.from(svgs.field)).png().toBuffer();
      await sharp(drawing).toFile(path.join(out,entry.id+'-render.png'));
      await sharp(Buffer.from(svgs.cell)).png().toFile(path.join(out,entry.id+'-cell.png'));
      const [file,region]=sources[i];
      const source=await sharp(path.join(out,file)).extract(region)
        .resize(660,450,{fit:'contain',background:'white'}).png().toBuffer();
      const heading=Buffer.from(`<svg width="1340" height="55"><rect width="1340" height="55" fill="white"/><text x="12" y="22" font-family="Arial" font-size="18">${entry.name} - printed page ${entry.source.printedPage}</text><text x="12" y="45" font-family="Arial" font-size="15">Source drawing (inset grid retained for reference)</text><text x="682" y="45" font-family="Arial" font-size="15">App render: editable lines, repeated 3 cells across</text></svg>`);
      await sharp({create:{width:1340,height:515,channels:3,background:'white'}})
        .composite([{input:heading,left:0,top:0},{input:source,left:0,top:60},{input:drawing,left:680,top:60}])
        .png().toFile(path.join(out,entry.id+'-comparison.png'));
      audit.push({id:entry.id,source:entry.source,...joins});
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'stars-audit.json'),JSON.stringify({errors,patterns:audit},null,2));
    console.log(JSON.stringify({patterns:audit.length,errors,output:out}));
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
