const fs = require('fs');
let code = fs.readFileSync('src/lib/sync.ts', 'utf8');

code = code.replace(
  /export const syncToFirestore = async \(data: any\) => \{[\s\S]*?\}\};/m,
  `let lastLocalWrite = 0;
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
};`
);

code = code.replace(
  /export const subscribeToWorkspace = \(callback: \(data: any \| null, hasPendingWrites: boolean\) => void\) => \{[\s\S]*?return onSnapshot\([\s\S]*?\(docSnap\) => \{/m,
  `export const subscribeToWorkspace = (callback: (data: any | null, hasPendingWrites: boolean) => void) => {
  const path = \`settings/\${WORKSPACE_DOC_ID}\`;
  return onSnapshot(
    doc(db, 'settings', WORKSPACE_DOC_ID),
    { includeMetadataChanges: true },
    (docSnap) => {
      // Prevent bouncing: If we've made a local write recently, ignore incoming server data
      // This protects the user's cursor and typing from being overwritten by delayed snapshots
      if (Date.now() - lastLocalWrite < 2500) {
        console.log('Ignored snapshot due to recent local write');
        return;
      }`
);

fs.writeFileSync('src/lib/sync.ts', code);
