import React, { useState } from 'react';
import { 
  X, 
  GitMerge, 
  Plus, 
  Calendar, 
  User, 
  Users, 
  Clock, 
  Sparkles, 
  Layers, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  FileText 
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { ChainStep, StepStatus, TaskAttachment } from '../types';
import { AttachmentManager } from './AttachmentManager';

interface CreateStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  defaultPerson?: string;
}

export const CreateStepModal: React.FC<CreateStepModalProps> = ({
  isOpen,
  onClose,
  defaultRole,
  defaultPerson,
}) => {
  const { activeProject, projects, members, addCustomStep, addPersonalTask } = useWork();
  const [selectedProjectId, setSelectedProjectId] = useState(activeProject?.id || '');

  const [taskScope, setTaskScope] = useState<'team' | 'personal'>('team');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedRole, setAssignedRole] = useState(() => defaultRole || (members[0]?.name || 'ฟานี'));
  const [status, setStatus] = useState<StepStatus>('in_progress');
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [estimatedHours, setEstimatedHours] = useState<number>(4);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

  // Sync selectedProjectId when activeProject changes or initially
  React.useEffect(() => {
    if (activeProject) {
      setSelectedProjectId(activeProject.id);
    }
  }, [activeProject]);

  // Sync defaultRole if changed
  React.useEffect(() => {
    if (defaultRole) {
      setAssignedRole(defaultRole);
    }
  }, [defaultRole]);

  if (!isOpen || !activeProject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) return;

    // Find the selected project
    const targetProject = projects.find(p => p.id === selectedProjectId);
    if (!targetProject) return;

    // Determine next step number
    const maxStepNum = targetProject.steps.reduce((max, s) => Math.max(max, s.stepNumber), 0);
    const nextStepNum = maxStepNum + 1;

    // Find member to match assignedPerson
    const matchedMember = members.find(
      (m) => m.name.includes(assignedRole) || assignedRole.includes(m.name)
    );
    const assignedPersonName = matchedMember ? matchedMember.name : assignedRole;

    const newStepData: Omit<ChainStep, 'id'> = {
      stepNumber: nextStepNum,
      title: title.trim(),
      description: description.trim() || undefined,
      assignedRole,
      assignedPerson: assignedPersonName,
      status,
      startDate,
      dueDate,
      dependencies: [],
      branch: 'main',
      taskScope, // 'team' or 'personal'
      estimatedHours: Number(estimatedHours) || 2,
      attachments,
      workLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: assignedPersonName,
          text: `เพิ่ม${taskScope === 'team' ? 'งานกลุ่ม' : 'งานส่วนตัว'}ในช่อง ${assignedRole}: ${title.trim()}`,
          type: 'log',
        },
      ],
    };

    addCustomStep(targetProject.id, newStepData);

    if (taskScope === 'personal') {
      addPersonalTask({
        projectId: targetProject.id,
        title: title.trim(),
        description: description.trim() || undefined,
        category: 'งานด่วน/งานโต๊ะ',
        priority: 'medium',
        status: status === 'completed' ? 'completed' : status === 'waiting_approval' ? 'waiting_approval' : 'in_progress',
        assignedTo: assignedPersonName,
        dueDate,
        checklist: [],
        tags: ['จากแดชบอร์ด/ตาราง'],
        attachments,
      });
    }

    onClose();
    setTitle('');
    setDescription('');
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          taskScope === 'team'
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              {taskScope === 'team' ? (
                <Users className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base">เพิ่มงานใหม่ในตาราง</h3>
              <p className="text-xs text-blue-100">
                {taskScope === 'team' 
                  ? 'งานกลุ่ม: เมื่อทำเสร็จแล้วสามารถส่งต่อให้เพื่อนร่วมทีมได้' 
                  : 'งานส่วนตัว: งานประจำตัวที่จัดการเองในช่องนี้'}
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Project Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">เลือกโปรเจคที่ต้องการเพิ่มงาน:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white font-semibold outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Task Scope Selector (งานกลุ่ม VS งานส่วนตัว) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              ประเภทงาน (เลือกประเภทที่ต้องการสร้าง): <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaskScope('team')}
                className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                  taskScope === 'team'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-blue-900">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>👥 งานกลุ่ม</span>
                  </div>
                  {taskScope === 'team' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  เมื่อทำเสร็จแล้ว <strong>สามารถกดส่งต่อให้เพื่อนร่วมทีม</strong> ได้ทันที
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTaskScope('personal')}
                className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                  taskScope === 'personal'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-emerald-900">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>👤 งานส่วนตัว</span>
                  </div>
                  {taskScope === 'personal' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  งานประจำตัวในช่องของตัวเอง ติ๊กเสร็จเป็นงานเดี่ยว
                </p>
              </button>
            </div>
          </div>

          {/* Target Person / Column */}
          <div className="space-y-1">
            <label htmlFor="step-assigned-role" className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>เพิ่มงานในช่องของใคร (เจ้าของงาน):</span>
              <span className="text-blue-600 text-[11px] font-bold">ช่อง: {assignedRole}</span>
            </label>
            <select
              id="step-assigned-role"
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white font-semibold outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  👤 {m.name} ({m.role || m.department})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              ชื่องาน / กิจกรรมที่ต้องทำ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                taskScope === 'team'
                  ? 'เช่น ถ่ายวิดีโอลุคบุ๊ค, สรุปบรีฟงานเสื้อผ้า, ออกแบบลาย...'
                  : 'เช่น จัดระเบียบไฟล์, โทรประสานงาน, สรุปงานประจำวัน...'
              }
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              รายละเอียด / บรีฟงาน / สิ่งที่ต้องทำ
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุสิ่งที่ต้องทำ ลิงก์ไฟล์งาน หรือคำแนะนำเพิ่มเติม..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Status, Start Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label htmlFor="step-initial-status" className="block text-xs font-bold text-slate-700">สถานะเริ่มต้น</label>
              <select
                id="step-initial-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StepStatus)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white outline-none font-medium"
              >
                <option value="in_progress">🔵 กำลังทำ</option>
                <option value="pending">⚪ รอดำเนินการ</option>
                <option value="waiting_approval">🟡 รอตรวจ</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">วันที่เริ่มงาน</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">กำหนดส่ง (Due Date)</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Estimated Hours */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>เวลาทำงานโดยประมาณ (ชั่วโมง):</span>
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Attachments (Files, Images, Links) */}
          <div className="pt-2 border-t border-slate-100">
            <AttachmentManager
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>

          {/* Helpful Tip Box */}
          <div className={`p-3 rounded-xl border text-xs ${
            taskScope === 'team'
              ? 'bg-blue-50/70 border-blue-200 text-blue-900'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                {taskScope === 'team' ? (
                  <span>
                    เมื่อคุณทำ <strong>งานกลุ่ม</strong> นี้เสร็จ จะมีปุ่ม <strong>"ส่งต่อ"</strong> บนการ์ดงาน เพื่อให้คุณเลือกว่าจะส่งต่อให้ใคร (เช่น Mr Lee) พร้อมพิมพ์บรีฟงาน และงานจะไปปรากฏในช่องของเพื่อนคนนั้นทันที
                  </span>
                ) : (
                  <span>
                    <strong>งานส่วนตัว</strong> จะปรากฏในการ์ดช่องของคุณ สามารถติ๊กเสร็จได้โดยตรง และยังมีตัวเลือกให้ส่งต่อให้เพื่อนร่วมทีมได้หากต้องการเปลี่ยนเป็นงานกลุ่มในภายหลัง
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`flex items-center space-x-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition cursor-pointer ${
                taskScope === 'team'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>บันทึก{taskScope === 'team' ? 'งานกลุ่ม' : 'งานส่วนตัว'}ลงช่อง {assignedRole}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
