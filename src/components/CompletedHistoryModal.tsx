import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  RotateCcw, 
  Search, 
  Paperclip, 
  MessageSquare, 
  Calendar, 
  User, 
  Users, 
  Sparkles,
  ExternalLink,
  Eye,
  FileText,
  Download,
  Printer,
  Plus
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { ChainStep, TaskAttachment } from '../types';
import { AttachmentManager } from './AttachmentManager';
import { formatExternalUrl } from '../utils/url';

interface CompletedHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStep: (step: ChainStep) => void;
}

export const CompletedHistoryModal: React.FC<CompletedHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectStep,
}) => {
  const { activeProject, personalTasks, selectedRole, reopenStep, updatePersonalTask, updateStepStatus, members } = useWork();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'hr_report'>('list');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingAttachmentsStepId, setEditingAttachmentsStepId] = useState<string | null>(null);

  if (!isOpen || !activeProject) return null;

  const teamCompletedSteps = activeProject.steps.filter((s) => s.status === 'completed');

  const personalCompletedSteps: ChainStep[] = personalTasks
    .filter((t) => t.status === 'completed')
    .map((t) => ({
      id: t.id,
      stepNumber: 0,
      title: t.title,
      description: t.description || t.notes,
      assignedRole: t.assignedTo || 'งานส่วนตัว',
      assignedPerson: t.assignedTo || 'ส่วนตัว',
      status: 'completed',
      taskScope: 'personal',
      dueDate: t.dueDate,
      completedAt: t.updatedAt || t.dueDate,
      handoverComment: t.notes ? `[งานส่วนตัว] ${t.notes}` : 'งานส่วนตัวเสร็จสมบูรณ์',
      attachments: t.attachments || [],
      dependencies: [],
    }));

  const allCompleted = [...teamCompletedSteps, ...personalCompletedSteps];

  // Month options derived from completedSteps or current date
  const monthsList = [
    { value: 'all', label: 'ทุกเดือน (All History)' },
    { value: '2026-08', label: 'สิงหาคม 2026 (August)' },
    { value: '2026-07', label: 'กรกฎาคม 2026 (July)' },
    { value: '2026-06', label: 'มิถุนายน 2026 (June)' },
  ];

  const filteredSteps = allCompleted.filter((s) => {
    // Month filter
    if (selectedMonth !== 'all') {
      const stepDate = s.completedAt || '';
      if (!stepDate.startsWith(selectedMonth)) return false;
    }

    // Search term (Task name / Description / Comment)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchesTitle = s.title.toLowerCase().includes(q);
      const matchesDesc = s.description && s.description.toLowerCase().includes(q);
      const matchesComment = s.handoverComment && s.handoverComment.toLowerCase().includes(q);
      const matchesPerson = s.assignedRole.toLowerCase().includes(q) || s.assignedPerson.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesComment && !matchesPerson) return false;
    }

    // Member / Assignee filter
    if (selectedAssignee !== 'all') {
      const target = selectedAssignee === 'my_tasks' ? selectedRole : selectedAssignee;
      if (target !== 'all') {
        const matchRole = s.assignedRole.includes(target) || target.includes(s.assignedRole);
        const matchPerson = s.assignedPerson.includes(target) || target.includes(s.assignedPerson);
        const matchName = target.includes('ลี') && (s.assignedRole.includes('แบฟีลี') || s.assignedPerson.includes('แบฟีลี'));
        if (!matchRole && !matchPerson && !matchName) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (a.completedAt && b.completedAt) {
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    }
    return b.stepNumber - a.stepNumber;
  });

  const handleRestore = (stepId: string) => {
    const isPersonal = personalTasks.some((t) => t.id === stepId);
    if (isPersonal) {
      updatePersonalTask(stepId, { status: 'in_progress' });
    } else {
      reopenStep(activeProject?.id || '', stepId);
    }
  };

  const handleUpdateAttachments = (stepId: string, newAttachments: TaskAttachment[]) => {
    const isPersonal = personalTasks.some((t) => t.id === stepId);
    if (isPersonal) {
      updatePersonalTask(stepId, { attachments: newAttachments });
    } else {
      const step = activeProject.steps.find((s) => s.id === stepId);
      if (step) {
        updateStepStatus(activeProject.id, stepId, 'completed', step.handoverComment, undefined, newAttachments);
      }
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-prompt">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base">ประวัติผลงานที่เสร็จสิ้น (Completed Archive & Report)</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  {allCompleted.length} รายการ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                คลังเก็บผลงาน ไฟล์แนบรูปผลงานของแต่ละคน และสามารถดาวน์โหลดหรือพิมพ์รายงานสรุปเป็น PDF ได้ทันที
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintPDF}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition cursor-pointer shadow-2xs"
              title="ดาวน์โหลดหรือพิมพ์รายงานสรุปผลงานเป็น PDF"
            >
              <Printer className="w-4 h-4" />
              <span>ดาวน์โหลด PDF (พิมพ์รายงาน)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="พิมพ์ค้นหาชื่องาน รายละเอียด หรือหมายเหตุ..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Member / Assignee Selector & Quick My Tasks Button */}
            <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap gap-y-1">
              {selectedRole !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedAssignee(selectedAssignee === 'my_tasks' ? 'all' : 'my_tasks')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                    selectedAssignee === 'my_tasks' || selectedAssignee === selectedRole
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>งานของฉัน ({selectedRole})</span>
                </button>
              )}

              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="all">พนักงานทุกคน (All Members)</option>
                  <option value="my_tasks">👤 งานของฉัน ({selectedRole})</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="bg-slate-200/80 p-1 rounded-xl flex items-center space-x-1 ml-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 รายการงาน
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('hr_report')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                    viewMode === 'hr_report' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>📊 รายงานส่ง HR</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Completed Steps List or HR Report */}
        <div className="p-6 space-y-3.5 overflow-y-auto flex-1 bg-slate-100/50 print:p-0 print:bg-white">
          {viewMode === 'hr_report' ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:shadow-none print:border-0 print:p-0">
              <div className="text-center border-b border-slate-200 pb-5 space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>รายงานสรุปผลงานประจำเดือนสำหรับฝ่ายทรัพยากรบุคคล (HR Performance Report)</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">โครงการ: {activeProject.title} ({activeProject.code})</h2>
                <p className="text-xs text-slate-500">
                  งวดประจำเดือน: <span className="font-bold text-slate-700">{monthsList.find(m => m.value === selectedMonth)?.label || selectedMonth}</span> | วันที่ออกรายงาน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-slate-900">{filteredSteps.length}</div>
                  <div className="text-xs text-slate-500 font-medium">งานที่สำเร็จในงวดนี้</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{members.length}</div>
                  <div className="text-xs text-slate-500 font-medium">พนักงานในทีมที่ปฏิบัติงาน</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {filteredSteps.reduce((acc, s) => acc + (s.attachments?.filter(a => a.type === 'image').length || 0), 0)}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">รูปภาพผลงานแนบรวม</div>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                  รายละเอียดผลงานแยกตามรายบุคคล & รูปภาพผลงาน
                </h3>

                {members.map((member) => {
                  const memberSteps = filteredSteps.filter(s => s.assignedRole.includes(member.name) || s.assignedPerson.includes(member.name));
                  if (memberSteps.length === 0) return null;

                  return (
                    <div key={member.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-xs"
                            style={{ backgroundColor: member.color || '#334155' }}
                          >
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              member.name.slice(0, 2)
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                            <p className="text-xs text-slate-500">{member.role} ({member.department})</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                          สำเร็จ {memberSteps.length} งาน
                        </span>
                      </div>

                      <div className="space-y-3">
                        {memberSteps.map((step) => (
                          <div key={step.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">
                                #{step.stepNumber}. {step.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                เสร็จสิ้นเมื่อ: {step.completedAt ? new Date(step.completedAt).toLocaleString('th-TH') : 'N/A'}
                              </span>
                            </div>
                            {step.description && (
                              <p className="text-xs text-slate-600">{step.description}</p>
                            )}
                            {step.handoverComment && (
                              <div className="p-2 bg-emerald-50/60 rounded-lg text-xs text-emerald-900 border border-emerald-100">
                                <span className="font-semibold">บันทึกผลงาน / ส่งมอบ:</span> {step.handoverComment}
                              </div>
                            )}

                            {step.attachments && step.attachments.length > 0 && (
                              <div className="pt-2">
                                <span className="block text-[11px] font-bold text-slate-500 mb-1.5">รูปภาพผลงานแนบ ({step.attachments.length} ไฟล์):</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {step.attachments.map((att) => (
                                    <div key={att.id} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                                      {att.type === 'image' ? (
                                        <img 
                                          src={att.url} 
                                          alt={att.name} 
                                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-200"
                                          onClick={() => setPreviewImage(att.url)}
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-600">
                                          <FileText className="w-5 h-5 mb-1 text-slate-400" />
                                          <span className="truncate w-full">{att.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                <div className="space-y-12">
                  <p>ลงชื่อ ........................................................ (ผู้จัดทำรายงาน)</p>
                  <p>วันที่: _____ / _____ / ________</p>
                </div>
                <div className="space-y-12">
                  <p>ลงชื่อ ........................................................ (ผู้อำนวยการ / ผู้จัดการฝ่าย HR)</p>
                  <p>วันที่: _____ / _____ / ________</p>
                </div>
              </div>
            </div>
          ) : filteredSteps.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">
                {searchTerm || selectedAssignee !== 'all' ? 'ไม่พบรายการที่ตรงกับตัวกรอง' : 'ยังไม่มีงานที่เสร็จสิ้น'}
              </p>
              <p className="text-xs text-slate-400">
                เมื่องานในกระดานดำเนินการเสร็จสิ้น จะถูกเก็บไว้ที่นี่พร้อมรูปผลงานและลิงก์
              </p>
            </div>
          ) : (
            filteredSteps.map((step) => {
              const isPersonal = step.taskScope === 'personal';
              const attachments = step.attachments || [];
              const isEditingAtt = editingAttachmentsStepId === step.id;

              return (
                <div
                  key={step.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        
                        <h4 
                          onClick={() => onSelectStep(step)}
                          className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition"
                        >
                          {step.title}
                        </h4>

                        {isPersonal ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>งานส่วนตัว</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>งานกลุ่ม</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>เสร็จสิ้น</span>
                        </span>
                      </div>

                      {step.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {step.description}
                        </p>
                      )}
                    </div>

                    {/* Restore Button */}
                    <button
                      type="button"
                      onClick={() => handleRestore(step.id)}
                      className="print:hidden px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
                      title="นำงานนี้กลับเข้าสู่ตารางทำงานเพื่อแก้ไขหรือทำต่อ"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ดึงกลับมาทำต่อ</span>
                    </button>
                  </div>

                  {/* Handover & Completion Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold">👤 ผู้ดำเนินการ / ผู้รับผิดชอบ:</div>
                      <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{step.assignedRole} ({step.assignedPerson})</span>
                      </div>
                      {step.completedAt && (
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>เสร็จเมื่อ: {new Date(step.completedAt).toLocaleString('th-TH')}</span>
                        </div>
                      )}
                    </div>

                    {step.handoverComment && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                        <div className="text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>บันทึกผลงาน / ข้อความส่งมอบ:</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {step.handoverComment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Attachments & Result Images Section */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        <span>รูปผลงานและไฟล์แนบของงานนี้ ({attachments.length}):</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingAttachmentsStepId(isEditingAtt ? null : step.id)}
                        className="print:hidden text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isEditingAtt ? 'เสร็จสิ้น' : 'แนบรูป/ไฟล์ผลงานเพิ่ม'}</span>
                      </button>
                    </div>

                    {/* Attachment Manager if editing */}
                    {isEditingAtt ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <AttachmentManager
                          attachments={attachments}
                          onChange={(newAtts) => handleUpdateAttachments(step.id, newAtts)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center flex-wrap gap-2">
                        {attachments.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">ยังไม่มีรูปผลงานหรือไฟล์แนบ (คลิกปุ่มแนบรูปด้านบนเพื่อเพิ่มผลงาน)</span>
                        ) : (
                          attachments.map((att) => (
                            <div
                              key={att.id}
                              className="p-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center space-x-1.5 text-xs text-slate-700"
                            >
                              {att.type === 'image' ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(att.url)}
                                  className="flex items-center space-x-1.5 font-semibold text-pink-700 hover:underline cursor-pointer"
                                >
                                  <img 
                                    src={att.url} 
                                    alt={att.name}
                                    className="w-6 h-6 object-cover rounded"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span>{att.name} (ดูภาพ)</span>
                                </button>
                              ) : att.type === 'link' ? (
                                <a
                                  href={formatExternalUrl(att.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center space-x-1 font-semibold text-blue-700 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>{att.name}</span>
                                </a>
                              ) : (
                                <a
                                  href={att.url}
                                  download={att.name}
                                  className="flex items-center space-x-1 font-semibold text-emerald-700 hover:underline"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>{att.name}</span>
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Lightbox Modal */}
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
                alt="ภาพผลงานขยาย"
                className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            แสดง {filteredSteps.length} จากทั้งหมด {allCompleted.length} รายการที่เสร็จสิ้น
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด PDF รายงาน</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

