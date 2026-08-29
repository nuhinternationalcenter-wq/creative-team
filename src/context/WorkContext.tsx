import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  TeamChainProject, 
  PersonalTask, 
  TeamMember, 
  NotificationItem, 
  ChainStep, 
  StepStatus,
  WorkLogEntry,
  WorkDocument,
  ApprovalStatus,
  ApprovalLogEntry,
  TaskAttachment
} from '../types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_PROJECTS, 
  INITIAL_PERSONAL_TASKS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_DOCUMENTS
} from '../data/initialData';
import { isSameMember, isLeeAlias, migrateAllDataToMrLee, normalizeMemberName } from '../utils/memberMatch';

export interface ToastNotification {
  id: string;
  message: string;
  recipient: string;
  taskTitle: string;
  type: 'success' | 'info';
}

interface WorkContextType {
  members: TeamMember[];
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteMember: (id: string) => void;
  reorderMember: (id: string, direction: 'left' | 'right' | 'up' | 'down') => void;
  projects: TeamChainProject[];
  personalTasks: PersonalTask[];
  notifications: NotificationItem[];
  selectedRole: string; // 'all' or member ID/name
  setSelectedRole: (role: string) => void;
  activeProject: TeamChainProject | null;
  setActiveProjectId: (id: string) => void;
  visibleProjects: TeamChainProject[];
  visiblePersonalTasks: PersonalTask[];
  toast: ToastNotification | null;
  dismissToast: () => void;

  // Step operations
  updateStepStatus: (projectId: string, stepId: string, newStatus: StepStatus, handoverComment?: string, workLogText?: string, newAttachments?: any[]) => void;
  reopenStep: (projectId: string, stepId: string) => void;
  completeStepAndHandover: (
    projectId: string,
    stepId: string,
    handoverComment: string,
    logDurationMinutes?: number,
    customNextAssignee?: string,
    newStepTitle?: string,
    newStepDueDate?: string,
    newAttachments?: any[]
  ) => void;
  addStepLog: (projectId: string, stepId: string, log: Omit<WorkLogEntry, 'id' | 'timestamp'>) => void;
  updateStepDetails: (
    projectId: string,
    stepId: string,
    updates: Partial<ChainStep> & { targetProjectId?: string }
  ) => void;
  addCustomStep: (projectId: string, newStep: Omit<ChainStep, 'id'>) => void;
  deleteStep: (projectId: string, stepId: string) => void;
  clearProjectSteps: (projectId: string) => void;

  // Step Approval operations
  submitStepForApproval: (
    projectId: string,
    stepId: string,
    approverRole: string,
    submitterRole: string,
    comment?: string,
    attachments?: any[]
  ) => void;
  approveStep: (projectId: string, stepId: string, approverName: string, comment?: string) => void;
  rejectStep: (projectId: string, stepId: string, approverName: string, comment: string) => void;
  requestStepRevision: (
    projectId: string,
    stepId: string,
    approverName: string,
    revisionComment: string,
    attachments?: any[]
  ) => void;

  // Project operations
  createProject: (project: Omit<TeamChainProject, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => void;
  updateProject: (id: string, updates: Partial<TeamChainProject>) => void;
  deleteProject: (id: string) => void;

  // Personal task operations
  addPersonalTask: (task: Omit<PersonalTask, 'id' | 'createdAt'>) => void;
  updatePersonalTask: (id: string, updates: Partial<PersonalTask>) => void;
  deletePersonalTask: (id: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addPersonalTaskLog: (taskId: string, log: Omit<WorkLogEntry, 'id' | 'timestamp'>) => void;
  handoverPersonalTask: (
    taskId: string,
    targetAssignee: string,
    comment: string,
    actionType: 'delegate' | 'complete_and_assign_next',
    newDueDate?: string,
    newTitle?: string,
    newAttachments?: any[]
  ) => void;

  // Personal Task Approval operations
  submitPersonalTaskForApproval: (
    taskId: string,
    approverRole: string,
    submitterRole: string,
    comment?: string,
    attachments?: any[]
  ) => void;
  approvePersonalTask: (taskId: string, approverName: string, comment?: string) => void;
  rejectPersonalTask: (taskId: string, approverName: string, comment: string) => void;
  requestPersonalTaskRevision: (
    taskId: string,
    approverName: string,
    revisionComment: string,
    attachments?: any[]
  ) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // Documents
  documents: WorkDocument[];
  addDocument: (doc: Omit<WorkDocument, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDocument: (id: string, updates: Partial<WorkDocument>) => void;
  deleteDocument: (id: string) => void;

  // System
  resetToDefault: () => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;

  // Customization
  customLogo: string;
  setCustomLogo: (logo: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

const STORAGE_KEY_MEMBERS = 'workchain_members_v2';
const STORAGE_KEY_PROJECTS = 'workchain_projects_v2';
const STORAGE_KEY_TASKS = 'workchain_personal_tasks_v2';
const STORAGE_KEY_NOTIFS = 'workchain_notifications_v2';
const STORAGE_KEY_DOCUMENTS = 'workchain_documents_v2';
const STORAGE_KEY_ROLE = 'workchain_active_role_v2';

const WorkContext = createContext<WorkContextType | undefined>(undefined);


function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 === 'string' && typeof obj2 === 'string') {
    if (obj1.startsWith('data:image/') && obj1.length > 200000 && obj2 === '[Large Base64 Image Omitted for Firestore]') return true;
    if (obj2.startsWith('data:image/') && obj2.length > 200000 && obj1 === '[Large Base64 Image Omitted for Firestore]') return true;
  }
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
  let keys1 = Object.keys(obj1).filter(k => obj1[k] !== undefined);
  let keys2 = Object.keys(obj2).filter(k => obj2[k] !== undefined);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

export const WorkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
    let loaded = INITIAL_MEMBERS;
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored members', e);
      }
    }
    const migrated = migrateAllDataToMrLee({ members: loaded });
    return migrated.members || loaded;
  });

  const [selectedRole, setSelectedRole] = useState<string>(() => {
    const savedRole = localStorage.getItem(STORAGE_KEY_ROLE) || 'all';
    if (isLeeAlias(savedRole)) {
      return 'Mr Lee';
    }
    return savedRole;
  });

  const [projects, setProjects] = useState<TeamChainProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
    let loaded = INITIAL_PROJECTS;
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored projects', e);
      }
    }
    const migrated = migrateAllDataToMrLee({ projects: loaded });
    return migrated.projects || loaded;
  });

  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    let loaded = INITIAL_PERSONAL_TASKS;
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored tasks', e);
      }
    }
    const migrated = migrateAllDataToMrLee({ personalTasks: loaded });
    return migrated.personalTasks || loaded;
  });

  const [documents, setDocuments] = useState<WorkDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
    let loaded = INITIAL_DOCUMENTS;
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored documents', e);
      }
    }
    const migrated = migrateAllDataToMrLee({ documents: loaded });
    return migrated.documents || loaded;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
    let loaded = INITIAL_NOTIFICATIONS;
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored notifs', e);
      }
    }
    const migrated = migrateAllDataToMrLee({ notifications: loaded });
    return migrated.notifications || loaded;
  });

  const [toast, setToast] = useState<ToastNotification | null>(null);
  const lastServerStateRef = React.useRef<any>(null);
  const isSnapshotUpdatingRef = React.useRef<boolean>(false);

  const dismissToast = () => {
    setToast(null);
  };

  const showToastNotification = (recipient: string, taskTitle: string, message: string) => {
    const newToast: ToastNotification = {
      id: `toast-${Date.now()}`,
      recipient,
      taskTitle,
      message,
      type: 'success',
    };
    setToast(newToast);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToast((current) => (current?.id === newToast.id ? null : current));
    }, 6000);
  };

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || 'proj-001';
  });

  const [customLogo, setCustomLogoState] = useState<string>(() => {
    return localStorage.getItem('workchain_custom_logo') || '';
  });
  const [themeColor, setThemeColorState] = useState<string>(() => {
    return localStorage.getItem('workchain_theme_color') || 'slate';
  });

  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);

  const setCustomLogo = (logo: string) => {
    setCustomLogoState(logo);
    localStorage.setItem('workchain_custom_logo', logo);
  };

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
    localStorage.setItem('workchain_theme_color', color);
  };

  
  // Firestore real-time sync with onSnapshot
  useEffect(() => {
    let unsubscribe: any;
    import('../lib/sync').then(({ subscribeToWorkspace, hasPendingSync }) => {
      unsubscribe = subscribeToWorkspace((data, hasPendingWrites) => {
        setIsFirebaseLoaded(true);

        // Prevent bouncing: Ignore snapshot if we have a pending debounced local write
        if (hasPendingSync && hasPendingSync()) {
          return;
        }

        if (data && !hasPendingWrites) {
          isSnapshotUpdatingRef.current = true;
          const migrated = migrateAllDataToMrLee({
            members: data.members,
            projects: data.projects,
            personalTasks: data.personalTasks,
            notifications: data.notifications,
            documents: data.documents,
          });
          
          lastServerStateRef.current = {
            members: migrated.members || [],
            projects: migrated.projects || [],
            personalTasks: migrated.personalTasks || [],
            notifications: migrated.notifications || [],
            documents: migrated.documents || [],
            customLogo: data.customLogo !== undefined ? data.customLogo : '',
            themeColor: data.themeColor !== undefined ? data.themeColor : 'slate'
          };
          
          if (migrated.members && migrated.members.length > 0) setMembers(migrated.members);
          if (migrated.projects) setProjects(migrated.projects);
          if (migrated.personalTasks) setPersonalTasks(migrated.personalTasks);
          if (migrated.notifications) setNotifications(migrated.notifications);
          if (migrated.documents) setDocuments(migrated.documents);
          if (data.customLogo !== undefined) setCustomLogoState(data.customLogo);
          if (data.themeColor !== undefined) setThemeColorState(data.themeColor);
        }
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Force-migration check on mount to ensure existing local data with legacy names is converted
  useEffect(() => {
    const migrated = migrateAllDataToMrLee({
      members,
      projects,
      personalTasks,
      documents,
      notifications,
    });

    if (migrated.members) setMembers(migrated.members);
    if (migrated.projects) setProjects(migrated.projects);
    if (migrated.personalTasks) setPersonalTasks(migrated.personalTasks);
    if (migrated.documents) setDocuments(migrated.documents);
    if (migrated.notifications) setNotifications(migrated.notifications);

    if (isLeeAlias(selectedRole) && selectedRole !== 'Mr Lee') {
      setSelectedRole('Mr Lee');
    }
  }, []);

  // Sync to local storage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.warn('localStorage quota exceeded for members', e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('localStorage quota exceeded for projects', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(personalTasks));
    } catch (e) {
      console.warn('localStorage quota exceeded for personalTasks', e);
    }
  }, [personalTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('localStorage quota exceeded for notifications', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(documents));
    } catch (e) {
      console.warn('localStorage quota exceeded for documents', e);
    }
  }, [documents]);

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only process if Firebase is not yet loaded, otherwise onSnapshot handles it
      if (isFirebaseLoaded) return;

      if (e.key === STORAGE_KEY_MEMBERS && e.newValue) {
        try { setMembers(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_PROJECTS && e.newValue) {
        try { setProjects(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_TASKS && e.newValue) {
        try { setPersonalTasks(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_NOTIFS && e.newValue) {
        try { setNotifications(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_DOCUMENTS && e.newValue) {
        try { setDocuments(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isFirebaseLoaded]);

  // Sync to Firestore when local state changes
  useEffect(() => {
    if (!isFirebaseLoaded) return;
    
    if (isSnapshotUpdatingRef.current) {
      isSnapshotUpdatingRef.current = false;
      return;
    }

    const currentState = {
      members,
      projects,
      personalTasks,
      notifications,
      documents,
      customLogo,
      themeColor
    };
    
    if (deepEqual(currentState, lastServerStateRef.current)) {
      return;
    }
    
    lastServerStateRef.current = currentState;
    
    import('../lib/sync').then(({ syncToFirestore }) => {
      syncToFirestore(currentState);
    });
  }, [members, projects, personalTasks, notifications, documents, customLogo, themeColor, isFirebaseLoaded]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROLE, selectedRole);
  }, [selectedRole]);

  // Helper to map PersonalTask to ChainStep
  const mapPersonalTaskToStep = (t: PersonalTask, stepNumber: number): ChainStep => {
    return {
      id: t.id,
      stepNumber,
      title: t.title,
      description: t.description || t.notes || '',
      assignedBy: t.assignedBy,
      assignedRole: t.assignedTo || 'ทั่วไป',
      assignedPerson: t.assignedTo || 'ทั่วไป',
      status: (t.status === 'todo' ? 'pending' : t.status) as StepStatus,
      startDate: t.createdAt ? t.createdAt.split('T')[0] : undefined,
      dueDate: t.dueDate || new Date().toISOString().split('T')[0],
      completedAt: t.completedAt,
      dependencies: [],
      taskScope: 'personal',
      attachments: t.attachments || [],
      workLogs: t.workLogs || [],
      color: t.color,
      link: t.link,
      checklist: t.checklist || [],
      approvalStatus: t.approvalStatus,
      approverRole: t.approverRole,
      submittedForApprovalBy: t.submittedForApprovalBy,
      submittedForApprovalAt: t.submittedForApprovalAt,
      approvalComment: t.approvalComment,
      approvalAttachments: t.approvalAttachments,
      approvalHistory: t.approvalHistory,
    };
  };

  const combineProjectSteps = (project: TeamChainProject, tasks: PersonalTask[]): TeamChainProject => {
    if (!project) return project;
    const matchingPersonalTasks = (tasks || []).filter((t) => t && t.projectId === project.id);
    if (matchingPersonalTasks.length === 0) return project;

    const existingStepIds = new Set(project.steps.map((s) => s.id));
    const newPersonalSteps: ChainStep[] = [];

    matchingPersonalTasks.forEach((t, idx) => {
      if (!existingStepIds.has(t.id)) {
        newPersonalSteps.push(mapPersonalTaskToStep(t, project.steps.length + idx + 1));
      }
    });

    if (newPersonalSteps.length === 0) return project;

    const combinedSteps = [...project.steps, ...newPersonalSteps];
    const completedCount = combinedSteps.filter((s) => s.status === 'completed').length;
    const progress = combinedSteps.length > 0 ? Math.round((completedCount / combinedSteps.length) * 100) : project.progress;

    return {
      ...project,
      steps: combinedSteps,
      progress,
    };
  };

  const rawActiveProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  const activeProject = useMemo(() => {
    return rawActiveProject ? combineProjectSteps(rawActiveProject, personalTasks) : null;
  }, [rawActiveProject, personalTasks]);

  const visibleProjects = useMemo(() => {
    const filtered = selectedRole === 'all' || isLeeAlias(selectedRole)
      ? projects
      : projects.filter(p => !p.allowedMembers || p.allowedMembers.includes(selectedRole));
    return filtered.map((p) => combineProjectSteps(p, personalTasks));
  }, [projects, personalTasks, selectedRole]);

  const visiblePersonalTasks = useMemo(() => {
    if (selectedRole === 'all' || isLeeAlias(selectedRole)) return personalTasks;
    return personalTasks.filter(t => !t.allowedMembers || t.allowedMembers.includes(selectedRole));
  }, [personalTasks, selectedRole]);

  // Member CRUD
  const addMember = (newMemberData: Omit<TeamMember, 'id'>) => {
    const id = `member-${Date.now()}`;
    const newMember: TeamMember = {
      ...newMemberData,
      id,
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const updateMember = (id: string, updates: Partial<TeamMember>) => {
    setMembers((prev) => {
      const targetMember = prev.find((m) => m.id === id || m.name === id);
      if (!targetMember) return prev;

      const oldName = targetMember.name;
      const newName = updates.name;

      if (newName && oldName !== newName) {
        const memberId = targetMember.id;
        // 1. Cascade to projects & steps & logs
        setProjects((prevProjects) =>
          prevProjects.map((proj) => ({
            ...proj,
            steps: proj.steps.map((step) => {
              const updatedStep = { ...step };
              let stepChanged = false;

              if (step.assignedPerson === oldName || isSameMember(step.assignedPerson, oldName, memberId)) {
                updatedStep.assignedPerson = newName;
                stepChanged = true;
              }
              if (step.assignedRole === oldName || isSameMember(step.assignedRole, oldName, memberId)) {
                updatedStep.assignedRole = newName;
                stepChanged = true;
              }

              if (step.workLogs && step.workLogs.length > 0) {
                const logsChanged = step.workLogs.some((log) => log.author === oldName || isSameMember(log.author, oldName, memberId));
                if (logsChanged) {
                  updatedStep.workLogs = step.workLogs.map((log) =>
                    (log.author === oldName || isSameMember(log.author, oldName, memberId)) ? { ...log, author: newName } : log
                  );
                  stepChanged = true;
                }
              }

              return stepChanged ? updatedStep : step;
            }),
          }))
        );

        // 2. Cascade to personalTasks & logs
        setPersonalTasks((prevTasks) =>
          prevTasks.map((task) => {
            let taskChanged = false;
            const updatedTask = { ...task };

            if (task.assignedTo === oldName || isSameMember(task.assignedTo, oldName, memberId)) {
              updatedTask.assignedTo = newName;
              taskChanged = true;
            }

            if (task.workLogs && task.workLogs.length > 0) {
              const logsChanged = task.workLogs.some((log) => log.author === oldName || isSameMember(log.author, oldName, memberId));
              if (logsChanged) {
                updatedTask.workLogs = task.workLogs.map((log) =>
                  (log.author === oldName || isSameMember(log.author, oldName, memberId)) ? { ...log, author: newName } : log
                );
                taskChanged = true;
              }
            }

            return taskChanged ? updatedTask : task;
          })
        );

        // 3. Cascade to documents
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            (doc.createdBy === oldName || isSameMember(doc.createdBy, oldName, memberId)) ? { ...doc, createdBy: newName } : doc
          )
        );

        // 4. Update active filter if it matched the old name
        if (selectedRole === oldName || isSameMember(selectedRole, oldName, memberId)) {
          setSelectedRole(newName);
        }
      }

      return prev.map((m) => (m.id === id || m.name === id ? { ...m, ...updates } : m));
    });
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id && m.name !== id));
  };

  const reorderMember = (id: string, direction: 'left' | 'right' | 'up' | 'down') => {
    setMembers((prev) => {
      const index = prev.findIndex((m) => m.id === id || m.name === id);
      if (index === -1) return prev;
      const targetIndex = (direction === 'left' || direction === 'up') ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const newMembers = [...prev];
      const temp = newMembers[index];
      newMembers[index] = newMembers[targetIndex];
      newMembers[targetIndex] = temp;
      return newMembers;
    });
  };

  // Reopen Step (restore from completed history back to active pipeline)
  const reopenStep = (projectId: string, stepId: string) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      setPersonalTasks((prev) =>
        prev.map((t) => {
          if (t.id !== stepId) return t;
          const updatedLogs = [...(t.workLogs || [])];
          updatedLogs.push({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: t.assignedTo,
            text: 'นำงานกลับมาทำต่อจากประวัติงานที่เสร็จสิ้น',
            type: 'status_change',
          });
          return {
            ...t,
            status: 'in_progress',
            completedAt: undefined,
            workLogs: updatedLogs,
          };
        })
      );
      showToastNotification('ทุกคน', 'ดึงงานส่วนตัวกลับมาทำต่อ', 'นำงานกลับมายังกระดานทำงานเรียบร้อยแล้ว');
      return;
    }
    setProjects((prevProjects) =>
      prevProjects.map((proj) => {
        const hasStep = proj.steps.some((s) => s.id === stepId);
        if (proj.id !== projectId && !hasStep) return proj;

        const updatedSteps = proj.steps.map((step) => {
          if (step.id !== stepId) return step;
          const updatedLogs = [...(step.workLogs || [])];
          updatedLogs.push({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: step.assignedPerson,
            text: 'นำงานกลับมาทำต่อจากประวัติงานที่เสร็จสิ้น',
            type: 'status_change',
          });

          return {
            ...step,
            status: 'in_progress' as StepStatus,
            completedAt: undefined,
            workLogs: updatedLogs,
          };
        });

        const completedCount = updatedSteps.filter((s) => s.status === 'completed').length;
        const progress = updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0;

        return {
          ...proj,
          steps: updatedSteps,
          progress,
          status: 'active' as const,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    showToastNotification('ทุกคน', 'ดึงงานกลับมาทำต่อ', 'นำงานกลับมายังกระดานทำงานเรียบร้อยแล้ว');
  };

  // Add Notification helper
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Step Status Update
  const updateStepStatus = (
    projectId: string,
    stepId: string,
    newStatus: StepStatus,
    handoverComment?: string,
    workLogText?: string,
    newAttachments?: any[]
  ) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      setPersonalTasks((prev) =>
        prev.map((t) => {
          if (t.id !== stepId) return t;
          const updatedLogs = [...(t.workLogs || [])];
          if (workLogText) {
            updatedLogs.push({
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              author: t.assignedTo,
              text: workLogText,
              type: 'status_change',
            });
          }
          if (handoverComment) {
            updatedLogs.push({
              id: `log-${Date.now() + 1}`,
              timestamp: new Date().toISOString(),
              author: t.assignedTo,
              text: `ส่งต่องาน: ${handoverComment}`,
              type: 'handover',
            });
          }
          const mappedStatus = newStatus === 'pending' ? 'todo' : (newStatus as any);
          return {
            ...t,
            status: mappedStatus,
            handoverComment: handoverComment || t.notes,
            notes: handoverComment || t.notes,
            attachments: newAttachments ? [...(t.attachments || []), ...newAttachments] : t.attachments,
            completedAt: newStatus === 'completed' ? (t.completedAt || new Date().toISOString()) : undefined,
            workLogs: updatedLogs,
          };
        })
      );
    }

    setProjects((prevProjects) =>
      prevProjects.map((proj) => {
        const hasStep = proj.steps.some((s) => s.id === stepId);
        if (proj.id !== projectId && !hasStep) return proj;

        const updatedSteps = proj.steps.map((step) => {
          if (step.id !== stepId) return step;

          const updatedLogs = [...(step.workLogs || [])];
          if (workLogText) {
            updatedLogs.push({
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              author: step.assignedPerson,
              text: workLogText,
              type: 'status_change',
            });
          }

          return {
            ...step,
            status: newStatus,
            handoverComment: handoverComment || step.handoverComment,
            attachments: newAttachments || step.attachments,
            completedAt: newStatus === 'completed' ? (step.completedAt || new Date().toISOString()) : undefined,
            workLogs: updatedLogs,
          };
        });

        // Calculate progress percentage
        const completedCount = updatedSteps.filter((s) => s.status === 'completed').length;
        const progress = Math.round((completedCount / updatedSteps.length) * 100);

        return {
          ...proj,
          steps: updatedSteps,
          progress,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Chain Handover with automatic dependency unlocking & dynamic step creation
  const completeStepAndHandover = (
    projectId: string,
    stepId: string,
    handoverComment: string,
    logDurationMinutes?: number,
    customNextAssignee?: string,
    newStepTitle?: string,
    newStepDueDate?: string,
    newAttachments?: any[]
  ) => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    if (personalTasks.some((t) => t.id === stepId)) {
      setPersonalTasks((prev) =>
        prev.map((t) => {
          if (t.id !== stepId) return t;
          const targetLogs = [...(t.workLogs || [])];
          targetLogs.push({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: t.assignedTo,
            text: handoverComment || 'ส่งมอบงานสำเร็จ',
            durationMinutes: logDurationMinutes,
            type: 'handover',
            attachments: newAttachments,
          });
          const combinedAtts = newAttachments ? [...(t.attachments || []), ...newAttachments] : t.attachments;
          return {
            ...t,
            status: customNextAssignee ? 'in_progress' : 'completed',
            assignedTo: customNextAssignee || t.assignedTo,
            completedAt: !customNextAssignee ? (t.completedAt || new Date().toISOString()) : undefined,
            title: newStepTitle || t.title,
            dueDate: newStepDueDate || t.dueDate,
            notes: handoverComment || t.notes,
            attachments: combinedAtts,
            workLogs: targetLogs,
          };
        })
      );
      showToastNotification(customNextAssignee || 'สมาชิกทีม', 'ส่งต่องานเรียบร้อยแล้ว', handoverComment);
      return;
    }

    setProjects((prevProjects) =>
      prevProjects.map((proj) => {
        if (proj.id !== projectId) return proj;

        // 1. Mark target step completed
        const targetStep = proj.steps.find((s) => s.id === stepId);
        if (!targetStep) return proj;

        const targetLogs = [...(targetStep.workLogs || [])];
        targetLogs.push({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: targetStep.assignedPerson,
          text: handoverComment || 'ส่งมอบงานในกระบวนการลูกโซ่สำเร็จ',
          durationMinutes: logDurationMinutes,
          type: 'handover',
          attachments: newAttachments,
        });

        // Track which steps become completed
        const completedStepIds = new Set<string>();
        proj.steps.forEach((s) => {
          if (s.status === 'completed' || s.id === stepId) {
            completedStepIds.add(s.id);
          }
        });

        // 2. Unlock dependent steps
        const newlyUnlockedSteps: ChainStep[] = [];

        const updatedSteps = proj.steps.map((s) => {
          if (s.id === stepId) {
            const combinedAtts = newAttachments ? [...(s.attachments || []), ...newAttachments] : s.attachments;
            return {
              ...s,
              status: 'completed' as StepStatus,
              completedAt: new Date().toISOString(),
              handoverComment: handoverComment || s.handoverComment,
              handedOverTo: customNextAssignee || s.handedOverTo,
              attachments: combinedAtts,
              workLogs: targetLogs,
            };
          }

          // Check if this step is pending and all its dependencies are now satisfied
          if (s.status === 'pending' && s.dependencies.length > 0) {
            const allDepsCompleted = s.dependencies.every((depId) => completedStepIds.has(depId));
            if (allDepsCompleted) {
              const combinedAtts = newAttachments ? [...(s.attachments || []), ...newAttachments] : s.attachments;
              const updatedStep: ChainStep = {
                ...s,
                status: 'in_progress' as StepStatus,
                startDate: s.startDate || new Date().toISOString().split('T')[0],
                handedOverFrom: targetStep.assignedRole,
                handoverComment: handoverComment || s.handoverComment,
                attachments: combinedAtts,
              };
              if (customNextAssignee) {
                updatedStep.assignedRole = customNextAssignee;
                updatedStep.assignedPerson = customNextAssignee;
              }
              newlyUnlockedSteps.push(updatedStep);
              return updatedStep;
            }
          }

          return s;
        });

        // 2.1 If a custom recipient was selected, and no dependent step was unlocked for them,
        // create a new active step in their column immediately!
        if (customNextAssignee) {
          const hasUnlockedForRecipient = newlyUnlockedSteps.some(
            (s) => s.assignedRole.includes(customNextAssignee) || customNextAssignee.includes(s.assignedRole)
          );

          if (!hasUnlockedForRecipient) {
            const maxStepNum = updatedSteps.reduce((max, s) => Math.max(max, s.stepNumber), 0);
            const createdStep: ChainStep = {
              id: `step-${Date.now()}`,
              stepNumber: maxStepNum + 1,
              title: newStepTitle?.trim() || `งานส่งต่อจาก ${targetStep.assignedRole}: ${targetStep.title}`,
              description: handoverComment,
              assignedRole: customNextAssignee,
              assignedPerson: customNextAssignee,
              status: 'in_progress',
              startDate: new Date().toISOString().split('T')[0],
              dueDate: newStepDueDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
              dependencies: [stepId],
              branch: targetStep.branch || 'main',
              handedOverFrom: targetStep.assignedRole,
              handoverComment: handoverComment,
              attachments: newAttachments || targetStep.attachments || [],
              estimatedHours: 4,
              workLogs: [
                {
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  author: targetStep.assignedRole,
                  text: `ส่งมอบงานให้ ${customNextAssignee}: ${handoverComment}`,
                  type: 'handover',
                  attachments: newAttachments,
                },
              ],
            };
            updatedSteps.push(createdStep);
            newlyUnlockedSteps.push(createdStep);
          }
        }

        // 3. Create notifications for newly unlocked step assignees
        if (newlyUnlockedSteps.length > 0) {
          newlyUnlockedSteps.forEach((unlockedStep) => {
            const recipient = unlockedStep.assignedRole;
            addNotification({
              type: 'step_unlocked',
              title: `🔔 งานส่งต่อถึงคุณ: สเต็ป ${unlockedStep.stepNumber}`,
              message: `งาน "${unlockedStep.title}" ปลดล็อกแล้วหลังจาก "${targetStep.title}" เสร็จสิ้น ข้อความส่งต่อ: "${handoverComment}"`,
              relatedProjectId: projectId,
              relatedStepId: unlockedStep.id,
              targetRole: recipient,
            });

            showToastNotification(
              recipient,
              `สเต็ป ${unlockedStep.stepNumber}: ${unlockedStep.title}`,
              `ส่งต่องานให้คุณ ${recipient} เรียบร้อยแล้ว! งานปรากฏในช่องของ ${recipient} ทันที`
            );
          });
        } else {
          showToastNotification(
            'ทีมงาน',
            targetStep.title,
            `บันทึกส่งต่องานเสร็จสิ้นเรียบร้อยแล้ว!`
          );
        }

        // Notification for completed handover
        addNotification({
          type: 'handover',
          title: `ส่งต่องานลูกโซ่: สเต็ป ${targetStep.stepNumber} สำเร็จ`,
          message: `${targetStep.assignedPerson} ได้ส่งมอบงาน "${targetStep.title}" เรียบร้อย: "${handoverComment}"`,
          relatedProjectId: projectId,
          relatedStepId: stepId,
        });

        const completedCount = updatedSteps.filter((s) => s.status === 'completed').length;
        const progress = Math.round((completedCount / updatedSteps.length) * 100);

        return {
          ...proj,
          steps: updatedSteps,
          progress,
          status: progress === 100 ? 'completed' : proj.status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addStepLog = (
    projectId: string,
    stepId: string,
    log: Omit<WorkLogEntry, 'id' | 'timestamp'>
  ) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      addPersonalTaskLog(stepId, log);
      return;
    }
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          steps: proj.steps.map((step) => {
            if (step.id !== stepId) return step;
            return {
              ...step,
              workLogs: [
                ...(step.workLogs || []),
                {
                  ...log,
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }),
        };
      })
    );
  };

  const updateStepDetails = (
    projectId: string,
    stepId: string,
    updates: Partial<ChainStep> & { targetProjectId?: string }
  ) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      setPersonalTasks((prev) =>
        prev.map((t) => {
          if (t.id !== stepId) return t;
          const updated = { ...t };
          if (updates.title !== undefined) updated.title = updates.title;
          if (updates.description !== undefined) updated.description = updates.description;
          if (updates.assignedPerson !== undefined || updates.assignedRole !== undefined) {
            updated.assignedTo = updates.assignedPerson || updates.assignedRole || t.assignedTo;
          }
          if (updates.targetProjectId !== undefined) updated.projectId = updates.targetProjectId || undefined;
          if (updates.dueDate !== undefined) updated.dueDate = updates.dueDate;
          if (updates.color !== undefined) updated.color = updates.color;
          if (updates.link !== undefined) updated.link = updates.link;
          if (updates.attachments !== undefined) updated.attachments = updates.attachments;
          if (updates.status !== undefined) updated.status = (updates.status === 'pending' ? 'todo' : updates.status) as any;
          return updated;
        })
      );
      return;
    }
    const { targetProjectId, ...stepUpdates } = updates;

    if (targetProjectId === '') {
      // User explicitly cleared project association -> Remove step from project & add to personal tasks as unassigned task
      let stepToMove: ChainStep | null = null;
      setProjects((prev) => {
        return prev.map((proj) => {
          const found = proj.steps.find((s) => s.id === stepId);
          if (found) {
            stepToMove = { ...found, ...stepUpdates };
          }
          return {
            ...proj,
            steps: proj.steps.filter((s) => s.id !== stepId),
            updatedAt: new Date().toISOString(),
          };
        });
      });

      setPersonalTasks((prev) => {
        const existingIndex = prev.findIndex((t) => t.id === stepId);
        if (existingIndex >= 0) {
          return prev.map((t) => {
            if (t.id !== stepId) return t;
            const updated = { ...t, ...stepUpdates };
            delete updated.projectId;
            return updated;
          });
        }
        // Convert project step into PersonalTask
        const createdTask: PersonalTask = {
          id: stepId,
          title: stepUpdates.title || 'งานทั่วไป',
          description: stepUpdates.description || '',
          category: 'ทั่วไป',
          priority: 'medium',
          status: (stepUpdates.status === 'pending' ? 'todo' : stepUpdates.status) as any,
          assignedTo: stepUpdates.assignedPerson || stepUpdates.assignedRole || 'มีมี่',
          dueDate: stepUpdates.dueDate || new Date().toISOString().split('T')[0],
          checklist: [],
          tags: [],
          createdAt: new Date().toISOString(),
          attachments: stepUpdates.attachments || [],
          notes: stepUpdates.handoverComment,
        };
        return [createdTask, ...prev];
      });

      return;
    }

    setProjects((prev) => {
      let stepToMove: ChainStep | null = null;
      let currentProjId: string = projectId;

      for (const proj of prev) {
        const found = proj.steps.find((s) => s.id === stepId);
        if (found) {
          stepToMove = { ...found, ...stepUpdates };
          currentProjId = proj.id;
          break;
        }
      }

      if (!stepToMove) return prev;

      const destinationProjectId = targetProjectId || currentProjId;

      // Clean stepId from ALL projects first
      const cleanedProjects = prev.map((proj) => ({
        ...proj,
        steps: proj.steps.filter((s) => s.id !== stepId),
        updatedAt: proj.id === currentProjId || proj.id === destinationProjectId ? new Date().toISOString() : proj.updatedAt,
      }));

      // Add updated step to destination project ONCE
      return cleanedProjects.map((proj) => {
        if (proj.id === destinationProjectId) {
          const maxStepNum = proj.steps.reduce((max, s) => Math.max(max, s.stepNumber), 0);
          return {
            ...proj,
            steps: [...proj.steps, { ...stepToMove!, stepNumber: maxStepNum + 1 }],
            updatedAt: new Date().toISOString(),
          };
        }
        return proj;
      });
    });
  };

  const addCustomStep = (projectId: string, newStep: Omit<ChainStep, 'id'>) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const createdStep: ChainStep = {
          ...newStep,
          id: `step-${Date.now()}`,
          workLogs: newStep.workLogs || [],
        };
        const updatedSteps = [...proj.steps, createdStep].sort((a, b) => a.stepNumber - b.stepNumber);
        return {
          ...proj,
          steps: updatedSteps,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteStep = (projectId: string, stepId: string) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      deletePersonalTask(stepId);
      return;
    }
    let newProjects: TeamChainProject[] = [];
    setProjects((prev) => {
      newProjects = prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedSteps = proj.steps.filter((s) => s.id !== stepId);
        const completedCount = updatedSteps.filter((s) => s.status === 'completed').length;
        const progress = updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0;
        return {
          ...proj,
          steps: updatedSteps,
          progress,
          updatedAt: new Date().toISOString(),
        };
      });
      return newProjects;
    });

    import('../lib/sync').then(({ updateFirestoreDoc }) => {
      updateFirestoreDoc({ projects: newProjects });
    });
  };

  const clearProjectSteps = (projectId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          steps: [],
          progress: 0,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Step Approval Handlers
  const submitStepForApproval = (
    projectId: string,
    stepId: string,
    approverRole: string,
    submitterRole: string,
    comment?: string,
    attachments?: any[]
  ) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      submitPersonalTaskForApproval(stepId, approverRole, submitterRole, comment, attachments);
      return;
    }
    const nowIso = new Date().toISOString();
    let stepTitle = '';

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const targetStep = proj.steps.find((s) => s.id === stepId);
        if (!targetStep) return proj;
        stepTitle = targetStep.title;

        const newLog: WorkLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: nowIso,
          author: submitterRole,
          text: `ส่งขออนุมัติงานไปยังคุณ ${approverRole}${comment ? `: "${comment}"` : ''}`,
          type: 'approval',
        };

        const approvalLog: ApprovalLogEntry = {
          id: `appr-${Date.now()}`,
          timestamp: nowIso,
          action: 'submit',
          actorName: submitterRole,
          actorRole: submitterRole,
          targetApprover: approverRole,
          comment,
          attachments,
        };

        const updatedSteps = proj.steps.map((s) => {
          if (s.id !== stepId) return s;
          return {
            ...s,
            status: 'waiting_approval' as StepStatus,
            approvalStatus: 'pending' as ApprovalStatus,
            submittedForApprovalBy: submitterRole,
            submittedForApprovalAt: nowIso,
            approverRole,
            assignedPerson: approverRole,
            assignedRole: approverRole,
            approvalComment: comment || s.approvalComment,
            approvalAttachments: attachments || s.approvalAttachments,
            workLogs: [...(s.workLogs || []), newLog],
            approvalHistory: [...(s.approvalHistory || []), approvalLog],
          };
        });

        return {
          ...proj,
          steps: updatedSteps,
          updatedAt: nowIso,
        };
      })
    );

    // Send in-app notification to the approver
    addNotification({
      type: 'approval_request',
      title: `🔔 มีงานรอการอนุมัติจาก ${submitterRole}`,
      message: `งาน "${stepTitle || 'ขั้นตอนในสายงาน'}" ส่งมาให้คุณอนุมัติ ${comment ? `ข้อความ: "${comment}"` : ''}`,
      relatedProjectId: projectId,
      relatedStepId: stepId,
      targetRole: approverRole,
      senderRole: submitterRole,
    });

    showToastNotification(
      approverRole,
      stepTitle || 'ส่งขออนุมัติสำเร็จ',
      `ส่งงานให้คุณ ${approverRole} ตรวจสอบและอนุมัติแล้ว!`
    );
  };

  const approveStep = (projectId: string, stepId: string, approverName: string, comment?: string) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      approvePersonalTask(stepId, approverName, comment);
      return;
    }
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const nowIso = new Date().toISOString();
    let stepTitle = '';
    let targetSubmitter = '';

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const targetStep = proj.steps.find((s) => s.id === stepId);
        if (!targetStep) return proj;
        stepTitle = targetStep.title;
        targetSubmitter = targetStep.submittedForApprovalBy || targetStep.assignedPerson || targetStep.assignedRole;

        const newLog: WorkLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: nowIso,
          author: approverName,
          text: `✅ อนุมัติงานเรียบร้อยแล้ว: "${comment || 'ผ่านการตรวจ'}"`,
          type: 'approval',
        };

        const approvalLog: ApprovalLogEntry = {
          id: `appr-${Date.now()}`,
          timestamp: nowIso,
          action: 'approve',
          actorName: approverName,
          actorRole: approverName,
          comment: comment || 'อนุมัติเรียบร้อยแล้ว',
        };

        const updatedSteps = proj.steps.map((s) => {
          if (s.id !== stepId) return s;
          return {
            ...s,
            status: 'in_progress' as StepStatus,
            approvalStatus: 'approved' as ApprovalStatus,
            assignedPerson: targetSubmitter || s.assignedPerson,
            assignedRole: targetSubmitter || s.assignedRole,
            completedAt: nowIso,
            approvalComment: comment || s.approvalComment,
            workLogs: [...(s.workLogs || []), newLog],
            approvalHistory: [...(s.approvalHistory || []), approvalLog],
          };
        });

        const completedCount = updatedSteps.filter((s) => s.status === 'completed').length;
        const progress = Math.round((completedCount / updatedSteps.length) * 100);

        return {
          ...proj,
          steps: updatedSteps,
          progress,
          updatedAt: nowIso,
        };
      })
    );

    // Notify submitter
    addNotification({
      type: 'approval_approved',
      title: `✅ งานของคุณผ่านการอนุมัติแล้ว!`,
      message: `งาน "${stepTitle}" ได้รับการอนุมัติโดยคุณ ${approverName} ${comment ? `("${comment}")` : ''}`,
      relatedProjectId: projectId,
      relatedStepId: stepId,
      targetRole: targetSubmitter,
      senderRole: approverName,
    });

    showToastNotification(
      targetSubmitter,
      stepTitle,
      `งานผ่านการอนุมัติโดยคุณ ${approverName} เรียบร้อยแล้ว!`
    );
  };

  const rejectStep = (projectId: string, stepId: string, approverName: string, comment: string) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      rejectPersonalTask(stepId, approverName, comment);
      return;
    }
    const nowIso = new Date().toISOString();
    let stepTitle = '';
    let targetSubmitter = '';

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const targetStep = proj.steps.find((s) => s.id === stepId);
        if (!targetStep) return proj;
        stepTitle = targetStep.title;
        targetSubmitter = targetStep.submittedForApprovalBy || targetStep.assignedPerson || targetStep.assignedRole;

        const newLog: WorkLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: nowIso,
          author: approverName,
          text: `❌ ปฏิเสธ/ยกเลิกคำขออนุมัติ: "${comment}"`,
          type: 'approval',
        };

        const approvalLog: ApprovalLogEntry = {
          id: `appr-${Date.now()}`,
          timestamp: nowIso,
          action: 'reject',
          actorName: approverName,
          actorRole: approverName,
          comment,
        };

        const updatedSteps = proj.steps.map((s) => {
          if (s.id !== stepId) return s;
          return {
            ...s,
            status: 'in_progress' as StepStatus,
            approvalStatus: 'rejected' as ApprovalStatus,
            assignedPerson: targetSubmitter || s.assignedPerson,
            assignedRole: targetSubmitter || s.assignedRole,
            approvalComment: comment,
            workLogs: [...(s.workLogs || []), newLog],
            approvalHistory: [...(s.approvalHistory || []), approvalLog],
          };
        });

        return {
          ...proj,
          steps: updatedSteps,
          updatedAt: nowIso,
        };
      })
    );

    // Notify submitter
    addNotification({
      type: 'approval_rejected',
      title: `❌ งานไม่ผ่านการอนุมัติ / ถูกยกเลิก`,
      message: `งาน "${stepTitle}" ถูกปฏิเสธโดยคุณ ${approverName} เหตุผล: "${comment}"`,
      relatedProjectId: projectId,
      relatedStepId: stepId,
      targetRole: targetSubmitter,
      senderRole: approverName,
    });

    showToastNotification(
      targetSubmitter,
      stepTitle,
      `ผลการตรวจ: ไม่อนุมัติ/ยกเลิก โดยคุณ ${approverName}`
    );
  };

  const requestStepRevision = (
    projectId: string,
    stepId: string,
    approverName: string,
    revisionComment: string,
    attachments?: any[]
  ) => {
    if (personalTasks.some((t) => t.id === stepId)) {
      requestPersonalTaskRevision(stepId, approverName, revisionComment, attachments);
      return;
    }
    const nowIso = new Date().toISOString();
    let stepTitle = '';
    let targetSubmitter = '';

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const targetStep = proj.steps.find((s) => s.id === stepId);
        if (!targetStep) return proj;
        stepTitle = targetStep.title;
        targetSubmitter = targetStep.submittedForApprovalBy || targetStep.assignedPerson || targetStep.assignedRole;

        const newLog: WorkLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: nowIso,
          author: approverName,
          text: `🔄 ส่งกลับให้แก้ไข: "${revisionComment}"${attachments?.length ? ` (แนบรูป ${attachments.length} รูป)` : ''}`,
          type: 'approval',
        };

        const approvalLog: ApprovalLogEntry = {
          id: `appr-${Date.now()}`,
          timestamp: nowIso,
          action: 'revision_request',
          actorName: approverName,
          actorRole: approverName,
          comment: revisionComment,
          attachments,
        };

        const updatedSteps = proj.steps.map((s) => {
          if (s.id !== stepId) return s;
          return {
            ...s,
            status: 'in_progress' as StepStatus,
            approvalStatus: 'revision_requested' as ApprovalStatus,
            assignedPerson: targetSubmitter || s.assignedPerson,
            assignedRole: targetSubmitter || s.assignedRole,
            approvalComment: revisionComment,
            approvalAttachments: attachments || s.approvalAttachments,
            workLogs: [...(s.workLogs || []), newLog],
            approvalHistory: [...(s.approvalHistory || []), approvalLog],
          };
        });

        return {
          ...proj,
          steps: updatedSteps,
          updatedAt: nowIso,
        };
      })
    );

    // Notify submitter
    addNotification({
      type: 'approval_revision',
      title: `🔄 งานของคุณถูกส่งกลับให้แก้ไข`,
      message: `งาน "${stepTitle}" ส่งกลับจากคุณ ${approverName}: "${revisionComment}" (มีรูปแนบรายละเอียด)`,
      relatedProjectId: projectId,
      relatedStepId: stepId,
      targetRole: targetSubmitter,
      senderRole: approverName,
    });

    showToastNotification(
      targetSubmitter,
      stepTitle,
      `งานถูกส่งกลับให้แก้ไขโดยคุณ ${approverName}`
    );
  };

  // Project CRUD
  const createProject = (projectData: Omit<TeamChainProject, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => {
    const newProj: TeamChainProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
  };

  const updateProject = (id: string, updates: Partial<TeamChainProject>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    let newProjects: TeamChainProject[] = [];
    setProjects((prev) => {
      newProjects = prev.filter((p) => p.id !== id);
      return newProjects;
    });
    if (activeProjectId === id) {
      const remaining = newProjects;
      if (remaining.length > 0) setActiveProjectId(remaining[0].id);
    }
    import('../lib/sync').then(({ updateFirestoreDoc }) => {
      updateFirestoreDoc({ projects: newProjects });
    });
  };

  // Personal Tasks CRUD
  const addPersonalTask = (taskData: Omit<PersonalTask, 'id' | 'createdAt'>) => {
    const newTask: PersonalTask = {
      ...taskData,
      id: `pt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      checklist: taskData.checklist || [],
      tags: taskData.tags || [],
    };
    setPersonalTasks((prev) => [newTask, ...prev]);
  };

  const updatePersonalTask = (id: string, updates: Partial<PersonalTask>) => {
    setPersonalTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (updates.status === 'completed' && t.status !== 'completed') {
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      })
    );
  };

  const deletePersonalTask = (id: string) => {
    let newPersonalTasks: PersonalTask[] = [];
    setPersonalTasks((prev) => {
      newPersonalTasks = prev.filter((t) => t.id !== id);
      return newPersonalTasks;
    });
    import('../lib/sync').then(({ updateFirestoreDoc }) => {
      updateFirestoreDoc({ personalTasks: newPersonalTasks });
    });
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setPersonalTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          checklist: t.checklist.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        };
      })
    );
  };

  const addPersonalTaskLog = (taskId: string, log: Omit<WorkLogEntry, 'id' | 'timestamp'>) => {
    setPersonalTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newLog: WorkLogEntry = {
          ...log,
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        const currentSpent = t.spentMinutes || 0;
        const addedMinutes = log.durationMinutes || 0;
        return {
          ...t,
          spentMinutes: currentSpent + addedMinutes,
          workLogs: [...(t.workLogs || []), newLog],
        };
      })
    );
  };

  // Handover Personal Task to another team member
  const handoverPersonalTask = (
    taskId: string,
    targetAssignee: string,
    comment: string,
    actionType: 'delegate' | 'complete_and_assign_next',
    newDueDate?: string,
    newTitle?: string,
    newAttachments?: any[]
  ) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    const currentTask = personalTasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    const author = currentTask.assignedTo;
    const nowIso = new Date().toISOString();

    if (actionType === 'complete_and_assign_next') {
      // Mark current task completed
      setPersonalTasks((prev) => {
        const updatedOriginal = prev.map((t) => {
          if (t.id !== taskId) return t;
          const combinedAtts = newAttachments ? [...(t.attachments || []), ...newAttachments] : t.attachments;
          return {
            ...t,
            status: 'in_progress' as const,
            completedAt: nowIso,
            handedOverTo: targetAssignee,
            handoverComment: comment,
            handoverDate: nowIso,
            attachments: combinedAtts,
            workLogs: [
              ...(t.workLogs || []),
              {
                id: `log-${Date.now()}`,
                timestamp: nowIso,
                author,
                text: `ส่งต่องานให้คุณ ${targetAssignee}: "${comment}"`,
                type: 'handover' as const,
                attachments: newAttachments,
              },
            ],
          };
        });

        // Create new follow-up task for recipient
        const nextTask: PersonalTask = {
          id: `pt-${Date.now()}`,
          title: newTitle?.trim() || `${currentTask.title} (ส่งต่อจาก ${author})`,
          description: `งานส่งต่อจากคุณ ${author}\n\nข้อความส่งมอบ:\n${comment}`,
          category: currentTask.category,
          priority: currentTask.priority,
          status: 'todo',
          assignedTo: targetAssignee,
          projectId: currentTask.projectId,
          dueDate: newDueDate || currentTask.dueDate,
          checklist: [],
          tags: [...currentTask.tags, 'งานส่งต่อ'],
          createdAt: nowIso,
          handedOverFrom: author,
          handoverComment: comment,
          handoverDate: nowIso,
          attachments: newAttachments || currentTask.attachments || [],
          workLogs: [
            {
              id: `log-${Date.now() + 1}`,
              timestamp: nowIso,
              author: 'ระบบ',
              text: `ได้รับงานส่งต่อจากคุณ ${author}`,
              type: 'handover' as const,
              attachments: newAttachments,
            },
          ],
        };

        return [nextTask, ...updatedOriginal];
      });
    } else {
      // Delegate directly
      setPersonalTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const combinedAtts = newAttachments ? [...(t.attachments || []), ...newAttachments] : t.attachments;
          return {
            ...t,
            assignedTo: targetAssignee,
            handedOverFrom: author,
            handoverComment: comment,
            handoverDate: nowIso,
            dueDate: newDueDate || t.dueDate,
            attachments: combinedAtts,
            workLogs: [
              ...(t.workLogs || []),
              {
                id: `log-${Date.now()}`,
                timestamp: nowIso,
                author,
                text: `ส่งมอบความรับผิดชอบให้คุณ ${targetAssignee}: "${comment}"`,
                type: 'handover' as const,
                attachments: newAttachments,
              },
            ],
          };
        })
      );
    }

    // Add targeted notification for recipient
    addNotification({
      type: 'handover',
      title: `🔔 คุณได้รับงานส่งต่อใหม่จาก ${author}`,
      message: `งาน "${currentTask.title}" ถูกส่งต่อให้คุณรับผิดชอบ ข้อความ: "${comment}"`,
      relatedTaskId: taskId,
      targetRole: targetAssignee,
    });

    // Show top toast banner
    showToastNotification(
      targetAssignee,
      currentTask.title,
      `ส่งต่องานให้คุณ ${targetAssignee} เรียบร้อยแล้ว พร้อมส่งการแจ้งเตือนทันที!`
    );
  };

  // Personal Task Approval Handlers
  const submitPersonalTaskForApproval = (
    taskId: string,
    approverRole: string,
    submitterRole: string,
    comment?: string,
    attachments?: any[]
  ) => {
    const nowIso = new Date().toISOString();
    const target = personalTasks.find((t) => t.id === taskId);
    const taskTitle = target?.title || 'งานส่วนตัว';

    const newLog: WorkLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      author: submitterRole,
      text: `ส่งขออนุมัติงานไปยังคุณ ${approverRole}${comment ? `: "${comment}"` : ''}`,
      type: 'approval',
    };

    const approvalLog: ApprovalLogEntry = {
      id: `appr-${Date.now()}`,
      timestamp: nowIso,
      action: 'submit',
      actorName: submitterRole,
      actorRole: submitterRole,
      targetApprover: approverRole,
      comment,
      attachments,
    };

    setPersonalTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: 'waiting_approval' as const,
          approvalStatus: 'pending' as ApprovalStatus,
          submittedForApprovalBy: submitterRole,
          submittedForApprovalAt: nowIso,
          approverRole,
          assignedTo: approverRole,
          approvalComment: comment || t.approvalComment,
          approvalAttachments: attachments || t.approvalAttachments,
          workLogs: [...(t.workLogs || []), newLog],
          approvalHistory: [...(t.approvalHistory || []), approvalLog],
        };
      })
    );

    // In-app notification to approver
    addNotification({
      type: 'approval_request',
      title: `🔔 มีงานส่วนตัวรอการอนุมัติจาก ${submitterRole}`,
      message: `งาน "${taskTitle}" ส่งมาให้คุณอนุมัติ ${comment ? `ข้อความ: "${comment}"` : ''}`,
      relatedTaskId: taskId,
      targetRole: approverRole,
      senderRole: submitterRole,
    });

    showToastNotification(
      approverRole,
      taskTitle,
      `ส่งงานให้คุณ ${approverRole} ตรวจสอบและอนุมัติแล้ว!`
    );
  };

  const approvePersonalTask = (taskId: string, approverName: string, comment?: string) => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const nowIso = new Date().toISOString();
    const target = personalTasks.find((t) => t.id === taskId);
    const taskTitle = target?.title || 'งานส่วนตัว';
    const submitter = target?.submittedForApprovalBy || target?.assignedTo || approverName;

    const newLog: WorkLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      author: approverName,
      text: `✅ อนุมัติงานเรียบร้อยแล้ว: "${comment || 'ผ่านการตรวจ'}"`,
      type: 'approval',
    };

    const approvalLog: ApprovalLogEntry = {
      id: `appr-${Date.now()}`,
      timestamp: nowIso,
      action: 'approve',
      actorName: approverName,
      actorRole: approverName,
      comment: comment || 'อนุมัติเรียบร้อยแล้ว',
    };

    setPersonalTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: 'in_progress' as const,
          approvalStatus: 'approved' as ApprovalStatus,
          assignedTo: submitter || t.assignedTo,
          completedAt: nowIso,
          approvalComment: comment || t.approvalComment,
          workLogs: [...(t.workLogs || []), newLog],
          approvalHistory: [...(t.approvalHistory || []), approvalLog],
        };
      })
    );

    // Notify submitter
    addNotification({
      type: 'approval_approved',
      title: `✅ งานส่วนตัวของคุณผ่านการอนุมัติแล้ว!`,
      message: `งาน "${taskTitle}" ได้รับการอนุมัติโดยคุณ ${approverName} ${comment ? `("${comment}")` : ''}`,
      relatedTaskId: taskId,
      targetRole: submitter,
      senderRole: approverName,
    });

    showToastNotification(
      submitter,
      taskTitle,
      `งานผ่านการอนุมัติโดยคุณ ${approverName} เรียบร้อยแล้ว!`
    );
  };

  const rejectPersonalTask = (taskId: string, approverName: string, comment: string) => {
    const nowIso = new Date().toISOString();
    const target = personalTasks.find((t) => t.id === taskId);
    const taskTitle = target?.title || 'งานส่วนตัว';
    const submitter = target?.submittedForApprovalBy || target?.assignedTo || approverName;

    const newLog: WorkLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      author: approverName,
      text: `❌ ปฏิเสธ/ยกเลิกคำขออนุมัติ: "${comment}"`,
      type: 'approval',
    };

    const approvalLog: ApprovalLogEntry = {
      id: `appr-${Date.now()}`,
      timestamp: nowIso,
      action: 'reject',
      actorName: approverName,
      actorRole: approverName,
      comment,
    };

    setPersonalTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: 'in_progress' as const,
          approvalStatus: 'rejected' as ApprovalStatus,
          assignedTo: submitter || t.assignedTo,
          approvalComment: comment,
          workLogs: [...(t.workLogs || []), newLog],
          approvalHistory: [...(t.approvalHistory || []), approvalLog],
        };
      })
    );

    // Notify submitter
    addNotification({
      type: 'approval_rejected',
      title: `❌ งานส่วนตัวไม่ผ่านการอนุมัติ / ถูกยกเลิก`,
      message: `งาน "${taskTitle}" ถูกปฏิเสธโดยคุณ ${approverName} เหตุผล: "${comment}"`,
      relatedTaskId: taskId,
      targetRole: submitter,
      senderRole: approverName,
    });

    showToastNotification(
      submitter,
      taskTitle,
      `ผลการตรวจ: ไม่อนุมัติ/ยกเลิก โดยคุณ ${approverName}`
    );
  };

  const requestPersonalTaskRevision = (
    taskId: string,
    approverName: string,
    revisionComment: string,
    attachments?: any[]
  ) => {
    const nowIso = new Date().toISOString();
    const target = personalTasks.find((t) => t.id === taskId);
    const taskTitle = target?.title || 'งานส่วนตัว';
    const submitter = target?.submittedForApprovalBy || target?.assignedTo || approverName;

    const newLog: WorkLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      author: approverName,
      text: `🔄 ส่งกลับให้แก้ไข: "${revisionComment}"${attachments?.length ? ` (แนบรูป ${attachments.length} รูป)` : ''}`,
      type: 'approval',
    };

    const approvalLog: ApprovalLogEntry = {
      id: `appr-${Date.now()}`,
      timestamp: nowIso,
      action: 'revision_request',
      actorName: approverName,
      actorRole: approverName,
      comment: revisionComment,
      attachments,
    };

    setPersonalTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: 'in_progress' as const,
          approvalStatus: 'revision_requested' as ApprovalStatus,
          assignedTo: submitter || t.assignedTo,
          approvalComment: revisionComment,
          approvalAttachments: attachments || t.approvalAttachments,
          workLogs: [...(t.workLogs || []), newLog],
          approvalHistory: [...(t.approvalHistory || []), approvalLog],
        };
      })
    );

    // Notify submitter
    addNotification({
      type: 'approval_revision',
      title: `🔄 งานส่วนตัวของคุณถูกส่งกลับให้แก้ไข`,
      message: `งาน "${taskTitle}" ส่งกลับจากคุณ ${approverName}: "${revisionComment}" (มีรูปแนบรายละเอียด)`,
      relatedTaskId: taskId,
      targetRole: submitter,
      senderRole: approverName,
    });

    showToastNotification(
      submitter,
      taskTitle,
      `งานถูกส่งกลับให้แก้ไขโดยคุณ ${approverName}`
    );
  };

  // Notifications Handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Documents Handlers
  const addDocument = (newDocData: Omit<WorkDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `doc-${Date.now()}`;
    const now = new Date().toISOString();
    const newDoc: WorkDocument = {
      ...newDocData,
      id,
      createdAt: now,
      updatedAt: now
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return id;
  };

  const updateDocument = (id: string, updates: Partial<WorkDocument>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
  };

  const deleteDocument = (id: string) => {
    let newDocuments: WorkDocument[] = [];
    setDocuments((prev) => {
      newDocuments = prev.filter((d) => d.id !== id);
      return newDocuments;
    });
    import('../lib/sync').then(({ updateFirestoreDoc }) => {
      updateFirestoreDoc({ documents: newDocuments });
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Reset & Export
  const resetToDefault = () => {
    setMembers(INITIAL_MEMBERS);
    setProjects(INITIAL_PROJECTS);
    setPersonalTasks(INITIAL_PERSONAL_TASKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setDocuments(INITIAL_DOCUMENTS);
    setSelectedRole('all');
    localStorage.removeItem(STORAGE_KEY_MEMBERS);
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    localStorage.removeItem(STORAGE_KEY_DOCUMENTS);
    localStorage.removeItem(STORAGE_KEY_ROLE);
  };

  const exportData = () => {
    const data = {
      members,
      projects,
      personalTasks,
      notifications,
      documents,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workchain-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.members) setMembers(parsed.members);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.personalTasks) setPersonalTasks(parsed.personalTasks);
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.documents) setDocuments(parsed.documents);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <WorkContext.Provider
      value={{
        members,
        addMember,
        updateMember,
        deleteMember,
        reorderMember,
        projects,
        personalTasks,
        notifications,
        documents,
        selectedRole,
        setSelectedRole,
        activeProject,
        setActiveProjectId,
        visibleProjects,
        visiblePersonalTasks,
        toast,
        dismissToast,
        updateStepStatus,
        reopenStep,
        completeStepAndHandover,
        addStepLog,
        updateStepDetails,
        addCustomStep,
        deleteStep,
        clearProjectSteps,
        submitStepForApproval,
        approveStep,
        rejectStep,
        requestStepRevision,
        createProject,
        updateProject,
        deleteProject,
        addPersonalTask,
        updatePersonalTask,
        deletePersonalTask,
        toggleChecklistItem,
        addPersonalTaskLog,
        handoverPersonalTask,
        submitPersonalTaskForApproval,
        approvePersonalTask,
        rejectPersonalTask,
        requestPersonalTaskRevision,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        addNotification,
        addDocument,
        updateDocument,
        deleteDocument,
        resetToDefault,
        exportData,
        importData,
        customLogo,
        setCustomLogo,
        themeColor,
        setThemeColor,
      }}
    >
      {!isFirebaseLoaded ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">กำลังเชื่อมต่อฐานข้อมูล...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </WorkContext.Provider>
  );
};

export const useWork = () => {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error('useWork must be used within a WorkProvider');
  }
  return context;
};
