import { TeamMember, TeamChainProject, PersonalTask, WorkDocument, NotificationItem } from '../types';

/**
 * Checks if a given string or member name refers to Lee / Mr Lee / แบฟีลี / น้องลี.
 */
export const isLeeAlias = (str: string | undefined | null): boolean => {
  if (!str) return false;
  const lower = str.trim().toLowerCase();
  return (
    lower === 'lee' ||
    lower === 'mr lee' ||
    lower === 'mr. lee' ||
    lower === 'mr.lee' ||
    lower.includes('ลี') ||
    lower.includes('แบฟีลี') ||
    lower.includes('น้องลี') ||
    lower.includes('mr lee') ||
    lower.includes('mr. lee') ||
    lower.includes('lee')
  );
};

/**
 * Normalizes member names, converting any legacy variations of Lee to 'Mr Lee'.
 */
export const normalizeMemberName = (name: string | undefined | null): string => {
  if (!name) return '';
  if (isLeeAlias(name)) {
    return 'Mr Lee';
  }
  return name;
};

/**
 * Checks if a given field value (e.g. from step.assignedPerson, step.assignedRole, task.assignedTo)
 * matches a team member's name or known variations of their nickname/role.
 */
export const isSameMember = (
  assignedVal: string | undefined | null,
  memberName: string | undefined | null,
  memberId?: string
): boolean => {
  if (!assignedVal || !memberName) return false;
  
  const val = assignedVal.trim().toLowerCase();
  const name = memberName.trim().toLowerCase();
  
  if (val === name) return true;

  // If both refer to Lee
  if (isLeeAlias(val) && (isLeeAlias(name) || memberId === 'lee')) {
    return true;
  }

  // Pre-defined IDs mapping to catch initial data variations
  if (memberId === 'lee' || name === 'mr lee' || name === 'แบฟีลี' || name === 'น้องลี') {
    return isLeeAlias(val);
  }

  if (memberId === 'seng' || name.includes('เซ็ง')) {
    return val === 'เซ็ง' || val === 'น้องเซ็ง' || val === 'seng';
  }

  if (memberId === 'demy' || name.includes('เดะมี่')) {
    return val === 'เดะมี่' || val === 'demy' || val === 'มี่';
  }

  if (memberId === 'mimi' || name.includes('มีมี่')) {
    return val === 'มีมี่' || val === 'mimi';
  }

  if (memberId === 'fani' || name.includes('ฟานี')) {
    return val === 'ฟานี' || val === 'fani';
  }

  if (memberId === 'mkt' || name.includes('mkt') || name.includes('การตลาด')) {
    return val.includes('mkt') || val.includes('การตลาด');
  }

  if (memberId === 'po' || name.includes('po') || name.includes('จัดซื้อ') || name.includes('สั่งผลิต')) {
    return val.includes('po') || val.includes('จัดซื้อ') || val.includes('สั่งผลิต');
  }

  if (memberId === 'suri' || name.includes('ซูรี')) {
    return val.includes('ซูรี') || val.includes('suri');
  }

  if (memberId === 'kafah' || name.includes('กะฟา')) {
    return val.includes('กะฟา') || val.includes('kafah');
  }

  if (memberId === 'npd' || name.includes('npd')) {
    return val.includes('npd') || val.includes('product');
  }

  // Fallback check: removed for stricter matching
  return false;
};

/**
 * Migrates all legacy Lee data ("แบฟีลี", "น้องลี", etc.) to "Mr Lee" across all data structures.
 */
export const migrateAllDataToMrLee = (data: {
  members?: TeamMember[];
  projects?: TeamChainProject[];
  personalTasks?: PersonalTask[];
  documents?: WorkDocument[];
  notifications?: NotificationItem[];
}) => {
  const migratedMembers = data.members?.map((m) => {
    if (m.id === 'lee' || isLeeAlias(m.name)) {
      return {
        ...m,
        id: 'lee',
        name: 'Mr Lee',
        role: m.role || 'Photo Editor & Retouch (ตัดรูป/รีทัช)',
        department: m.department || 'Post-Production',
        avatarBg: m.avatarBg || 'bg-violet-500',
        color: m.color || '#8b5cf6',
      };
    }
    return m;
  });

  const migratedPersonalTasks = data.personalTasks?.map((task) => {
    let changed = false;
    const updated = { ...task };

    if (isLeeAlias(task.assignedTo)) {
      updated.assignedTo = 'Mr Lee';
      changed = true;
    }
    if (task.handedOverFrom && isLeeAlias(task.handedOverFrom)) {
      updated.handedOverFrom = 'Mr Lee';
      changed = true;
    }
    if (task.handedOverTo && isLeeAlias(task.handedOverTo)) {
      updated.handedOverTo = 'Mr Lee';
      changed = true;
    }
    if (task.workLogs && task.workLogs.some((l) => isLeeAlias(l.author))) {
      updated.workLogs = task.workLogs.map((l) =>
        isLeeAlias(l.author) ? { ...l, author: 'Mr Lee' } : l
      );
      changed = true;
    }

    return changed ? updated : task;
  });

  const migratedProjects = data.projects?.map((proj) => {
    let projChanged = false;
    const updatedSteps = proj.steps.map((step) => {
      let stepChanged = false;
      const updatedStep = { ...step };

      if (isLeeAlias(step.assignedPerson)) {
        updatedStep.assignedPerson = 'Mr Lee';
        stepChanged = true;
      }
      if (isLeeAlias(step.assignedRole)) {
        updatedStep.assignedRole = 'Mr Lee';
        stepChanged = true;
      }
      if (step.handedOverTo && isLeeAlias(step.handedOverTo)) {
        updatedStep.handedOverTo = 'Mr Lee';
        stepChanged = true;
      }
      if (step.handedOverFrom && isLeeAlias(step.handedOverFrom)) {
        updatedStep.handedOverFrom = 'Mr Lee';
        stepChanged = true;
      }
      if (step.workLogs && step.workLogs.some((l) => isLeeAlias(l.author))) {
        updatedStep.workLogs = step.workLogs.map((l) =>
          isLeeAlias(l.author) ? { ...l, author: 'Mr Lee' } : l
        );
        stepChanged = true;
      }

      if (stepChanged) projChanged = true;
      return stepChanged ? updatedStep : step;
    });

    return projChanged ? { ...proj, steps: updatedSteps } : proj;
  });

  const migratedDocuments = data.documents?.map((doc) => {
    if (isLeeAlias(doc.createdBy)) {
      return { ...doc, createdBy: 'Mr Lee' };
    }
    return doc;
  });

  const migratedNotifications = data.notifications?.map((notif) => {
    if (notif.targetRole && isLeeAlias(notif.targetRole)) {
      return { ...notif, targetRole: 'Mr Lee' };
    }
    return notif;
  });

  return {
    members: migratedMembers,
    projects: migratedProjects,
    personalTasks: migratedPersonalTasks,
    documents: migratedDocuments,
    notifications: migratedNotifications,
  };
};
