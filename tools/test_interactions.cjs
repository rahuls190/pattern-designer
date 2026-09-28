const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost:3000/#e=tess',
  beforeParse(window) {
    window.HTMLCanvasElement.prototype.getContext = function() {
      return {
        clearRect() {},
        drawImage() {},
        getImageData() { return { data: new Uint8Array(400) }; },
        putImageData() {},
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      };
    };
    window.HTMLCanvasElement.prototype.toBlob = function(cb) {
      cb(new window.Blob(['mock png'], { type: 'image/png' }));
    };
    window.URL.createObjectURL = () => 'blob:mock-url';
    window.URL.revokeObjectURL = () => {};
    window.navigator.clipboard = { writeText: async () => {} };
  }
});

setTimeout(() => {
  const win = dom.window;
  const doc = win.document;
  console.log('Testing interactive features in DOM...');

  // 1. Test Inspector toggle button
  const bi = doc.getElementById('btnToggleInspector');
  const pDes = doc.getElementById('p-designer');
  if (!bi) throw new Error('Missing #btnToggleInspector');
  console.log('Initial inspector collapsed?', pDes.classList.contains('inspector-collapsed'));
  bi.click();
  console.log('After click inspector collapsed?', pDes.classList.contains('inspector-collapsed'));
  if (!pDes.classList.contains('inspector-collapsed')) throw new Error('Inspector collapse toggle failed');
  bi.click();
  console.log('After second click inspector collapsed?', pDes.classList.contains('inspector-collapsed'));

  // 2. Test Fullscreen toggle button
  const bfs = doc.getElementById('btnStageFullscreen');
  const stage = doc.querySelector('.stage');
  if (!bfs) throw new Error('Missing #btnStageFullscreen');
  bfs.click();
  console.log('After click stage fullscreen?', stage.classList.contains('fullscreen'));
  if (!stage.classList.contains('fullscreen')) throw new Error('Fullscreen toggle failed');
  bfs.click();
  console.log('After second click stage fullscreen?', stage.classList.contains('fullscreen'));

  // 3. Test Export Dropdown
  const expBtn = doc.getElementById('expMenuBtn');
  const expMenu = doc.getElementById('expDropdownMenu');
  if (!expBtn || !expMenu) throw new Error('Missing export dropdown elements');
  console.log('Initial export menu display:', expMenu.style.display);
  expBtn.click();
  console.log('After click export menu display:', expMenu.style.display);
  if (expMenu.style.display !== 'flex' && expMenu.style.display !== 'block') {
    throw new Error('Export menu failed to open on click');
  }

  // Test export options
  const optSvg = doc.getElementById('expSvgOpt');
  optSvg.click();
  console.log('After clicking SVG option, export menu display:', expMenu.style.display);

  // 4. Test Preset Search
  const ps = doc.getElementById('presetSearch');
  if (!ps) throw new Error('Missing #presetSearch');
  ps.value = 'Carrara';
  ps.dispatchEvent(new win.Event('input'));
  const presetCards = doc.querySelectorAll('#presets .pcard');
  console.log(`Searching "Carrara": found ${presetCards.length} preset card(s)`);
  if (presetCards.length !== 1) throw new Error('Preset search failed for "Carrara"');
  
  // Clear search
  ps.value = '';
  ps.dispatchEvent(new win.Event('input'));
  console.log(`Cleared search: found ${doc.querySelectorAll('#presets .pcard').length} preset card(s)`);

  // 5. Test Navigation and Return to Designer
  const navGuide = doc.querySelector('#nav [data-p="guide"]');
  navGuide.click();
  console.log('Navigated to guide: p-designer display is', pDes.style.display);
  console.log('p-guide active?', doc.getElementById('p-guide').classList.contains('on'));
  if (pDes.style.display !== 'none') throw new Error('Failed to switch to guide');

  const backBtn = doc.querySelector('#p-guide [data-back-to-designer]');
  backBtn.click();
  console.log('Clicked back button: p-designer display is', pDes.style.display);
  if (pDes.style.display !== '') throw new Error('Failed to return to designer via back button');

  // 6. Test Help / Shortcuts Modal
  const helpBtn = doc.getElementById('btnHelp');
  const sm = doc.getElementById('shortcutsModal');
  if (!helpBtn || !sm) throw new Error('Missing help button or shortcuts modal');
  helpBtn.click();
  console.log('After clicking help: shortcutsModal display is', sm.style.display);
  if (sm.style.display !== 'flex') throw new Error('Help modal failed to open');
  const smClose = doc.getElementById('shortcutsBtnClose');
  smClose.click();
  console.log('After clicking close: shortcutsModal display is', sm.style.display);
  if (sm.style.display !== 'none') throw new Error('Help modal failed to close');

  console.log('ALL INTERACTIONS PASSED WITH FLYING COLORS!');
  process.exit(0);
}, 1200);
