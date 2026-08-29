import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Send, 
  GitCommit, 
  User, 
  Calendar,
  Lock,
  Layers
} from 'lucide-react';
import { ChainStep, TeamChainProject, StepStatus } from '../types';
import { useWork } from '../context/WorkContext';
import { isSameMember, isLeeAlias } from '../utils/memberMatch';

interface ChainFlowVisualizerProps {
  project: TeamChainProject;
  onSelectStep: (step: ChainStep) => void;
  onOpenHandover: (step: ChainStep) => void;
}

export const ChainFlowVisualizer: React.FC<ChainFlowVisualizerProps> = ({
  project,
  onSelectStep,
  onOpenHandover,
}) => {
  const { selectedRole } = useWork();

  // Group steps into 4 logical phases of the chain
  const phases = [
    {
      id: 'phase-1',
      title: 'ขั้นตอนที่ 1: วางคอนเซปต์ & ดีไซน์ (Concept & Design)',
      subtitle: 'มีมี่ ➔ MKT ➔ NPD ➔ มีมี่ (Steps 1-5)',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      stepNumbers: [1, 2, 3, 4, 5],
    },
    {
      id: 'phase-2',
      title: 'ขั้นตอนที่ 2: จัดซื้อผ้า & พัฒนาผลิตภัณฑ์ (Sourcing & Manufacturing)',
      subtitle: 'สายงานคู่ขนาน: PO สั่งผ้า & ซูรี/กะฟา พัฒนาสินค้า (Steps 6-13)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      stepNumbers: [6, 7, 8, 9, 10, 11, 12, 13],
    },
    {
      id: 'phase-3',
      title: 'ขั้นตอนที่ 3: โปรดักชั่นสื่อ & ถ่ายแบบ (Media & Content Production)',
      subtitle: 'สายงานคู่ขนาน: เดะมี่ (ภาพนิ่ง) & ฟานี (วิดีโอ) (Steps 14-19)',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      stepNumbers: [14, 15, 16, 17, 18, 19],
    },
    {
      id: 'phase-4',
      title: 'ขั้นตอนที่ 4: โพสต์โปรดักชั่น & ส่งมอบงาน (Post-Production & Final Assets)',
      subtitle: 'น้องเซ็ง (ตัดต่อวิดีโอ) & Mr Lee (รีทัชรูป) (Step 20)',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      stepNumbers: [20],
    },
  ];

  const getStepStatusDetails = (step: ChainStep) => {
    switch (step.status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          bgColor: 'bg-emerald-50/80 border-emerald-300 text-slate-900',
          badgeText: 'เสร็จสมบูรณ์',
          badgeClass: 'bg-emerald-100 text-emerald-800',
        };
      case 'in_progress':
        return {
          icon: <Clock className="w-4 h-4 text-blue-600 animate-spin" />,
          bgColor: 'bg-blue-50 border-blue-400 text-slate-900 ring-2 ring-blue-500/20 shadow-md',
          badgeText: '⚡ กำลังทำ',
          badgeClass: 'bg-blue-100 text-blue-800 font-bold',
        };
      case 'waiting_approval':
        return {
          icon: <Clock className="w-4 h-4 text-amber-500" />,
          bgColor: 'bg-amber-50 border-amber-300 text-slate-900',
          badgeText: 'รออนุมัติ',
          badgeClass: 'bg-amber-100 text-amber-800',
        };
      case 'blocked':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
          bgColor: 'bg-rose-50 border-rose-300 text-slate-900',
          badgeText: 'ติดขัด',
          badgeClass: 'bg-rose-100 text-rose-800',
        };
      default:
        return {
          icon: <Lock className="w-3.5 h-3.5 text-slate-400" />,
          bgColor: 'bg-white border-slate-200 text-slate-600 opacity-80',
          badgeText: 'รอดำเนินการ',
          badgeClass: 'bg-slate-100 text-slate-600',
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Chain Progress Summary Bar */}
      <div className="p-5 bg-[#0f172a] text-white rounded-2xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {project.code}
              </span>
              <h2 className="text-base sm:text-lg font-bold">{project.title}</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">{project.description}</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">{project.progress}%</div>
            <span className="text-xs text-slate-400">ความคืบหน้ารวม</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Sequential Phases */}
      <div className="space-y-6">
        {phases.map((phase, phaseIndex) => {
          const phaseSteps = project.steps.filter((s) => phase.stepNumbers.includes(s.stepNumber));
          const completedCount = phaseSteps.filter((s) => s.status === 'completed').length;
          const phaseProgress = phaseSteps.length > 0 ? Math.round((completedCount / phaseSteps.length) * 100) : 0;

          return (
            <div
              key={phase.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm transition hover:border-slate-300"
            >
              {/* Phase Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                    {phaseIndex + 1}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{phase.title}</h3>
                    <p className="text-xs text-slate-500">{phase.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${phase.badgeColor}`}>
                    สำเร็จ {completedCount}/{phaseSteps.length} ขั้นตอน ({phaseProgress}%)
                  </span>
                </div>
              </div>

              {/* Steps Chain Grid / Node Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {phaseSteps.map((step) => {
                  const details = getStepStatusDetails(step);
                  const isRoleMatch = selectedRole !== 'all' && (
                    step.assignedRole === selectedRole ||
                    step.assignedPerson === selectedRole ||
                    step.assignedRole.includes(selectedRole) || 
                    step.assignedPerson.includes(selectedRole) ||
                    (isLeeAlias(selectedRole) && (isLeeAlias(step.assignedRole) || isLeeAlias(step.assignedPerson))) ||
                    isSameMember(step.assignedRole, selectedRole) ||
                    isSameMember(step.assignedPerson, selectedRole)
                  );

                  return (
                    <div
                      key={step.id}
                      onClick={() => onSelectStep(step)}
                      className={`relative p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${details.bgColor} ${
                        isRoleMatch ? 'ring-2 ring-blue-500 shadow-md' : 'hover:border-blue-300'
                      }`}
                    >
                      <div>
                        {/* Card Top: Number, Role, Status */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                              {step.stepNumber}
                            </span>
                            <span className="font-semibold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                              👤 {step.assignedRole}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${details.badgeClass}`}>
                            {details.badgeText}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-1">
                          {step.title}
                        </h4>

                        {step.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                            {step.description}
                          </p>
                        )}

                        {/* Handover Comment if present */}
                        {step.handoverComment && (
                          <div className="p-2 rounded-lg bg-white/90 border border-emerald-200 text-[11px] text-emerald-900 my-2">
                            <div className="font-semibold text-emerald-800 flex items-center space-x-1 mb-0.5">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>บันทึกการส่งมอบ:</span>
                            </div>
                            <p className="italic">"{step.handoverComment}"</p>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom: Due Date & Handover button */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>ครบกำหนด: {step.dueDate}</span>
                        </div>

                        {step.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenHandover(step);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1 shadow-sm transition"
                          >
                            <span>ส่งต่องาน</span>
                            <Send className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
