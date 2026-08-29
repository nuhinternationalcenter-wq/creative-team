import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  ChevronRight, 
  User, 
  Calendar, 
  FileText, 
  AlertCircle, 
  ArrowDown, 
  Sparkles,
  Lock,
  ShieldCheck,
  RotateCcw,
  Check
} from 'lucide-react';
import { ChainStep } from '../types';
import { useWork } from '../context/WorkContext';
import { isSameMember, isLeeAlias } from '../utils/memberMatch';
import { SubmitApprovalModal } from './SubmitApprovalModal';
import { ApprovalActionModal } from './ApprovalActionModal';

interface SimpleStepListViewProps {
  steps: ChainStep[];
  onOpenStepDetail: (step: ChainStep) => void;
  onOpenHandover: (step: ChainStep) => void;
}

export const SimpleStepListView: React.FC<SimpleStepListViewProps> = ({
  steps,
  onOpenStepDetail,
  onOpenHandover,
}) => {
  const { selectedRole, updateStepStatus, activeProject } = useWork();
  const [submitApprovalStep, setSubmitApprovalStep] = useState<ChainStep | null>(null);
  const [approvalActionStep, setApprovalActionStep] = useState<ChainStep | null>(null);

  return (
    <div className="space-y-4">
      {/* Friendly Guide Banner */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-slate-700">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-blue-950">💡 ขั้นตอนการทำงานทีม 20 สเต็ป (เรียง 1 ถึง 20)</p>
          <p className="text-slate-600 mt-0.5">
            เมื่อแต่ละฝ่ายทำงานเสร็จ ให้กดปุ่ม <span className="font-semibold text-emerald-700">"✅ เสร็จแล้ว ส่งต่องาน"</span> เพื่อปลดล็อกและแจ้งเตือนเพื่อนในขั้นตอนถัดไปทันที
          </p>
        </div>
      </div>

      {/* Sequential Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isWaiting = step.status === 'waiting_approval';
          const isPending = step.status === 'pending';
          const isBlocked = step.status === 'blocked';

          const isMyRole = selectedRole !== 'all' && (
            step.assignedRole === selectedRole ||
            step.assignedPerson === selectedRole ||
            step.assignedRole.includes(selectedRole) || 
            step.assignedPerson.includes(selectedRole) ||
            (isLeeAlias(selectedRole) && (isLeeAlias(step.assignedRole) || isLeeAlias(step.assignedPerson))) ||
            isSameMember(step.assignedRole, selectedRole) ||
            isSameMember(step.assignedPerson, selectedRole) ||
            (isWaiting && (
              step.approverRole === selectedRole ||
              step.approverRole?.includes(selectedRole) ||
              selectedRole.includes(step.approverRole || '') ||
              (isLeeAlias(selectedRole) && isLeeAlias(step.approverRole)) ||
              isSameMember(step.approverRole, selectedRole)
            ))
          );

          return (
            <div key={step.id} className="relative">
              {/* Step Card */}
              <div
                className={`rounded-2xl border transition-all p-4 sm:p-5 ${
                  isMyRole
                    ? 'ring-2 ring-blue-500/80 bg-blue-50/30 border-blue-300 shadow-sm'
                    : isCompleted
                    ? 'bg-white border-slate-200 opacity-90'
                    : isInProgress
                    ? 'bg-white border-blue-400 shadow-md shadow-blue-500/5'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left Side: Step Number + Title + Role */}
                  <div className="flex items-start space-x-3.5 flex-1">
                    {/* Big Step Number Circle */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white'
                          : isWaiting
                          ? 'bg-amber-500 text-white'
                          : isBlocked
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.stepNumber}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {/* Tags & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center space-x-1">
                          <User className="w-3 h-3 text-blue-600" />
                          <span>{step.assignedRole} ({step.assignedPerson})</span>
                        </span>

                        {step.assignedBy && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center space-x-1" title={`ผู้มอบหมาย: ${step.assignedBy}`}>
                            <User className="w-3 h-3 text-indigo-600" />
                            <span>ผู้มอบหมาย: {step.assignedBy}</span>
                          </span>
                        )}

                        {isMyRole && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                            👉 งานของคุณ
                          </span>
                        )}

                        {/* Status Badges */}
                        {isCompleted && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>เสร็จเรียบร้อย</span>
                          </span>
                        )}
                        {isInProgress && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center space-x-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>กำลังดำเนินการ</span>
                          </span>
                        )}
                        {isWaiting && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>รออนุมัติ ({step.approverRole || 'หัวหน้า'})</span>
                          </span>
                        )}
                        {step.approvalStatus === 'revision_requested' && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center space-x-1">
                            <RotateCcw className="w-3 h-3 text-rose-600" />
                            <span>ส่งกลับแก้ไข</span>
                          </span>
                        )}
                        {step.approvalStatus === 'approved' && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>ผ่านอนุมัติ</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            รอดำเนินการ
                          </span>
                        )}
                        {isBlocked && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            ติดปัญหา (Blocked)
                          </span>
                        )}

                        <span className="text-xs text-slate-500 font-medium flex items-center space-x-1 ml-auto sm:ml-0">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>กำหนดส่ง: {step.dueDate}</span>
                        </span>
                      </div>

                      {/* Step Title */}
                      <h3 
                        onClick={() => onOpenStepDetail(step)}
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                      >
                        {step.title}
                      </h3>

                      {/* Revision notice if requested */}
                      {step.approvalStatus === 'revision_requested' && step.approvalComment && (
                        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                          <span className="font-bold flex items-center space-x-1 text-rose-700">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>สิ่งที่ต้องแก้ไข (จาก {step.approverRole || 'ผู้อนุมัติ'}):</span>
                          </span>
                          <p className="font-medium">{step.approvalComment}</p>
                        </div>
                      )}

                      {/* Handover Comment if Completed */}
                      {isCompleted && step.handoverComment && (
                        <p className="text-xs text-slate-600 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 italic">
                          💬 บันทึกส่งงาน: "{step.handoverComment}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Easy Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end shrink-0 flex-wrap gap-y-1">
                    {/* APPROVAL WORKFLOW BUTTONS */}
                    {step.status === 'waiting_approval' ? (
                      <button
                        onClick={() => setApprovalActionStep(step)}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md shadow-amber-600/20 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>ตรวจ/อนุมัติ</span>
                      </button>
                    ) : step.approvalStatus === 'revision_requested' ? (
                      <button
                        onClick={() => setSubmitApprovalStep(step)}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md shadow-rose-600/20 transition cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>ส่งอนุมัติใหม่</span>
                      </button>
                    ) : !isCompleted ? (
                      <button
                        onClick={() => setSubmitApprovalStep(step)}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition cursor-pointer shadow-2xs"
                        title="ส่งขออนุมัติงานกลุ่มนี้"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                        <span>ส่งขออนุมัติ</span>
                      </button>
                    ) : null}

                    {/* If In Progress: Big Green Finish & Handover Button */}
                    {isInProgress && (
                      <button
                        onClick={() => onOpenHandover(step)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>เสร็จแล้ว ส่งต่องาน</span>
                      </button>
                    )}

                    {/* If Pending: Quick Start Button */}
                    {isPending && (
                      <button
                        onClick={() => {
                          if (activeProject) {
                            updateStepStatus(activeProject.id, step.id, 'in_progress', undefined, 'เริ่มดำเนินการสเต็ปนี้');
                          }
                        }}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>เริ่มทำสเต็ปนี้</span>
                      </button>
                    )}

                    {/* View & Log Details Button */}
                    <button
                      onClick={() => onOpenStepDetail(step)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>ดูรายละเอียด / บันทึก</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Connecting Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Approval Modal */}
      {submitApprovalStep && activeProject && (
        <SubmitApprovalModal
          isOpen={!!submitApprovalStep}
          onClose={() => setSubmitApprovalStep(null)}
          step={submitApprovalStep}
          projectId={activeProject.id}
        />
      )}

      {/* Approval Action Modal */}
      {approvalActionStep && activeProject && (
        <ApprovalActionModal
          isOpen={!!approvalActionStep}
          onClose={() => setApprovalActionStep(null)}
          step={approvalActionStep}
          projectId={activeProject.id}
        />
      )}
    </div>
  );
};
