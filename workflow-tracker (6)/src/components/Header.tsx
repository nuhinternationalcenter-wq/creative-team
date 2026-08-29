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
  CheckSquare,
  FileText,
  ShieldCheck,
  Users,
  Volume2,
  Trash2
} from 'lucide-react';
import { useWork } from '../context/WorkContext';

interface HeaderProps {
  activeTab: 'dashboard' | 'personal' | 'timeline' | 'documents' | 'team_chain';
  setActiveTab: (tab: 'dashboard' | 'personal' | 'timeline' | 'documents' | 'team_chain') => void;
  onOpenCreateTask: () => void; // This will now be explicitly for project tasks, or rename it later. Actually, the user says "อยากปรับแก้จากเมนูนี้" - I will add a new button.
  onOpenCreatePersonalTask: () => void; 
  onOpenCreateProject: () => void;
  onOpenNotifications: () => void;
  onOpenManageMembers?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateTask,
  onOpenCreatePersonalTask,
  onOpenCreateProject,
  onOpenNotifications,
  onOpenManageMembers,
}) => {

  const { 
    members, 
    updateMember,
    selectedRole, 
    setSelectedRole, 
    notifications, 
    resetToDefault,
    clearAllSampleData,
    exportData,
    importData,
    customLogo,
    setCustomLogo,
    themeColor,
    setThemeColor,
    isRealtimeConnected,
    forceSyncFromCloud,
    isSoundEnabled,
    setIsSoundEnabled,
    playNotificationSound
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

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        try {
          const { uploadFileToStorage } = await import('../lib/storage');
          const downloadUrl = await uploadFileToStorage(file, 'logos');
          setCustomLogo(downloadUrl);
        } catch (error: any) {
          console.warn('Firebase storage unavailable/failed, using local Data URL fallback:', error);
          const downloadUrl = await compressImage(file);
          setCustomLogo(downloadUrl);
        }
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
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-200/80 p-1.5 rounded-xl border border-slate-300 shadow-inner">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? `bg-white shadow-sm border border-slate-200/60 font-bold ${
                      themeColor === 'blue' ? 'text-blue-600' :
                      themeColor === 'emerald' ? 'text-emerald-600' :
                      themeColor === 'indigo' ? 'text-indigo-600' :
                      themeColor === 'rose' ? 'text-rose-600' : 'text-black'
                    }`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>แดชบอร์ดสรุป</span>
            </button>

            <button
              id="nav-tab-personal"
              onClick={() => setActiveTab('personal')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'personal'
                  ? `bg-white shadow-sm border border-slate-200/60 font-bold ${
                      themeColor === 'blue' ? 'text-blue-600' :
                      themeColor === 'emerald' ? 'text-emerald-600' :
                      themeColor === 'indigo' ? 'text-indigo-600' :
                      themeColor === 'rose' ? 'text-rose-600' : 'text-black'
                    }`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>งานส่วนตัว</span>
            </button>

            <button
              id="nav-tab-timeline"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'timeline'
                  ? `bg-white shadow-sm border border-slate-200/60 font-bold ${
                      themeColor === 'blue' ? 'text-blue-600' :
                      themeColor === 'emerald' ? 'text-emerald-600' :
                      themeColor === 'indigo' ? 'text-indigo-600' :
                      themeColor === 'rose' ? 'text-rose-600' : 'text-black'
                    }`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>ไทม์ไลน์</span>
            </button>

            <button
              id="nav-tab-documents"
              onClick={() => setActiveTab('documents')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'documents'
                  ? `bg-white shadow-sm border border-slate-200/60 font-bold ${
                      themeColor === 'blue' ? 'text-blue-600' :
                      themeColor === 'emerald' ? 'text-emerald-600' :
                      themeColor === 'indigo' ? 'text-indigo-600' :
                      themeColor === 'rose' ? 'text-rose-600' : 'text-black'
                    }`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ข้อมูลงาน</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Realtime Sync Status Indicator */}
            <button
              onClick={forceSyncFromCloud}
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer shadow-2xs shrink-0 ${
                isRealtimeConnected
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
              title="สถานะเชื่อมต่อคลาวด์เรียลไทม์ (คลิกเพื่อรีเฟรชข้อมูลล่าสุด)"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="hidden sm:inline">{isRealtimeConnected ? 'เรียลไทม์' : 'กำลังดึงข้อมูล'}</span>
              <RefreshCw className="w-3.5 h-3.5 text-slate-500 hover:text-slate-800 shrink-0" />
            </button>

            {/* Manage Roles & Permissions Button */}
            {onOpenManageMembers && (
              <button
                id="header-manage-members-btn"
                onClick={onOpenManageMembers}
                className="px-2 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition cursor-pointer flex items-center space-x-1 shrink-0 shadow-2xs"
                title="จัดการสิทธิ์สมาชิก บทบาท และผู้อนุมัติ"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs hidden sm:inline">จัดการสิทธิ์</span>
              </button>
            )}

            {/* Active User Perspective Dropdown */}
            <div className="relative flex items-center shrink-0">
              <div className="flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs text-slate-700 transition max-w-[125px] sm:max-w-none">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-500 shrink-0" />
                <span className="text-slate-400 mr-1 hidden md:inline">มุมมอง:</span>
                <select
                  id="role-perspective-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  aria-label="เลือกมุมมองผู้ใช้งาน"
                  className="bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer pr-1 truncate text-xs"
                >
                  <option value="all" className="bg-white text-slate-900">✨ ทุกคน (View All)</option>
                  
                  {members.map((m) => (
                    <option key={m.id} value={m.name} className="bg-white text-slate-900">
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notification Bell */}
            <button
              id="header-notification-btn"
              onClick={onOpenNotifications}
              className="relative p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer shrink-0"
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
            <div className="relative shrink-0">
              <button
                id="header-settings-toggle"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 transition cursor-pointer flex items-center space-x-1"
                title="ตั้งค่าธีมและข้อมูล"
              >
                <Layers className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs hidden sm:inline">ตั้งค่าระบบ</span>
              </button>

              {showSettingsMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSettingsMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-slate-200 shadow-xl py-3 z-50 text-xs">
                    <div className="px-4 pb-2 border-b border-slate-100 mb-2">
                    <h3 className="font-bold text-sm text-slate-800">ตั้งค่าระบบ (Settings)</h3>
                  </div>

                  {/* Manage Roles Quick Menu */}
                  {onOpenManageMembers && (
                    <div className="px-2 mb-2">
                      <button
                        onClick={() => {
                          onOpenManageMembers();
                          setShowSettingsMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center space-x-2 transition cursor-pointer font-bold"
                      >
                        <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                        <div>
                          <div className="text-xs">จัดการสิทธิ์ & บทบาทสมาชิก</div>
                          <div className="text-[10px] text-indigo-500 font-normal">กำหนดสิทธิ์ Admin / ผู้อนุมัติ / ทีม</div>
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="px-4 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    เสียงและการแจ้งเตือน
                  </div>
                  <div className="px-2 mb-2">
                    <div className="flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition group">
                      <div className="flex items-center space-x-2">
                        <Volume2 className={`w-4 h-4 ${isSoundEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="font-medium">เสียงแจ้งเตือนงาน</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSoundEnabled(!isSoundEnabled);
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          isSoundEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            isSoundEnabled ? 'translate-x-4.5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playNotificationSound(true);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[10px] text-indigo-600 hover:text-indigo-700 hover:underline transition font-bold cursor-pointer"
                    >
                      ▶️ ทดสอบเสียงแจ้งเตือน
                    </button>
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
                  <div className="px-4 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    ล้างข้อมูล / เริ่มต้นใหม่
                  </div>
                  <div className="px-2 space-y-1">
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการล้างข้อมูลงานตัวอย่างทั้งหมด (คงรายชื่อทีมไว้) เพื่อเริ่มกรอกงานจริงใช่หรือไม่?')) {
                          clearAllSampleData(true);
                          setShowSettingsMenu(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-amber-700 bg-amber-50/70 hover:bg-amber-100/80 flex items-center space-x-2 transition font-medium text-xs"
                    >
                      <Trash2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold">ล้างงานตัวอย่าง (เก็บรายชื่อทีม)</div>
                        <div className="text-[10px] text-amber-600/80">ลบงาน SS26 และงานส่วนตัวออก ให้กระดานว่าง</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการล้างข้อมูลทั้งหมดรวมรายชื่อทีม (กระดานเปล่า 100%) ใช่หรือไม่?')) {
                          clearAllSampleData(false);
                          setShowSettingsMenu(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center space-x-2 transition font-medium text-xs"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>ล้างทั้งหมดรวมรายชื่อทีม (กระดานเปล่า)</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการโหลดแม่แบบข้อมูลตัวอย่างเริ่มต้น (SS26 Collection) กลับมาหรือไม่?')) {
                          resetToDefault();
                          setShowSettingsMenu(false);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center space-x-2 transition font-medium text-[11px]"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>โหลดแม่แบบตัวอย่าง (SS26 Collection)</span>
                    </button>
                  </div>
                </div>
              </>
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
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium cursor-pointer ${
              activeTab === 'documents' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📄 ข้อมูลงาน
          </button>
        </div>
      </div>
    </header>
  );
};
