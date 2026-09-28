const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');

const errors = [];

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

    window.onerror = function(msg, url, line, col, error) {
      errors.push({ msg, line, error: error && error.stack });
    };
  }
});

setTimeout(() => {
  const win = dom.window;
  console.log('Window loaded. Evaluating script scope...');
  
  const testResults = win.eval(`
    (() => {
      const res = { errors: [], enginesCount: ENGINES.length, presetsCount: PRESETS.length };
      for (let i = 0; i < PRESETS.length; i++) {
        try {
          applyPreset(i);
          render();
        } catch(e) {
          res.errors.push({ preset: i, name: PRESETS[i].name, error: e.message });
        }
      }
      try {
        const dxf = exportDXF();
        res.dxfOk = Boolean(dxf && dxf.length > 50);
      } catch(e) {
        res.errors.push({ export: 'dxf', error: e.message });
      }
      try {
        const pdf = exportPDF();
        res.pdfOk = Boolean(pdf && pdf.startsWith('%PDF'));
      } catch(e) {
        res.errors.push({ export: 'pdf', error: e.message });
      }
      return res;
    })()
  `);

  console.log('Test results:', testResults);
  if (testResults.errors.length > 0) {
    console.error('Errors found:', testResults.errors);
    process.exit(1);
  } else {
    console.log(`SUCCESS! Tested ${testResults.presetsCount} presets and all vector exports with 0 errors!`);
    process.exit(0);
  }
}, 1200);
