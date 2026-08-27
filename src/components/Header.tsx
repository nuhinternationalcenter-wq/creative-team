import React, { useState } from 'react';
import { 
  GitMerge, 
  CheckCircle2, 
  Bell, 
  Plus, 
  UserCheck, 
  RefreshCw, 
  Download, 
  Upload,
  Layers,
  Calendar,
  LayoutDashboard,
  CheckSquare
} from 'lucide-react';
import { useWork } from '../context/WorkContext';

interface HeaderProps {
  activeTab: 'dashboard' | 'personal' | 'timeline';
  setActiveTab: (tab: 'dashboard' | 'personal' | 'timeline') => void;
  onOpenCreateTask: () => void;
  onOpenCreateProject: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateTask,
  onOpenCreateProject,
  onOpenNotifications,
}) => {
  const { 
    members, 
    selectedRole, 
    setSelectedRole, 
    notifications, 
    resetToDefault,
    exportData,
    importData,
    customLogo,
    setCustomLogo,
    themeColor,
    setThemeColor
  } = useWork();

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            const success = importData(content);
            if (success) {
              alert('นำเข้าข้อมูลสำเร็จแล้ว');
            } else {
              alert('รูปแบบไฟล์ไม่ถูกต้อง');
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setCustomLogo(result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <header id="main-app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 shadow-2xs font-prompt">
      {/* Top Banner / Navigation */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 flex items-center justify-center text-white font-semibold overflow-hidden ${
              customLogo 
                ? 'bg-transparent' 
                : `rounded-xl shadow-2xs ${
                    themeColor === 'blue' ? 'bg-blue-600' :
                    themeColor === 'emerald' ? 'bg-emerald-600' :
                    themeColor === 'indigo' ? 'bg-indigo-600' :
                    themeColor === 'rose' ? 'bg-rose-600' : 'bg-black'
                  }`
            }`}>
              {customLogo ? (
                <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <GitMerge className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900">Creative</span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? `bg-white shadow-sm font-bold ${
                      themeColor === 'blue' ? 'text-blue-600' :
                      themeColor === 'emerald' ? 'text-emerald-600' :
                      themeColor === 'indigo' ? 'text-indigo-600' :
                      themeColor === 'rose' ? 'text-rose-600' : 'text-black'
                    }`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>แดชบอร์ดสรุป</span>
            </button>

            <button
              id="nav-tab-personal"
              onClick={() => setActiveTab('personal')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === 'personal'
                  ? `bg-white shadow-sm font-bold ${
                      themeColor === 'blue' ? 'text-blue-600' :
                      themeColor === 'emerald' ? 'text-emerald-600' :
                      themeColor === 'indigo' ? 'text-indigo-600' :
                      themeColor === 'rose' ? 'text-rose-600' : 'text-black'
                    }`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>งานส่วนตัว</span>
            </button>

            <button
              id="nav-tab-timeline"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === 'timeline'
                  ? `bg-white shadow-sm font-bold ${
                      themeColor === 'blue' ? 'text-blue-600' :
                      themeColor === 'emerald' ? 'text-emerald-600' :
                      themeColor === 'indigo' ? 'text-indigo-600' :
                      themeColor === 'rose' ? 'text-rose-600' : 'text-black'
                    }`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>ไทม์ไลน์</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {/* Active User Perspective Dropdown */}
            <div className="relative">
              <div className="flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 transition">
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                <span className="text-slate-400 mr-1 hidden sm:inline">มุมมอง:</span>
                <select
                  id="role-perspective-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  aria-label="เลือกมุมมองผู้ใช้งาน"
                  className="bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all" className="bg-white text-slate-900">✨ ทุกบทบาท (ทุกคน)</option>
                  <optgroup label="สมาชิกในทีม" className="bg-white text-slate-900 font-semibold">
                    {members.map((m) => (
                      <option key={m.id} value={m.name} className="bg-white text-slate-900">
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Notification Bell */}
            <button
              id="header-notification-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
              title="การแจ้งเตือนงานและกำหนดส่ง"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Backup & Settings dropdown toggle */}
            <div className="relative">
              <button
                id="header-settings-toggle"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 transition cursor-pointer flex items-center space-x-1.5"
                title="ตั้งค่าธีมและข้อมูล"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span className="text-xs hidden sm:inline">ตั้งค่าระบบ</span>
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-3 z-50 text-xs">
                  <div className="px-4 pb-2 border-b border-slate-100 mb-2">
                    <h3 className="font-bold text-sm text-slate-800">ตั้งค่าระบบ (Settings)</h3>
                  </div>

                  <div className="px-4 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    ปรับแต่งธีม & โลโก้
                  </div>
                  
                  <div className="px-2">
                    <button
                      onClick={() => {
                        handleLogoUpload();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center space-x-2 transition cursor-pointer font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      <span>อัปโหลดโลโก้เว็บ (Upload Logo)</span>
                    </button>
                    {customLogo && (
                      <button
                        onClick={() => {
                          setCustomLogo('');
                          setShowSettingsMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition cursor-pointer font-medium mt-1"
                      >
                        <span>🗑️ ลบโลโก้และใช้ค่าเริ่มต้น</span>
                      </button>
                    )}
                  </div>

                  <div className="px-4 pt-3 pb-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    สีธีมหลัก (Theme Color)
                  </div>
                  <div className="px-4 pb-3 flex items-center space-x-3">
                    {[
                      { id: 'black', color: 'bg-black', label: 'Black' },
                      { id: 'blue', color: 'bg-blue-600', label: 'Blue' },
                      { id: 'emerald', color: 'bg-emerald-600', label: 'Emerald' },
                      { id: 'indigo', color: 'bg-indigo-600', label: 'Indigo' },
                      { id: 'rose', color: 'bg-rose-600', label: 'Rose' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setThemeColor(th.id)}
                        className={`w-7 h-7 rounded-full shadow-sm ${th.color} transition cursor-pointer flex items-center justify-center ${
                          themeColor === th.id ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                        title={th.label}
                      >
                        {themeColor === th.id && <CheckCircle2 className="w-4 h-4 text-white opacity-80" />}
                      </button>
                    ))}
                  </div>

                  <div className="my-2 border-t border-slate-100"></div>

                  <div className="px-4 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    จัดการข้อมูลโปรเจกต์
                  </div>
                  <div className="px-2">
                    <button
                      onClick={() => {
                        onOpenCreateProject();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition font-medium"
                    >
                      <Plus className="w-4 h-4 text-slate-500" />
                      <span>สร้างโปรเจกต์งานทีมใหม่</span>
                    </button>
                    <button
                      onClick={() => {
                        exportData();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center space-x-2 transition font-medium mt-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>ส่งออกข้อมูล (Export JSON)</span>
                    </button>
                    <button
                      onClick={() => {
                        handleImportClick();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 transition font-medium mt-1"
                    >
                      <Upload className="w-4 h-4" />
                      <span>นำเข้าข้อมูล (Import JSON)</span>
                    </button>
                  </div>
                  <div className="my-2 border-t border-slate-100"></div>
                  <div className="px-2">
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นแม่แบบเริ่มต้นหรือไม่?')) {
                          resetToDefault();
                          setShowSettingsMenu(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้น</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-100 overflow-x-auto space-x-1 text-xs">
          <button
            onClick={() => setActiveTab('team_chain')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium cursor-pointer ${
              activeTab === 'team_chain' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            👥 งานทีม
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📊 แดชบอร์ด
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium cursor-pointer ${
              activeTab === 'personal' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📝 ส่วนตัว
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium cursor-pointer ${
              activeTab === 'timeline' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📅 ปฏิทิน
          </button>
        </div>
      </div>
    </header>
  );
};
