const fs = require('fs');
let code = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

code = code.replace(
  /import\('\.\.\/lib\/sync'\)\.then\(\(\{ subscribeToWorkspace, hasPendingSync \}\) => \{/g,
  `import('../lib/sync').then(({ subscribeToWorkspace }) => {`
);

code = code.replace(
  /\/\/ Prevent bouncing: Ignore snapshot if we have a pending debounced local write,[\s\S]*?if \(hasPendingSync && hasPendingSync\(\)\) \{[\s\S]*?console\.log\('Snapshot ignored due to pending local sync timeout'\);[\s\S]*?return;[\s\S]*?\}/g,
  ''
);

fs.writeFileSync('src/context/WorkContext.tsx', code);
