const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

code = code.replace(
  /export const syncToFirestore = \(data: any\) => \{[\s\S]*?\};[\s\S]*?\/\*\*/m,
  `export const syncToFirestore = async (data: any) => {
  const cleanData = removeUndefinedValues(data);
  const path = \`settings/\${WORKSPACE_DOC_ID}\`;
  
  try {
    // Calling setDoc immediately. Firestore SDK handles network debouncing/batching automatically.
    await setDoc(doc(db, 'settings', WORKSPACE_DOC_ID), cleanData, { merge: true });
    console.log("Sync to Firestore successful");
  } catch (e: any) {
    console.error("Error syncing to Firestore", e);
    handleFirestoreError(e, OperationType.WRITE, path);
  }
};

/**`
);

fs.writeFileSync('src/lib/sync.ts', code);
