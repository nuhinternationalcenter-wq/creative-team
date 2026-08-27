import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const WORKSPACE_DOC_ID = 'main_workspace';

let syncTimeout: any;

export const syncToFirestore = (data: any) => {
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(async () => {
    try {
      await setDoc(doc(db, 'settings', WORKSPACE_DOC_ID), data, { merge: true });
    } catch (e) {
      console.error("Error syncing to Firestore", e);
    }
  }, 1000);
};

export const subscribeToWorkspace = (callback: (data: any) => void) => {
  return onSnapshot(doc(db, 'settings', WORKSPACE_DOC_ID), (docSnap) => {
    if (docSnap.exists() && !docSnap.metadata.hasPendingWrites) {
      callback(docSnap.data());
    }
  });
};
