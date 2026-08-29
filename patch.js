const fs = require('fs');

// 1. Update src/lib/sync.ts
let sync = fs.readFileSync('src/lib/sync.ts', 'utf8');

// Change subscribeToWorkspace
sync = sync.replace(
  /export const subscribeToWorkspace = \(callback: \(data: any \| null\) => void\) => \{[\s\S]*?return onSnapshot\([\s\S]*?doc\(db, 'settings', WORKSPACE_DOC_ID\),[\s\S]*?\(docSnap\) => \{/m,
  `export const subscribeToWorkspace = (callback: (data: any | null, hasPendingWrites: boolean) => void) => {
  const path = \`settings/\${WORKSPACE_DOC_ID}\`;
  return onSnapshot(
    doc(db, 'settings', WORKSPACE_DOC_ID),
    { includeMetadataChanges: true },
    (docSnap) => {`
);

sync = sync.replace(
  /if \(docSnap\.exists\(\)\) \{\s*callback\(docSnap\.data\(\)\);\s*\} else \{\s*callback\(null\);\s*\}/,
  `if (docSnap.exists()) {
        callback(docSnap.data(), docSnap.metadata.hasPendingWrites);
      } else {
        callback(null, false);
      }`
);

// Reduce debounce in syncToFirestore from 1000 to 200
sync = sync.replace(/1000\);\s*\};/g, '200);\n};');

fs.writeFileSync('src/lib/sync.ts', sync);

// 2. Update src/context/WorkContext.tsx
let wc = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

// Remove isRemoteUpdateRef
wc = wc.replace(/const isRemoteUpdateRef = React\.useRef\(false\);\n/g, '');
wc = wc.replace(/isRemoteUpdateRef\.current = true;\n/g, '');
wc = wc.replace(/setTimeout\(\(\) => \{\s*isRemoteUpdateRef\.current = false;\s*\}, 1000\);\n/g, '');
wc = wc.replace(/if \(!isFirebaseLoaded \|\| isRemoteUpdateRef\.current\) return;/g, 'if (!isFirebaseLoaded) return;');

// Update subscribeToWorkspace signature and logic
wc = wc.replace(
  /const unsubscribe = subscribeToWorkspace\(\(data\) => \{/g,
  `const unsubscribe = subscribeToWorkspace((data, hasPendingWrites) => {`
);

wc = wc.replace(
  /if \(data\) \{([\s\S]*?)const migrated = migrateAllDataToMrLee/m,
  `if (data && !hasPendingWrites) {
          const migrated = migrateAllDataToMrLee`
);

fs.writeFileSync('src/context/WorkContext.tsx', wc);
