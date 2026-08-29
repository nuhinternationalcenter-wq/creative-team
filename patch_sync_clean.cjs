const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

code = code.replace(/let syncTimeout: any;\n\nexport const hasPendingSync = \(\) => syncTimeout !== undefined && syncTimeout !== null;/g, 'export const hasPendingSync = () => syncTimeout !== undefined && syncTimeout !== null;');

fs.writeFileSync('src/lib/sync.ts', code);
