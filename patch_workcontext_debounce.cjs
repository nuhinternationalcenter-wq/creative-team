const fs = require('fs');
let code = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

code = code.replace(
  /import\('\.\.\/lib\/sync'\)\.then\(\(\{ subscribeToWorkspace \}\) => \{/g,
  `import('../lib/sync').then(({ subscribeToWorkspace, hasPendingSync }) => {`
);

code = code.replace(
  /if \(data && !hasPendingWrites\) \{/g,
  `// Prevent bouncing: Ignore snapshot if we have a pending debounced local write,
        if (hasPendingSync && hasPendingSync()) {
          console.log('Snapshot ignored due to pending local sync timeout');
          return;
        }

        if (data && !hasPendingWrites) {`
);

fs.writeFileSync('src/context/WorkContext.tsx', code);
