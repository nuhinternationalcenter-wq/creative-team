import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const uploadFileToStorage = (
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const fileExt = file.name.split('.').pop();
      const storageRef = ref(storage, `${path}/${fileId}.${fileExt}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        }, 
        (error) => {
          console.error('Upload failed:', error);
          if (error.code === 'storage/unauthorized') {
            reject(new Error('unauthorized'));
          } else {
            reject(error);
          }
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};
