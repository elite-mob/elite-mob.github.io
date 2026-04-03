const fs = require('fs');
const path = require('path');
const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
const svg = fs.readFileSync(svgPath, 'utf8');
const minified = svg.replace(/\s+/g, ' ').trim();
const b64 = Buffer.from(minified).toString('base64');
console.log('data:image/svg+xml;base64,' + b64);
