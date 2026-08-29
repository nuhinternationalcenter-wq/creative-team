const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

const startIndex = code.indexOf('export const syncToFirestore = async (data: any) => {');
const endIndex = code.indexOf('export const subscribeToWorkspace');

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `let lastLocalWrite = 0;
let syncTimeout: any;

export const syncToFirestore = (data: any) => {
  lastLocalWrite = Date.now();
  if (syncTimeout) clearTimeout(syncTimeout);
  
  const cleanData = removeUndefinedValues(data);
  const path = \`settings/\${WORKSPACE_DOC_ID}\`;
  
  syncTimeout = setTimeout(async () => {
    try {
      await setDoc(doc(db, 'settings', WORKSPACE_DOC_ID), cleanData, { merge: true });
      console.log("Sync to Firestore successful");
    } catch (e: any) {
      console.error("Error syncing to Firestore", e);
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }, 1000);
};

/**
 * Real-time listener using onSnapshot()
 */
`;
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/lib/sync.ts', code);
  console.log("Replaced successfully");
} else {
  console.log("Could not find start/end indices", startIndex, endIndex);
}
