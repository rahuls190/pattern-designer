const fs = require('fs');
const { JSDOM } = require('jsdom');

console.log('Testing Polygons in Contact to Draw integration in JSDOM...');
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost:3000/#e=pic',
  beforeParse(window) {
    window.HTMLCanvasElement.prototype.getContext = () => ({
      clearRect() {}, drawImage() {}, getImageData() { return { data: new Uint8Array(400) }; },
      putImageData() {}, imageSmoothingEnabled: true, imageSmoothingQuality: 'high'
    });
    window.HTMLCanvasElement.prototype.toBlob = cb => cb(new window.Blob(['mock'], { type: 'image/png' }));
    window.URL.createObjectURL = () => 'blob:mock';
    window.URL.revokeObjectURL = () => {};
  }
});

setTimeout(() => {
  const result = dom.window.eval(`
    const picEntries = GRID_LIB.filter(x => x.group === "Polygons in Contact (Hankin · Kaplan)");
    const initialEngine = st.engine;
    
    // 1. Load first PIC pattern
    const firstPic = picEntries[0];
    loadPatternIntoDraw(firstPic.s, { mode: "replace", title: firstPic.name });
    const afterLoadEngine = st.engine;
    const afterLoadCount = st.gData.split(";").length;
    
    // 2. Draw a new line with drawing tools — one the pattern doesn't already
    //    have, since adding an existing line is correctly a no-op
    const beforeSegCount = gParse(st.gData).length;
    const have = new Set(gParse(st.gData).map(t => gCanon(t).join()));
    let freeEnd = null;
    for (let x = 0; x <= st.gW * st.gSub && !freeEnd; x++)
      for (let y = 0; y <= st.gH * st.gSub && !freeEnd; y++)
        if ((x || y) && !have.has(gCanon([0, 0, x, y]).join())) freeEnd = [x, y];
    gAddSeg([0, 0], freeEnd);
    const afterSegCount = gParse(st.gData).length;
    
    // 3. Convert current Polygons in Contact pattern
    st.engine = "pic";
    st.tiling = "octasq";
    st.angle = 50;
    const spec = getCurrentPatternSpec({ include: "both" });
    loadPatternIntoDraw(spec, { mode: "replace", title: spec.name });
    const convertedEngine = st.engine;
    const convertedCount = st.gData.split(";").length;
    
    // 4. Modal check
    openAddPatternModal("pic");
    const modalVisible = document.getElementById("patDrawModal").style.display === "flex";
    closeAddPatternModal();
    const modalClosed = document.getElementById("patDrawModal").style.display === "none";
    
    ({
      initialEngine,
      picEntriesCount: picEntries.length,
      afterLoadEngine,
      afterLoadCount,
      beforeSegCount,
      afterSegCount,
      convertedEngine,
      convertedCount,
      modalVisible,
      modalClosed
    })
  `);
  
  console.log('Polygons in Contact to Draw Test Results:', result);
  if (result.picEntriesCount === 8 &&
      result.afterLoadEngine === 'gridp' &&
      result.afterSegCount > result.beforeSegCount &&
      result.convertedEngine === 'gridp' &&
      result.convertedCount > 0 &&
      result.modalVisible &&
      result.modalClosed) {
    console.log('SUCCESS! All Polygons in Contact to Draw features verified!');
    process.exit(0);
  } else {
    console.error('Test failed:', result);
    process.exit(1);
  }
}, 1200);
