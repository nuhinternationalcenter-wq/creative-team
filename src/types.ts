export type TaskType = 'team_chain' | 'personal';

export type StepStatus = 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'blocked';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarBg: string;
  color: string;
  gradient?: string;
  avatarUrl?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'link';
  url: string;
  size?: string;
  uploadedAt?: string;
}

export interface WorkLogEntry {
  id: string;
  timestamp: string;
  author: string;
  text: string;
  durationMinutes?: number;
  type: 'log' | 'handover' | 'status_change' | 'comment';
}

export interface ChainStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  assignedRole: string; // e.g. "มีมี่", "MKT", "NPD", "PO", "เดะมี่", "ฟานี", "น้องเซ็ง", "น้องลี", "ซูรี", "กะฟา", "GM"
  assignedPerson: string;
  status: StepStatus;
  startDate?: string;
  dueDate: string;
  completedAt?: string;
  dependencies: string[]; // step IDs that must be completed first
  branch?: 'fabric_po' | 'product_dev' | 'photo_shoot' | 'video_prod' | 'post_prod' | 'main';
  taskScope?: 'team' | 'personal';
  handoverComment?: string;
  handedOverTo?: string;
  handedOverFrom?: string;
  attachments?: TaskAttachment[];
  workLogs?: WorkLogEntry[];
  estimatedHours?: number;
}

export interface TeamChainProject {
  id: string;
  title: string;
  code: string;
  category: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'on_hold';
  priority: PriorityLevel;
  steps: ChainStep[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g. "งานด่วน", "การตลาด", "ประสานงาน", "เอกสาร", "ส่วนตัว"
  priority: PriorityLevel;
  status: 'todo' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  estimatedMinutes?: number;
  spentMinutes?: number;
  completedAt?: string;
  checklist: ChecklistItem[];
  notes?: string;
  tags: string[];
  createdAt: string;
  attachments?: TaskAttachment[];
  workLogs?: WorkLogEntry[];
  handedOverTo?: string;
  handedOverFrom?: string;
  handoverComment?: string;
  handoverDate?: string;
}

export interface NotificationItem {
  id: string;
  type: 'due_soon' | 'overdue' | 'step_unlocked' | 'handover' | 'completed';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedProjectId?: string;
  relatedStepId?: string;
  relatedTaskId?: string;
  targetRole?: string;
}
