const fs = require('fs');
let code = fs.readFileSync('src/components/AttachmentManager.tsx', 'utf8');

// Replace readFileAsDataUrl and compressImage with uploadFileToStorage usage in uploadFile
const uploadFileReplace = `
  const uploadFile = async (file: File, type: 'image' | 'file') => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      const { uploadFileToStorage } = await import('../lib/storage');
      
      const downloadUrl = await uploadFileToStorage(
        file, 
        'attachments', 
        (progress) => setUploadProgress(progress)
      );
      
      const sizeStr = file.size > 1024 * 1024 
        ? \`\${(file.size / (1024 * 1024)).toFixed(1)} MB\`
        : \`\${Math.round(file.size / 1024)} KB\`;

      const newAttachment: TaskAttachment = {
        id: \`att-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`,
        name: file.name,
        type: type,
        url: downloadUrl,
        size: sizeStr,
        uploadedAt: new Date().toISOString()
      };

      setAttachments((prev) => [...prev, newAttachment]);
      setActiveTab(null);
      setUploadProgress(100);
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };
`;

code = code.replace(/const uploadFile = async \(file: File, type: 'image' \| 'file'\) => \{[\s\S]*?setTimeout\(\(\) => setUploadProgress\(0\), 500\);\s*\}\s*\};/m, uploadFileReplace.trim());

fs.writeFileSync('src/components/AttachmentManager.tsx', code);
