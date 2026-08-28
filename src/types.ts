export type TaskType = 'team_chain' | 'personal';

export type StepStatus = 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'blocked';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type RoleLevel = 'admin' | 'approver' | 'member';
export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarBg: string;
  color: string;
  gradient?: string;
  avatarUrl?: string;
  canApprove?: boolean; // มีสิทธิ์อนุมัติงาน
  roleLevel?: RoleLevel; // ระดับสิทธิ์: admin (ผู้ดูแล), approver (ผู้อนุมัติ), member (พนักงาน)
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
  type: 'log' | 'handover' | 'status_change' | 'comment' | 'approval';
}

export interface ApprovalLogEntry {
  id: string;
  timestamp: string;
  action: 'submit' | 'approve' | 'reject' | 'revision_request';
  actorName: string;
  actorRole?: string;
  targetApprover?: string;
  comment?: string;
  attachments?: TaskAttachment[];
}

export interface ChainStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  assignedRole: string; // e.g. "มีมี่", "MKT", "NPD", "PO", "เดะมี่", "ฟานี", "น้องเซ็ง", "Mr Lee", "ซูรี", "กะฟา", "GM"
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
  color?: string;
  link?: string;
  // Approval System fields
  approvalStatus?: ApprovalStatus;
  submittedForApprovalBy?: string;
  submittedForApprovalAt?: string;
  approverRole?: string;
  approvalComment?: string;
  approvalAttachments?: TaskAttachment[]; // รูปภาพและไฟล์ประกอบการแจ้งแก้ไข/อนุมัติ
  approvalHistory?: ApprovalLogEntry[];
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
  allowedMembers?: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PersonalTask {
  id: string;
  projectId?: string; // Add this
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
  color?: string;
  link?: string;
  // Approval System fields
  approvalStatus?: ApprovalStatus;
  submittedForApprovalBy?: string;
  submittedForApprovalAt?: string;
  approverRole?: string;
  approvalComment?: string;
  approvalAttachments?: TaskAttachment[]; // รูปภาพและไฟล์ประกอบการแจ้งแก้ไข/อนุมัติ
  approvalHistory?: ApprovalLogEntry[];
  allowedMembers?: string[];
}

export interface NotificationItem {
  id: string;
  type: 'due_soon' | 'overdue' | 'step_unlocked' | 'handover' | 'completed' | 'approval_request' | 'approval_approved' | 'approval_rejected' | 'approval_revision';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedProjectId?: string;
  relatedStepId?: string;
  relatedTaskId?: string;
  targetRole?: string;
  senderRole?: string;
  attachments?: TaskAttachment[];
}

export interface WorkDocument {
  id: string;
  title: string;
  category: string;
  content: string; // HTML format rich text content
  pages?: string[]; // Array of HTML strings for each page
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

