const fs = require('fs');

let code2 = fs.readFileSync('src/components/PersonalTasksView.tsx', 'utf8');

code2 = code2.replace(
  /<span className="text-\[10px\] font-medium">\{task\.assignedTo\}<\/span>/g,
  '<span className="text-[10px] font-medium">{task.assignedTo} {task.assignedBy ? `(จาก: ${task.assignedBy})` : ""}</span>'
);
fs.writeFileSync('src/components/PersonalTasksView.tsx', code2);
