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
  
  if (val === 'all' || name === 'all') return false;
  if (val === name) return true;

  // If both refer to Lee
  if (isLeeAlias(val) && isLeeAlias(name)) {
    return true;
  }

  // Pre-defined alias groups where BOTH val and name (or memberId) must match
  const aliasGroups: { id?: string; aliases: string[] }[] = [
    { id: 'lee', aliases: ['mr lee', 'mr. lee', 'mr.lee', 'แบฟีลี', 'น้องลี', 'ลี', 'lee'] },
    { id: 'seng', aliases: ['เซ็ง', 'น้องเซ็ง', 'seng'] },
    { id: 'demy', aliases: ['เดะมี่', 'demy', 'มี่'] },
    { id: 'mimi', aliases: ['มีมี่', 'mimi'] },
    { id: 'fani', aliases: ['ฟานี', 'fani'] },
    { id: 'mkt', aliases: ['mkt', 'การตลาด', 'marketing'] },
    { id: 'po', aliases: ['po', 'จัดซื้อ', 'สั่งผลิต', 'procurement'] },
    { id: 'suri', aliases: ['ซูรี', 'suri'] },
    { id: 'kafah', aliases: ['กะฟา', 'kafah'] },
    { id: 'npd', aliases: ['npd', 'product', 'พัฒนาผลิตภัณฑ์'] },
    { id: 'aim', aliases: ['aim', 'เอม'] }
  ];

  for (const group of aliasGroups) {
    const valMatches = (group.id && val === group.id) || group.aliases.some(a => val === a || val.includes(a) || a.includes(val));
    const nameMatches = (group.id && (name === group.id || memberId === group.id)) || group.aliases.some(a => name === a || name.includes(a) || a.includes(name));
    
    // BOTH val and name must match the same alias group
    if (valMatches && nameMatches) {
      return true;
    }
  }

  // Fallback exact substring match (only if long enough to prevent accidental overlaps)
  const fuzzyVal = val.replace(/[^a-z0-9ก-ฮ]/gi, '');
  const fuzzyName = name.replace(/[^a-z0-9ก-ฮ]/gi, '');
  
  if (fuzzyVal.length >= 4 && fuzzyName.length >= 4) {
    if (fuzzyVal === fuzzyName) return true;
  }

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
