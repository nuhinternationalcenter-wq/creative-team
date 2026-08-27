import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Trash2, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ListTodo,
  User,
  Send,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { PersonalTask, PriorityLevel, TaskAttachment } from '../types';
import { PersonalTaskHandoverModal } from './PersonalTaskHandoverModal';
import { AttachmentManager } from './AttachmentManager';

interface PersonalTasksViewProps {
  onOpenCreateTask: () => void;
}

export const PersonalTasksView: React.FC<PersonalTasksViewProps> = ({
  onOpenCreateTask,
}) => {
  const { 
    personalTasks, 
    updatePersonalTask, 
    deletePersonalTask, 
    toggleChecklistItem,
    selectedRole,
    members,
    addPersonalTaskLog
  } = useWork();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed' | 'handover'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [quickLogText, setQuickLogText] = useState('');
  const [quickLogMins, setQuickLogMins] = useState(30);

  // Handover modal state
  const [handoverModalTask, setHandoverModalTask] = useState<PersonalTask | null>(null);

  // Filter tasks
  const filteredTasks = personalTasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.handedOverFrom && t.handedOverFrom.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.handedOverTo && t.handedOverTo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = selectedRole === 'all' || t.assignedTo.includes(selectedRole);
    
    let matchesStatus = true;
    if (statusFilter === 'handover') {
      matchesStatus = Boolean(t.handedOverFrom || t.handedOverTo);
    } else if (statusFilter !== 'all') {
      matchesStatus = t.status === statusFilter;
    }

    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">🔥 ด่วนมาก (Urgent)</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">⚡ สำคัญสูง (High)</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">ปานกลาง (Medium)</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">ทั่วไป (Low)</span>;
    }
  };

  const handleAddLog = (taskId: string) => {
    if (!quickLogText.trim()) return;
    const task = personalTasks.find((t) => t.id === taskId);
    if (!task) return;

    addPersonalTaskLog(taskId, {
      author: task.assignedTo,
      text: quickLogText.trim(),
      durationMinutes: Number(quickLogMins) || 0,
      type: 'log',
    });

    setQuickLogText('');
  };

  const completedCount = personalTasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = personalTasks.filter((t) => t.status === 'in_progress').length;
  const todoCount = personalTasks.filter((t) => t.status === 'todo').length;
  const handoverCount = personalTasks.filter((t) => t.handedOverFrom || t.handedOverTo).length;

  return (
    <div id="personal-tasks-section" className="space-y-6">
      
      {/* Handover Modal */}
      <PersonalTaskHandoverModal
        task={handoverModalTask}
        isOpen={Boolean(handoverModalTask)}
        onClose={() => setHandoverModalTask(null)}
      />

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">บันทึกงานส่วนตัว & ส่งต่องาน (Personal Tasks & Handover)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            จัดการงานประจำวัน เลือกส่งต่องานให้เพื่อนร่วมทีม พร้อมระบบแจ้งเตือนอัตโนมัติ
          </p>
        </div>

        {/* Quick Add Button */}
        <button
          id="add-personal-task-btn"
          onClick={onOpenCreateTask}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มงานส่วนตัวใหม่</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search */}
          <div className="flex items-center space-x-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหางานส่วนตัว, แท็ก, ชื่อผู้รับผิดชอบ, คนส่งต่อ..."
              className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({personalTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('todo')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === 'todo' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รอดำเนินการ ({todoCount})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === 'in_progress' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              กำลังทำ ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === 'completed' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เสร็จแล้ว ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('handover')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
                statusFilter === 'handover' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3 h-3 text-indigo-500" />
              <span>งานส่งต่อ ({handoverCount})</span>
            </button>
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-2 text-xs">
            <label htmlFor="priority-filter-select" className="text-slate-500 font-medium">ความสำคัญ:</label>
            <select
              id="priority-filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="กรองความสำคัญของงาน"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">ทุกระดับ</option>
              <option value="urgent">🔥 ด่วนมาก (Urgent)</option>
              <option value="high">⚡ สำคัญสูง (High)</option>
              <option value="medium">ปานกลาง (Medium)</option>
              <option value="low">ทั่วไป (Low)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isExpanded = selectedTaskId === task.id;
            const completedChecklistCount = task.checklist.filter((c) => c.done).length;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border transition shadow-sm hover:border-slate-300 overflow-hidden ${
                  isCompleted ? 'border-slate-200 opacity-80' : 'border-slate-200'
                }`}
              >
                {/* Task Item Main Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Checkbox & Title */}
                  <div className="flex items-start space-x-3.5 flex-1">
                    <button
                      onClick={() =>
                        updatePersonalTask(task.id, {
                          status: isCompleted ? 'todo' : 'completed',
                        })
                      }
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-blue-500 bg-white'
                      }`}
                      title={isCompleted ? 'คลิกเพื่อเปลี่ยนเป็นยังไม่เสร็จ' : 'คลิกเพื่อเสร็จงาน'}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          👤 {task.assignedTo}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {task.category}
                        </span>
                        {getPriorityBadge(task.priority)}

                        {/* Handover Badges */}
                        {task.handedOverFrom && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium flex items-center space-x-1">
                            <span>📥 ส่งต่อมาจาก: <strong>{task.handedOverFrom}</strong></span>
                          </span>
                        )}
                        {task.handedOverTo && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center space-x-1">
                            <span>📤 ส่งต่อไปให้: <strong>{task.handedOverTo}</strong></span>
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold text-slate-900 leading-snug ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                      )}

                      {/* Handover Comment Preview */}
                      {task.handoverComment && (
                        <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-950">โน้ตส่งมอบ:</span> {task.handoverComment}
                          </div>
                        </div>
                      )}

                      {/* Tags & Subtasks count */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {task.checklist.length > 0 && (
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <ListTodo className="w-3 h-3 text-blue-600" />
                            <span>
                              เช็คลิสต์ {completedChecklistCount}/{task.checklist.length}
                            </span>
                          </span>
                        )}

                        {task.spentMinutes && task.spentMinutes > 0 && (
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>ใช้ไป {task.spentMinutes} นาที</span>
                          </span>
                        )}

                        {/* Attachments Mini Bar */}
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1 pt-1">
                            {task.attachments.map((att) => (
                              <span
                                key={att.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (att.type === 'link') {
                                    window.open(att.url, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium border border-slate-200"
                                title={att.name}
                              >
                                {att.type === 'image' ? (
                                  <ImageIcon className="w-2.5 h-2.5 text-pink-600" />
                                ) : att.type === 'link' ? (
                                  <LinkIcon className="w-2.5 h-2.5 text-blue-600" />
                                ) : (
                                  <FileText className="w-2.5 h-2.5 text-emerald-600" />
                                )}
                                <span className="truncate max-w-[80px]">{att.name}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {task.tags.map((tg, i) => (
                          <span key={i} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Due Date & Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center space-x-1 text-xs text-slate-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>กำหนด: {task.dueDate}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        สถานะ: {task.status === 'completed' ? 'เสร็จแล้ว' : task.status === 'in_progress' ? 'กำลังทำ' : 'รอดำเนินการ'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      
                      {/* HANDOVER BUTTON */}
                      <button
                        onClick={() => setHandoverModalTask(task)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/20 flex items-center space-x-1.5 transition cursor-pointer"
                        title="ส่งต่องานนี้ให้เพื่อนร่วมทีม"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">ส่งต่องาน</span>
                      </button>

                      <button
                        onClick={() => setSelectedTaskId(isExpanded ? null : task.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center space-x-1 transition cursor-pointer"
                      >
                        <span>รายละเอียด</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('คุณต้องการลบงานส่วนตัวนี้หรือไม่?')) {
                            deletePersonalTask(task.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="ลบงาน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>

                {/* Expanded Details & Checklist */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-4 text-xs animate-in fade-in duration-150">
                    
                    {/* Handover Callout Inside details */}
                    <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-indigo-950 flex items-center space-x-1">
                          <Send className="w-3.5 h-3.5 text-indigo-600" />
                          <span>ต้องการส่งต่องานนี้ให้เพื่อนร่วมทีม?</span>
                        </div>
                        <p className="text-[11px] text-indigo-700 mt-0.5">
                          เลือกคนที่จะรับผิดชอบต่อ ระบบจะแจ้งเตือนไปยังผู้รับทันที
                        </p>
                      </div>
                      <button
                        onClick={() => setHandoverModalTask(task)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition cursor-pointer"
                      >
                        เปิดหน้าต่างส่งต่อ
                      </button>
                    </div>
                    
                    {/* Checklist */}
                    {task.checklist.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-slate-700 uppercase tracking-wider block">รายการเช็คลิสต์ย่อย:</span>
                        <div className="space-y-1.5">
                          {task.checklist.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-center space-x-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition"
                            >
                              <input
                                type="checkbox"
                                checked={item.done}
                                onChange={() => toggleChecklistItem(task.id, item.id)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                              />
                              <span className={`text-slate-800 ${item.done ? 'line-through text-slate-400' : ''}`}>
                                {item.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <AttachmentManager
                        attachments={task.attachments || []}
                        onChange={(newAttachments: TaskAttachment[]) => {
                          updatePersonalTask(task.id, { attachments: newAttachments });
                        }}
                      />
                    </div>

                    {/* Notes */}
                    {task.notes && (
                      <div className="space-y-1">
                        <span className="font-bold text-slate-700 uppercase tracking-wider block">บันทึกเพิ่มเติม:</span>
                        <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 whitespace-pre-wrap">
                          {task.notes}
                        </p>
                      </div>
                    )}

                    {/* Quick Work Log recorder */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 uppercase tracking-wider block">
                        ⏱️ บันทึกความคืบหน้า & เวลาทำงานสำหรับงานนี้:
                      </span>
                      
                      {/* Past logs list */}
                      {task.workLogs && task.workLogs.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {task.workLogs.map((log) => (
                            <div key={log.id} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex items-center justify-between">
                              <span className="text-slate-800">{log.text}</span>
                              <span className="text-slate-400">+{log.durationMinutes} นาที ({new Date(log.timestamp).toLocaleTimeString('th-TH')})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={quickLogText}
                          onChange={(e) => setQuickLogText(e.target.value)}
                          placeholder="บันทึกสิ่งที่ทำเสร็จแล้ว..."
                          className="flex-1 text-xs p-2 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="15"
                            value={quickLogMins}
                            onChange={(e) => setQuickLogMins(Number(e.target.value))}
                            placeholder="นาที"
                            className="w-20 text-xs p-2 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddLog(task.id)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition shrink-0"
                          >
                            + บันทึกเวลา
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">ไม่พบรายการงานส่วนตัว</h3>
            <p className="text-xs text-slate-500 mt-1">กดปุ่ม "+ เพิ่มงานส่วนตัวใหม่" เพื่อเริ่มต้นบันทึกงาน</p>
          </div>
        )}
      </div>

    </div>
  );
};
