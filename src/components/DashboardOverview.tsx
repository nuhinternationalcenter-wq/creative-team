import React from 'react';
import { 
  GitMerge, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Calendar,
  Send,
  Zap,
  Layers,
  Flame
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { ChainStep, PersonalTask } from '../types';
import { isSameMember, isLeeAlias } from '../utils/memberMatch';

interface DashboardOverviewProps {
  onNavigateToTeamChain: () => void;
  onNavigateToPersonal: () => void;
  onOpenCreateTask: () => void;
  onOpenStepDetail: (step: ChainStep) => void;
  onOpenHandover: (step: ChainStep) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateToTeamChain,
  onNavigateToPersonal,
  onOpenCreateTask,
  onOpenStepDetail,
  onOpenHandover,
}) => {
  const { 
    activeProject, 
    personalTasks, 
    selectedRole, 
    members,
    updatePersonalTask 
  } = useWork();

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedMemberObj = members.find((m) => m.name === selectedRole || m.id === selectedRole);
  const memberId = selectedMemberObj ? selectedMemberObj.id : (isLeeAlias(selectedRole) ? 'lee' : '');

  const filterStepsByRole = (steps: ChainStep[]) => {
    if (selectedRole === "all") return steps;
    return steps.filter(
      (s) =>
        s.assignedRole === selectedRole ||
        s.assignedPerson === selectedRole ||
        s.assignedRole.includes(selectedRole) ||
        s.assignedPerson.includes(selectedRole) ||
        (isLeeAlias(selectedRole) && (isLeeAlias(s.assignedRole) || isLeeAlias(s.assignedPerson))) ||
        isSameMember(s.assignedRole, selectedRole, memberId) ||
        isSameMember(s.assignedPerson, selectedRole, memberId) ||
        (s.status === 'waiting_approval' && (
          s.approverRole === selectedRole ||
          s.approverRole?.includes(selectedRole) ||
          selectedRole.includes(s.approverRole || '') ||
          (isLeeAlias(selectedRole) && isLeeAlias(s.approverRole)) ||
          isSameMember(s.approverRole, selectedRole, memberId)
        ))
    );
  };
  
  const relevantSteps = activeProject ? filterStepsByRole(activeProject.steps) : [];
  const totalChainSteps = relevantSteps.length;
  const completedChainSteps = relevantSteps.filter((s) => s.status === "completed").length;
  const inProgressChainSteps = relevantSteps.filter((s) => s.status === "in_progress");
  const waitingChainSteps = relevantSteps.filter((s) => s.status === "waiting_approval");
  const projectProgress = totalChainSteps > 0 ? Math.round((completedChainSteps / totalChainSteps) * 100) : (activeProject ? activeProject.progress : 0);
  // Personal Tasks Metrics
  const userPersonalTasks = personalTasks.filter((t) => {
    if (!t) return false;
    if (selectedRole === 'all') return true;
    const assigned = t.assignedTo || '';
    const approver = t.approverRole || '';
    const isAssigned = (
      assigned === selectedRole ||
      assigned.includes(selectedRole) ||
      selectedRole.includes(assigned) ||
      (isLeeAlias(selectedRole) && isLeeAlias(assigned)) ||
      isSameMember(assigned, selectedRole, memberId)
    );
    const isWaitingApprovalForMe = (
      t.status === 'waiting_approval' && (
        approver === selectedRole ||
        approver.includes(selectedRole) ||
        selectedRole.includes(approver) ||
        (isLeeAlias(selectedRole) && isLeeAlias(approver)) ||
        isSameMember(approver, selectedRole, memberId)
      )
    );
    return isAssigned || isWaitingApprovalForMe;
  });
  const totalPersonal = userPersonalTasks.length;
  const completedPersonal = userPersonalTasks.filter((t) => t.status === 'completed').length;
  const inProgressPersonal = userPersonalTasks.filter((t) => t.status === 'in_progress').length;
  const urgentPersonal = userPersonalTasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed');

  // Overdue calculations
  const overdueChainSteps = relevantSteps.filter((s) => s.status !== "completed" && s.dueDate < todayStr);
  const overduePersonalTasks = userPersonalTasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr);
  const totalOverdue = overdueChainSteps.length + overduePersonalTasks.length;

  // Recent handovers from logs
  const recentHandovers = activeProject
    ? activeProject.steps
        .filter((s) => s.handoverComment)
        .slice(-4)
        .reverse()
    : [];

  return (
    <div id="dashboard-overview-container" className="space-y-6">
      
      {/* KPI Cards Grid (4 Cards in Sleek Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Team Chain Progress */}
        <div 
          onClick={onNavigateToTeamChain}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TEAM PROGRESS</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <GitMerge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{projectProgress}%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {completedChainSteps}/{totalChainSteps} สเต็ป
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${projectProgress}%` }}
            />
          </div>
        </div>

        {/* Card 2: Personal Tasks */}
        <div 
          onClick={onNavigateToPersonal}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PERSONAL TASKS</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">
              {completedPersonal}/{totalPersonal}
            </span>
            <span className="text-xs text-slate-500 font-medium">เสร็จสิ้น</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalPersonal > 0 ? (completedPersonal / totalPersonal) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 3: Next Deadline / Active In Progress */}
        <div 
          onClick={onNavigateToTeamChain}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">กำลังดำเนินการ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-blue-600">{inProgressChainSteps.length}</span>
            <span className="text-xs text-slate-500 font-medium">สเต็ปพร้อมส่งต่อ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>รอตรวจ/อนุมัติ {waitingChainSteps.length} ขั้นตอน</span>
          </p>
        </div>

        {/* Card 4: Urgent & Overdue Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">งานด่วน & เลยกำหนด</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-rose-600">
              {urgentPersonal.length + totalOverdue}
            </span>
            <span className="text-xs text-slate-500 font-medium">รายการ</span>
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-3 flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>เลยกำหนด {totalOverdue} รายการ</span>
          </p>
        </div>

      </div>



    </div>
  );
};
