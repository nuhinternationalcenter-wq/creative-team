const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

code = code.replace(/let lastLocalWrite = 0;\nlet syncTimeout: any;/g, 'let lastLocalWrite = 0;');
fs.writeFileSync('src/lib/sync.ts', code);
