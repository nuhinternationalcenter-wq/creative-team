const fs = require('fs');
let code = fs.readFileSync('src/components/CreateStepModal.tsx', 'utf8');

// 1. Add state for assignedBy
code = code.replace(
  /const \[assignedRole, setAssignedRole\] = useState[\s\S]*?;/,
  'const [assignedRole, setAssignedRole] = useState(() => defaultRole || (members[0]?.name || "ฟานี"));\n  const [assignedBy, setAssignedBy] = useState("");'
);

// 2. Add assignedBy to newStepData
code = code.replace(
  /assignedRole,\n\s*assignedPerson: assignedPersonName,/,
  'assignedBy: assignedBy || undefined,\n      assignedRole,\n      assignedPerson: assignedPersonName,'
);

// 3. Add UI field
const uiReplacement = `
          {/* Assigned By */}
          <div className="space-y-1 mt-2">
            <label className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>ผู้มอบหมายงาน (ถ้ามี):</span>
            </label>
            <select
              value={assignedBy}
              onChange={(e) => setAssignedBy(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white font-medium outline-none"
            >
              <option value="">-- ไม่ระบุ --</option>
              {members.map((m) => (
                <option key={'assigner-'+m.id} value={m.name}>
                  👤 {m.name} ({m.role || m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">`;

code = code.replace(/<div className="space-y-1">\s*<label className="block text-xs font-bold text-slate-700">\s*ชื่องาน \/ กิจกรรมที่ต้องทำ/, uiReplacement + '\n            <label className="block text-xs font-bold text-slate-700">\n              ชื่องาน / กิจกรรมที่ต้องทำ');

fs.writeFileSync('src/components/CreateStepModal.tsx', code);
