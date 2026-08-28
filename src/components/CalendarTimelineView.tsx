import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  GitMerge, 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Filter,
  Send,
  User,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  Layers,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { ChainStep, PersonalTask, TeamChainProject } from '../types';
import { isSameMember, isLeeAlias } from '../utils/memberMatch';
import { PersonalTaskHandoverModal } from './PersonalTaskHandoverModal';
import { StepHandoverModal } from './StepHandoverModal';
import { EditStepModal } from './EditStepModal';
import { EditPersonalTaskModal } from './EditPersonalTaskModal';

interface UnifiedDueItem {
  id: string;
  type: 'chain_step' | 'personal_task';
  title: string;
  assignedTo: string;
  dueDate: string;
  status: string;
  isCompleted: boolean;
  priority?: string;
  stepNumber?: number;
  projectTitle?: string;
  originalStep?: ChainStep;
  originalTask?: PersonalTask;
  originalProject?: TeamChainProject;
  handedOverTo?: string;
  handedOverFrom?: string;
}

interface CalendarTimelineViewProps {
  onOpenStepDetail: (step: ChainStep) => void;
  onOpenHandover?: (step: ChainStep) => void;
}

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  onOpenStepDetail,
  onOpenHandover,
}) => {
  const { 
    visibleProjects: projects, 
    activeProject, 
    visiblePersonalTasks: personalTasks, 
    selectedRole, 
    members,
    updatePersonalTask,
    reopenStep
  } = useWork();

  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'agenda'>('calendar');
  const [filterType, setFilterType] = useState<'all' | 'chain' | 'personal'>('all');
  const [filterMember, setFilterMember] = useState<string>('all');
  
  // Current month state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Modals for instant handover & edit from calendar
  const [handoverPersonalTask, setHandoverPersonalTask] = useState<PersonalTask | null>(null);
  const [handoverStep, setHandoverStep] = useState<{ step: ChainStep; project: TeamChainProject } | null>(null);
  const [editingStep, setEditingStep] = useState<ChainStep | null>(null);
  const [editingPersonalTask, setEditingPersonalTask] = useState<PersonalTask | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Combine all items across projects and personal tasks
  const allItems: UnifiedDueItem[] = useMemo(() => {
    const list: UnifiedDueItem[] = [];

    const selectedMemberObj = members.find((m) => m.name === selectedRole || m.id === selectedRole);
    const memberId = selectedMemberObj ? selectedMemberObj.id : (isLeeAlias(selectedRole) ? 'lee' : '');

    // 1. Team Chain steps from all projects (or active project)
    projects.forEach((proj) => {
      proj.steps.forEach((s) => {
        const matchesType = filterType === 'all' || filterType === 'chain';
        const matchesGlobalRole = selectedRole === 'all' || 
          s.assignedRole === selectedRole ||
          s.assignedPerson === selectedRole ||
          s.assignedRole.includes(selectedRole) || 
          s.assignedPerson.includes(selectedRole) ||
          (isLeeAlias(selectedRole) && (isLeeAlias(s.assignedRole) || isLeeAlias(s.assignedPerson))) ||
          isSameMember(s.assignedRole, selectedRole, memberId) ||
          isSameMember(s.assignedPerson, selectedRole, memberId);
        
        const matchesMember = filterMember === 'all' || 
          s.assignedPerson === filterMember || 
          s.assignedRole.includes(filterMember) ||
          (isLeeAlias(filterMember) && (isLeeAlias(s.assignedRole) || isLeeAlias(s.assignedPerson))) ||
          isSameMember(s.assignedPerson, filterMember) ||
          isSameMember(s.assignedRole, filterMember);

        if (matchesType && matchesGlobalRole && matchesMember) {
          list.push({
            id: s.id,
            type: 'chain_step',
            title: `สเต็ป ${s.stepNumber}: ${s.title}`,
            assignedTo: s.assignedPerson || s.assignedRole,
            dueDate: s.dueDate,
            status: s.status,
            isCompleted: s.status === 'completed',
            stepNumber: s.stepNumber,
            projectTitle: proj.title,
            originalStep: s,
            originalProject: proj,
            handedOverTo: s.handedOverTo,
            handedOverFrom: s.handedOverFrom,
          });
        }
      });
    });

    // 2. Personal tasks
    personalTasks.forEach((t) => {
      if (!t) return;
      const assigned = t.assignedTo || '';
      const matchesType = filterType === 'all' || filterType === 'personal';
      const matchesGlobalRole = selectedRole === 'all' || 
        assigned === selectedRole ||
        assigned.includes(selectedRole) ||
        selectedRole.includes(assigned) ||
        (isLeeAlias(selectedRole) && isLeeAlias(assigned)) ||
        isSameMember(assigned, selectedRole, memberId);

      const matchesMember = filterMember === 'all' || 
        assigned === filterMember ||
        (isLeeAlias(filterMember) && isLeeAlias(assigned)) ||
        isSameMember(assigned, filterMember);

      if (matchesType && matchesGlobalRole && matchesMember) {
        list.push({
          id: t.id,
          type: 'personal_task',
          title: t.title || 'ไม่มีชื่อหัวข้อ',
          assignedTo: assigned,
          dueDate: t.dueDate,
          status: t.status,
          isCompleted: t.status === 'completed',
          priority: t.priority,
          originalTask: t,
          handedOverTo: t.handedOverTo,
          handedOverFrom: t.handedOverFrom,
        });
      }
    });

    return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [projects, personalTasks, filterType, selectedRole, filterMember]);

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNamesTh = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(todayStr);
  };

  // Group items by date string "YYYY-MM-DD"
  const itemsByDate = useMemo(() => {
    const map: Record<string, UnifiedDueItem[]> = {};
    allItems.forEach((item) => {
      if (!map[item.dueDate]) map[item.dueDate] = [];
      map[item.dueDate].push(item);
    });
    return map;
  }, [allItems]);

  // Overdue, today, upcoming
  const overdueItems = allItems.filter((i) => !i.isCompleted && i.dueDate < todayStr);
  const todayItems = allItems.filter((i) => !i.isCompleted && i.dueDate === todayStr);
  const upcomingItems = allItems.filter((i) => !i.isCompleted && i.dueDate > todayStr);
  const completedItems = allItems.filter((i) => i.isCompleted);

  // Selected Day Items
  const selectedDayItems = selectedDay ? itemsByDate[selectedDay] || [] : [];

  const handleEditItem = (item: UnifiedDueItem) => {
    if (item.type === 'chain_step' && item.originalStep) {
      setEditingStep(item.originalStep);
    } else if (item.type === 'personal_task' && item.originalTask) {
      setEditingPersonalTask(item.originalTask);
    }
  };

  const handleOpenHandoverForItem = (item: UnifiedDueItem) => {
    if (item.type === 'personal_task' && item.originalTask) {
      setHandoverPersonalTask(item.originalTask);
    } else if (item.type === 'chain_step' && item.originalStep && item.originalProject) {
      if (onOpenHandover) {
        onOpenHandover(item.originalStep);
      } else {
        setHandoverStep({ step: item.originalStep, project: item.originalProject });
      }
    }
  };

  const renderItemCard = (item: UnifiedDueItem) => {
    const isChain = item.type === 'chain_step';

    return (
      <div
        key={`${item.type}-${item.id}`}
        className={`p-3.5 sm:p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          item.isCompleted
            ? 'bg-slate-50 border-slate-200 opacity-75'
            : isChain
            ? 'bg-white border-indigo-200 hover:border-indigo-400 shadow-xs'
            : 'bg-white border-blue-200 hover:border-blue-400 shadow-xs'
        }`}
      >
        <div className="flex items-start space-x-3 flex-1">
          {/* Icon Badge */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
              isChain
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}
          >
            {isChain ? <GitMerge className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isChain ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isChain ? '👥 งานทีม' : '📝 งานส่วนตัว'}
              </span>
              <span className="text-[11px] font-semibold text-slate-700">
                👤 {item.assignedTo}
              </span>
              {item.projectTitle && (
                <span className="text-[10px] text-slate-400">({item.projectTitle})</span>
              )}

              {item.handedOverTo && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                  ส่งต่อไปยัง {item.handedOverTo}
                </span>
              )}
            </div>

            <h4
              onClick={() => handleEditItem(item)}
              className={`text-sm font-bold text-slate-900 leading-snug cursor-pointer hover:text-indigo-600 transition ${
                item.isCompleted ? 'line-through text-slate-400' : ''
              }`}
              title="คลิกเพื่อแก้ไขรายละเอียดงาน"
            >
              {item.title}
            </h4>
          </div>
        </div>

        {/* Right side: Date and actions */}
        <div className="flex items-center justify-between sm:justify-end space-x-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-left sm:text-right">
            <div className="flex items-center space-x-1 text-xs font-semibold text-slate-700">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{item.dueDate}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {item.isCompleted
                ? 'เสร็จแล้ว'
                : item.dueDate === todayStr
                ? 'ครบกำหนดวันนี้'
                : item.dueDate < todayStr
                ? 'เลยกำหนด'
                : 'รอดำเนินการ'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Quick Edit Button */}
            <button
              onClick={() => handleEditItem(item)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 transition cursor-pointer"
              title="แก้ไขรายละเอียดงานนี้"
            >
              <Edit3 className="w-3 h-3 text-slate-600" />
              <span className="hidden sm:inline">แก้ไข</span>
            </button>

            {/* Handover Button */}
            {!item.isCompleted && (
              <button
                onClick={() => handleOpenHandoverForItem(item)}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 shadow-xs transition cursor-pointer"
                title="ส่งต่องานนี้ให้เพื่อนร่วมทีม"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">ส่งต่องาน</span>
              </button>
            )}

            {/* Reopen Team Step Button */}
            {isChain && item.isCompleted && item.originalStep && (
              <button
                onClick={() =>
                  reopenStep(item.originalProject?.id || '', item.originalStep!.id)
                }
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center space-x-1 border border-blue-200 transition cursor-pointer shadow-2xs"
                title="ดึงงานนี้กลับมาทำต่อในกระดาน"
              >
                <RotateCcw className="w-3 h-3 text-blue-600" />
                <span className="hidden sm:inline">ดึงกลับมาทำต่อ</span>
              </button>
            )}

            {/* Toggle Done for Personal Task */}
            {!isChain && item.originalTask && (
              <button
                onClick={() =>
                  updatePersonalTask(item.originalTask!.id, {
                    status: item.isCompleted ? 'todo' : 'completed',
                  })
                }
                className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
                  item.isCompleted
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                }`}
              >
                {item.isCompleted ? 'ทำอีกครั้ง' : '✓ เสร็จ'}
              </button>
            )}
          </div>

        </div>

      </div>
    );
  };

  return (
    <div id="calendar-timeline-section" className="space-y-6">
      
      {/* Handover & Edit Modals */}
      <PersonalTaskHandoverModal
        task={handoverPersonalTask}
        isOpen={Boolean(handoverPersonalTask)}
        onClose={() => setHandoverPersonalTask(null)}
      />
      <StepHandoverModal
        step={handoverStep?.step || null}
        project={handoverStep?.project || null}
        isOpen={Boolean(handoverStep)}
        onClose={() => setHandoverStep(null)}
      />
      <EditStepModal
        isOpen={Boolean(editingStep)}
        step={editingStep}
        onClose={() => setEditingStep(null)}
      />
      <EditPersonalTaskModal
        isOpen={Boolean(editingPersonalTask)}
        task={editingPersonalTask}
        onClose={() => setEditingPersonalTask(null)}
      />

      {/* Top Header Card with Summary & View Mode Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">ปฏิทิน & สรุปภาพรวมงาน (Calendar & Overview)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ดูภาพรวมงานของตนเองและของทีม ส่งต่องานให้เพื่อน และติดตามกำหนดส่งในมุมมองปฏิทิน
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ปฏิทินรายเดือน</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'timeline' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ภาพรวมกำหนดส่ง</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'agenda' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>กำหนดส่งตามลำดับ</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          
          {/* Filter Type */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              รวมทั้งหมด ({allItems.length})
            </button>
            <button
              onClick={() => setFilterType('chain')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'chain' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              👥 งานทีม
            </button>
            <button
              onClick={() => setFilterType('personal')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'personal' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              📝 งานส่วนตัว
            </button>
          </div>

          {/* Filter Member */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">ดูเฉพาะงานของ:</span>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">👥 สมาชิกทุกคนในทีม</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  👤 {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">งานทั้งหมด</span>
            <span className="text-base font-bold text-slate-900">{allItems.length} งาน</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">ครบกำหนดวันนี้</span>
            <span className="text-base font-bold text-amber-600">{todayItems.length} งาน</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">เลยกำหนดส่ง</span>
            <span className="text-base font-bold text-rose-600">{overdueItems.length} งาน</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">เสร็จสมบูรณ์</span>
            <span className="text-base font-bold text-emerald-600">{completedItems.length} งาน</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Calendar Header Navigation */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <select
                value={month}
                onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
                className="text-base font-bold text-slate-900 bg-transparent outline-none cursor-pointer hover:bg-slate-100 rounded px-1"
              >
                {monthNamesTh.map((mName, i) => (
                  <option key={i} value={i}>{mName}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
                className="text-base font-bold text-slate-900 bg-transparent outline-none cursor-pointer hover:bg-slate-100 rounded px-1"
              >
                {Array.from({ length: 11 }).map((_, i) => {
                  const y = new Date().getFullYear() - 5 + i;
                  return <option key={y} value={y}>{y + 543}</option>;
                })}
              </select>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                วันนี้
              </button>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-bold text-slate-600 bg-slate-100/70 py-2">
            <span className="text-rose-600">อา.</span>
            <span>จ.</span>
            <span>อ.</span>
            <span>พ.</span>
            <span>พฤ.</span>
            <span>ศ.</span>
            <span className="text-blue-600">ส.</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-50/30">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-50/50 text-slate-300" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = selectedDay === dateStr;
              const dayTasks = itemsByDate[dateStr] || [];

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={`min-h-[110px] p-2 transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 ring-2 ring-indigo-500 ring-inset'
                      : isToday
                      ? 'bg-amber-50/40'
                      : 'hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-900 font-extrabold'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Chips inside cell */}
                  <div className="space-y-1 overflow-hidden flex-1">
                    {dayTasks.slice(0, 3).map((item) => {
                      const isChain = item.type === 'chain_step';
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditItem(item);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center space-x-1 cursor-pointer hover:opacity-85 transition ${
                            item.isCompleted
                              ? 'bg-slate-100 text-slate-400 line-through'
                              : isChain
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                          title={`คลิกแก้ไข: ${item.title} (${item.assignedTo})`}
                        >
                          <span className="shrink-0">{isChain ? '⛓️' : '📝'}</span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <div className="text-[9px] text-slate-500 font-bold pl-1">
                        +{dayTasks.length - 3} งานเพิ่มเติม
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Date Detail Drawer below Calendar */}
          {selectedDay && (
            <div className="p-5 bg-indigo-50/40 border-t border-indigo-100 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  <span>งานที่กำหนดส่งวันที่ {selectedDay} ({selectedDayItems.length} รายการ)</span>
                </h4>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  ปิดหน้ารายละเอียด
                </button>
              </div>

              {selectedDayItems.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayItems.map(renderItemCard)}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">ไม่มีรายการงานที่กำหนดส่งในวันนี้</p>
              )}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2 & 3: TIMELINE & AGENDA LIST */}
      {viewMode !== 'calendar' && (
        <div className="space-y-5">
          
          {/* Overdue Section */}
          {overdueItems.length > 0 && (
            <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>เลยกำหนดส่งแล้ว ({overdueItems.length} รายการ)</span>
              </div>
              <div className="space-y-2.5">
                {overdueItems.map(renderItemCard)}
              </div>
            </div>
          )}

          {/* Due Today */}
          {todayItems.length > 0 && (
            <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>ครบกำหนดส่งวันนี้ ({todayItems.length} รายการ)</span>
              </div>
              <div className="space-y-2.5">
                {todayItems.map(renderItemCard)}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <span>กำหนดส่งที่กำลังจะถึง ({upcomingItems.length} รายการ)</span>
            </div>
            <div className="space-y-2.5">
              {upcomingItems.length > 0 ? (
                upcomingItems.map(renderItemCard)
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">ไม่มีกำหนดส่งในอนาคต</p>
              )}
            </div>
          </div>

          {/* Completed */}
          {completedItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>งานที่เสร็จสมบูรณ์แล้ว ({completedItems.length} รายการ)</span>
              </div>
              <div className="space-y-2.5">
                {completedItems.map(renderItemCard)}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
