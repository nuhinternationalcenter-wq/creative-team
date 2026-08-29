const fs = require('fs');
let code = fs.readFileSync('src/components/AttachmentManager.tsx', 'utf8');

const startIndex = code.indexOf("const uploadFile = async (file: File, type: 'image' | 'file') => {");
const endIndex = code.indexOf("const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {");

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `const uploadFile = async (file: File, type: 'image' | 'file') => {
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
        uploadedAt: new Date().toISOString(),
      };

      onChange([...attachments, newAttachment]);
      setActiveTab(null);
    } catch (e: any) {
      console.error('File upload error:', e);
      alert('เกิดข้อผิดพลาดในการแนบไฟล์: ' + (e.message || e));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {`;
  
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex + "const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {".length);
  fs.writeFileSync('src/components/AttachmentManager.tsx', code);
  console.log("Fixed successfully.");
} else {
  console.log("Could not find start/end indices.");
}
