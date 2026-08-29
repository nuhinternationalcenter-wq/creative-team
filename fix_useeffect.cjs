const fs = require('fs');
let code = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

const regex = /\/\/ Firestore real-time sync with onSnapshot\s*useEffect\(\(\) => \{[\s\S]*?return \(\) => unsubscribe\(\);\s*\}\);\s*\}, \[\]\);/m;

const correctCode = `// Firestore real-time sync with onSnapshot
  useEffect(() => {
    let unsubscribe: any;
    import('../lib/sync').then(({ subscribeToWorkspace }) => {
      unsubscribe = subscribeToWorkspace((data, hasPendingWrites) => {
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
            customLogo: data.customLogo !== undefined ? data.customLogo : '',
            themeColor: data.themeColor !== undefined ? data.themeColor : 'slate'
          };
          
          if (migrated.members) setMembers(migrated.members);
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
  }, []);`;

if (regex.test(code)) {
  code = code.replace(regex, correctCode);
  fs.writeFileSync('src/context/WorkContext.tsx', code);
  console.log("Fixed.");
} else {
  console.log("Regex not found.");
}
