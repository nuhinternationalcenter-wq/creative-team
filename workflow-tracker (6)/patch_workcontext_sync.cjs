const fs = require('fs');
let code = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

const replacement = `import('../lib/sync').then(({ subscribeToWorkspace, hasPendingSync }) => {
      unsubscribe = subscribeToWorkspace((data, hasPendingWrites) => {
        setIsFirebaseLoaded(true);
        
        // Prevent bouncing: Ignore snapshot if we have a pending debounced local write,
        // or if Firestore indicates there are pending local writes.
        if (hasPendingSync && hasPendingSync()) {
          console.log('Snapshot ignored due to pending local sync timeout');
          return;
        }

        if (data && !hasPendingWrites) {`;

code = code.replace(
  /import\('\.\.\/lib\/sync'\)\.then\(\(\{ subscribeToWorkspace \}\) => \{\s*unsubscribe = subscribeToWorkspace\(\(data, hasPendingWrites\) => \{\s*setIsFirebaseLoaded\(true\);\s*if \(data && !hasPendingWrites\) \{/m,
  replacement
);

fs.writeFileSync('src/context/WorkContext.tsx', code);
