const fs = require('fs');
let code = fs.readFileSync('src/components/CreateTaskModal.tsx', 'utf8');

// 1. Add state for assignedBy
code = code.replace(
  /const \[assignedTo, setAssignedTo\] = useState\(\(\) => \{[\s\S]*?\n  \}\);/,
  "const [assignedTo, setAssignedTo] = useState(() => {\n    return selectedRole === 'all' ? (members[0]?.name || 'มีมี่') : selectedRole;\n  });\n  const [assignedBy, setAssignedBy] = useState('');"
);

// 2. Add assignedBy to newStepData
code = code.replace(
  /assignedTo,\n\s*dueDate,/,
  "assignedTo,\n      assignedBy: assignedBy || undefined,\n      dueDate,"
);

// 3. Add UI field
const uiReplacement = `
            {/* Assigned By */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <User className="w-3.5 h-3.5 text-blue-500" /> ผู้มอบหมายงาน (ตัวเลือก)
              </label>
              <select
                value={assignedBy}
                onChange={(e) => setAssignedBy(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white outline-none"
              >
                <option value="">-- ไม่ระบุ --</option>
                {members.map((m) => (
                  <option key={'assigner-'+m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>`;

code = code.replace(/<\/select>\n\s*<\/div>\n\s*<\/div>/, "</select>\n            </div>\n" + uiReplacement);

fs.writeFileSync('src/components/CreateTaskModal.tsx', code);
