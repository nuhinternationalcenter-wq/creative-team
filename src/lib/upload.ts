import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadFileToStorage = async (file: File, folder: string = 'uploads'): Promise<string> => {
  if (!file) throw new Error("No file provided");
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${uniqueName}`);
  
  const snapshot = await uploadBytesResumable(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};
