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
      
      let lastBytesTransferred = 0;
      let timeoutId = setTimeout(() => {
        console.warn('Upload timed out due to inactivity, canceling uploadTask');
        uploadTask.cancel();
        reject(new Error('timeout'));
      }, 60000);

      uploadTask.on('state_changed', 
        (snapshot) => {
          if (snapshot.bytesTransferred > lastBytesTransferred) {
            lastBytesTransferred = snapshot.bytesTransferred;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              console.warn('Upload timed out due to inactivity, canceling uploadTask');
              uploadTask.cancel();
              reject(new Error('timeout'));
            }, 60000);
          }
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        }, 
        (error) => {
          clearTimeout(timeoutId);
          console.error('Upload failed:', error);
          if (error.code === 'storage/unauthorized') {
            reject(new Error('unauthorized'));
          } else {
            reject(error);
          }
        }, 
        async () => {
          clearTimeout(timeoutId);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};
