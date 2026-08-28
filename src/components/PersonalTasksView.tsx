import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Trash2, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ListTodo,
  User,
  Send,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Edit3,
  LayoutDashboard,
  Columns,
  List,
  BarChart3,
  TrendingUp,
  Flame,
  Check,
  RotateCcw,
  SlidersHorizontal,
  X,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { PersonalTask, PriorityLevel, TaskAttachment, ChecklistItem } from '../types';
import { isSameMember, isLeeAlias } from '../utils/memberMatch';
import { PersonalTaskHandoverModal } from './PersonalTaskHandoverModal';
import { EditPersonalTaskModal } from './EditPersonalTaskModal';
import { SubmitApprovalModal } from './SubmitApprovalModal';
import { ApprovalActionModal } from './ApprovalActionModal';
import { AttachmentManager } from './AttachmentManager';
import { openExternalUrl } from '../utils/url';
import { getMemberColorStyle } from '../utils/memberColor';

interface PersonalTasksViewProps {
  onOpenCreateTask: () => void;
}

export const PersonalTasksView: React.FC<PersonalTasksViewProps> = ({
  onOpenCreateTask,
}) => {
  const { 
    personalTasks, 
    updatePersonalTask, 
    deletePersonalTask, 
    toggleChecklistItem,
    selectedRole,
    members,
    addPersonalTaskLog,
    submitPersonalTaskForApproval,
    approvePersonalTask,
    rejectPersonalTask,
    requestPersonalTaskRevision
  } = useWork();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'waiting_approval' | 'revision_requested' | 'completed' | 'handover' | 'urgent'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showDashboardStats, setShowDashboardStats] = useState<boolean>(true);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<PersonalTask | null>(null);
  const [handoverModalTask, setHandoverModalTask] = useState<PersonalTask | null>(null);
  const [submitApprovalTask, setSubmitApprovalTask] = useState<PersonalTask | null>(null);
  const [approvalActionTask, setApprovalActionTask] = useState<PersonalTask | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Quick log and inline subtask states
  const [quickLogText, setQuickLogText] = useState('');
  const [quickLogMins, setQuickLogMins] = useState(30);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter tasks based on current role scope
  const selectedMemberObj = members.find((m) => m.name === selectedRole || m.id === selectedRole);
  const memberId = selectedMemberObj ? selectedMemberObj.id : (isLeeAlias(selectedRole) ? 'lee' : '');

  // Scope tasks: tasks that match the selected member or waiting approval for the approver
  const roleScopedTasks = useMemo(() => {
    return personalTasks.filter((t) => {
      if (!t) return false;
      if (selectedRole === 'all') return true;
      const assigned = t.assignedTo || '';
      const approver = t.approverRole || '';
      const isAssigned = (
        assigned.toLowerCase() === selectedRole.toLowerCase() ||
        assigned.includes(selectedRole) ||
        selectedRole.includes(assigned) ||
        (isLeeAlias(selectedRole) && isLeeAlias(assigned)) ||
        isSameMember(assigned, selectedRole, memberId)
      );
      const isWaitingApprovalForMe = (
        t.status === 'waiting_approval' && (
          approver.toLowerCase() === selectedRole.toLowerCase() ||
          approver.includes(selectedRole) ||
          selectedRole.includes(approver) ||
          (isLeeAlias(selectedRole) && isLeeAlias(approver)) ||
          isSameMember(approver, selectedRole, memberId)
        )
      );
      return isAssigned || isWaitingApprovalForMe;
    });
  }, [personalTasks, selectedRole, memberId]);

  // Dashboard Metrics Calculation
  const metrics = useMemo(() => {
    const total = roleScopedTasks.length;
    const todo = roleScopedTasks.filter((t) => t.status === 'todo').length;
    const inProgress = roleScopedTasks.filter((t) => t.status === 'in_progress').length;
    const waitingApproval = roleScopedTasks.filter((t) => t.status === 'waiting_approval').length;
    const revisionRequested = roleScopedTasks.filter((t) => t.approvalStatus === 'revision_requested').length;
    const completed = roleScopedTasks.filter((t) => t.status === 'completed').length;
    const handovers = roleScopedTasks.filter((t) => t.handedOverFrom || t.handedOverTo).length;
    const urgent = roleScopedTasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed').length;
    
    const overdue = roleScopedTasks.filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length;
    const dueToday = roleScopedTasks.filter((t) => t.status !== 'completed' && t.dueDate === todayStr).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let totalSpentMins = 0;
    let totalEstimatedMins = 0;
    roleScopedTasks.forEach((t) => {
      totalSpentMins += t.spentMinutes || 0;
      totalEstimatedMins += t.estimatedMinutes || 0;
    });

    // Categories breakdown
    const categoriesMap: { [cat: string]: number } = {};
    roleScopedTasks.forEach((t) => {
      const cat = t.category || 'ทั่วไป';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    return {
      total,
      todo,
      inProgress,
      waitingApproval,
      revisionRequested,
      completed,
      handovers,
      urgent,
      overdue,
      dueToday,
      completionRate,
      totalSpentMins,
      totalEstimatedMins,
      categoriesMap
    };
  }, [roleScopedTasks, todayStr]);

  // Filter tasks for display
  const filteredTasks = useMemo(() => {
    return roleScopedTasks.filter((t) => {
      if (!t) return false;
      const title = t.title || '';
      const description = t.description || '';
      const assigned = t.assignedTo || '';
      const handedFrom = t.handedOverFrom || '';
      const handedTo = t.handedOverTo || '';

      const matchesSearch = 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        assigned.toLowerCase().includes(searchQuery.toLowerCase()) ||
        handedFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        handedTo.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'handover') {
        matchesStatus = Boolean(t.handedOverFrom || t.handedOverTo);
      } else if (statusFilter === 'urgent') {
        matchesStatus = (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed';
      } else if (statusFilter === 'waiting_approval') {
        matchesStatus = t.status === 'waiting_approval';
      } else if (statusFilter === 'revision_requested') {
        matchesStatus = t.approvalStatus === 'revision_requested';
      } else if (statusFilter !== 'all') {
        matchesStatus = t.status === statusFilter;
      }

      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || (t.category || 'ทั่วไป') === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [roleScopedTasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1"><span>🔥</span><span>ด่วนมาก (Urgent)</span></span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1"><span>⚡</span><span>สำคัญสูง (High)</span></span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">ปานกลาง (Medium)</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">ทั่วไป (Low)</span>;
    }
  };

  const handleAddLog = (taskId: string) => {
    if (!quickLogText.trim()) return;
    const task = personalTasks.find((t) => t.id === taskId);
    if (!task) return;

    addPersonalTaskLog(taskId, {
      author: task.assignedTo,
      text: quickLogText.trim(),
      durationMinutes: Number(quickLogMins) || 0,
      type: 'log',
    });

    setQuickLogText('');
  };

  const handleAddInlineSubtask = (taskId: string) => {
    if (!newSubtaskText.trim()) return;
    const task = personalTasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSubtask: ChecklistItem = {
      id: `check-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newSubtaskText.trim(),
      done: false,
    };

    updatePersonalTask(taskId, {
      checklist: [...(task.checklist || []), newSubtask],
    });

    setNewSubtaskText('');
  };

  return (
    <div id="personal-tasks-section" className="space-y-6">
      
      {/* Edit Personal Task Modal */}
      <EditPersonalTaskModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />

      {/* Handover Modal */}
      <PersonalTaskHandoverModal
        task={handoverModalTask}
        isOpen={Boolean(handoverModalTask)}
        onClose={() => setHandoverModalTask(null)}
      />

      {/* TOP DASHBOARD BANNER & METRICS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold shadow-sm">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">แดชบอร์ดงานส่วนตัว (Personal Tasks Dashboard)</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    {selectedRole === 'all' ? 'ทุกคนในทีม' : `ของ ${selectedRole}`}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  ติดตามภาพรวมงานส่วนตัว ความคืบหน้า กำหนดส่ง และส่งต่องานระหว่างสมาชิกในทีม
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 self-start md:self-auto flex-wrap gap-y-2">
            <button
              onClick={() => setShowDashboardStats(!showDashboardStats)}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>{showDashboardStats ? 'ซ่อนสถิติย่อ' : 'แสดงสถิติย่อ'}</span>
            </button>

            <button
              id="add-personal-task-btn"
              onClick={onOpenCreateTask}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มงานส่วนตัวใหม่</span>
            </button>
          </div>
        </div>

        {/* METRICS BENTO CARDS */}
        {showDashboardStats && (
          <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200/80 space-y-4">
            
            {/* Top Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              {/* 1. All Tasks */}
              <div 
                onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); }}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  statusFilter === 'all' && categoryFilter === 'all'
                    ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">งานทั้งหมด</span>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
                  <span className="text-[10px] text-slate-400 font-medium">รายการ</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>ความสำเร็จ:</span>
                  <span className="font-bold text-blue-600">{metrics.completionRate}%</span>
                </div>
              </div>

              {/* 2. To Do */}
              <div 
                onClick={() => setStatusFilter('todo')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  statusFilter === 'todo' 
                    ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">รอดำเนินการ</span>
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-800">{metrics.todo}</span>
                  <span className="text-[10px] text-slate-400 font-medium">รอเริ่ม</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>สถานะ:</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-700">To Do</span>
                </div>
              </div>

              {/* 3. In Progress */}
              <div 
                onClick={() => setStatusFilter('in_progress')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  statusFilter === 'in_progress' 
                    ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700">กำลังทำ</span>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-blue-600">{metrics.inProgress}</span>
                  <span className="text-[10px] text-blue-400 font-medium">กำลังดำเนินการ</span>
                </div>
                <div className="mt-2 text-[10px] text-blue-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>สถานะ:</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 font-semibold text-blue-700">In Progress</span>
                </div>
              </div>

              {/* 3.5 Approval Pending & Revision Card */}
              <div 
                onClick={() => setStatusFilter(metrics.waitingApproval > 0 ? 'waiting_approval' : 'revision_requested')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  statusFilter === 'waiting_approval' || statusFilter === 'revision_requested'
                    ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800">รออนุมัติ/แก้ไข</span>
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-amber-700">{metrics.waitingApproval + metrics.revisionRequested}</span>
                  <span className="text-[10px] text-amber-600 font-medium">รอตรวจ {metrics.waitingApproval}</span>
                </div>
                <div className="mt-2 text-[10px] text-amber-700 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>ขอแก้ไข:</span>
                  <span className="font-bold text-rose-600">{metrics.revisionRequested} รายการ</span>
                </div>
              </div>

              {/* 4. Completed */}
              <div 
                onClick={() => setStatusFilter('completed')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  statusFilter === 'completed' 
                    ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700">เสร็จสมบูรณ์</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-emerald-600">{metrics.completed}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">สำเร็จแล้ว</span>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>อัตราส่วน:</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 font-bold text-emerald-700">{metrics.completionRate}%</span>
                </div>
              </div>

              {/* 5. Handovers */}
              <div 
                onClick={() => setStatusFilter('handover')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  statusFilter === 'handover' 
                    ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-700">งานส่งต่อ</span>
                  <Send className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-indigo-600">{metrics.handovers}</span>
                  <span className="text-[10px] text-indigo-400 font-medium">ส่งมอบ</span>
                </div>
                <div className="mt-2 text-[10px] text-indigo-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>ส่งต่อในทีม:</span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 font-bold text-indigo-700">Handover</span>
                </div>
              </div>

              {/* 6. Urgent / Attention */}
              <div 
                onClick={() => setStatusFilter('urgent')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  statusFilter === 'urgent' 
                    ? 'bg-white border-rose-600 shadow-md ring-2 ring-rose-600/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700">งานด่วน & สำคัญ</span>
                  <Flame className="w-4 h-4 text-rose-600" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-rose-600">{metrics.urgent}</span>
                  <span className="text-[10px] text-rose-400 font-medium">ต้องโฟกัส</span>
                </div>
                <div className="mt-2 text-[10px] text-rose-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>เลยกำหนด:</span>
                  <span className="font-bold text-rose-700">{metrics.overdue} งาน</span>
                </div>
              </div>

            </div>

            {/* Progress Bar & Sub-Analytics Strip */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Progress visual bar */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>ความคืบหน้าภาพรวม</span>
                    <span className="text-[11px] font-normal text-slate-400">({metrics.completed}/{metrics.total} งาน)</span>
                  </span>
                  <span className="font-bold text-blue-600">{metrics.completionRate}%</span>
                </div>
                
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0}%` }} 
                    className="bg-emerald-500 h-full transition-all duration-300"
                    title={`เสร็จแล้ว: ${metrics.completed}`}
                  />
                  <div 
                    style={{ width: `${metrics.total > 0 ? (metrics.inProgress / metrics.total) * 100 : 0}%` }} 
                    className="bg-blue-500 h-full transition-all duration-300"
                    title={`กำลังทำ: ${metrics.inProgress}`}
                  />
                  <div 
                    style={{ width: `${metrics.total > 0 ? (metrics.todo / metrics.total) * 100 : 0}%` }} 
                    className="bg-slate-300 h-full transition-all duration-300"
                    title={`รอดำเนินการ: ${metrics.todo}`}
                  />
                </div>

                <div className="flex items-center space-x-4 text-[10px] text-slate-500 pt-0.5">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>เสร็จแล้ว ({metrics.completed})</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    <span>กำลังทำ ({metrics.inProgress})</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                    <span>รอเริ่ม ({metrics.todo})</span>
                  </span>
                </div>
              </div>

              {/* Time stats */}
              <div className="flex items-center space-x-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 shrink-0">
                <div className="text-center px-2">
                  <span className="text-[10px] text-slate-400 block">เวลาที่บันทึกไป</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {Math.floor(metrics.totalSpentMins / 60)} ชม. {metrics.totalSpentMins % 60} น.
                  </span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="text-center px-2">
                  <span className="text-[10px] text-slate-400 block">กำหนดส่งวันนี้</span>
                  <span className={`font-bold text-sm ${metrics.dueToday > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                    {metrics.dueToday} งาน
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* FILTER & TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="flex items-center space-x-2 flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหางานส่วนตัว, แท็ก, ผู้รับผิดชอบ, คนส่งต่อ..."
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Right Controls: View Toggle & Filters */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            
            {/* Category Filter */}
            <div className="flex items-center space-x-1.5 text-xs">
              <label htmlFor="cat-filter" className="text-slate-500 font-medium">หมวด:</label>
              <select
                id="cat-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none text-xs"
              >
                <option value="all">ทุกหมวดหมู่</option>
                {Object.keys(metrics.categoriesMap).map((cat) => (
                  <option key={cat} value={cat}>{cat} ({metrics.categoriesMap[cat]})</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-1.5 text-xs">
              <label htmlFor="prio-filter" className="text-slate-500 font-medium">ความสำคัญ:</label>
              <select
                id="prio-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none text-xs"
              >
                <option value="all">ทุกระดับ</option>
                <option value="urgent">🔥 ด่วนมาก (Urgent)</option>
                <option value="high">⚡ สำคัญสูง (High)</option>
                <option value="medium">ปานกลาง (Medium)</option>
                <option value="low">ทั่วไป (Low)</option>
              </select>
            </div>

            {/* View Mode Switcher: List vs Kanban */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองรายการ"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">รายการ</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'kanban' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองคัมบัง"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">คัมบัง</span>
              </button>
            </div>

          </div>

        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1">สถานะ:</span>
          
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({roleScopedTasks.length})
          </button>

          <button
            onClick={() => setStatusFilter('todo')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === 'todo' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            รอดำเนินการ ({metrics.todo})
          </button>

          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === 'in_progress' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-blue-700 hover:bg-blue-50'
            }`}
          >
            กำลังทำ ({metrics.inProgress})
          </button>

          <button
            onClick={() => setStatusFilter('waiting_approval')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
              statusFilter === 'waiting_approval' ? 'bg-amber-500 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-amber-700" />
            <span>รออนุมัติ ({metrics.waitingApproval})</span>
          </button>

          {metrics.revisionRequested > 0 && (
            <button
              onClick={() => setStatusFilter('revision_requested')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
                statusFilter === 'revision_requested' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <RotateCcw className="w-3 h-3 text-rose-600" />
              <span>ส่งกลับแก้ไข ({metrics.revisionRequested})</span>
            </button>
          )}

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            เสร็จแล้ว ({metrics.completed})
          </button>

          <button
            onClick={() => setStatusFilter('handover')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
              statusFilter === 'handover' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>งานส่งต่อ ({metrics.handovers})</span>
          </button>

          <button
            onClick={() => setStatusFilter('urgent')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
              statusFilter === 'urgent' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>ด่วนมาก ({metrics.urgent})</span>
          </button>

          {/* Reset Filters button if any active */}
          {(statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="ml-auto text-xs text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}

        </div>
      </div>

      {/* TASKS CONTENT: LIST VIEW OR KANBAN VIEW */}
      {viewMode === 'list' ? (
        
        /* ---------------- LIST VIEW ---------------- */
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isExpanded = selectedTaskId === task.id;
              const completedChecklistCount = (task.checklist || []).filter((c) => c.done).length;

              return (
                <div
                  key={task.id}
                  style={task.color ? { borderLeftColor: task.color, borderLeftWidth: '4px' } : undefined}
                  className={`bg-white rounded-2xl border transition shadow-xs hover:shadow-md hover:border-slate-300 overflow-hidden ${
                    isCompleted ? 'border-slate-200 opacity-85' : 'border-slate-200'
                  }`}
                >
                  {/* Task Item Main Row */}
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                    
                    {/* Left: Checkbox, Member Pill & Title */}
                    <div className="flex items-start space-x-3.5 flex-1">
                      
                      {/* Completion check button */}
                      <button
                        onClick={() =>
                          updatePersonalTask(task.id, {
                            status: isCompleted ? 'todo' : 'completed',
                            completedAt: !isCompleted ? new Date().toISOString() : undefined,
                          })
                        }
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/50'
                        }`}
                        title={isCompleted ? 'คลิกเพื่อเปลี่ยนเป็นยังไม่เสร็จ' : 'คลิกเพื่อเสร็จงาน'}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2.5 h-2.5 rounded-xs bg-transparent" />}
                      </button>

                      <div className="space-y-1.5 flex-1">
                        
                        {/* Badges Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200/60">
                            👤 {task.assignedTo}
                          </span>
                          
                          <span className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                            {task.category || 'ทั่วไป'}
                          </span>

                          {getPriorityBadge(task.priority)}

                          {/* Quick Status Pill */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'waiting_approval'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.status === 'completed'
                              ? '✅ เสร็จแล้ว'
                              : task.status === 'waiting_approval'
                              ? '⏳ รออนุมัติ'
                              : task.status === 'in_progress'
                              ? '⚡ กำลังทำ'
                              : '📋 รอดำเนินการ'}
                          </span>

                          {/* Approval Status Badges */}
                          {task.status === 'waiting_approval' && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                              <span>ผู้อนุมัติ: {task.approverRole || 'หัวหน้างาน'}</span>
                            </span>
                          )}

                          {task.approvalStatus === 'revision_requested' && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-bold flex items-center space-x-1">
                              <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                              <span>ส่งกลับให้แก้ไข ({task.approverRole || 'ผู้อนุมัติ'})</span>
                            </span>
                          )}

                          {task.approvalStatus === 'approved' && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>ผ่านอนุมัติแล้ว</span>
                            </span>
                          )}

                          {/* Handover Badges */}
                          {task.handedOverFrom && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium flex items-center space-x-1">
                              <span>📥 ส่งต่อมาจาก: <strong>{task.handedOverFrom}</strong></span>
                            </span>
                          )}
                          {task.handedOverTo && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center space-x-1">
                              <span>📤 ส่งต่อไปให้: <strong>{task.handedOverTo}</strong></span>
                            </span>
                          )}
                        </div>

                        {/* Task Title */}
                        <h3
                          className={`text-sm sm:text-base font-bold text-slate-900 leading-snug ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                        )}

                        {/* Revision Feedback Box with Picture attachments if revision requested */}
                        {task.approvalStatus === 'revision_requested' && (
                          <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-2">
                            <div className="flex items-center space-x-1.5 font-bold text-rose-900">
                              <RotateCcw className="w-4 h-4 text-rose-600 animate-spin-once" />
                              <span>ข้อความแจ้งแก้ไขจาก {task.approverRole || 'ผู้อนุมัติ'}:</span>
                            </div>
                            <p className="font-medium pl-5 text-rose-900 leading-relaxed whitespace-pre-wrap">
                              {task.approvalComment || 'กรุณาปรับปรุงและแก้ไขรายละเอียดงานให้สมบูรณ์'}
                            </p>
                            {task.approvalAttachments && task.approvalAttachments.length > 0 && (
                              <div className="pl-5 pt-1 space-y-1.5">
                                <span className="text-[10px] font-bold text-rose-700 block">🖼️ รูปภาพ/หลักฐานที่ต้องแก้ไข (คลิกเพื่อดูภาพใหญ่):</span>
                                <div className="flex items-center flex-wrap gap-2">
                                  {task.approvalAttachments.map((att) => (
                                    <div
                                      key={att.id}
                                      onClick={() => {
                                        if (att.type === 'image') setPreviewImageUrl(att.url);
                                      }}
                                      className="cursor-pointer group relative"
                                    >
                                      {att.type === 'image' ? (
                                        <div className="relative overflow-hidden rounded-lg border border-rose-300 shadow-xs hover:border-rose-500">
                                          <img
                                            src={att.url}
                                            alt={att.name}
                                            className="w-16 h-16 object-cover group-hover:scale-105 transition"
                                          />
                                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                            <Eye className="w-4 h-4 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] px-2 py-1 bg-white border border-rose-200 rounded text-rose-800 flex items-center space-x-1">
                                          <span>📎 {att.name}</span>
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Handover Comment Preview */}
                        {task.handoverComment && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start space-x-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-amber-950">โน้ตส่งมอบ:</span> {task.handoverComment}
                            </div>
                          </div>
                        )}

                        {/* Tags, Checklist count & Attachments */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {task.checklist && task.checklist.length > 0 && (
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                              <ListTodo className="w-3 h-3 text-blue-600" />
                              <span>
                                เช็คลิสต์ {completedChecklistCount}/{task.checklist.length}
                              </span>
                            </span>
                          )}

                          {task.spentMinutes && task.spentMinutes > 0 ? (
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>ใช้ไป {task.spentMinutes} นาที</span>
                            </span>
                          ) : null}

                          {/* Attachments Mini Bar */}
                          {task.attachments && task.attachments.length > 0 && (
                            <div className="flex items-center flex-wrap gap-1">
                              {task.attachments.map((att) => (
                                <span
                                  key={att.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (att.type === 'link') {
                                      openExternalUrl(att.url, e);
                                    }
                                  }}
                                  className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium border border-slate-200 cursor-pointer hover:bg-slate-200"
                                  title={att.name}
                                >
                                  {att.type === 'image' ? (
                                    <ImageIcon className="w-2.5 h-2.5 text-pink-600" />
                                  ) : att.type === 'link' ? (
                                    <LinkIcon className="w-2.5 h-2.5 text-blue-600" />
                                  ) : (
                                    <FileText className="w-2.5 h-2.5 text-emerald-600" />
                                  )}
                                  <span className="truncate max-w-[90px]">{att.name}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {task.tags && task.tags.map((tg, i) => (
                            <span key={i} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Due Date & Full Action Set */}
                    <div className="flex items-center justify-between lg:justify-end space-x-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                      
                      {/* Due date info */}
                      <div className="text-left lg:text-right pr-2">
                        <div className="flex items-center space-x-1 text-xs text-slate-700 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span>{task.dueDate}</span>
                        </div>
                        <span className={`text-[10px] block font-medium ${
                          task.dueDate < todayStr && !isCompleted ? 'text-rose-600 font-bold' : 'text-slate-400'
                        }`}>
                          {task.dueDate < todayStr && !isCompleted ? '⚠️ เลยกำหนด' : 'กำหนดส่ง'}
                        </span>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        
                        {/* APPROVAL WORKFLOW BUTTONS */}
                        {task.status === 'waiting_approval' ? (
                          <button
                            onClick={() => setApprovalActionTask(task)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-xs shadow-amber-600/20 flex items-center space-x-1 transition cursor-pointer"
                            title="เปิดหน้าต่างตรวจสอบและอนุมัติงาน"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ตรวจ/อนุมัติ</span>
                          </button>
                        ) : task.approvalStatus === 'revision_requested' ? (
                          <button
                            onClick={() => setSubmitApprovalTask(task)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-xs shadow-rose-600/20 flex items-center space-x-1 transition cursor-pointer"
                            title="ส่งงานขออนุมัติใหม่หลังแก้ไขแล้ว"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>ส่งอนุมัติใหม่</span>
                          </button>
                        ) : !isCompleted ? (
                          <button
                            onClick={() => setSubmitApprovalTask(task)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 flex items-center space-x-1 transition cursor-pointer"
                            title="ส่งเรื่องขออนุมัติงานนี้ต่อหัวหน้า"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                            <span className="hidden sm:inline">ส่งอนุมัติ</span>
                          </button>
                        ) : null}

                        {/* 1. EDIT BUTTON (ปุ่มแก้ไขงาน) */}
                        <button
                          onClick={() => setEditingTask(task)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 flex items-center space-x-1 transition cursor-pointer"
                          title="แก้ไขรายละเอียดงานนี้"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>แก้ไข</span>
                        </button>

                        {/* 2. HANDOVER BUTTON (ปุ่มส่งต่องาน) */}
                        <button
                          onClick={() => setHandoverModalTask(task)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs shadow-indigo-600/20 flex items-center space-x-1 transition cursor-pointer"
                          title="ส่งต่องานนี้ให้เพื่อนร่วมทีม"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">ส่งต่อ</span>
                        </button>

                        {/* 3. DETAILS EXPAND BUTTON */}
                        <button
                          onClick={() => setSelectedTaskId(isExpanded ? null : task.id)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center space-x-1 transition cursor-pointer"
                          title={isExpanded ? 'ย่อรายละเอียด' : 'ดูรายละเอียดเต็ม'}
                        >
                          <span>{isExpanded ? 'ย่อ' : 'รายละเอียด'}</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        {/* 4. DELETE BUTTON */}
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบงาน "${task.title}" หรือไม่?`)) {
                              deletePersonalTask(task.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="ลบงานนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* EXPANDED DETAILS ACCORDION */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-slate-50/90 border-t border-slate-200 space-y-4 text-xs animate-in fade-in duration-150">
                      
                      {/* Top Action Ribbon inside Details */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-700">ปรับสถานะงานด่วน:</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updatePersonalTask(task.id, { status: 'todo' })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                task.status === 'todo' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              To Do
                            </button>
                            <button
                              onClick={() => updatePersonalTask(task.id, { status: 'in_progress' })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                task.status === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              ⚡ กำลังทำ
                            </button>
                            <button
                              onClick={() => updatePersonalTask(task.id, { status: 'completed', completedAt: new Date().toISOString() })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                task.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              ✅ เสร็จสิ้น
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>แก้ไขงานฉบับเต็ม</span>
                          </button>
                          <button
                            onClick={() => setHandoverModalTask(task)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>ส่งต่องานให้เพื่อน</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Checklist Section */}
                      <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                            <ListTodo className="w-4 h-4 text-blue-600" />
                            <span>รายการเช็คลิสต์ย่อย ({completedChecklistCount}/{(task.checklist || []).length})</span>
                          </span>
                        </div>

                        {task.checklist && task.checklist.length > 0 ? (
                          <div className="space-y-1.5">
                            {task.checklist.map((item) => (
                              <label
                                key={item.id}
                                className="flex items-center space-x-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer hover:bg-blue-50/40 transition"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.done}
                                  onChange={() => toggleChecklistItem(task.id, item.id)}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                                <span className={`text-slate-800 ${item.done ? 'line-through text-slate-400' : 'font-medium'}`}>
                                  {item.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-xs italic">ยังไม่มีเช็คลิสต์ย่อย</p>
                        )}

                        {/* Inline add subtask */}
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                          <input
                            type="text"
                            value={newSubtaskText}
                            onChange={(e) => setNewSubtaskText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddInlineSubtask(task.id);
                              }
                            }}
                            placeholder="+ เพิ่มรายการเช็คลิสต์ย่อยใหม่ แล้วกด Enter..."
                            className="flex-1 text-xs p-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddInlineSubtask(task.id)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition cursor-pointer"
                          >
                            เพิ่ม
                          </button>
                        </div>
                      </div>

                      {/* Attachments Section */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                        <AttachmentManager
                          attachments={task.attachments || []}
                          onChange={(newAttachments: TaskAttachment[]) => {
                            updatePersonalTask(task.id, { attachments: newAttachments });
                          }}
                        />
                      </div>

                      {/* Notes Section */}
                      {task.notes && (
                        <div className="space-y-1.5">
                          <span className="font-bold text-slate-700 uppercase tracking-wider block">บันทึกเพิ่มเติม (Notes):</span>
                          <p className="p-3.5 bg-white rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {task.notes}
                          </p>
                        </div>
                      )}

                      {/* Work Logs Section */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-700 uppercase tracking-wider block">
                          ⏱️ บันทึกเวลาทำงาน & ความคืบหน้า (Work Logs):
                        </span>
                        
                        {task.workLogs && task.workLogs.length > 0 ? (
                          <div className="space-y-1.5 mb-2">
                            {task.workLogs.map((log) => (
                              <div key={log.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] flex items-center justify-between">
                                <span className="text-slate-800 font-medium">{log.text}</span>
                                <span className="text-slate-400 font-semibold">+{log.durationMinutes} นาที ({new Date(log.timestamp).toLocaleTimeString('th-TH')})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-xs italic">ยังไม่มีการบันทึกเวลาทำงาน</p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={quickLogText}
                            onChange={(e) => setQuickLogText(e.target.value)}
                            placeholder="พิมพ์สิ่งที่ทำเสร็จแล้ว..."
                            className="flex-1 text-xs p-2.5 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              step="15"
                              value={quickLogMins}
                              onChange={(e) => setQuickLogMins(Number(e.target.value))}
                              placeholder="นาที"
                              className="w-20 text-xs p-2.5 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddLog(task.id)}
                              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition shrink-0 cursor-pointer shadow-xs"
                            >
                              + บันทึกเวลา
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">ไม่พบรายการงานส่วนตัวตามเงื่อนไข</h3>
              <p className="text-xs text-slate-500 mt-1">ลองล้างตัวกรองหรือกดปุ่ม "+ เพิ่มงานส่วนตัวใหม่" เพื่อสร้างงาน</p>
            </div>
          )}
        </div>

      ) : (

        /* ---------------- KANBAN BOARD VIEW ---------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          {/* 1. To Do Column */}
          <div className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200/80 space-y-3 flex flex-col">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <h4 className="font-bold text-sm text-slate-800">รอดำเนินการ (To Do)</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-xs font-bold text-slate-700 shadow-2xs">
                {filteredTasks.filter((t) => t.status === 'todo').length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {filteredTasks
                .filter((t) => t.status === 'todo')
                .map((task) => (
                  <div 
                    key={task.id} 
                    style={task.color ? { borderLeftColor: task.color, borderLeftWidth: '4px' } : undefined}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        👤 {task.assignedTo}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    <h5 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h5>
                    {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>{task.dueDate}</span>
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                          title="แก้ไขงาน"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSubmitApprovalTask(task)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="ส่งขออนุมัติ"
                        >
                          ส่งอนุมัติ
                        </button>
                        <button
                          onClick={() => updatePersonalTask(task.id, { status: 'in_progress' })}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          เริ่มทำ →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 2. In Progress & Revision Column */}
          <div className="bg-blue-50/40 rounded-3xl p-4 border border-blue-200/60 space-y-3 flex flex-col">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <h4 className="font-bold text-sm text-blue-950">กำลังดำเนินการ (In Progress)</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-xs font-bold text-blue-700 shadow-2xs">
                {filteredTasks.filter((t) => t.status === 'in_progress').length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {filteredTasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <div 
                    key={task.id} 
                    style={task.color ? { borderLeftColor: task.color, borderLeftWidth: '4px' } : undefined}
                    className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-2.5 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                        👤 {task.assignedTo}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {task.approvalStatus === 'revision_requested' && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900 space-y-1">
                        <div className="font-bold flex items-center space-x-1">
                          <RotateCcw className="w-3 h-3 text-rose-600" />
                          <span>แจ้งแก้ไข:</span>
                        </div>
                        <p className="line-clamp-2">{task.approvalComment || 'กรุณาแก้ไขตามที่ผู้อนุมัติแจ้ง'}</p>
                      </div>
                    )}

                    <h5 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h5>
                    {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>{task.dueDate}</span>
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                          title="แก้ไขงาน"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSubmitApprovalTask(task)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="ส่งขออนุมัติ"
                        >
                          ส่งอนุมัติ
                        </button>
                        <button
                          onClick={() => updatePersonalTask(task.id, { status: 'completed', completedAt: new Date().toISOString() })}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          เสร็จ ✓
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 3. Waiting Approval Column (รออนุมัติ) */}
          <div className="bg-amber-50/40 rounded-3xl p-4 border border-amber-200/70 space-y-3 flex flex-col">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-sm text-amber-950">รออนุมัติ (Approval)</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-xs font-bold text-amber-700 shadow-2xs border border-amber-200">
                {filteredTasks.filter((t) => t.status === 'waiting_approval').length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {filteredTasks
                .filter((t) => t.status === 'waiting_approval')
                .map((task) => (
                  <div 
                    key={task.id} 
                    style={task.color ? { borderLeftColor: task.color, borderLeftWidth: '4px' } : undefined}
                    className="bg-white p-4 rounded-2xl border border-amber-300/80 shadow-xs space-y-2.5 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        👤 {task.assignedTo}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        ⏳ รออนุมัติ
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h5>
                    <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                      <span className="font-semibold">ผู้อนุมัติ:</span> {task.approverRole || 'หัวหน้างาน'}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>{task.dueDate}</span>
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setApprovalActionTask(task)}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center space-x-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>ตรวจ/อนุมัติ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 4. Completed Column */}
          <div className="bg-emerald-50/40 rounded-3xl p-4 border border-emerald-200/60 space-y-3 flex flex-col">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-sm text-emerald-950">เสร็จสิ้นแล้ว (Completed)</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-xs font-bold text-emerald-700 shadow-2xs">
                {filteredTasks.filter((t) => t.status === 'completed').length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {filteredTasks
                .filter((t) => t.status === 'completed')
                .map((task) => (
                  <div 
                    key={task.id} 
                    style={task.color ? { borderLeftColor: task.color, borderLeftWidth: '4px' } : undefined}
                    className="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 hover:shadow-md transition opacity-90"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        👤 {task.assignedTo}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ เสร็จแล้ว
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-600 line-through leading-snug">{task.title}</h5>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                      <span>{task.completedAt ? new Date(task.completedAt).toLocaleDateString('th-TH') : task.dueDate}</span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                          title="แก้ไขงาน"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updatePersonalTask(task.id, { status: 'todo', completedAt: undefined })}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          ย้อนกลับ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

      )}

      {/* APPROVAL SUBMISSION MODAL */}
      <SubmitApprovalModal
        task={submitApprovalTask}
        isOpen={Boolean(submitApprovalTask)}
        onClose={() => setSubmitApprovalTask(null)}
      />

      {/* APPROVAL ACTION MODAL (Approve / Reject / Revision) */}
      <ApprovalActionModal
        task={approvalActionTask}
        isOpen={Boolean(approvalActionTask)}
        onClose={() => setApprovalActionTask(null)}
      />

      {/* IMAGE PREVIEW LIGHTBOX */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImageUrl} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain mx-auto rounded-xl" 
            />
          </div>
        </div>
      )}

    </div>
  );
};
