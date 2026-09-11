import React, { useState } from 'react';
import { 
  GitMerge, 
  Table, 
  ListOrdered, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Send,
  Layers,
  ArrowRight,
  Sparkles,
  LayoutList,
  Users,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { SpreadsheetGridView } from './SpreadsheetGridView';
import { ChainFlowVisualizer } from './ChainFlowVisualizer';
import { SimpleStepListView } from './SimpleStepListView';
import { StepDetailModal } from './StepDetailModal';
import { StepHandoverModal } from './StepHandoverModal';
import { ChainStep } from '../types';
import { isSameMember, isLeeAlias } from '../utils/memberMatch';

interface TeamChainBoardProps {
  onOpenCreateProject?: () => void;
  onOpenEditProject?: () => void;
}

export const TeamChainBoard: React.FC<TeamChainBoardProps> = ({ onOpenCreateProject, onOpenEditProject }) => {
  const { 
    visibleProjects: projects,
    activeProject, 
    setActiveProjectId, 
    selectedRole,
    members,
    updateProject
  } = useWork();

  const [viewMode, setViewMode] = useState<'simple' | 'matrix' | 'flow' | 'list'>('simple');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  
  const [selectedStep, setSelectedStep] = useState<ChainStep | null>(null);
  const [handoverStep, setHandoverStep] = useState<ChainStep | null>(null);

  if (!activeProject) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
        <GitMerge className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">ไม่พบโปรเจกต์กระบวนการทำงาน</h3>
        <p className="text-sm text-slate-500 mt-1">กรุณากดสร้างโปรเจกต์ใหม่หรือรีเซ็ตข้อมูล</p>
      </div>
    );
  }

  const selectedMemberObj = members.find((m) => m.name === selectedRole || m.id === selectedRole);
  const memberId = selectedMemberObj ? selectedMemberObj.id : (isLeeAlias(selectedRole) ? 'lee' : '');

  // Filter steps
  const filteredSteps = activeProject.steps.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.assignedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.assignedPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || 
      s.assignedRole === selectedRole ||
      s.assignedPerson === selectedRole ||
      (isLeeAlias(selectedRole) && (isLeeAlias(s.assignedRole) || isLeeAlias(s.assignedPerson))) ||
      isSameMember(s.assignedRole, selectedRole, memberId) ||
      isSameMember(s.assignedPerson, selectedRole, memberId);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const completedCount = activeProject.steps.filter((s) => s.status === 'completed').length;
  const inProgressCount = activeProject.steps.filter((s) => s.status === 'in_progress').length;
  const pendingCount = activeProject.steps.filter((s) => s.status === 'pending').length;

  return (
    <div id="team-chain-board-section" className="space-y-6">
      
      {/* Top Controls Bar: Project Switcher & View Mode Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Project Selector & Progress */}
        <div className="flex items-center space-x-3.5 relative">
          <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-md shadow-black/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button 
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="font-bold text-slate-900 text-base sm:text-lg bg-transparent flex items-center space-x-1 hover:text-slate-700 transition"
                >
                  <span>{activeProject.title}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                
                {isProjectDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProjectDropdownOpen(false)} 
                    />
                    <div className="absolute top-full left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                      <div className="max-h-64 overflow-y-auto py-1">
                        {/* All Projects Filter Option */}
                        <button
                          onClick={() => {
                            setActiveProjectId('all');
                            setIsProjectDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition font-bold flex items-center justify-between ${
                            activeProject.id === 'all' 
                              ? 'bg-slate-900 text-white' 
                              : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Layers className={`w-4 h-4 ${activeProject.id === 'all' ? 'text-blue-400' : 'text-slate-500'}`} />
                            <span>ทุกโปรเจกต์ (All Projects)</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                            activeProject.id === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {projects.length}
                          </span>
                        </button>

                        <div className="my-1 border-t border-slate-100" />

                        {projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveProjectId(p.id);
                              setIsProjectDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition ${
                              activeProject.id === p.id ? 'bg-slate-200 font-bold text-slate-900' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 p-2 space-y-1 bg-slate-50">
                        {onOpenEditProject && (
                          <button
                            onClick={() => {
                              onOpenEditProject();
                              setIsProjectDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-white hover:text-slate-900 rounded-lg flex items-center space-x-2 transition font-medium"
                          >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                          <span>แก้ไขข้อมูลโปรเจกต์ปัจจุบัน</span>
                        </button>
                      )}
                      {onOpenCreateProject && (
                        <button
                          onClick={() => {
                            onOpenCreateProject();
                            setIsProjectDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-white hover:text-slate-900 rounded-lg flex items-center space-x-2 transition font-medium"
                        >
                          <Plus className="w-4 h-4 text-slate-500" />
                          <span>เพิ่มโปรเจกต์ใหม่</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{activeProject.steps.length} ขั้นตอน</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">เสร็จแล้ว {completedCount} ขั้น</span>
              <span>•</span>
              <span className="text-blue-600 font-bold">กำลังทำ {inProgressCount} ขั้น</span>
              <span>•</span>
              <span className="text-slate-500">รอเริ่ม {pendingCount} ขั้น</span>
            </div>
          </div>
        </div>

        {/* Right Side: Project Count & View Mode Switcher */}
        <div className="flex items-center gap-4 self-start lg:self-auto">
          {/* Project Count Circle / Interactive Filter Button */}
          <button
            onClick={() => setActiveProjectId(activeProject?.id === 'all' ? (projects[0]?.id || '') : 'all')}
            className={`px-3.5 py-2 rounded-2xl flex items-center space-x-2.5 border transition cursor-pointer ${
              activeProject?.id === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
            }`}
            title="คลิกเพื่อเลือกดูทุกโปรเจกต์รวมกัน หรือสลับกลับมาดูโปรเจกต์เดี่ยว"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-extrabold shrink-0 shadow-xs ${
              activeProject?.id === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
            }`}>
              {projects.length}
            </div>
            <div className="text-left pr-1">
              <div className="text-[10px] uppercase font-extrabold tracking-wider opacity-75 leading-tight">
                {activeProject?.id === 'all' ? 'กำลังแสดง' : 'โปรเจกต์ทั้งหมด'}
              </div>
              <div className="text-xs font-bold leading-tight flex items-center space-x-1">
                <span>{activeProject?.id === 'all' ? 'ทุกโปรเจกต์' : 'ฟิลเตอร์ทั้งหมด'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </div>
            </div>
          </button>

          {/* View Mode Switcher (Matrix Board Only) */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black text-white shadow-sm">
              <Table className="w-4 h-4" />
              <span>ตารางงานรายบุคคล (Matrix Board)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search & Status Filter Chips */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่องาน, ผู้รับผิดชอบ (เช่น มีมี่, MKT, NPD)..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({activeProject.steps.length})
          </button>

          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            ⚡ กำลังทำ ({inProgressCount})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⏳ รอเริ่ม ({pendingCount})
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            ✅ เสร็จแล้ว ({completedCount})
          </button>
        </div>
      </div>

      {/* RENDER MATRIX GRID VIEW */}
      <SpreadsheetGridView
        project={activeProject}
        onSelectStep={(step) => setSelectedStep(step)}
        onOpenHandover={(step) => setHandoverStep(step)}
      />

      {/* Step Detail Modal */}
      {selectedStep && (
        <StepDetailModal
          step={selectedStep}
          project={activeProject}
          isOpen={!!selectedStep}
          onClose={() => setSelectedStep(null)}
          onOpenHandover={(step) => {
            setSelectedStep(null);
            setHandoverStep(step);
          }}
        />
      )}

      {/* Step Handover Modal */}
      {handoverStep && (
        <StepHandoverModal
          step={handoverStep}
          project={activeProject}
          isOpen={!!handoverStep}
          onClose={() => setHandoverStep(null)}
        />
      )}
    </div>
  );
};
