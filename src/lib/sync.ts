import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const WORKSPACE_DOC_ID = 'main_workspace';

let syncTimeout: any;

export const syncToFirestore = (data: any) => {
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(async () => {
    try {
      await setDoc(doc(db, 'settings', WORKSPACE_DOC_ID), data, { merge: true });
    } catch (e: any) {
      console.error("Error syncing to Firestore", e);
      if (e.code === 'permission-denied') {
         console.warn("Permission denied when syncing to Firestore. Check your security rules.");
      }
    }
  }, 1000);
};

export const subscribeToWorkspace = (callback: (data: any | null) => void) => {
  return onSnapshot(
    doc(db, 'settings', WORKSPACE_DOC_ID), 
    (docSnap) => {
      if (docSnap.exists() && !docSnap.metadata.hasPendingWrites) {
        callback(docSnap.data());
      } else if (!docSnap.exists()) {
        callback(null);
      }
    },
    (error: any) => {
      console.error("Firestore Subscribe Error:", error);
      if (error.code === 'permission-denied') {
        alert("⚠️ แจ้งเตือน: ฐานข้อมูล Firebase ยังไม่อนุญาตให้เขียน/อ่านข้อมูล\n\nกรุณาไปที่ Firebase Console > Firestore Database > แท็บ Rules แล้วอัปเดตโค้ด Rules เป็น 'allow read, write: if true;' ก่อนครับ");
      }
    }
  );
};
