import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitMerge, 
  Plus, 
  Calendar, 
  Layers, 
  Sparkles,
  Info,
  Edit3
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { PriorityLevel, TeamChainProject } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: TeamChainProject | null;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const { createProject, updateProject, deleteProject, activeProject, addCustomStep, members } = useWork();

  const [mode, setMode] = useState<'new_project' | 'add_step'>('new_project');

  // New Project State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [category, setCategory] = useState('New Product Launch');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [useTemplate, setUseTemplate] = useState(true);
  const [allowedMembers, setAllowedMembers] = useState<string[]>([]);

  // Add Step State
  const [stepTitle, setStepTitle] = useState('');
  const [stepNumber, setStepNumber] = useState(21);
  const [assignedRole, setAssignedRole] = useState(members[0]?.name || 'มีมี่');
  const [stepDueDate, setStepDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [stepDesc, setStepDesc] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setMode('new_project');
      setProjectTitle(projectToEdit.title);
      setProjectCode(projectToEdit.code);
      setCategory(projectToEdit.category);
      setDescription(projectToEdit.description || '');
      setPriority(projectToEdit.priority);
      setStartDate(projectToEdit.startDate);
      setTargetDate(projectToEdit.targetDate);
      setAllowedMembers(projectToEdit.allowedMembers || []);
    } else {
      setMode('new_project');
      setProjectTitle('');
      setProjectCode('');
      setCategory('New Product Launch');
      setDescription('');
      setPriority('high');
      setUseTemplate(true);
      setAllowedMembers([]);
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    if (projectToEdit) {
      updateProject(projectToEdit.id, {
        title: projectTitle.trim(),
        code: projectCode.trim(),
        category,
        description: description.trim(),
        priority,
        startDate,
        targetDate,
        allowedMembers,
      });
      onClose();
      return;
    }

    // If template selected, copy standard steps
    const templateSteps = useTemplate && activeProject
      ? activeProject.steps.map((s) => ({
          ...s,
          id: `step-${Date.now()}-${s.stepNumber}`,
          status: s.stepNumber === 1 ? 'in_progress' : 'pending',
          completedAt: undefined,
          handoverComment: undefined,
          workLogs: [],
        }))
      : [
          {
            id: `step-${Date.now()}-1`,
            stepNumber: 1,
            title: 'เริ่มต้นวางแผนคอนเซปต์โปรเจกต์',
            assignedRole: 'มีมี่',
            assignedPerson: 'มีมี่',
            status: 'in_progress' as const,
            dueDate: targetDate,
            dependencies: [],
            workLogs: [],
          },
        ];

    createProject({
      title: projectTitle.trim(),
      code: projectCode.trim() || `PRJ-${Date.now().toString().slice(-4)}`,
      category,
      description: description.trim(),
      priority,
      startDate,
      targetDate,
      status: 'active',
      steps: templateSteps as any,
      allowedMembers,
    });

    onClose();
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepTitle.trim() || !activeProject) return;

    addCustomStep(activeProject.id, {
      stepNumber: Number(stepNumber),
      title: stepTitle.trim(),
      description: stepDesc.trim(),
      assignedRole,
      assignedPerson: assignedRole,
      status: 'pending',
      dueDate: stepDueDate,
      dependencies: [],
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
              {projectToEdit ? <Edit3 className="w-4 h-4 text-white" /> : <GitMerge className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {projectToEdit ? 'แก้ไขข้อมูลโปรเจกต์' : mode === 'new_project' ? 'สร้างโปรเจกต์ใหม่' : 'เพิ่มขั้นตอนในโปรเจกต์ปัจจุบัน'}
              </h3>
              <p className="text-xs text-slate-300">{projectToEdit ? 'อัปเดตรายละเอียดโปรเจกต์' : 'บริหารจัดการกระบวนการทำงานทีม'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        {!projectToEdit && (
          <div className="px-6 pt-4 flex space-x-2">
            <button
              onClick={() => setMode('new_project')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                mode === 'new_project'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              📦 สร้างโปรเจกต์ใหม่
            </button>
            <button
              onClick={() => setMode('add_step')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                mode === 'add_step'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ➕ เพิ่มสเต็ปใหม่ในกระบวนการ
            </button>
          </div>
        )}

        {/* Form Body */}
        {mode === 'new_project' ? (
          <form onSubmit={handleCreateProject} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">ชื่อโปรเจกต์ *</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="เช่น คอลเลกชัน Autumn 2026, แคมเปญวันแม่..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">รหัสโปรเจกต์</label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  placeholder="เช่น AW26-01"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">หมวดหมู่</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">วันที่เริ่มต้น</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">เป้าหมายส่งมอบ</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">คำอธิบายโปรเจกต์</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุรายละเอียดสำคัญ..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">สมาชิกที่เข้าถึงโปรเจกต์ได้ (ปล่อยว่างหากให้ทุกคนเห็น)</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setAllowedMembers(prev => 
                        prev.includes(member.name) 
                          ? prev.filter(m => m !== member.name)
                          : [...prev, member.name]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] border transition ${
                      allowedMembers.includes(member.name)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Toggle */}
            {!projectToEdit && (
              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useTemplate}
                  onChange={(e) => setUseTemplate(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-indigo-950 block">ใช้แม่แบบกระบวนการทำงาน 20 สเต็ปมาตรฐาน</span>
                  <span className="text-indigo-700 text-[11px]">คัดลอกโครงสร้าง มีมี่ ➔ MKT ➔ NPD ➔ PO ➔ ซูรี/กะฟา ➔ เดะมี่/ฟานี ➔ น้องเซ็ง/น้องลี</span>
                </div>
              </label>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {projectToEdit ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์ "${projectToEdit.title}"?`)) {
                      deleteProject(projectToEdit.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบโปรเจกต์นี้</span>
                </button>
              ) : <div />}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  {projectToEdit ? <Edit3 className="w-3.5 h-3.5" /> : null}
                  <span>{projectToEdit ? 'บันทึกการแก้ไข' : 'สร้างโปรเจกต์ใหม่'}</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          <form onSubmit={handleAddStep} className="p-6 space-y-4">
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">ลำดับสเต็ป (#)</label>
                <input
                  type="number"
                  min="1"
                  value={stepNumber}
                  onChange={(e) => setStepNumber(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700">ผู้รับผิดชอบ</label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">ชื่องานในสเต็ปนี้ *</label>
              <input
                type="text"
                required
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                placeholder="เช่น ตรวจเช็คสต็อกสินค้าพร้อมจำหน่าย..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">กำหนดส่ง (Due Date)</label>
              <input
                type="date"
                value={stepDueDate}
                onChange={(e) => setStepDueDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">คำอธิบาย</label>
              <textarea
                rows={2}
                value={stepDesc}
                onChange={(e) => setStepDesc(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition"
              >
                + เพิ่มสเต็ปใหม่
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
