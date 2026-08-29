const fs = require('fs');
let code = fs.readFileSync('src/components/WorkDocumentsView.tsx', 'utf8');

const newHandleImageUpload = `
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { uploadFileToStorage } = await import('../lib/storage');
        const downloadUrl = await uploadFileToStorage(file, 'documents');
        insertImage(downloadUrl);
      } catch (err: any) {
        console.error('Failed to upload image:', err);
        alert('Upload failed: ' + err.message);
      }
    }
  };
`;

code = code.replace(/const handleImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*\}\s*\};/m, newHandleImageUpload.trim());

fs.writeFileSync('src/components/WorkDocumentsView.tsx', code);
