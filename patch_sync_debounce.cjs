const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

code = code.replace(
  /export const syncToFirestore = async \(data: any\) => \{[\s\S]*?\};\n\n\/\*\*/m,
  `let syncTimeout: any;

export const hasPendingSync = () => syncTimeout !== undefined && syncTimeout !== null;

export const syncToFirestore = (data: any) => {
  if (syncTimeout) clearTimeout(syncTimeout);
  
  const cleanData = removeUndefinedValues(data);
  const path = \`settings/\${WORKSPACE_DOC_ID}\`;
  
  syncTimeout = setTimeout(async () => {
    syncTimeout = null;
    try {
      await setDoc(doc(db, 'settings', WORKSPACE_DOC_ID), cleanData, { merge: true });
      console.log("Sync to Firestore successful");
    } catch (e: any) {
      console.error("Error syncing to Firestore", e);
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }, 1500);
};

/**`
);

fs.writeFileSync('src/lib/sync.ts', code);
