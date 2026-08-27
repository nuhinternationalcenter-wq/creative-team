import React, { useState } from 'react';
import { 
  Send, 
  X, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Bell,
  Sparkles,
  Users
} from 'lucide-react';
import { PersonalTask } from '../types';
import { useWork } from '../context/WorkContext';

interface PersonalTaskHandoverModalProps {
  task: PersonalTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalTaskHandoverModal: React.FC<PersonalTaskHandoverModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { members, handoverPersonalTask } = useWork();

  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'complete_and_assign_next' | 'delegate'>('complete_and_assign_next');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Set default recipient and dates when task opens
  React.useEffect(() => {
    if (task) {
      // Pick first member who is not the current assignee as default suggestion
      const other = members.find((m) => m.name !== task.assignedTo);
      setSelectedRecipient(other?.name || members[0]?.name || '');
      setNewDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
      setNewTitle(`${task.title} (ส่งต่อจาก ${task.assignedTo})`);
      setComment('');
      setActionType('complete_and_assign_next');
    }
  }, [task, members, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient) return;

    setSubmitting(true);
    handoverPersonalTask(
      task.id,
      selectedRecipient,
      comment.trim() || `ส่งต่องาน "${task.title}" ให้คุณ ${selectedRecipient} รับผิดชอบต่อ`,
      actionType,
      newDueDate,
      newTitle
    );
    setSubmitting(false);
    onClose();
  };

  const recipientMember = members.find((m) => m.name === selectedRecipient);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">ส่งต่องานให้เพื่อนร่วมทีม (Handover Task)</h3>
              <p className="text-xs text-blue-100">เลือกผู้รับผิดชอบช่วงต่อ พร้อมส่งข้อความและแจ้งเตือนทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Current Task Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                งานต้นทางของคุณ
              </span>
              <span>ผู้ทำปัจจุบัน: <strong className="text-slate-800">{task.assignedTo}</strong></span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
            )}
          </div>

          {/* Recipient Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>เลือกคนที่ต้องการส่งต่องานให้: <span className="text-rose-500">*</span></span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 scrollbar-thin">
              {members.map((m) => {
                const isSelected = selectedRecipient === m.name;
                const isSelf = m.name === task.assignedTo;

                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setSelectedRecipient(m.name)}
                    className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full shrink-0 ${m.avatarBg}`} />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {m.name} {isSelf && <span className="text-[10px] text-slate-400 font-normal">(ฉัน)</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{m.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Handover Action Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              รูปแบบการส่งต่องาน:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActionType('complete_and_assign_next')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  actionType === 'complete_and_assign_next'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เสร็จส่วนฉัน & ส่งต่อให้เพื่อน</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  เปลี่ยนงานนี้เป็นเสร็จสมบูรณ์ และสร้างงานใหม่ให้เพื่อนเริ่มทำต่อ
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActionType('delegate')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  actionType === 'delegate'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                  <span>โอน/มอบหมายให้เพื่อนทำ</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  เปลี่ยนชื่อผู้รับผิดชอบงานนี้เป็นเพื่อนทันที
                </p>
              </button>
            </div>
          </div>

          {/* New Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>กำหนดส่งของเพื่อน:</span>
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {actionType === 'complete_and_assign_next' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  หัวข้องานสำหรับเพื่อน:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ระบุชื่อขั้นตอนของเพื่อน..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Handover Comment / Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              ข้อความส่งมอบงาน & รายละเอียดถึง {selectedRecipient ? `คุณ ${selectedRecipient}` : 'เพื่อน'}: <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="เช่น สิ่งที่ทำเสร็จ ลิงก์ไฟล์งาน โฟลเดอร์งาน หรือสิ่งที่ต้องการให้เพื่อนทำต่อ..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Instant Notification Indicator */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-2 text-xs text-amber-900">
            <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <span className="font-bold">ระบบส่งการแจ้งเตือนทันที:</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                เมื่อกดยืนยัน ระบบจะส่งกระดิ่งแจ้งเตือนไปยัง <strong className="text-slate-900 font-bold">คุณ {selectedRecipient || '...'}</strong> โดยตรง ให้ทราบว่ามีงานใหม่ส่งต่อมา
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedRecipient}
              className="flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>ยืนยันส่งต่องาน & แจ้งเตือนเพื่อน</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
