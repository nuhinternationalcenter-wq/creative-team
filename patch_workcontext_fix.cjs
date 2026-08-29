const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

code = code.replace(
  /\/\/ Prevent bouncing: If we've made a local write recently, ignore incoming server data[\s\S]*?if \(Date\.now\(\) - lastLocalWrite < 2500\) \{[\s\S]*?return;[\s\S]*?\}/g,
  ''
);

fs.writeFileSync('src/lib/sync.ts', code);
