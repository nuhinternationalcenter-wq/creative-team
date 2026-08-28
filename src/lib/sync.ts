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
        clean[key] = removeUndefinedValues(val);
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

/**
 * Debounced sync for rapid consecutive local updates
 */
export const syncToFirestore = (data: any) => {
  if (syncTimeout) clearTimeout(syncTimeout);
  
  const cleanData = removeUndefinedValues(data);
  syncTimeout = setTimeout(async () => {
    const path = `settings/${WORKSPACE_DOC_ID}`;
    try {
      await setDoc(doc(db, 'settings', WORKSPACE_DOC_ID), cleanData, { merge: true });
    } catch (e: any) {
      console.error("Error syncing to Firestore", e);
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }, 300);
};

/**
 * Real-time listener using onSnapshot()
 */
export const subscribeToWorkspace = (callback: (data: any | null) => void) => {
  const path = `settings/${WORKSPACE_DOC_ID}`;
  return onSnapshot(
    doc(db, 'settings', WORKSPACE_DOC_ID), 
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback(null);
      }
    },
    (error: any) => {
      console.error("Firestore Subscribe Error:", error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
};

