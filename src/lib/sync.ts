import { db, auth } from './firebase';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export const WORKSPACE_DOC_ID = 'main_workspace';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function removeUndefinedValues(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string' && obj.startsWith('data:image/') && obj.length > 200000) {
      return '[Large Base64 Image Omitted for Firestore]';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item));
  }
  const clean: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        if (key === 'url' && typeof val === 'string' && val.startsWith('data:image/') && val.length > 200000) {
          clean[key] = '[Large Base64 Image Omitted for Firestore]';
        } else {
          clean[key] = removeUndefinedValues(val);
        }
      }
    }
  }
  return clean;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    isAnonymousUser?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

let syncTimeout: any;
let lastSyncedJSON = '';

/**
 * Immediate document update using updateDoc() as requested by user
 */
export const updateFirestoreDoc = async (updates: Record<string, any>) => {
  const path = `settings/${WORKSPACE_DOC_ID}`;
  const docRef = doc(db, 'settings', WORKSPACE_DOC_ID);
  const cleanUpdates = removeUndefinedValues(updates);
  try {
    await updateDoc(docRef, cleanUpdates);
  } catch (e: any) {
    try {
      await setDoc(docRef, cleanUpdates, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
};

export const hasPendingSync = () => syncTimeout !== undefined && syncTimeout !== null;

export const setLastSyncedData = (data: any) => {
  try {
    lastSyncedJSON = JSON.stringify(removeUndefinedValues(data));
  } catch (e) {
    console.error('Failed to stringify lastSyncedData', e);
  }
};

export const syncToFirestore = (data: any) => {
  const cleanData = removeUndefinedValues(data);
  let dataJSON = '';
  try {
    dataJSON = JSON.stringify(cleanData);
  } catch (e) {
    console.error('Failed to stringify cleanData', e);
  }

  if (dataJSON && dataJSON === lastSyncedJSON) {
    return;
  }
  
  if (syncTimeout) clearTimeout(syncTimeout);
  
  const path = `settings/${WORKSPACE_DOC_ID}`;
  
  syncTimeout = setTimeout(async () => {
    syncTimeout = null;
    try {
      if (dataJSON) lastSyncedJSON = dataJSON;
      await setDoc(doc(db, 'settings', WORKSPACE_DOC_ID), cleanData, { merge: true });
      console.log("Sync to Firestore successful");
    } catch (e: any) {
      console.error("Error syncing to Firestore", e);
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }, 150);
};

/**
 * Real-time listener using onSnapshot()
 */
export const subscribeToWorkspace = (callback: (data: any | null, hasPendingWrites: boolean) => void) => {
  const path = `settings/${WORKSPACE_DOC_ID}`;
  return onSnapshot(
    doc(db, 'settings', WORKSPACE_DOC_ID),
    { includeMetadataChanges: true },
    (docSnap) => {
      if (docSnap.exists()) {
        const snapData = docSnap.data();
        if (!docSnap.metadata.hasPendingWrites) {
          setLastSyncedData(snapData);
        }
        callback(snapData, docSnap.metadata.hasPendingWrites);
      } else {
        callback(null, false);
      }
    },
    (error: any) => {
      console.error("Firestore Subscribe Error:", error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
};

