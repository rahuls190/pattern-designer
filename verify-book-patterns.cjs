const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const runtime = 'C:/Users/Rahul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(runtime + '/playwright');
const sharp = require(runtime + '/sharp');

async function main() {
  const output = path.resolve(__dirname, '../tmp/pdfs/book-verification');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
  const entries = await page.evaluate(() => GRID_LIB.map((entry, i) => {
    loadGridPattern(i);
    const svg = gridThumb({ ...entry.s, gSize: 40 }, 600, 450);
    return { id: entry.id, name: entry.name, source: entry.source, svg,
      data: st.gData || st.gCirc || st.gArcs || st.gFill, exportPaths: last.gexport.length };
  }));
  for (const entry of entries) {
    if (!entry.data || !entry.exportPaths) throw new Error('Empty drawing: ' + entry.id);
    if (/NaN|Infinity/.test(entry.svg)) throw new Error('Invalid geometry: ' + entry.id);
    await sharp(Buffer.from(entry.svg)).png().toFile(path.join(output, entry.id + '.png'));
  }
  // Compare the transcribed linework with the corresponding scanned diagrams.
  const regions={
    'field-29-upper-left':{left:1203,top:98,width:301,height:390},
    'field-29-lower-left':{left:1214,top:568,width:270,height:391},
    'field-29-lower-right':{left:1540,top:568,width:274,height:391},
    'field-29-upper-right':{left:1530,top:98,width:299,height:375},
    'field-28-lower-left':{left:435,top:634,width:299,height:359},
    'field-28-lower-right':{left:765,top:572,width:291,height:420},
    'field-28-upper-right':{left:765,top:102,width:290,height:465}
  };
  const rows=[];
  for(const entry of entries){
    const region=regions[entry.id];
    if(!region)continue;
    const source=await sharp(path.resolve(__dirname,'../tmp/pdfs/field-window-source.png'))
      .extract(region).resize(380,400,{fit:'contain',background:'#fff'}).png().toBuffer();
    const drawing=await sharp(Buffer.from(entry.svg)).resize(530,400,{fit:'contain',background:'#fff'}).png().toBuffer();
    const label=Buffer.from(`<svg width="960" height="40"><rect width="960" height="40" fill="white"/><text x="12" y="25" font-size="18" font-family="Arial">${entry.name}: source (left), grid drawing (right)</text></svg>`);
    rows.push(await sharp({create:{width:960,height:440,channels:3,background:'#fff'}}).composite([
      {input:label,left:0,top:0},{input:source,left:10,top:40},{input:drawing,left:420,top:40}
    ]).png().toBuffer());
  }
  await sharp({create:{width:960,height:440*rows.length,channels:3,background:'#fff'}})
    .composite(rows.map((input,i)=>({input,left:0,top:440*i}))).png()
    .toFile(path.join(output,'source-comparison.png'));
  await page.evaluate(() => document.querySelector('#nav [data-p="guide"]').click());
  if (await page.locator('.gcard').count() !== entries.length) throw new Error('Gallery count mismatch');
  for (const viewport of [{width:1400,height:1000},{width:390,height:844}]) {
    await page.setViewportSize(viewport);
    await page.screenshot({path:path.join(output, `gallery-${viewport.width}.png`),fullPage:true});
  }
  const generated = await page.evaluate(() => {
    const i=GRID_LIB.findIndex(entry=>entry.id==='field-31-lower');
    loadGridPattern(i);
    return {count:GRID_LIB.length,engine:st.engine,data:st.gData};
  });
  if(generated.count!==entries.length||generated.engine!=='gridp'||!generated.data)
    throw new Error('Generated library pattern failed to open');
  await browser.close();
  if (errors.length) throw new Error(errors.join('\n'));
  fs.writeFileSync(path.join(output, 'audit.json'), JSON.stringify(entries.map(({svg,data,...e})=>e),null,2));
  console.log(JSON.stringify({patterns:entries.length,errors,output}));
}
main().catch(error=>{console.error(error);process.exitCode=1});
