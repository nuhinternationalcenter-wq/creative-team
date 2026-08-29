const fs = require('fs');

let code = fs.readFileSync('src/components/SimpleStepListView.tsx', 'utf8');
code = code.replace(
  /<div className="flex items-center gap-1">\\n\s*<User className="w-3.5 h-3.5" \/>\\n\s*<span>\{step.assignedPerson\}<\/span>\\n\s*<\/div>/g,
  '<div className="flex items-center gap-1"><User className="w-3.5 h-3.5" /><span>{step.assignedPerson} {step.assignedBy ? `(จาก: ${step.assignedBy})` : ""}</span></div>'
);
fs.writeFileSync('src/components/SimpleStepListView.tsx', code);
