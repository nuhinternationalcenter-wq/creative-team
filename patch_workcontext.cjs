const fs = require('fs');
let code = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

const deepEqualFn = `
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}
`;

if (!code.includes('function deepEqual')) {
  code = code.replace('export const WorkProvider', deepEqualFn + '\nexport const WorkProvider');
}

// Ensure lastServerStateRef is there
if (!code.includes('lastServerStateRef')) {
  code = code.replace(
    'const [toast, setToast] = useState<ToastMessage | null>(null);',
    `const [toast, setToast] = useState<ToastMessage | null>(null);\n  const lastServerStateRef = React.useRef<any>(null);`
  );
}

// Modify subscribeToWorkspace
const subMatch = code.match(/const unsubscribe = subscribeToWorkspace\(\(data, hasPendingWrites\) => \{[\s\S]*?\}\);/);
if (subMatch) {
  const newSub = `const unsubscribe = subscribeToWorkspace((data, hasPendingWrites) => {
        setIsFirebaseLoaded(true);
        if (data && !hasPendingWrites) {
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
            customLogo: data.customLogo,
            themeColor: data.themeColor
          };
          
          if (migrated.members) setMembers(migrated.members);
          if (migrated.projects) setProjects(migrated.projects);
          if (migrated.personalTasks) setPersonalTasks(migrated.personalTasks);
          if (migrated.notifications) setNotifications(migrated.notifications);
          if (migrated.documents) setDocuments(migrated.documents);
          if (data.customLogo !== undefined) setCustomLogoState(data.customLogo);
          if (data.themeColor !== undefined) setThemeColorState(data.themeColor);
        }
      });`;
  code = code.replace(subMatch[0], newSub);
}

// Modify syncToFirestore
const syncMatch = code.match(/useEffect\(\(\) => \{\s*if \(!isFirebaseLoaded\) return;\s*import\('\.\.\/lib\/sync'\)\.then\(\(\{ syncToFirestore \}\) => \{[\s\S]*?\}\);\s*\}, \[members, projects, personalTasks, notifications, documents, customLogo, themeColor, isFirebaseLoaded\]\);/);

if (syncMatch) {
  const newSync = `useEffect(() => {
    if (!isFirebaseLoaded) return;
    
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
    
    import('../lib/sync').then(({ syncToFirestore }) => {
      syncToFirestore(currentState);
    });
  }, [members, projects, personalTasks, notifications, documents, customLogo, themeColor, isFirebaseLoaded]);`;
  
  code = code.replace(syncMatch[0], newSync);
}

fs.writeFileSync('src/context/WorkContext.tsx', code);
