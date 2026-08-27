import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  Trash2,
  CheckCheck
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTeamChain: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTeamChain,
}) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications,
    members,
    selectedRole 
  } = useWork();

  const [filterUnread, setFilterUnread] = useState(false);
  const [filterMember, setFilterMember] = useState<string>('all');

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filterUnread && n.read) return false;
    if (filterMember !== 'all' && n.targetRole) {
      if (n.targetRole !== filterMember && !n.message.includes(filterMember)) {
        return false;
      }
    }
    return true;
  });

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'step_unlocked':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      case 'handover':
        return <Send className="w-4 h-4 text-emerald-600" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">การแจ้งเตือนงาน & กำหนดส่ง</h3>
              <p className="text-xs text-slate-300">
                {notifications.filter((n) => !n.read).length} รายการที่ยังไม่ได้อ่าน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={filterUnread}
                onChange={(e) => setFilterUnread(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>เฉพาะยังไม่ได้อ่าน</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                onClick={markAllNotificationsAsRead}
                className="text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>อ่านทั้งหมด</span>
              </button>
              <span>•</span>
              <button
                onClick={clearNotifications}
                className="text-slate-400 hover:text-rose-600"
              >
                ล้าง
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">กรองตามบุคคล:</span>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">👥 ทุกคน (ทั้งหมด)</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.relatedProjectId) {
                    onNavigateToTeamChain();
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border text-xs transition cursor-pointer space-y-1.5 ${
                  notif.read
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-indigo-50/70 border-indigo-200 text-slate-900 ring-1 ring-indigo-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold">
                    {getNotifIcon(notif.type)}
                    <span>{notif.title}</span>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed">{notif.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>{new Date(notif.timestamp).toLocaleString('th-TH')}</span>
                  {notif.targetRole && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      👤 ถึง: {notif.targetRole}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>ไม่มีการแจ้งเตือนในขณะนี้</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
          >
            ปิดหน้าต่างแจ้งเตือน
          </button>
        </div>

      </div>
    </div>
  );
};
