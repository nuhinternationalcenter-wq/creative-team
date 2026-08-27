import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Send, 
  AlertCircle, 
  X, 
  Sparkles,
  Users,
  Bell,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { ChainStep, TeamChainProject } from '../types';
import { useWork } from '../context/WorkContext';

interface StepHandoverModalProps {
  step: ChainStep | null;
  project: TeamChainProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StepHandoverModal: React.FC<StepHandoverModalProps> = ({
  step,
  project,
  isOpen,
  onClose,
}) => {
  const { completeStepAndHandover, members } = useWork();

  const [handoverComment, setHandoverComment] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [targetRecipient, setTargetRecipient] = useState<string>('แบฟีลี');
  const [nextTaskTitle, setNextTaskTitle] = useState('');
  const [nextDueDate, setNextDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [submitting, setSubmitting] = useState(false);

  // When modal opens or step changes, set initial recipient and title
  useEffect(() => {
    if (step && project) {
      const nextSteps = project.steps.filter((s) => s.dependencies.includes(step.id));
      if (nextSteps.length > 0) {
        setTargetRecipient(nextSteps[0].assignedRole);
        setNextTaskTitle(`ต่อจาก ${step.assignedRole}: ${nextSteps[0].title}`);
      } else {
        // If step is from ฟานี, suggest แบฟีลี as top friendly default
        if (step.assignedRole.includes('ฟานี')) {
          setTargetRecipient('แบฟีลี');
          setNextTaskTitle(`งานต่อจากฟานี: รีทัชและเตรียมภาพประกอบวิดีโอ`);
        } else {
          setTargetRecipient(members[0]?.name || 'แบฟีลี');
          setNextTaskTitle(`งานส่งต่อจาก ${step.assignedRole}: ${step.title}`);
        }
      }
      setHandoverComment('');
    }
  }, [step, project, members]);

  if (!isOpen || !step || !project) return null;

  // Find if there's an existing dependent step
  const nextSteps = project.steps.filter((s) => s.dependencies.includes(step.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverComment.trim()) return;

    setSubmitting(true);
    completeStepAndHandover(
      project.id,
      step.id,
      handoverComment.trim(),
      Number(durationMinutes) || 0,
      targetRecipient,
      nextTaskTitle.trim() || undefined,
      nextDueDate
    );
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">ส่งต่องานทีม (Task Handover)</h3>
              <p className="text-xs text-emerald-100">ส่งงานให้เพื่อนร่วมทีม & งานจะไปปรากฏในช่องของเพื่อนทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Current Step Summary Card */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>งานของคุณที่ทำเสร็จแล้ว</span>
              </span>
              <span className="text-emerald-800 font-semibold">
                ช่อง: <strong>{step.assignedRole}</strong>
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm leading-snug">
              สเต็ป {step.stepNumber}: {step.title}
            </h4>
            {step.description && (
              <p className="text-xs text-slate-600 line-clamp-2">{step.description}</p>
            )}
          </div>

          {/* Target Recipient Picker */}
          <div className="space-y-1.5">
            <label htmlFor="handover-target-recipient" className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>ส่งต่องานนี้ให้ใคร (ผู้รับช่วงต่อ):</span>
              </span>
              <span className="text-emerald-700 text-[11px] font-bold">
                งานจะไปโผล่ที่ช่อง: {targetRecipient}
              </span>
            </label>
            <select
              id="handover-target-recipient"
              value={targetRecipient}
              onChange={(e) => {
                const newRecip = e.target.value;
                setTargetRecipient(newRecip);
                setNextTaskTitle(`ต่อจาก ${step.assignedRole}: ${step.title}`);
              }}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border-2 border-emerald-400 focus:border-emerald-600 bg-white font-bold text-slate-900 outline-none shadow-xs"
            >
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  👤 {m.name} ({m.role || m.department})
                </option>
              ))}
            </select>
          </div>

          {/* Handover Comment / Instructions ("ว่าต้องทำอะไร") */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1">
              <span>ข้อความส่งมอบงาน & สิ่งที่ {targetRecipient} ต้องทำต่อไป:</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={handoverComment}
              onChange={(e) => setHandoverComment(e.target.value)}
              placeholder={`เช่น "ทำวิดีโอส่วนของฉันเสร็จแล้ว ช่วยแบฟีลีรีทัชรูป Lookbook ชุดสีน้ำเงิน 10 ภาพ และเตรียมภาพปกให้เสร็จภายในวันศุกร์ (ไฟล์อยู่ใน Drive โฟลเดอร์ SS26)"`}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none leading-relaxed"
            />
          </div>

          {/* Next Task Title to appear in Recipient's Column */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>ชื่องานที่จะไปปรากฏในช่องของ <strong className="text-emerald-700">{targetRecipient}</strong>:</span>
            </label>
            <input
              type="text"
              required
              value={nextTaskTitle}
              onChange={(e) => setNextTaskTitle(e.target.value)}
              placeholder="เช่น รีทัชรูปและจัดทำ Key Frame ต่อจากฟานี"
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>

          {/* Due Date & Time Spent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>กำหนดส่งของ {targetRecipient}:</span>
              </label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>เวลาที่คุณใช้ทำงานนี้ (นาที):</span>
              </label>
              <input
                type="number"
                min="0"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Instant Auto-appear Indicator */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-start space-x-3 text-xs text-blue-950">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold text-blue-900">ปรากฏในช่องของ {targetRecipient} อัตโนมัติ:</span>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                เมื่อกดยืนยัน งานในช่องของคุณ ({step.assignedRole}) จะถูกบันทึกว่า <strong>"เสร็จแล้ว"</strong> และงานจะถูกสร้างขึ้นในช่องของ <strong className="text-slate-950 underline decoration-blue-500 font-bold">{targetRecipient}</strong> พร้อมสถานะ <strong>"กำลังทำ"</strong> และมีโน้ตส่งมอบงานระบุชัดเจนทันที
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting || !handoverComment.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ยืนยันส่งต่องานให้ {targetRecipient} ทันที</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
