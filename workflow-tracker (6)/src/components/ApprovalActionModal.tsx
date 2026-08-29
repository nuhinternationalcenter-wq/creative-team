import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Image as ImageIcon, 
  Paperclip, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  User, 
  FileText,
  Upload,
  ClipboardPaste,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { ChainStep, PersonalTask, TaskAttachment } from '../types';
import { AttachmentManager } from './AttachmentManager';
import { uploadFileToStorage } from '../lib/storage';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: {
    type: 'step' | 'personal_task';
    item: ChainStep | PersonalTask;
    projectId?: string;
  } | null;
  task?: PersonalTask | null;
  step?: ChainStep | null;
  projectId?: string;
}

type ActionChoice = 'approve' | 'revision' | 'reject';

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  isOpen,
  onClose,
  target,
  task,
  step,
  projectId,
}) => {
  const { 
    selectedRole, 
    approveStep, 
    rejectStep, 
    requestStepRevision, 
    approvePersonalTask, 
    rejectPersonalTask, 
    requestPersonalTaskRevision,
    members 
  } = useWork();

  const effectiveTarget = target || (task ? { type: 'personal_task' as const, item: task } : (step ? { type: 'step' as const, item: step, projectId } : null));

  const [action, setAction] = useState<ActionChoice>('approve');
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAction('approve');
      setComment('');
      setAttachments([]);
    }
  }, [isOpen, effectiveTarget?.item?.id]);

  // Current Approver Name
  const approverName = selectedRole === 'all' 
    ? (effectiveTarget?.item?.approverRole || members.find((m) => m.canApprove)?.name || 'Mr Lee') 
    : selectedRole;

  // Submitter name
  const submitterName = effectiveTarget?.item?.submittedForApprovalBy || 
    (effectiveTarget?.type === 'step' 
      ? (effectiveTarget?.item as ChainStep)?.assignedPerson 
      : (effectiveTarget?.item as PersonalTask)?.assignedTo) || '';

  // Listen for Clipboard Paste (Ctrl+V / Cmd+V) to capture screenshots / images directly
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.type && item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            try {
              setIsUploading(true);
              setPasteNotice('กำลังอัปโหลดรูปภาพที่วางจากคลิปบอร์ด...');
              const url = await uploadFileToStorage(file, 'approval_revisions');
              const newAttachment: TaskAttachment = {
                id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name: `ภาพคอมเมนต์แก้ไข_${new Date().toLocaleTimeString('th-TH')}.png`,
                type: 'image',
                url,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                uploadedAt: new Date().toISOString(),
              };
              setAttachments((prev) => [...prev, newAttachment]);
              setPasteNotice('✅ วางรูปภาพสำเร็จแล้ว!');
              setTimeout(() => setPasteNotice(null), 3000);
            } catch (err: any) {
              console.error('Failed to upload pasted image', err);
              // Fallback to base64 data URL
              const reader = new FileReader();
              reader.onload = (event) => {
                const base64 = event.target?.result as string;
                if (base64) {
                  const fallbackAttachment: TaskAttachment = {
                    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    name: `ภาพคอมเมนต์แก้ไข_${new Date().toLocaleTimeString('th-TH')}.png`,
                    type: 'image',
                    url: base64,
                    uploadedAt: new Date().toISOString(),
                  };
                  setAttachments((prev) => [...prev, fallbackAttachment]);
                  setPasteNotice('✅ วางรูปภาพสำเร็จ!');
                  setTimeout(() => setPasteNotice(null), 3000);
                }
              };
              reader.readAsDataURL(file);
            } finally {
              setIsUploading(false);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen]);

  if (!isOpen || !effectiveTarget || !effectiveTarget.item) return null;

  const title = effectiveTarget.item.title;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (action === 'revision' && !comment.trim() && attachments.length === 0) {
      alert('กรุณาระบุข้อความหรือแนบรูปภาพรายละเอียดที่ต้องการให้แก้ไข');
      return;
    }

    if (action === 'reject' && !comment.trim()) {
      alert('กรุณาระบุเหตุผลในการยกเลิก/ปฏิเสธ');
      return;
    }

    try {
      if (effectiveTarget.type === 'step' && effectiveTarget.projectId) {
        if (action === 'approve') {
          approveStep(effectiveTarget.projectId, effectiveTarget.item.id, approverName, comment.trim() || 'อนุมัติเรียบร้อยแล้ว');
        } else if (action === 'revision') {
          requestStepRevision(effectiveTarget.projectId, effectiveTarget.item.id, approverName, comment.trim(), attachments);
        } else if (action === 'reject') {
          rejectStep(effectiveTarget.projectId, effectiveTarget.item.id, approverName, comment.trim());
        }
      } else if (effectiveTarget.type === 'personal_task') {
        if (action === 'approve') {
          approvePersonalTask(effectiveTarget.item.id, approverName, comment.trim() || 'อนุมัติเรียบร้อยแล้ว');
        } else if (action === 'revision') {
          requestPersonalTaskRevision(effectiveTarget.item.id, approverName, comment.trim(), attachments);
        } else if (action === 'reject') {
          rejectPersonalTask(effectiveTarget.item.id, approverName, comment.trim());
        }
      }
    } catch (error) {
      console.error('Error during approval action:', error);
      alert('เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง');
    } finally {
      onClose();
      setComment('');
      setAttachments([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-prompt">
        
        {/* Top Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ${
              action === 'approve' ? 'bg-emerald-600' : action === 'revision' ? 'bg-amber-600' : 'bg-rose-600'
            }`}>
              {action === 'approve' && <CheckCircle2 className="w-5 h-5 text-white" />}
              {action === 'revision' && <RotateCcw className="w-5 h-5 text-white" />}
              {action === 'reject' && <XCircle className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="font-bold text-base">ตรวจสอบและอนุมัติงาน (Approval Center)</h3>
              <p className="text-xs text-slate-300">
                ผู้อนุมัติ: <strong>{approverName}</strong> | ผู้ส่งเรื่อง: <strong>{submitterName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Target Task Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {effectiveTarget.type === 'step' ? '📌 สเต็ปงานในกระบวนการ' : '📝 งานส่วนตัว'}
              </span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                <span>รอคุณอนุมัติ</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">{title}</h4>
            
            {/* Submitter's Note if any */}
            {effectiveTarget.item.approvalComment && (
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 space-y-0.5">
                <span className="font-bold text-slate-800 block text-[11px]">💬 ข้อความจากผู้ส่งตรวจ:</span>
                <p className="italic text-slate-600 leading-relaxed">{effectiveTarget.item.approvalComment}</p>
              </div>
            )}

            {/* Submitter Attachments if any */}
            {effectiveTarget.item.attachments && effectiveTarget.item.attachments.length > 0 && (
              <div className="pt-1.5 border-t border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 block">📎 ไฟล์ / รูปที่ส่งตรวจ ({effectiveTarget.item.attachments.length} รายการ):</span>
                <div className="flex flex-wrap gap-2">
                  {effectiveTarget.item.attachments.filter((att, idx, self) => self.findIndex(a => a.id === att.id) === idx).map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs text-slate-700 hover:text-blue-700 transition"
                    >
                      {att.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> : <Paperclip className="w-3.5 h-3.5 text-slate-500" />}
                      <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Selector: Approve / Revision / Reject */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              เลือกผลการตรวจสอบ: <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              
              {/* Option 1: Approve */}
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  action === 'approve'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">✅ อนุมัติผ่าน</span>
                <span className="text-[10px] text-slate-500">เสร็จสมบูรณ์ / พร้อมส่งต่อ</span>
              </button>

              {/* Option 2: Send back for revision */}
              <button
                type="button"
                onClick={() => setAction('revision')}
                className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  action === 'revision'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">🔄 ส่งกลับแก้ไข</span>
                <span className="text-[10px] text-slate-500">แจ้งจุดแก้ + วางรูป</span>
              </button>

              {/* Option 3: Reject / Cancel */}
              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  action === 'reject'
                    ? 'border-rose-600 bg-rose-50 text-rose-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">❌ ยกเลิก/ปฏิเสธ</span>
                <span className="text-[10px] text-slate-500">ไม่อนุมัติ / ยกเลิกคำขอ</span>
              </button>

            </div>
          </div>

          {/* Comment / Instructions Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {action === 'approve' 
                ? 'คำชมเชย / บันทึกเพิ่มเติม (ไม่บังคับ):' 
                : action === 'revision' 
                ? 'รายละเอียดสิ่งที่ต้องแก้ไข (Revision Instructions) *:' 
                : 'เหตุผลที่ปฏิเสธ / ยกเลิก *:'}
            </label>
            <textarea
              rows={3}
              required={action !== 'approve'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                action === 'approve'
                  ? 'เช่น ผลงานเรียบร้อยดีมาก ผ่านการตรวจแล้วครับ...'
                  : action === 'revision'
                  ? 'เช่น รบกวนปรับสีโทนภาพให้สว่างขึ้น 10% และแก้ขนาดฟอนต์หัวข้อตามภาพที่แนบ...'
                  : 'เช่น ข้อมูลไม่ครบถ้วน หรือยกเลิกเนื่องจากเปลี่ยนแผนงาน...'
              }
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          {/* Image Paste and Upload Section (Especially for Revision) */}
          {action === 'revision' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>แนบรูปภาพจุดที่ต้องแก้ไข (รองรับการกด Ctrl+V วางรูปได้ทันที)</span>
                </span>
                <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                  📋 Paste Supported
                </span>
              </div>

              {/* Paste Notice Toast */}
              {pasteNotice && (
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold animate-in fade-in flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{pasteNotice}</span>
                </div>
              )}

              {/* Drop / Paste Zone */}
              <div 
                className="p-4 border-2 border-dashed border-amber-300 hover:border-amber-400 bg-white/80 rounded-xl text-center space-y-2 cursor-pointer transition"
                tabIndex={0}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                  <ClipboardPaste className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700">
                  <strong className="text-amber-900">กด Ctrl+V (หรือ Cmd+V) บนคีย์บอร์ดเพื่อวางภาพแคปหน้าจอ</strong> หรือคลิกเพื่ออัปโหลดไฟล์รูปภาพ
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    setIsUploading(true);
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i];
                      try {
                        const url = await uploadFileToStorage(file, 'approval_revisions');
                        const newAtt: TaskAttachment = {
                          id: `att-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
                          name: file.name,
                          type: 'image',
                          url,
                          size: `${(file.size / 1024).toFixed(1)} KB`,
                          uploadedAt: new Date().toISOString(),
                        };
                        setAttachments((prev) => [...prev, newAtt]);
                      } catch {
                        // fallback
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const base64 = ev.target?.result as string;
                          if (base64) {
                            setAttachments((prev) => [
                              ...prev,
                              {
                                id: `att-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
                                name: file.name,
                                type: 'image',
                                url: base64,
                                size: `${(file.size / 1024).toFixed(1)} KB`,
                                uploadedAt: new Date().toISOString(),
                              },
                            ]);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                    setIsUploading(false);
                  }}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-800 file:font-semibold hover:file:bg-amber-200 cursor-pointer"
                />
              </div>

              {/* Thumbnails of Attached Revision Images */}
              {attachments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    รูปภาพประกอบการแก้ไข ({attachments.length} รูป):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {attachments.filter((att, idx, self) => self.findIndex(a => a.id === att.id) === idx).map((att) => (
                      <div key={att.id} className="relative group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        <img 
                          src={att.url} 
                          alt={att.name} 
                          className="w-full h-24 object-cover" 
                        />
                        <div className="p-1.5 text-[10px] text-slate-700 truncate font-medium bg-white">
                          {att.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                          title="ลบรูปนี้"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Action Banner */}
          <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
            action === 'approve'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : action === 'revision'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              {action === 'approve' && (
                <span>เมื่ออนุมัติแล้ว ระบบจะบันทึกสถานะเสร็จสิ้น และส่งการแจ้งเตือนไปยัง <strong>{submitterName}</strong> ทันที</span>
              )}
              {action === 'revision' && (
                <span>ระบบจะส่งงานนี้ย้อนกลับไปยัง <strong>{submitterName}</strong> พร้อมข้อความและรูปภาพที่คุณแนบ เพื่อให้พนักงานแก้ไขและส่งกลับมาตรวจใหม่</span>
              )}
              {action === 'reject' && (
                <span>ระบบจะปฏิเสธคำขออนุมัติ และส่งเรื่องกลับไปยัง <strong>{submitterName}</strong></span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`flex items-center space-x-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition cursor-pointer ${
                action === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : action === 'revision'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {action === 'approve' && 'ยืนยันอนุมัติงาน'}
                {action === 'revision' && 'ส่งกลับให้แก้ไขพร้อมรูปภาพ'}
                {action === 'reject' && 'ยืนยันปฏิเสธ/ยกเลิก'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
