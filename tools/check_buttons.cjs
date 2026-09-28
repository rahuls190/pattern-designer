const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const bodyHtml = html.slice(0, html.indexOf('<script'));
const buttonIds = [...bodyHtml.matchAll(/<button[^>]+id="([^"]+)"/g)].map(m => m[1]);

console.log('--- ALL BUTTON IDS IN HTML ---');
console.log(buttonIds);

const script = html.slice(html.indexOf('<script>'));

buttonIds.forEach(id => {
  const hasRef = script.includes(`'${id}'`) || script.includes(`"${id}"`) || script.includes('`' + id + '`');
  console.log(`Button #${id}: referenced in script?`, hasRef);
});
