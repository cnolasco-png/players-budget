const fs = require('fs');
const path = require('path');
const [,, chunkName] = process.argv;
if (!chunkName) {
  console.error('Usage: node scripts/inspect-chunk.cjs <chunk-file>');
  process.exit(1);
}
const filepath = path.join('dist','assets',chunkName);
if (!fs.existsSync(filepath)) {
  console.error('Chunk not found:', filepath);
  process.exit(1);
}
const code = fs.readFileSync(filepath,'utf8');
console.log(code.slice(0,2000));
