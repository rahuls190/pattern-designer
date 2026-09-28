const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const bodyHtml = html.slice(0, html.indexOf('<script'));
const bodyIds = new Set([...bodyHtml.matchAll(/id="([^"]+)"/g)].map(m => m[1]));

console.log('Total static body IDs:', bodyIds.size);

const script = html.slice(html.indexOf('<script>'));
const lookups = [...new Set([...script.matchAll(/\$\(['"`]([^'"`]+)['"`]\)/g)].map(m => m[1]))];
const missing = lookups.filter(id => !bodyIds.has(id));
console.log('--- MISSING DOM LOOKUPS with $(...) ---');
console.log(missing);

// Check if these missing elements are dynamically created in the script
missing.forEach(id => {
  const dynamicMatch = script.includes(`id="${id}"`) || script.includes(`id=\\"${id}\\"`) || script.includes(`id='${id}'`);
  console.log(`Missing ID "${id}" created dynamically?`, dynamicMatch);
});

