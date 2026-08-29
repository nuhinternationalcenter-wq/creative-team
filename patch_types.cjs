const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  'assignedRole: string; // e.g. "มีมี่"',
  'assignedBy?: string; // ผู้มอบหมายงาน\n  assignedRole: string; // e.g. "มีมี่"'
);

code = code.replace(
  'assignedTo: string;',
  'assignedTo: string;\n  assignedBy?: string;'
);

fs.writeFileSync('src/types.ts', code);
