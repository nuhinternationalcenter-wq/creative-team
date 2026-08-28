import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Tag, 
  Flag, 
  Clock, 
  CheckSquare, 
  Plus, 
  FileText
} from 'lucide-react';
import { PersonalTask, PriorityLevel, TaskAttachment } from '../types';
import { useWork } from '../context/WorkContext';
import { AttachmentManager } from './AttachmentManager';

interface EditPersonalTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: PersonalTask | null;
}

export const EditPersonalTaskModal: React.FC<EditPersonalTaskModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { members, updatePersonalTask, deletePersonalTask } = useWork();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('งานประจำวัน');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [cardColor, setCardColor] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCategory(task.category || 'งานประจำวัน');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'todo');
      setAssignedTo(task.assignedTo || members[0]?.name || 'ฟานี');
      setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
      setEstimatedMinutes(task.estimatedMinutes || 60);
      setNotes(task.notes || '');
      setTagsInput((task.tags || []).join(', '));
      setAttachments(task.attachments || []);
      setCardColor(task.color || '');
      setShowDeleteConfirm(false);
    }
  }, [task, isOpen, members]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const primaryLink = attachments.find((a) => a.type === 'link')?.url || task.link || '';

    updatePersonalTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      category: category || 'ทั่วไป',
      priority,
      status,
      assignedTo,
      dueDate,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      notes: notes.trim(),
      tags,
      attachments,
      link: primaryLink,
      color: cardColor,
    });

    onClose();
  };

  const handleDelete = () => {
    deletePersonalTask(task.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-prompt">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">แก้ไขงานส่วนตัว (Edit Personal Task)</h3>
              <p className="text-xs text-slate-400">ปรับเปลี่ยนรายละเอียด กำหนดส่ง หรือผู้รับผิดชอบ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ชื่องาน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่องาน..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายรายละเอียดงาน..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">สถานะงาน</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="todo">📋 รอดำเนินการ (To Do)</option>
                <option value="in_progress">⚡ กำลังทำ (In Progress)</option>
                <option value="completed">✅ เสร็จสิ้น (Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ระดับความสำคัญ</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="low">🟢 ปกติ (Low)</option>
                <option value="medium">🟡 ปานกลาง (Medium)</option>
                <option value="high">🔴 สำคัญ (High)</option>
                <option value="urgent">🔥 ด่วนมาก (Urgent)</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ผู้รับผิดชอบ</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">กำหนดส่ง (Due Date)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Category & Estimated Minutes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่งาน</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="เช่น งานประจำวัน, การตลาด"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ประมาณเวลา (นาที)</label>
              <input
                type="number"
                min={15}
                step={15}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">แท็ก / คีย์เวิร์ด (คั่นด้วยจุลภาค)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="เช่น urgent, review, design"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Card Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">สีการ์ดงาน (Card Color)</label>
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
                  className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 transition cursor-pointer ${
                    cardColor === c.color ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300"
                    style={{ backgroundColor: c.color || '#94a3b8' }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
              <input
                type="color"
                value={cardColor || '#3b82f6'}
                onChange={(e) => setCardColor(e.target.value)}
                className="w-6 h-6 rounded-lg border border-slate-300 cursor-pointer p-0 overflow-hidden"
                title="เลือกสีแบบกำหนดเอง"
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="pt-2">
            <AttachmentManager
              attachments={attachments}
              onChange={setAttachments}
              label="ไฟล์ / รูปภาพแนบประกอบงาน"
            />
          </div>

          {/* Delete Confirm Box or Actions */}
          {showDeleteConfirm ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
              <p className="font-bold text-rose-900">คุณแน่ใจหรือไม่ว่าต้องการลบงานส่วนตัวนี้?</p>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                >
                  ยืนยันลบ
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold rounded-lg transition"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบงานนี้</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
