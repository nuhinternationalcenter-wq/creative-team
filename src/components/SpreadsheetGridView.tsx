import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  Send, 
  Sparkles, 
  Calendar, 
  Layers, 
  MessageSquare,
  Plus,
  User,
  Users,
  Info,
  Check,
  Trash2,
  RotateCcw,
  CheckSquare,
  Paperclip,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Eye,
  ExternalLink,
  Edit3,
  Archive,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Search,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { ChainStep, TeamChainProject, StepStatus, TaskAttachment, TeamMember } from '../types';
import { useWork } from '../context/WorkContext';
import { getMemberColorStyle } from '../utils/memberColor';
import { isSameMember, isLeeAlias } from '../utils/memberMatch';
import { openExternalUrl } from '../utils/url';
import { CreateStepModal } from './CreateStepModal';
import { EditStepModal } from './EditStepModal';
import { CompletedHistoryModal } from './CompletedHistoryModal';
import { ManageMembersModal } from './ManageMembersModal';
import { SubmitApprovalModal } from './SubmitApprovalModal';
import { ApprovalActionModal } from './ApprovalActionModal';

interface SpreadsheetGridViewProps {
  project: TeamChainProject;
  onSelectStep: (step: ChainStep) => void;
  onOpenHandover: (step: ChainStep) => void;
}

type ColumnWidthMode = 'comfortable' | 'compact' | 'ultra-compact';

export const SpreadsheetGridView: React.FC<SpreadsheetGridViewProps> = ({
  project,
  onSelectStep,
  onOpenHandover,
}) => {
  const { 
    members, 
    updateMember,
    selectedRole, 
    setSelectedRole,
    updateStepStatus, 
    reopenStep,
    updatePersonalTask,
    deleteStep, 
    clearProjectSteps, 
    resetToDefault,
    reorderMember
  } = useWork();

  const [createStepRole, setCreateStepRole] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<ChainStep | null>(null);
  const [submitApprovalStep, setSubmitApprovalStep] = useState<ChainStep | null>(null);
  const [approvalActionStep, setApprovalActionStep] = useState<ChainStep | null>(null);
  const [showCompletedHistory, setShowCompletedHistory] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Toggle whether to hide completed tasks from the active board
  const [hideCompletedOnBoard, setHideCompletedOnBoard] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [widthMode, setWidthMode] = useState<ColumnWidthMode>('comfortable');

  // Drag-to-scroll container ref and state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Sync scroll positions between top scrollbar and main grid
  const handleScrollSync = (source: 'top' | 'main') => {
    if (source === 'top' && topScrollRef.current && scrollContainerRef.current) {
      if (Math.abs(scrollContainerRef.current.scrollLeft - topScrollRef.current.scrollLeft) > 2) {
        scrollContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
      }
    } else if (source === 'main' && topScrollRef.current && scrollContainerRef.current) {
      if (Math.abs(topScrollRef.current.scrollLeft - scrollContainerRef.current.scrollLeft) > 2) {
        topScrollRef.current.scrollLeft = scrollContainerRef.current.scrollLeft;
      }
    }
  };

  // Check scroll position to update arrow indicators
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        el.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [members, project.steps, widthMode]);

  // Mouse Drag-to-Scroll Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only initiate drag if clicking outside inputs/buttons
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('select') || 
      target.closest('textarea') ||
      target.closest('.interactive-card')
    ) {
      return;
    }

    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Smooth scroll arrow navigation
  const scrollLeftBy = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRightBy = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  // Scroll to a specific member's column
  const scrollToMember = (memberName: string) => {
    const el = document.getElementById(`column-${memberName}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Group steps by role/member
  const getStepsByRole = (memberName: string) => {
    const memberObj = members.find((m) => m.name === memberName || m.id === memberName);
    const memberId = memberObj ? memberObj.id : '';

    return project.steps
      .filter((s) => {
        // EXCLUDE PERSONAL TASKS FROM THE TEAM BOARD VIEW
        // if (s.taskScope === 'personal') {
        //   return false;
        // }

        // Filter out completed tasks if hideCompletedOnBoard is enabled
        if (hideCompletedOnBoard && s.status === 'completed') {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchDesc = s.description?.toLowerCase().includes(q);
          const matchHandover = s.handoverComment?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchHandover) return false;
        }

        const isAssigned = (
          s.assignedRole === memberName || 
          s.assignedPerson === memberName ||
          (isLeeAlias(memberName) && (isLeeAlias(s.assignedRole) || isLeeAlias(s.assignedPerson))) ||
          (memberId && (isSameMember(s.assignedPerson, memberName, memberId) || isSameMember(s.assignedRole, memberName, memberId))) ||
          isSameMember(s.assignedPerson, memberName) || 
          isSameMember(s.assignedRole, memberName)
        );

        const isWaitingApprovalForMember = (
          s.status === 'waiting_approval' && (
            s.approverRole === memberName ||
            s.approverRole?.includes(memberName) ||
            memberName.includes(s.approverRole || '') ||
            (isLeeAlias(memberName) && isLeeAlias(s.approverRole)) ||
            (memberId && isSameMember(s.approverRole, memberName, memberId)) ||
            isSameMember(s.approverRole, memberName)
          )
        );

        return isAssigned || isWaitingApprovalForMember;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const completedCount = project.steps.filter((s) => s.status === 'completed').length;
  const activeCount = project.steps.filter((s) => s.status !== 'completed').length;

  const getStatusBadge = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>เสร็จแล้ว</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>กำลังทำ</span>
          </span>
        );
      case 'waiting_approval':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>รอตรวจ</span>
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>ติดขัด</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200">
            <span>รอดำเนินการ</span>
          </span>
        );
    }
  };

  // Check if step is overdue or due today
  const checkDueStatus = (dueDateStr: string, isCompleted: boolean) => {
    if (isCompleted) return null;
    const today = new Date().toISOString().split('T')[0];
    if (dueDateStr < today) {
      return (
        <span className="inline-flex items-center space-x-1 text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
          <span>⚠️ เลยกำหนด</span>
        </span>
      );
    }
    if (dueDateStr === today) {
      return (
        <span className="inline-flex items-center space-x-1 text-xs text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
          <span>⏰ ครบกำหนดวันนี้</span>
        </span>
      );
    }
    return (
      <span className="text-xs text-slate-500 font-normal">
        กำหนด: {dueDateStr}
      </span>
    );
  };

  const handleClearAll = () => {
    clearProjectSteps(project.id);
    setShowClearConfirm(false);
  };

  const handleResetDemo = () => {
    resetToDefault();
    setShowResetConfirm(false);
  };

  // Column width styling depending on mode
  const getColumnMinWidth = () => {
    switch (widthMode) {
      case 'ultra-compact':
        return 200;
      case 'compact':
        return 240;
      case 'comfortable':
      default:
        return 280;
    }
  };

  const visibleMembers = selectedRole === "all" ? members : members.filter(m => m.name.includes(selectedRole) || selectedRole.includes(m.name) || isSameMember(m.name, selectedRole, m.id));
  const minColWidth = getColumnMinWidth();
  const totalMinWidth = visibleMembers.length * minColWidth;


  return (
    <div className="space-y-3 font-prompt">
      
      {/* Top Minimalist Action & Control Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        
        {/* Row 1: Header info & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Project & Matrix Board Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">
                  ตารางงานรายบุคคล (Matrix Board)
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-full font-medium border border-slate-200">
                  กำลังทำ {activeCount} งาน
                </span>
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCompletedHistory(true)}
                    className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] rounded-full font-medium border border-emerald-200 flex items-center space-x-1 cursor-pointer transition"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>เสร็จแล้ว {completedCount} งาน (ประวัติ)</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                คลิกหรือลากเมาส์เลื่อนซ้าย-ขวาเพื่อดูงานของสมาชิกแต่ละคน | กด <strong>"ส่งต่อ"</strong> เพื่องานไหลไปสเต็ปถัดไป
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center flex-wrap gap-1.5 shrink-0">
            
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหางาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 outline-none w-28 sm:w-36 transition"
              />
            </div>

            {/* Manage Members */}
            <button
              type="button"
              onClick={() => setShowManageMembers(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs border border-slate-200 transition cursor-pointer"
              title="เพิ่ม ลบ หรือแก้ไขสมาชิกและกำหนดสี"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>สมาชิก ({members.length})</span>
            </button>

            {/* Archive / History */}
            <button
              type="button"
              onClick={() => setShowCompletedHistory(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium rounded-xl text-sm border border-emerald-200 transition cursor-pointer"
            >
              <Archive className="w-4 h-4 text-emerald-600" />
              <span>ประวัติงาน ({completedCount})</span>
            </button>

            {/* Add Task */}
            <button
              onClick={() => setCreateStepRole(selectedRole !== 'all' ? selectedRole : members[0]?.name || 'ฟานี')}
              className="flex items-center space-x-1 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มงาน</span>
            </button>

            {/* More Menu / Reset / Clear */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="ล้างกระดานนี้"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="คืนค่าข้อมูลตัวอย่าง"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Row 2: Member Quick Jump Bar & Horizontal Drag Navigation Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Member Jump Quick Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-sm no-scrollbar">
            <span className="text-sm font-medium text-slate-400 shrink-0 flex items-center space-x-1 pr-1">
              <MoveHorizontal className="w-4 h-4" />
              <span>ไปยังคน:</span>
            </span>

            {visibleMembers.map((m) => {
              const colorStyle = getMemberColorStyle(m);
              const count = getStepsByRole(m.name).length;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => scrollToMember(m.name)}
                  className={`shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-sm font-medium border transition cursor-pointer ${
                    count > 0 
                      ? `${colorStyle.subtleBg} ${colorStyle.headerBorder} ${colorStyle.headerText} hover:shadow-2xs` 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={`เลื่อนไปดูคอลัมน์ของ ${m.name} (${m.role})`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: m.color || colorStyle.hex }}
                  />
                  <span>{m.name}</span>
                  {count > 0 && (
                    <span 
                      className="px-1.5 py-0.2 rounded-full text-xs font-semibold text-white shrink-0"
                      style={{ backgroundColor: m.color || colorStyle.hex }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Width Mode & Left/Right Scroll Arrow Buttons */}
          <div className="flex items-center justify-between md:justify-end space-x-2 shrink-0">
            
            {/* Column Width Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200">
              <button
                type="button"
                onClick={() => setWidthMode('comfortable')}
                className={`px-3 py-1 rounded-md transition text-xs ${widthMode === 'comfortable' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'}`}
                title="ความกว้างพอดี อ่านง่าย (255px)"
              >
                ปกติ
              </button>
              <button
                type="button"
                onClick={() => setWidthMode('compact')}
                className={`px-3 py-1 rounded-md transition text-xs ${widthMode === 'compact' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'}`}
                title="ความกว้างกะทัดรัด เห็นหลายคนพร้อมกัน (210px)"
              >
                กะทัดรัด
              </button>
              <button
                type="button"
                onClick={() => setWidthMode('ultra-compact')}
                className={`px-3 py-1 rounded-md transition text-xs ${widthMode === 'ultra-compact' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'}`}
                title="เห็นเกือบทุกคนในหน้าจอเดียว (175px)"
              >
                แคบ
              </button>
            </div>

            {/* Scroll Navigation Arrows */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={scrollLeftBy}
                disabled={!canScrollLeft}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                  canScrollLeft
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                }`}
                title="เลื่อนไปทางซ้าย"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRightBy}
                disabled={!canScrollRight}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                  canScrollRight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                }`}
                title="เลื่อนไปทางขวา"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Confirmation Dialog for Clearing Board */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              ยืนยันการล้างข้อมูลกระดานทั้งหมด?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              ระบบจะล้างรายการงานทั้งหมดในตารางของโปรเจกต์นี้ เพื่อให้คุณสามารถเริ่มเพิ่มงานใหม่แบบว่างเปล่าได้ทันที
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition cursor-pointer"
              >
                ใช่, ล้างข้อมูลทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Restoring Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              คืนค่าชุดข้อมูลตัวอย่าง (Demo Data)?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              ระบบจะโหลดข้อมูลตัวอย่างกระบวนการทำงานทีม 20 สเต็ปกลับมาให้ทดลองใช้งาน
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleResetDemo}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                ยืนยันคืนค่าตัวอย่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If board is completely empty, show friendly Minimalist Slate */}
      {activeCount === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base">
            {completedCount > 0 
              ? `งานทั้งหมดดำเนินการเสร็จสิ้นแล้ว (${completedCount} รายการอยู่ในประวัติ)` 
              : 'กระดานว่างเปล่า พร้อมสำหรับเริ่มต้นใส่ข้อมูลจริง'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {completedCount > 0 ? (
              <span>คุณสามารถคลิกปุ่ม <strong>"ประวัติงาน"</strong> เพื่อตรวจสอบหรือดึงงานกลับมาทำต่อ หรือกดปุ่ม <strong>"+ เพิ่มงาน"</strong> เพื่อเริ่มงานรอบถัดไป</span>
            ) : (
              <span>คุณสามารถคลิกที่ปุ่ม <strong>"+ เพิ่มงาน"</strong> ในช่องของแต่ละคน เพื่อสร้างงานกลุ่มหรือส่วนตัวได้เลยค่ะ</span>
            )}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setCreateStepRole(members[0]?.name || 'ฟานี')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl shadow-2xs cursor-pointer transition"
            >
              + เพิ่มงานใหม่
            </button>
            {completedCount > 0 && (
              <button
                onClick={() => setShowCompletedHistory(true)}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-200 cursor-pointer transition"
              >
                📂 ดูประวัติงาน ({completedCount})
              </button>
            )}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl cursor-pointer transition"
            >
              🔄 โหลดข้อมูลตัวอย่าง
            </button>
          </div>
        </div>
      )}

      {/* Sticky Top Horizontal Scrollbar (Pure sliding scrollbar) */}
      <div 
        ref={topScrollRef}
        onScroll={() => handleScrollSync('top')}
        className="sticky top-15 z-30 overflow-x-auto bg-slate-200/90 backdrop-blur-md rounded-full h-3 shadow-inner border border-slate-300 mb-3"
      >
        <div style={{ width: `${totalMinWidth}px`, height: '1px' }} />
      </div>

      {/* Main Drag-to-Scroll Spreadsheet Columns Board Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={() => handleScrollSync('main')}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`overflow-x-auto overflow-y-auto max-h-[75vh] pb-6 pt-1 transition-all rounded-2xl ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        <div 
          className="grid gap-3.5 items-start"
          style={{
            minWidth: `${totalMinWidth}px`,
            gridTemplateColumns: `repeat(${visibleMembers.length}, minmax(${minColWidth}px, 1fr))`
          }}
        >
          {visibleMembers.map((member) => {
            const steps = getStepsByRole(member.name);
            const colorStyle = getMemberColorStyle(member);
            const isHighlight = selectedRole !== 'all' && (
              member.name.includes(selectedRole) || 
              selectedRole.includes(member.name) ||
              isSameMember(member.name, selectedRole, member.id)
            );

            const memberHex = member.color || colorStyle.hex;

            return (
              <div
                key={member.id}
                id={`column-${member.name}`}
                className={`flex flex-col rounded-2xl border transition-all duration-150 ${
                  isHighlight
                    ? 'ring-2 ring-slate-900 shadow-md bg-white'
                    : 'bg-white shadow-2xs hover:shadow-xs'
                }`}
                style={{
                  borderColor: isHighlight ? memberHex : `${memberHex}50`, // 50 is hex opacity
                }}
              >
                {/* Column Header: Solid or Gradient Member Color Header with Bright Font and Avatar */}
                <div 
                  className="p-3 border-b rounded-t-2xl transition text-white shadow-xs"
                  style={{
                    backgroundColor: memberHex,
                    background: member.gradient || memberHex,
                    borderBottomColor: memberHex,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-black/20 text-white">
                      {member.department}
                    </span>

                    <div className="flex items-center space-x-0.5">
                      <button
                        type="button"
                        onClick={() => reorderMember(member.id, 'left')}
                        className="text-white/80 hover:text-white p-1 rounded hover:bg-black/15 transition"
                        title="ย้ายคอลัมน์ไปทางซ้าย"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderMember(member.id, 'right')}
                        className="text-white/80 hover:text-white p-1 rounded hover:bg-black/15 transition"
                        title="ย้ายคอลัมน์ไปทางขวา"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManageMembers(true)}
                        className="text-white/80 hover:text-white p-1 rounded hover:bg-black/15 transition"
                        title="แก้ไขข้อมูลสมาชิกนี้"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0" />
                    ) : null}
                    <div className="text-sm font-bold text-white tracking-tight break-words drop-shadow-xs" title={member.name}>
                      {member.name}
                    </div>
                  </div>
                  <div className="text-sm text-white/90 font-medium truncate mt-0.5" title={member.role}>
                    {member.role || member.department}
                  </div>
                  
                  {/* Column Stats & Add Task */}
                  <div className="mt-2.5 flex items-center justify-between gap-1 pt-1.5 border-t border-white/20">
                    <span className="text-sm px-2.5 py-1 rounded-full font-bold bg-white text-slate-900 shadow-2xs">
                      {steps.length} งาน
                    </span>

                    {/* Quick Add Step button inside column header */}
                    <button
                      type="button"
                      onClick={() => setCreateStepRole(member.name)}
                      title={`เพิ่มงานใหม่ในช่อง ${member.name}`}
                      className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <span>+ เพิ่มงาน</span>
                    </button>
                  </div>
                </div>

                {/* Steps List / Cards Container */}
                <div 
                  className="p-2.5 space-y-2.5 flex-1 min-h-[380px] rounded-b-2xl transition"
                  style={{
                    backgroundColor: `${memberHex}05`, // Subtle 2% tint
                  }}
                >
                  {steps.map((step) => {
                    const isCompleted = step.status === 'completed';
                    const isInProgress = step.status === 'in_progress';
                    const isBlocked = step.status === 'blocked';
                    const isWaiting = step.status === 'waiting_approval';
                    const isFromHandover = !!step.handedOverFrom;
                    const isPersonal = step.taskScope === 'personal';
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isOverdue = !isCompleted && step.dueDate && step.dueDate < todayStr;
                    const attachments = step.attachments || [];

                    return (
                      <div
                        key={step.id}
                        onClick={() => onSelectStep(step)}
                        className={`interactive-card group relative p-3 rounded-xl border bg-white text-left cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-sm ${
                          isInProgress
                            ? 'ring-1.5 ring-slate-900/20'
                            : isBlocked
                            ? 'bg-rose-50/40 border-rose-200'
                            : 'border-slate-200/90 hover:border-slate-300'
                        }`}
                        style={{
                          borderLeftWidth: '3.5px',
                          borderLeftColor: isCompleted ? '#10b981' : isBlocked ? '#f43f5e' : (step.color || memberHex),
                        }}
                      >
                        {/* Handover Incoming Badge if this step was handed over from someone */}
                        {isFromHandover && (
                          <div className="mb-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                            <span>รับส่งต่อจาก: <strong className="text-slate-900">{step.handedOverFrom}</strong></span>
                          </div>
                        )}

                        {/* Top Row: Badges & Quick Action */}
                        <div className="flex items-center justify-between mb-1.5 gap-1 flex-wrap">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: isCompleted ? "#10b981" : memberHex,
                                color: "#fff"
                              }}
                              title={isOverdue ? "เลยกำหนดเวลา" : project.priority === "urgent" ? "งานด่วนมาก" : "สถานะงาน"}
                            >
                              {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : (project.priority === "urgent" || project.priority === "high" ? <Flame className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />)}
                            </span>

                            {/* Team vs Personal Badge */}
                            {isPersonal ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium flex items-center space-x-0.5 shrink-0">
                                <User className="w-3 h-3" />
                                <span>ส่วนตัว</span>
                              </span>
                            ) : (
                              <span 
                                className="px-2 py-0.5 rounded text-[11px] font-medium flex items-center space-x-0.5 border shrink-0"
                                style={{
                                  backgroundColor: `${memberHex}15`,
                                  borderColor: `${memberHex}30`,
                                  color: memberHex
                                }}
                              >
                                <Users className="w-3 h-3" />
                                <span>งานกลุ่ม</span>
                              </span>
                            )}

                            {/* Approval Status Badge */}
                            {step.status === 'waiting_approval' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1 shrink-0">
                                <ShieldCheck className="w-3 h-3 text-amber-600" />
                                <span>รออนุมัติ</span>
                              </span>
                            ) : step.approvalStatus === 'revision_requested' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1 shrink-0">
                                <RotateCcw className="w-3 h-3 text-rose-600" />
                                <span>ส่งกลับแก้ไข</span>
                              </span>
                            ) : step.approvalStatus === 'approved' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1 shrink-0">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>ผ่านอนุมัติ</span>
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            {getStatusBadge(step.status)}

                            {/* Quick restore button if completed/blocked/waiting */}
                            {(isCompleted || isBlocked || step.status === 'waiting_approval') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isPersonal) {
                                    updatePersonalTask(step.id, { status: 'in_progress' });
                                  } else {
                                    reopenStep(project.id, step.id);
                                  }
                                }}
                                className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md border border-blue-200 transition flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
                                title="ดึงงานนี้กลับมาทำต่อในกระดาน"
                              >
                                <RotateCcw className="w-3 h-3 text-blue-600" />
                                <span>ดึงกลับมาทำต่อ</span>
                              </button>
                            )}

                            {/* Quick edit button on hover */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingStep(step);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                              title="แก้ไข / ยกเลิกงานนี้"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Full Task Title - Clear typography without truncation */}
                        <div className="text-sm font-semibold text-slate-900 leading-snug break-words mb-1.5 group-hover:text-slate-700 transition">
                          {step.title}
                        </div>

                        {/* Attachments Mini Bar & Primary Link */}
                        {(attachments.length > 0 || step.link) && (
                          <div className="my-1.5 flex items-center flex-wrap gap-1">
                            {step.link && !attachments.some((a) => a.type === 'link') && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openExternalUrl(step.link!, e);
                                }}
                                className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-xs text-blue-700 font-normal border border-blue-200 transition cursor-pointer"
                                title="เปิดลิงก์"
                              >
                                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                                <span className="truncate max-w-[100px]">{step.link.replace(/^https?:\/\//i, '')}</span>
                              </span>
                            )}
                            {attachments.slice(0, 3).map((att) => (
                              <span
                                key={att.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (att.type === 'image') {
                                    setPreviewImage(att.url);
                                  } else if (att.type === 'link') {
                                    openExternalUrl(att.url, e);
                                  }
                                }}
                                className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 font-normal border border-slate-200 transition"
                                title={att.name}
                              >
                                {att.type === 'image' ? (
                                  <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                                ) : att.type === 'link' ? (
                                  <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                                <span className="truncate max-w-[80px]">{att.name}</span>
                              </span>
                            ))}
                            {attachments.length > 3 && (
                              <span className="text-xs text-slate-400 font-medium">
                                +{attachments.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Revision feedback note & attachments if revision requested */}
                        {step.approvalStatus === 'revision_requested' && step.approvalComment && (
                          <div className="my-1.5 p-2 rounded-lg border border-rose-200 bg-rose-50/90 text-xs leading-relaxed text-rose-900 space-y-1">
                            <div className="font-bold flex items-center space-x-1 text-rose-700">
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>สิ่งที่ต้องแก้ไข (จาก {step.approverRole || 'ผู้อนุมัติ'}):</span>
                            </div>
                            <p className="break-words font-medium">{step.approvalComment}</p>
                            {step.approvalAttachments && step.approvalAttachments.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {step.approvalAttachments.map((att) => (
                                  <button
                                    key={att.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (att.type === 'image') setPreviewImage(att.url);
                                      else if (att.type === 'link') openExternalUrl(att.url, e);
                                    }}
                                    className="px-2 py-0.5 bg-white rounded border border-rose-200 text-[10px] text-rose-800 font-medium flex items-center space-x-1 hover:bg-rose-100 cursor-pointer"
                                  >
                                    {att.type === 'image' ? <ImageIcon className="w-3 h-3 text-pink-600" /> : <FileText className="w-3 h-3 text-rose-600" />}
                                    <span className="truncate max-w-[100px]">{att.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Handover notes / instructions received or given */}
                        {step.handoverComment && (
                          <div className="my-1.5 p-2 rounded-lg border border-slate-200/90 bg-slate-50 text-sm leading-relaxed flex items-start space-x-1.5 text-slate-700">
                            <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <div className="break-words w-full">
                              <span className="block text-xs text-slate-400 font-medium">
                                {isCompleted ? `ส่งต่อให้ ${step.handedOverTo || 'ทีมงาน'}:` : `บรีฟ / สรุป:`}
                              </span>
                              {step.handoverComment}
                            </div>
                          </div>
                        )}

                        {/* Due Date & Action Buttons Footer */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                          <div className="flex items-center justify-between gap-1 w-full flex-wrap">
                            <div className="shrink-0 text-slate-500">
                              {checkDueStatus(step.dueDate, isCompleted)}
                            </div>

                            {/* Start button if pending */}
                            {step.status === 'pending' && !isPersonal && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStepStatus(project.id, step.id, 'in_progress', undefined, `เริ่มงานสเต็ป ${step.stepNumber}`);
                                }}
                                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center space-x-0.5 border border-slate-200 transition cursor-pointer"
                              >
                                <span>เริ่มงาน</span>
                              </button>
                            )}
                          </div>

                          {/* Action Buttons Row: Compact & Non-overflowing */}
                          <div className="flex items-center justify-end gap-1.5 w-full flex-wrap">
                            {/* APPROVAL WORKFLOW BUTTONS */}
                            {step.status === 'waiting_approval' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setApprovalActionStep(step);
                                }}
                                className="px-2 py-1 rounded-md text-white text-xs font-semibold bg-amber-600 hover:bg-amber-500 flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                                title="เปิดหน้าต่างตรวจสอบและอนุมัติงานนี้"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>ตรวจ/อนุมัติ</span>
                              </button>
                            ) : step.approvalStatus === 'revision_requested' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubmitApprovalStep(step);
                                }}
                                className="px-2 py-1 rounded-md text-white text-xs font-semibold bg-rose-600 hover:bg-rose-500 flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                                title="ส่งงานขออนุมัติใหม่หลังแก้ไขแล้ว"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>ส่งอนุมัติใหม่</span>
                              </button>
                            ) : !isCompleted ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubmitApprovalStep(step);
                                }}
                                className="px-2 py-1 rounded-md text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-medium flex items-center space-x-1 transition cursor-pointer shadow-2xs"
                                title="ส่งเรื่องขออนุมัติงานนี้ต่อหัวหน้า/ผู้อนุมัติ"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>ส่งอนุมัติ</span>
                              </button>
                            ) : null}

                            {/* Team task: Handover button */}
                            {!isPersonal ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenHandover(step);
                                }}
                                className="px-2.5 py-1 rounded-md text-white text-xs font-medium flex items-center space-x-1 shadow-2xs transition cursor-pointer hover:opacity-90 active:scale-95"
                                style={{
                                  backgroundColor: memberHex,
                                }}
                                title="ทำงานเสร็จแล้ว ส่งต่องานให้เพื่อนร่วมทีม"
                              >
                                <span>ส่งต่อ</span>
                                <Send className="w-3 h-3" />
                              </button>
                            ) : (
                              /* Personal task: Mark done and Handover */
                              <div className="flex items-center gap-1.5">
                                {!isCompleted && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStepStatus(project.id, step.id, 'completed', undefined, `ทำงานส่วนตัวเสร็จสิ้น`);
                                    }}
                                    className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center space-x-0.5 border border-emerald-200 transition cursor-pointer"
                                    title="ติ๊กเสร็จงานส่วนตัว (จะย้ายเข้าสู่ประวัติที่เสร็จสิ้น)"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>เสร็จแล้ว</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenHandover(step);
                                  }}
                                  className="px-2 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center space-x-0.5 border border-slate-200 transition cursor-pointer"
                                  title="ส่งต่องานนี้ให้คนอื่น"
                                >
                                  <span>ส่งต่อ</span>
                                  <Send className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {steps.length === 0 && (
                    <div className="h-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs italic space-y-1.5 border border-dashed border-slate-200 rounded-xl bg-white/50">
                      <span>ไม่มีงานค้าง</span>
                      <button
                        onClick={() => setCreateStepRole(member.name)}
                        className="text-[11px] font-medium hover:underline transition"
                        style={{ color: memberHex }}
                      >
                        + เพิ่มงานให้ {member.name}
                      </button>
                    </div>
                  )}

                  {/* Bottom Quick Add button for convenience */}
                  <button
                    onClick={() => setCreateStepRole(member.name)}
                    className="w-full py-1.5 border border-dashed border-slate-300 hover:border-slate-400 bg-white/70 hover:bg-white text-slate-500 hover:text-slate-800 rounded-xl text-xs font-normal flex items-center justify-center space-x-1 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>เพิ่มงานในช่องนี้</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to add a new step into the chosen role's column */}
      <CreateStepModal
        isOpen={!!createStepRole}
        onClose={() => setCreateStepRole(null)}
        defaultRole={createStepRole || (members[0]?.name || 'ฟานี')}
        defaultPerson={createStepRole || (members[0]?.name || 'ฟานี')}
      />

      {/* Edit & Cancel Step Modal */}
      <EditStepModal
        isOpen={!!editingStep}
        onClose={() => setEditingStep(null)}
        step={editingStep}
      />

      {/* Completed Tasks History Modal */}
      <CompletedHistoryModal
        isOpen={showCompletedHistory}
        onClose={() => setShowCompletedHistory(false)}
        onSelectStep={(step) => {
          setShowCompletedHistory(false);
          onSelectStep(step);
        }}
      />

      {/* Manage Members Modal */}
      <ManageMembersModal
        isOpen={showManageMembers}
        onClose={() => setShowManageMembers(false)}
      />

      {/* Submit Approval Modal for Group / Step Tasks */}
      {submitApprovalStep && (
        <SubmitApprovalModal
          isOpen={!!submitApprovalStep}
          onClose={() => setSubmitApprovalStep(null)}
          step={submitApprovalStep}
          projectId={project.id}
        />
      )}

      {/* Approval Review / Action Modal for Group / Step Tasks */}
      {approvalActionStep && (
        <ApprovalActionModal
          isOpen={!!approvalActionStep}
          onClose={() => setApprovalActionStep(null)}
          step={approvalActionStep}
          projectId={project.id}
        />
      )}

      {/* Image Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition"
            >
              <Check className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="ภาพขยาย"
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
};
