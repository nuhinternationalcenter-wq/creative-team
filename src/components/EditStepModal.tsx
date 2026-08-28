import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  User, 
  Users, 
  Check, 
  Paperclip,
  Clock,
  Sparkles,
  Ban
} from 'lucide-react';
import { ChainStep, StepStatus, TaskAttachment } from '../types';
import { useWork } from '../context/WorkContext';
import { AttachmentManager } from './AttachmentManager';

interface EditStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: ChainStep | null;
}

export const EditStepModal: React.FC<EditStepModalProps> = ({
  isOpen,
  onClose,
  step,
}) => {
  const { activeProject, members, updateStepDetails, deleteStep } = useWork();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedRole, setAssignedRole] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<StepStatus>('in_progress');
  const [taskScope, setTaskScope] = useState<'team' | 'personal'>('team');
  const [handoverComment, setHandoverComment] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [cardColor, setCardColor] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (step) {
      setTitle(step.title || '');
      setDescription(step.description || '');
      setAssignedRole(step.assignedRole || 'ฟานี');
      setDueDate(step.dueDate || new Date().toISOString().split('T')[0]);
      setStatus(step.status || 'in_progress');
      setTaskScope(step.taskScope || 'team');
      setHandoverComment(step.handoverComment || '');
      setEstimatedHours(step.estimatedHours || 4);
      setAttachments(step.attachments || []);
      setCardColor(step.color || '');
      setShowDeleteConfirm(false);
    }
  }, [step, isOpen]);

  if (!isOpen || !step || !activeProject) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedMember = members.find((m) => m.name.includes(assignedRole) || assignedRole.includes(m.name));
    const assignedPersonName = matchedMember ? matchedMember.name : assignedRole;
    const primaryLink = attachments.find((a) => a.type === 'link')?.url || step.link || '';

    updateStepDetails(activeProject.id, step.id, {
      title: title.trim(),
      description: description.trim(),
      assignedRole: assignedRole.trim(),
      assignedPerson: assignedPersonName,
      dueDate,
      status,
      taskScope,
      handoverComment: handoverComment.trim(),
      estimatedHours,
      attachments,
      link: primaryLink,
      color: cardColor,
    });

    onClose();
  };

  const handleCancelTask = () => {
    updateStepDetails(activeProject.id, step.id, {
      status: 'blocked',
      handoverComment: handoverComment ? `${handoverComment} (ยกเลิกงาน)` : 'งานนี้ถูกยกเลิกการดำเนินการ',
    });
    onClose();
  };

  const handleDelete = () => {
    deleteStep(activeProject.id, step.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">แก้ไขหรือยกเลิกงาน (สเต็ปที่ {step.stepNumber})</h3>
              <p className="text-xs text-blue-200/80">ปรับปรุงข้อมูล ผู้รับผิดชอบ กำหนดส่ง ไฟล์แนบ หรือยกเลิกงาน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Task Scope: Team vs Personal */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">ประเภทงาน *</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setTaskScope('team')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition ${
                  taskScope === 'team'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${taskScope === 'team' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">👥 งานกลุ่ม (ทีม)</div>
                  <div className="text-[10px] text-slate-500">สามารถส่งต่องานให้เพื่อนร่วมทีมได้</div>
                </div>
              </label>

              <label
                onClick={() => setTaskScope('personal')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition ${
                  taskScope === 'personal'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${taskScope === 'personal' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">👤 งานส่วนตัว</div>
                  <div className="text-[10px] text-slate-500">จัดการทำเองในช่องของคุณ</div>
                </div>
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">ชื่องาน / กิจกรรมที่ต้องทำ *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่องานที่ชัดเจน..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Assignee & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">ผู้รับผิดชอบ (ช่องพนักงาน) *</label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role || m.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">สถานะงาน *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StepStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="in_progress">🔵 กำลังทำ (In Progress)</option>
                <option value="pending">⚪ รอดำเนินการ (Pending)</option>
                <option value="waiting_approval">🟡 รอตรวจ/อนุมัติ (Waiting Approval)</option>
                <option value="blocked">🔴 ติดขัด / ระงับ (Blocked / Cancelled)</option>
                <option value="completed">🟢 เสร็จแล้ว (Completed & Archive)</option>
              </select>
            </div>
          </div>

          {/* Due Date & Estimated Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">กำหนดส่ง (Due Date) *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">เวลาโดยประมาณ (ชั่วโมง)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">รายละเอียดงาน / คำอธิบายเพิ่มเติม</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุสเปก หรือแนวทางการทำงาน..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Handover Comment / Brief notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">บรีฟงาน / ข้อความส่งมอบที่ระบุไว้</label>
            <textarea
              rows={2}
              value={handoverComment}
              onChange={(e) => setHandoverComment(e.target.value)}
              placeholder="เช่น ส่งต่องานตัดต่อเรียบร้อย แนบไฟล์ในโฟลเดอร์..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Card Color Picker */}
          <div className="space-y-1 pt-1">
            <label className="block text-xs font-bold text-slate-700">สีการ์ดงาน (Card Color)</label>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
              {[
                { label: 'ตามพนักงาน', color: '' },
                { label: 'ฟ้า', color: '#3b82f6' },
                { label: 'มรกต', color: '#10b981' },
                { label: 'ส้ม', color: '#f59e0b' },
                { label: 'กุหลาบ', color: '#f43f5e' },
                { label: 'ม่วง', color: '#8b5cf6' },
                { label: 'คราม', color: '#6366f1' },
                { label: 'เขียวมิ้นต์', color: '#14b8a6' },
              ].map((c) => (
                <button
                  key={c.color || 'default'}
                  type="button"
                  onClick={() => setCardColor(c.color)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition cursor-pointer ${
                    cardColor === c.color ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-slate-300"
                    style={{ backgroundColor: c.color || '#94a3b8' }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
              <input
                type="color"
                value={cardColor || '#3b82f6'}
                onChange={(e) => setCardColor(e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0 overflow-hidden"
                title="เลือกสีแบบกำหนดเอง"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="pt-2 border-t border-slate-200">
            <AttachmentManager
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>

          {/* Action Bar inside Form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center space-x-2">
              {/* Cancel task button */}
              <button
                type="button"
                onClick={handleCancelTask}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition flex items-center space-x-1.5 cursor-pointer"
                title="เปลี่ยนสถานะเป็นยกเลิก/ติดขัด"
              >
                <Ban className="w-3.5 h-3.5 text-amber-600" />
                <span>ยกเลิกงานนี้</span>
              </button>

              {/* Delete permanently button */}
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center space-x-1.5 cursor-pointer"
                title="ลบงานนี้ถาวร"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>ลบงานถาวร</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                ปิด
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>

        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">ยืนยันการลบงานนี้?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  งาน "{step.title}" จะถูกลบออกจากกระดานอย่างถาวร
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
