import React, { useState } from 'react';
import { 
  X, 
  Send, 
  UserCheck, 
  FileText, 
  Paperclip, 
  Sparkles,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { ChainStep, PersonalTask, TaskAttachment, TeamMember } from '../types';
import { AttachmentManager } from './AttachmentManager';
import { isLeeAlias } from '../utils/memberMatch';

interface SubmitApprovalModalProps {
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

export const SubmitApprovalModal: React.FC<SubmitApprovalModalProps> = ({
  isOpen,
  onClose,
  target,
  task,
  step,
  projectId,
}) => {
  const { 
    members, 
    selectedRole, 
    submitStepForApproval, 
    submitPersonalTaskForApproval 
  } = useWork();

  const effectiveTarget = target || (task ? { type: 'personal_task' as const, item: task } : (step ? { type: 'step' as const, item: step, projectId } : null));

  const [approverRole, setApproverRole] = useState<string>(() => {
    // Prefer members who have canApprove or admin
    const defaultApprover = members.find((m) => m.canApprove || m.roleLevel === 'admin' || m.roleLevel === 'approver');
    return defaultApprover ? defaultApprover.name : (members.find(m => isLeeAlias(m.name))?.name || 'Mr Lee');
  });

  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>(() => {
    if (effectiveTarget?.item?.attachments) {
      return [...effectiveTarget.item.attachments];
    }
    return [];
  });

  // Current submitter name
  const currentSubmitter = selectedRole === 'all' 
    ? (effectiveTarget?.type === 'step' 
        ? (effectiveTarget?.item as ChainStep)?.assignedPerson 
        : (effectiveTarget?.item as PersonalTask)?.assignedTo) || ''
    : selectedRole;

  if (!isOpen || !effectiveTarget || !effectiveTarget.item) return null;

  const title = effectiveTarget.item.title;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverRole) {
      alert('กรุณาเลือกผู้อนุมัติงาน');
      return;
    }

    if (effectiveTarget.type === 'step' && effectiveTarget.projectId) {
      submitStepForApproval(
        effectiveTarget.projectId,
        effectiveTarget.item.id,
        approverRole,
        currentSubmitter,
        comment.trim(),
        attachments
      );
    } else if (effectiveTarget.type === 'personal_task') {
      submitPersonalTaskForApproval(
        effectiveTarget.item.id,
        approverRole,
        currentSubmitter,
        comment.trim(),
        attachments
      );
    }

    onClose();
    setComment('');
  };

  const approverList = members.filter((m) => m.canApprove || m.roleLevel === 'admin' || m.roleLevel === 'approver');
  const allOtherMembers = members.filter((m) => !approverList.some((a) => a.id === m.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-prompt">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">ส่งงานเพื่อขออนุมัติ (Submit for Approval)</h3>
              <p className="text-xs text-amber-100">ส่งเรื่องให้หัวหน้างาน/ผู้อนุมัติตรวจสอบความถูกต้อง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Target Task Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {effectiveTarget.type === 'step' ? '📌 งานในกระบวนการผลิต (Team Step)' : '📝 งานส่วนตัว (Personal Task)'}
            </span>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">{title}</h4>
            <div className="flex items-center space-x-3 text-xs text-slate-600 pt-1">
              <span>ผู้ส่งเรื่อง: <strong className="text-slate-800">{currentSubmitter}</strong></span>
              <span>กำหนดส่ง: <strong className="text-slate-800">{effectiveTarget.item.dueDate}</strong></span>
            </div>
          </div>

          {/* Approver Selection */}
          <div className="space-y-1.5">
            <label htmlFor="select-approver-role" className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>เลือกผู้อนุมัติ (Approver) <span className="text-rose-500">*</span></span>
            </label>
            <select
              id="select-approver-role"
              required
              value={approverRole}
              onChange={(e) => setApproverRole(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white font-medium outline-none"
            >
              <optgroup label="👑 สมาชิกที่มีสิทธิ์อนุมัติ (Authorized Approvers)">
                {approverList.map((m) => (
                  <option key={m.id} value={m.name}>
                    ⭐ {m.name} ({m.role || m.department}) {m.roleLevel === 'admin' ? '- Admin' : '- ผู้อนุมัติ'}
                  </option>
                ))}
              </optgroup>
              {allOtherMembers.length > 0 && (
                <optgroup label="สมาชิกคนอื่นๆ ในทีม">
                  {allOtherMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      👤 {m.name} ({m.role || m.department})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-[11px] text-slate-500">
              เมื่อส่งแล้ว งานจะแจ้งเตือนไปยังผู้อนุมัติคนนี้ทันที และสถานะจะเปลี่ยนเป็น <strong>"รอตรวจ/อนุมัติ"</strong>
            </p>
          </div>

          {/* Submitter Note / Remarks */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              รายละเอียดงาน / บันทึกชี้แจงถึงผู้อนุมัติ:
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="เช่น ทำงานส่วนนี้เสร็จเรียบร้อยแล้ว แนบไฟล์และภาพตัวอย่างไว้ด้านล่าง รบกวนตรวจเช็คครับ..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Attachments Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="block text-xs font-bold text-slate-800">
              ไฟล์งาน / ภาพตัวอย่าง / ลิงก์แนบส่งตรวจ:
            </span>
            <AttachmentManager
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>

          {/* Action Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              ผู้อนุมัติจะสามารถ <strong>กดอนุมัติ</strong>, <strong>ยกเลิก</strong> หรือ <strong>ส่งกลับให้แก้ไข (พร้อมวางรูปภาพคอมเมนต์)</strong> ได้ และระบบจะส่งผลการตรวจสอบกลับมาหาคุณทันที
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
              className="flex items-center space-x-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md shadow-amber-600/20 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ยืนยันส่งขออนุมัติ</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
