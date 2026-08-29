const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

code = code.replace(
  'export const syncToFirestore = (data: any) => {',
  `export const hasPendingSync = () => syncTimeout !== undefined && syncTimeout !== null;

export const syncToFirestore = (data: any) => {`
);

code = code.replace(
  /syncTimeout = setTimeout\(async \(\) => \{/g,
  `syncTimeout = setTimeout(async () => {
    syncTimeout = null;`
);

fs.writeFileSync('src/lib/sync.ts', code);
