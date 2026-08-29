import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  X, 
  Bell, 
  ArrowRight
} from 'lucide-react';
import { WorkProvider, useWork } from './context/WorkContext';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { TeamChainBoard } from './components/TeamChainBoard';
import { PersonalTasksView } from './components/PersonalTasksView';
import { CalendarTimelineView } from './components/CalendarTimelineView';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { StepDetailModal } from './components/StepDetailModal';
import { StepHandoverModal } from './components/StepHandoverModal';
import { WorkDocumentsView } from './components/WorkDocumentsView';
import { ManageMembersModal } from './components/ManageMembersModal';
import { ChainStep, TeamChainProject } from './types';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'personal' | 'timeline' | 'documents' | 'team_chain'>('dashboard');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<TeamChainProject | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [selectedStep, setSelectedStep] = useState<ChainStep | null>(null);
  const [handoverStep, setHandoverStep] = useState<ChainStep | null>(null);

  const { activeProject, toast, dismissToast, setSelectedRole } = useWork();


  // Check URL parameters for navigation hooks
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'documents') {
      setActiveTab('documents');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Real-time Handover Toast Banner */}
      {toast && (
        <aside 
          aria-label="การแจ้งเตือนส่งต่องาน"
          className="fixed top-4 right-4 z-50 max-w-md w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-emerald-400">ส่งต่องานเรียบร้อยแล้ว</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">แจ้งเตือนแล้ว</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">{toast.message}</p>
                <div className="text-[11px] text-slate-400 pt-0.5">
                  ผู้รับผิดชอบถัดไป: <strong className="text-white">👤 {toast.recipient}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setSelectedRole(toast.recipient);
                dismissToast();
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>สลับไปมุมมอง {toast.recipient}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsNotificationsOpen(true);
                dismissToast();
              }}
              className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
            >
              <Bell className="w-3 h-3" />
              <span>เปิดกล่องแจ้งเตือน</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenManageMembers={() => setIsManageMembersOpen(true)}
      />


      {/* Main Viewport */}
      <main className="flex-1 w-full mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-full overflow-x-hidden">

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <DashboardOverview
              onNavigateToTeamChain={() => {
                const el = document.getElementById('team-chain-board-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onNavigateToPersonal={() => setActiveTab('personal')}
              onOpenCreateTask={() => setIsCreateTaskOpen(true)}
              onOpenStepDetail={(step) => setSelectedStep(step)}
              onOpenHandover={(step) => setHandoverStep(step)}
            />

            <div className="pt-4 border-t border-slate-200">
              <TeamChainBoard 
                onOpenCreateProject={() => {
                  setProjectToEdit(null);
                  setIsCreateProjectOpen(true);
                }} 
                onOpenEditProject={() => {
                  setProjectToEdit(activeProject);
                  setIsCreateProjectOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <PersonalTasksView
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          />
        )}

        {activeTab === 'timeline' && (
          <CalendarTimelineView
            onOpenStepDetail={(step) => setSelectedStep(step)}
            onOpenHandover={(step) => setHandoverStep(step)}
          />
        )}

        {activeTab === 'documents' && (
          <WorkDocumentsView />
        )}
      </main>

      {/* Modals & Drawers */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        projectToEdit={projectToEdit}
      />

      <ManageMembersModal
        isOpen={isManageMembersOpen}
        onClose={() => setIsManageMembersOpen(false)}
      />

      <NotificationDrawer

        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToTeamChain={() => setActiveTab('dashboard')}
      />

      {selectedStep && activeProject && (
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

      {handoverStep && activeProject && (
        <StepHandoverModal
          step={handoverStep}
          project={activeProject}
          isOpen={!!handoverStep}
          onClose={() => setHandoverStep(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WorkProvider>
      <MainAppContent />
    </WorkProvider>
  );
}
