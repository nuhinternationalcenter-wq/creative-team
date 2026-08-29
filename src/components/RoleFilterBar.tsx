import React from 'react';
import { Users, Filter, X, Sparkles } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { getMemberColorStyle } from '../utils/memberColor';
import { isSameMember, isLeeAlias } from '../utils/memberMatch';

export const RoleFilterBar: React.FC = () => {
  const { members, updateMember, selectedRole, setSelectedRole, activeProject, personalTasks } = useWork();

  const getMemberTaskCounts = (memberName: string, memberId?: string) => {
    let chainCount = 0;
    if (activeProject) {
      chainCount = activeProject.steps.filter((s) => {
        const matches = 
          s.assignedRole === memberName || 
          s.assignedPerson === memberName ||
          (isLeeAlias(memberName) && (isLeeAlias(s.assignedRole) || isLeeAlias(s.assignedPerson))) ||
          isSameMember(s.assignedRole, memberName, memberId) ||
          isSameMember(s.assignedPerson, memberName, memberId);
        return matches && s.status === 'in_progress';
      }).length;
    }
    const personalCount = personalTasks.filter((t) => {
      if (!t) return false;
      const assigned = t.assignedTo || '';
      const matches = 
        assigned === memberName ||
        (isLeeAlias(memberName) && isLeeAlias(assigned)) ||
        isSameMember(assigned, memberName, memberId);
      return matches && t.status !== 'completed';
    }).length;
    return { chainCount, personalCount, total: chainCount + personalCount };
  };

  return (
    <div id="role-filter-bar" className="bg-white border-b border-slate-200 py-2 px-2 sm:px-6 lg:px-8 shadow-xs">
      <div className="w-full mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none touch-pan-x">
        
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 whitespace-nowrap">
          <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
            👤
          </span>
          <span>เลือกผู้ใช้งาน:</span>
        </div>

        <div className="flex items-center space-x-1.5 min-w-max">
          {/* All button */}
          <button
            onClick={() => setSelectedRole('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              selectedRole === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ดูทุกคน (ทั้งหมด)</span>
          </button>

          {/* Member chips */}
          {members.map((m) => {
            const counts = getMemberTaskCounts(m.name, m.id);
            const isSelected = selectedRole !== 'all' && (
              selectedRole === m.name || 
              selectedRole === m.id || 
              (isLeeAlias(selectedRole) && isLeeAlias(m.name))
            );

            return (
              <button
                key={m.id}
                onClick={() => setSelectedRole(m.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-900/40 ring-offset-1'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span 
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSelected ? 'bg-white' : ''}`} 
                  style={!isSelected ? { backgroundColor: m.color || getMemberColorStyle(m).hex } : undefined} 
                />
                <span className={isSelected ? 'text-white' : 'text-slate-800'}>{m.name}</span>
                {counts.chainCount > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`} title="งานทีมที่กำลังทำ">
                    {counts.chainCount} 👥
                  </span>
                )}
                {counts.personalCount > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                  }`} title="งานส่วนตัวที่ยังไม่เสร็จ">
                    {counts.personalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedRole !== 'all' && (
          <button
            onClick={() => setSelectedRole('all')}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1 whitespace-nowrap bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition"
          >
            <X className="w-3 h-3" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}

      </div>
    </div>
  );
};
