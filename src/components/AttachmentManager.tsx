import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Trash2, 
  ExternalLink, 
  Plus, 
  FileText, 
  Eye, 
  X,
  Upload
} from 'lucide-react';
import { TaskAttachment } from '../types';
import { formatExternalUrl, openExternalUrl } from '../utils/url';

interface AttachmentManagerProps {
  attachments: TaskAttachment[];
  onChange: (attachments: TaskAttachment[]) => void;
  readonly?: boolean;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments = [],
  onChange,
  readonly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'image' | 'file' | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Add Link
  const handleAddLink = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl.trim()) return;

    const formattedUrl = formatExternalUrl(linkUrl.trim());

    const newAttachment: TaskAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: linkName.trim() || formattedUrl.replace(/^https?:\/\//i, '').split('/')[0],
      type: 'link',
      url: formattedUrl,
      uploadedAt: new Date().toISOString(),
    };

    onChange([...attachments, newAttachment]);
    setLinkUrl('');
    setLinkName('');
    setActiveTab(null);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

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
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, 'image');
    if (e.target) e.target.value = '';
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, 'file');
    if (e.target) e.target.value = '';
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Header & Add Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
          <Paperclip className="w-3.5 h-3.5 text-blue-600" />
          <span>ไฟล์แนบ รูปภาพ & ลิงก์ที่เกี่ยวข้อง ({attachments.length})</span>
        </div>

        {!readonly && (
          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => setActiveTab(activeTab === 'link' ? null : 'link')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border transition cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>+ ลิงก์</span>
            </button>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => imageInputRef.current?.click()}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ImageIcon className="w-3 h-3 text-pink-600" />
              <span>+ รูปภาพ</span>
            </button>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-3 h-3 text-emerald-600" />
              <span>+ ไฟล์</span>
            </button>

            {/* Hidden native inputs */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {isUploading && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1.5 animate-pulse">
          <div className="flex justify-between text-xs text-blue-700 font-semibold">
            <span>กำลังอัปโหลดไฟล์ไปที่ Cloud Storage...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200/50 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Link Input Panel (Using div to avoid invalid HTML nested form submission) */}
      {!readonly && activeTab === 'link' && (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-blue-900 flex items-center justify-between">
            <span>🔗 เพิ่มลิงก์ (Google Drive / Canva / Figma / Sheets / URL)</span>
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="ชื่อลิงก์ (เช่น Lookbook รูปแบบจริง)"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
            <input
              type="text"
              required
              placeholder="URL ลิงก์ (https://...)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="px-2.5 py-1 text-slate-600 text-[11px] font-medium hover:bg-slate-100 rounded-lg"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleAddLink}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer"
            >
              แนบลิงก์
            </button>
          </div>
        </div>
      )}

      {/* Attachments List / Grid */}
      {attachments.length === 0 ? (
        <div className="p-3 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          ยังไม่มีไฟล์ รูปภาพ หรือลิงก์แนบในงานนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((att) => {
            const isImg = att.type === 'image';
            const isLink = att.type === 'link';

            return (
              <div
                key={att.id}
                className="group p-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {/* Thumbnail / Icon */}
                  {isImg ? (
                    <div 
                      onClick={() => setPreviewImage(att.url)}
                      className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer relative group/img"
                    >
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : isLink ? (
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}

                  {/* Name & metadata */}
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-xs font-semibold text-slate-800 truncate" title={att.name}>
                      {att.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      {isLink ? (
                        <span className="text-blue-600 truncate max-w-[120px]">{att.url}</span>
                      ) : (
                        <span>{att.size || 'ไฟล์แนบ'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 shrink-0">
                  {isLink ? (
                    <a
                      href={formatExternalUrl(att.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="เปิดลิงก์"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : isImg ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(att.url)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                      title="ดูภาพขยาย"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <a
                      href={att.url}
                      download={att.name}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                      title="ดาวน์โหลดไฟล์"
                    >
                      <Upload className="w-3.5 h-3.5 rotate-180" />
                    </a>
                  )}

                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => handleRemove(att.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="ลบไฟล์แนบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="ภาพขยาย"
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
