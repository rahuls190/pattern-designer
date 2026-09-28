const fs = require('fs');
const { JSDOM } = require('jsdom');

console.log('Testing index.html in JSDOM...');

const html = fs.readFileSync('index.html', 'utf8');

const errors = [];
const warnings = [];

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost:3000/#e=tess',
  beforeParse(window) {
    // Mock canvas context
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
    window.navigator.clipboard = {
      writeText: async () => {}
    };

    window.onerror = function(msg, url, line, col, error) {
      errors.push({ type: 'window.onerror', msg, line, error: error && error.stack });
    };
  }
});

// Give scripts time to execute
setTimeout(() => {
  console.log('Errors caught during initialization:', errors.length);
  if (errors.length > 0) {
    console.error('Initialization errors:', errors);
  } else {
    console.log('No initialization errors!');
  }
  process.exit(errors.length > 0 ? 1 : 0);
}, 1000);
