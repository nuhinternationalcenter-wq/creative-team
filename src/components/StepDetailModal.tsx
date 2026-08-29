import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Send, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  FileText,
  Edit3,
  Paperclip,
  ShieldCheck,
  RotateCcw,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { ChainStep, TeamChainProject, StepStatus, TaskAttachment } from '../types';
import { useWork } from '../context/WorkContext';
import { AttachmentManager } from './AttachmentManager';
import { SubmitApprovalModal } from './SubmitApprovalModal';
import { ApprovalActionModal } from './ApprovalActionModal';

interface StepDetailModalProps {
  step: ChainStep | null;
  project: TeamChainProject | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenHandover: (step: ChainStep) => void;
  onEditStep?: (step: ChainStep) => void;
}

export const StepDetailModal: React.FC<StepDetailModalProps> = ({
  step,
  project,
  isOpen,
  onClose,
  onOpenHandover,
  onEditStep,
}) => {
  const { updateStepStatus, updateStepDetails, addStepLog, members, projects } = useWork();
  const [newLogText, setNewLogText] = useState('');
  const [logMinutes, setLogMinutes] = useState(30);
  const [isSubmitApprovalOpen, setIsSubmitApprovalOpen] = useState(false);
  const [isApprovalActionOpen, setIsApprovalActionOpen] = useState(false);

  if (!isOpen || !step || !project) return null;

  const handleAttachmentsChange = (attachments: TaskAttachment[]) => {
    updateStepDetails(project.id, step.id, { attachments });
  };

  // Find prerequisite steps
  const prerequisiteSteps = project.steps.filter((s) => step.dependencies.includes(s.id));
  // Find dependent steps that rely on this step
  const unlockedSteps = project.steps.filter((s) => s.dependencies.includes(step.id));

  const handleStatusChange = (newStatus: StepStatus) => {
    if (newStatus === 'completed') {
      onOpenHandover(step);
      onClose();
    } else {
      updateStepStatus(project.id, step.id, newStatus, undefined, `เปลี่ยนสถานะเป็น ${newStatus}`);
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;

    addStepLog(project.id, step.id, {
      author: step.assignedPerson,
      text: newLogText.trim(),
      durationMinutes: Number(logMinutes) || 0,
      type: 'log',
    });

    setNewLogText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="bg-[#0f172a] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 font-black text-sm flex items-center justify-center shadow-sm">
              {step.stepNumber}
            </span>
            <div>
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                สเต็ปที่ {step.stepNumber} ในกระบวนการทำงาน
              </span>
              <h3 className="font-bold text-base sm:text-lg text-white leading-tight">{step.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block mb-1">ผู้รับผิดชอบ</span>
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>{step.assignedRole} ({step.assignedPerson})</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">👤 ผู้มอบหมายงาน</span>
              <select
                value={step.assignedBy || ''}
                onChange={(e) => updateStepDetails(project.id, step.id, { assignedBy: e.target.value })}
                className="bg-white font-bold text-indigo-900 border border-indigo-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
              >
                <option value="">-- ไม่ระบุ --</option>
                {members.map((m) => (
                  <option key={'modal-assigner-' + m.id} value={m.name}>
                    👤 {m.name} ({m.role || m.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">📁 สังกัดโปรเจกต์</span>
              <select
                value={project.id}
                onChange={(e) => {
                  if (e.target.value !== project.id) {
                    updateStepDetails(project.id, step.id, { targetProjectId: e.target.value });
                  }
                }}
                className="bg-white font-bold text-slate-800 border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none w-full"
              >
                {projects.map((p) => (
                  <option key={'modal-proj-' + p.id} value={p.id}>
                    📁 {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">สถานะปัจจุบัน</span>
              <select
                value={step.status}
                onChange={(e) => handleStatusChange(e.target.value as StepStatus)}
                className="bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none w-full"
              >
                <option value="pending">รอดำเนินการ</option>
                <option value="in_progress">⚡ กำลังดำเนินการ</option>
                <option value="waiting_approval">⏳ รอตรวจ/อนุมัติ</option>
                <option value="completed">✅ เสร็จแล้ว (ส่งต่อ)</option>
                <option value="blocked">🚫 ติดขัด (Blocked)</option>
              </select>
            </div>
          </div>

          {/* Approval Status & Revision Notice */}
          {step.status === 'waiting_approval' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>งานกลุ่มนี้อยู่ระหว่างรอการตรวจ/อนุมัติ</span>
              </div>
              <p className="text-amber-800">
                ส่งขออนุมัติไปยัง: <strong className="font-bold">{step.approverRole || 'หัวหน้า/ผู้เกี่ยวข้อง'}</strong>
                {step.submittedForApprovalBy && <span> (โดย {step.submittedForApprovalBy})</span>}
              </p>
              {step.approvalComment && (
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 text-slate-700 italic">
                  "{step.approvalComment}"
                </div>
              )}
            </div>
          )}

          {step.approvalStatus === 'revision_requested' && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
              <div className="font-bold text-rose-900 flex items-center space-x-1.5">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>งานถูกส่งกลับให้แก้ไข (จาก {step.approverRole || 'ผู้อนุมัติ'})</span>
              </div>
              {step.approvalComment && (
                <p className="p-2.5 rounded-lg bg-white/80 border border-rose-200 text-rose-950 font-medium">
                  {step.approvalComment}
                </p>
              )}
              {step.approvalAttachments && step.approvalAttachments.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] text-rose-800 font-bold block">ไฟล์/ภาพประกอบการแก้ไข:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {step.approvalAttachments.map((att) => (
                      <span key={att.id} className="px-2 py-1 rounded bg-white border border-rose-200 text-xs flex items-center space-x-1">
                        {att.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-pink-600" /> : <FileText className="w-3.5 h-3.5 text-rose-600" />}
                        <span className="truncate max-w-[120px]">{att.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step.approvalStatus === 'approved' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>งานกลุ่มนี้ได้รับการอนุมัติเรียบร้อยแล้ว</span>
            </div>
          )}

          {/* Description */}
          {step.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">รายละเอียดการทำงาน:</h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {step.description}
              </p>
            </div>
          )}

          {/* Handover comments if completed */}
          {step.handoverComment && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>บันทึกการส่งมอบงาน (Handover Log):</span>
              </div>
              <p className="italic text-slate-700 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                "{step.handoverComment}"
              </p>
              {step.completedAt && (
                <span className="text-[10px] text-emerald-700 block mt-1">
                  เสร็จเมื่อ: {new Date(step.completedAt).toLocaleString('th-TH')}
                </span>
              )}
            </div>
          )}

          {/* Chain Dependencies Flow Diagram */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">ความสัมพันธ์ในสายงาน (Process Flow):</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Prerequisites */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-semibold text-slate-600 block">⬅️ สเต็ปก่อนหน้าที่ต้องเสร็จก่อน:</span>
                {prerequisiteSteps.length > 0 ? (
                  prerequisiteSteps.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-[11px] p-1.5 bg-white rounded-md border border-slate-200">
                      <span>สเต็ป {p.stepNumber}: {p.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {p.status === 'completed' ? 'เสร็จแล้ว' : 'ยังไม่เสร็จ'}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[11px]">เป็นขั้นตอนแรกของสายงาน</span>
                )}
              </div>

              {/* Dependents */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-semibold text-blue-700 block">➡️ สเต็ปที่จะปลดล็อกต่อจากนี้:</span>
                {unlockedSteps.length > 0 ? (
                  unlockedSteps.map((u) => (
                    <div key={u.id} className="flex items-center justify-between text-[11px] p-1.5 bg-white rounded-md border border-blue-100">
                      <span>สเต็ป {u.stepNumber}: {u.title}</span>
                      <span className="text-blue-600 font-bold">({u.assignedRole})</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[11px]">ขั้นตอนสุดท้ายในกระบวนการ</span>
                )}
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <AttachmentManager
              attachments={step.attachments || []}
              onChange={handleAttachmentsChange}
            />
          </div>

          {/* Work Log History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>บันทึกการทำงาน & กิจกรรม (Activity Logs):</span>
              <span className="text-slate-400 font-normal">{step.workLogs?.length || 0} รายการ</span>
            </h4>

            {/* List of past logs */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {step.workLogs && step.workLogs.length > 0 ? (
                step.workLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">👤 {log.author}</span>
                      <span>{new Date(log.timestamp).toLocaleString('th-TH')}</span>
                    </div>
                    <p className="text-slate-800">{log.text}</p>
                    {log.durationMinutes && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                        ⏱️ ใช้เวลา {log.durationMinutes} นาที
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-2">ยังไม่มีบันทึกการทำงาน</p>
              )}
            </div>

            {/* Add new work log input */}
            <form onSubmit={handleAddLog} className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="พิมพ์บันทึกสิ่งที่ทำในวันนี้สำหรับสเต็ปนี้..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  step="15"
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(Number(e.target.value))}
                  placeholder="นาที"
                  className="w-20 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  title="เวลาที่ใช้ (นาที)"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>บันทึก</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
            >
              ปิด
            </button>
            {onEditStep && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditStep(step);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center space-x-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>แก้ไข / ยกเลิกงาน</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Approval Workflow Buttons */}
            {step.status === 'waiting_approval' ? (
              <button
                type="button"
                onClick={() => setIsApprovalActionOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-amber-600/20 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ตรวจ / อนุมัติงาน</span>
              </button>
            ) : step.approvalStatus === 'revision_requested' ? (
              <button
                type="button"
                onClick={() => setIsSubmitApprovalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ส่งขออนุมัติใหม่</span>
              </button>
            ) : step.status !== 'completed' ? (
              <button
                type="button"
                onClick={() => setIsSubmitApprovalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>ส่งขออนุมัติ</span>
              </button>
            ) : null}

            {step.status !== 'completed' && (
              <button
                onClick={() => {
                  onOpenHandover(step);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ทำเสร็จแล้ว & ส่งต่องาน</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Submit Approval Modal */}
      {isSubmitApprovalOpen && (
        <SubmitApprovalModal
          isOpen={isSubmitApprovalOpen}
          onClose={() => setIsSubmitApprovalOpen(false)}
          step={step}
          projectId={project.id}
        />
      )}

      {/* Approval Action Modal */}
      {isApprovalActionOpen && (
        <ApprovalActionModal
          isOpen={isApprovalActionOpen}
          onClose={() => setIsApprovalActionOpen(false)}
          step={step}
          projectId={project.id}
        />
      )}
    </div>
  );
};
