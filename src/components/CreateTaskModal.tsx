import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Clock, 
  User, 
  Flag 
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { PriorityLevel, TaskAttachment } from '../types';
import { AttachmentManager } from './AttachmentManager';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { members, selectedRole, addPersonalTask } = useWork();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('งานประจำวัน');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [assignedTo, setAssignedTo] = useState(() => {
    return selectedRole === 'all' ? (members[0]?.name || 'มีมี่') : selectedRole;
  });
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'ตรวจเช็ครายละเอียดเบื้องต้น', done: false },
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([
      ...checklistItems,
      {
        id: `c-${Date.now()}`,
        text: newChecklistText.trim(),
        done: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    addPersonalTask({
      title: title.trim(),
      description: description.trim(),
      category: category || 'ทั่วไป',
      priority,
      status: 'todo',
      assignedTo,
      dueDate,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      checklist: checklistItems,
      notes: notes.trim(),
      tags,
      attachments,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">เพิ่มงานส่วนตัว (New Personal Task)</h3>
              <p className="text-xs text-slate-300">บันทึกรายการสิ่งที่ต้องทำและกำหนดเวลาส่ง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              ชื่องาน / รายการที่ต้องทำ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สรุปรายงานประจำสัปดาห์, เช็คราคาตัวอย่าง..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Assigned Member & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="create-task-assigned-to" className="block text-xs font-bold text-slate-700">ผู้รับผิดชอบ</label>
              <select
                id="create-task-assigned-to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="create-task-category" className="block text-xs font-bold text-slate-700">หมวดหมู่งาน</label>
              <select
                id="create-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
              >
                <option value="งานประจำวัน">งานประจำวัน</option>
                <option value="รายงาน/ผู้บริหาร">รายงาน/ผู้บริหาร</option>
                <option value="ประสานงาน">ประสานงาน</option>
                <option value="จัดซื้อ">จัดซื้อ</option>
                <option value="โปรดักชั่น">โปรดักชั่น</option>
                <option value="เทคนิค/อุปกรณ์">เทคนิค/อุปกรณ์</option>
                <option value="ส่วนตัว">ส่วนตัว</option>
              </select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="create-task-priority" className="block text-xs font-bold text-slate-700">ระดับความสำคัญ</label>
              <select
                id="create-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
              >
                <option value="urgent">🔥 ด่วนมาก (Urgent)</option>
                <option value="high">⚡ สำคัญสูง (High)</option>
                <option value="medium">ปานกลาง (Medium)</option>
                <option value="low">ทั่วไป (Low)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">กำหนดส่ง (Due Date)</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียด เป้าหมาย หรือลิงก์ที่เกี่ยวข้อง..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Checklist items */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              รายการเช็คลิสต์ย่อย ({checklistItems.length})
            </label>
            
            <div className="space-y-1.5">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span>{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="+ พิมพ์เช็คลิสต์ย่อยแล้วกดเพิ่ม..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 text-xs p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                + เพิ่มข้อ
              </button>
            </div>
          </div>

          {/* Attachments (Files, Images, Links) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <AttachmentManager
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">แท็ก (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="เช่น ด่วน, ตัดต่อ, เอกสาร, ประชุม"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              บันทึกงานส่วนตัว
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
