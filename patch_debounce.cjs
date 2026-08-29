const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

code = code.replace(
  /syncTimeout = setTimeout\(async \(\) => \{\s*syncTimeout = null;/g,
  `syncTimeout = setTimeout(async () => {
    syncTimeout = null;`
);

code = code.replace(
  /\}, 200\);/g,
  `}, 1500); // 1.5 seconds to respect Firestore 1 write/sec limit`
);

fs.writeFileSync('src/lib/sync.ts', code);
