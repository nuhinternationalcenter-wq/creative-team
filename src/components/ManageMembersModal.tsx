import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Sparkles,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Crown,
  User,
  ShieldAlert
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { TeamMember, RoleLevel } from '../types';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { label: 'กุหลาบ (Rose)', bg: 'bg-rose-500', color: '#f43f5e' },
  { label: 'ฟ้า (Blue)', bg: 'bg-blue-500', color: '#3b82f6' },
  { label: 'ส้ม/อำพัน (Amber)', bg: 'bg-amber-500', color: '#f59e0b' },
  { label: 'มรกต (Emerald)', bg: 'bg-emerald-500', color: '#10b981' },
  { label: 'คราม (Indigo)', bg: 'bg-indigo-500', color: '#6366f1' },
  { label: 'ชมพู (Pink)', bg: 'bg-pink-500', color: '#ec4899' },
  { label: 'ฟ้าคราม (Cyan)', bg: 'bg-cyan-500', color: '#06b6d4' },
  { label: 'ม่วง (Violet)', bg: 'bg-violet-500', color: '#8b5cf6' },
  { label: 'ม่วงเข้ม (Purple)', bg: 'bg-purple-500', color: '#a855f7' },
  { label: 'เขียวมิ้นต์ (Teal)', bg: 'bg-teal-500', color: '#14b8a6' },
  { label: 'เทาเข้ม (Slate)', bg: 'bg-slate-700', color: '#334155' },
];

const GRADIENT_PRESETS = [
  { label: 'ใช้สีเดียว (Solid Color)', gradient: '' },
  { label: 'รุ้ง/พระอาทิตย์ตก (Sunset)', gradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' },
  { label: 'มหาสมุทร (Ocean Breeze)', gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
  { label: 'มรกตประกาย (Emerald Shine)', gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' },
  { label: 'เนบิวลา (Purple Nebula)', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
  { label: 'โรสโกลด์ (Rose Gold)', gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
  { label: 'ไซเบอร์นีออน (Cyber Neon)', gradient: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' },
  { label: 'ทไวไลท์ (Twilight)', gradient: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)' },
];

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { members, addMember, updateMember, deleteMember, reorderMember } = useWork();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [roleLevel, setRoleLevel] = useState<RoleLevel>('member');
  const [canApprove, setCanApprove] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].gradient);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setIsAddingNew(false);
    setName(member.name);
    setRole(member.role);
    setDepartment(member.department);
    setRoleLevel(member.roleLevel || (member.canApprove ? 'approver' : 'member'));
    setCanApprove(!!member.canApprove || member.roleLevel === 'admin' || member.roleLevel === 'approver');
    setAvatarUrl(member.avatarUrl || '');
    const matchedPreset = COLOR_PRESETS.find((c) => c.bg === member.avatarBg) || COLOR_PRESETS[0];
    setSelectedColor(matchedPreset);
    setCustomHex(member.color || '#3b82f6');
    setSelectedGradient(member.gradient || '');
  };

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setName('');
    setRole('');
    setDepartment('Creative & Media');
    setRoleLevel('member');
    setCanApprove(false);
    setAvatarUrl('');
    const randomPreset = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];
    setSelectedColor(randomPreset);
    setCustomHex(randomPreset.color);
    setSelectedGradient('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCanApprove = roleLevel === 'admin' || roleLevel === 'approver' || canApprove;

    if (isAddingNew) {
      addMember({
        name: name.trim(),
        role: role.trim() || 'ทีมงาน',
        department: department.trim() || 'ทั่วไป',
        avatarBg: selectedColor.bg,
        color: customHex || selectedColor.color,
        gradient: selectedGradient || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        roleLevel,
        canApprove: finalCanApprove,
      });
      setIsAddingNew(false);
    } else if (editingId) {
      updateMember(editingId, {
        name: name.trim(),
        role: role.trim() || 'ทีมงาน',
        department: department.trim() || 'ทั่วไป',
        avatarBg: selectedColor.bg,
        color: customHex || selectedColor.color,
        gradient: selectedGradient || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        roleLevel,
        canApprove: finalCanApprove,
      });
      setEditingId(null);
    }

    setName('');
    setRole('');
    setDepartment('');
    setRoleLevel('member');
    setCanApprove(false);
    setSelectedGradient('');
    setAvatarUrl('');
  };

  const handleDelete = (id: string) => {
    deleteMember(id);
    setDeleteConfirmId(null);
    if (editingId === id) setEditingId(null);
  };

  const handleToggleApproveQuick = (member: TeamMember) => {
    const nextApproved = !member.canApprove;
    updateMember(member.id, {
      canApprove: nextApproved,
      roleLevel: nextApproved ? (member.roleLevel === 'admin' ? 'admin' : 'approver') : 'member'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">จัดการสิทธิ์ & สมาชิกในทีม (Roles & Permissions)</h3>
              <p className="text-xs text-slate-300">กำหนดระดับสิทธิ์ผู้อนุมัติ เพิ่ม/ลบสมาชิก และจัดการบทบาทในทีม</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Permissions Overview Box */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-indigo-950 flex items-center space-x-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>ระดับสิทธิ์ในระบบ (Role Permissions):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 bg-white rounded-xl border border-indigo-100 space-y-1">
                <span className="font-bold text-slate-900 flex items-center space-x-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin (ผู้ดูแล)</span>
                </span>
                <p className="text-slate-600">จัดการทีม สิทธิ์ อนุมัติงาน และแก้ไขได้ทุกอย่าง</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-indigo-100 space-y-1">
                <span className="font-bold text-slate-900 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Approver (ผู้อนุมัติ)</span>
                </span>
                <p className="text-slate-600">ตรวจ อนุมัติ ส่งกลับแก้ไขงานทีมและงานส่วนตัว</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-indigo-100 space-y-1">
                <span className="font-bold text-slate-900 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Member (สมาชิก)</span>
                </span>
                <p className="text-slate-600">ปฏิบัติงาน ส่งต่องาน และส่งขออนุมัติ</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              รายชื่อสมาชิกและสิทธิ์ในทีม ({members.length} คน)
            </span>
            {!isAddingNew && !editingId && (
              <button
                type="button"
                onClick={startAdd}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มสมาชิก / กำหนดสิทธิ์ใหม่</span>
              </button>
            )}
          </div>

          {/* Form when adding or editing */}
          {(isAddingNew || editingId) && (
            <form onSubmit={handleSave} className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
                <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{isAddingNew ? 'เพิ่มสมาชิกใหม่และกำหนดสิทธิ์' : 'แก้ไขข้อมูล & สิทธิ์ของสมาชิก'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>

              {/* Role Level & Approval Rights Selection */}
              <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-800">ระดับสิทธิ์ (Role Level) *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleLevel('admin');
                      setCanApprove(true);
                    }}
                    className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                      roleLevel === 'admin'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRoleLevel('approver');
                      setCanApprove(true);
                    }}
                    className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                      roleLevel === 'approver'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>ผู้อนุมัติ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRoleLevel('member');
                      setCanApprove(false);
                    }}
                    className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                      roleLevel === 'member'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>สมาชิกทั่วไป</span>
                  </button>
                </div>

                <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canApprove || roleLevel === 'admin' || roleLevel === 'approver'}
                    onChange={(e) => setCanApprove(e.target.checked)}
                    disabled={roleLevel === 'admin' || roleLevel === 'approver'}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-700 font-medium">
                    อนุญาตให้สมาชิกคนนี้สามารถตรวจและกดอนุมัติงานได้ (Can Approve Tasks)
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">ชื่อสมาชิก / ชื่อเรียก *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Mr Lee, มีมี่, ฟานี, นุฮา"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">บทบาท / ตำแหน่งหน้าที่</label>
                  <input
                    type="text"
                    placeholder="เช่น Photo Editor, ตัดรูป/รีทัช, การตลาด"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">แผนก / สายงาน</label>
                  <input
                    type="text"
                    placeholder="เช่น Post-Production, Design, Marketing"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">สีประจำตัว & ดูดสี (Tag Color & Picker)</label>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 pt-1">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.bg}
                        type="button"
                        onClick={() => {
                          setSelectedColor(preset);
                          setCustomHex(preset.color);
                        }}
                        className={`w-6 h-6 rounded-full ${preset.bg} flex items-center justify-center text-white transition ${
                          selectedColor.bg === preset.bg ? 'ring-2 ring-slate-900 ring-offset-1 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        {selectedColor.bg === preset.bg && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    ))}
                    {/* Custom Color Picker */}
                    <div className="flex items-center space-x-1 pl-2 border-l border-slate-300">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => {
                          setCustomHex(e.target.value);
                        }}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                        title="คลิกเพื่อเลือกสีหรือดูดสี (Custom / Eyedropper)"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">{customHex}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700">การไล่สีหัวตาราง (Gradient Header Style - ทางเลือก)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {GRADIENT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedGradient(preset.gradient)}
                        className={`p-2 rounded-xl text-left border text-[11px] font-medium transition flex items-center justify-between ${
                          selectedGradient === preset.gradient
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate pr-1">{preset.label}</span>
                        {preset.gradient ? (
                          <div className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ background: preset.gradient }} />
                        ) : (
                          <div className="w-4 h-4 rounded-full shrink-0 bg-slate-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700">รูปโปรไฟล์ (Avatar Profile Image)</label>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-slate-500">{name ? name.slice(0, 2) : '📷'}</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const { uploadFileToStorage } = await import('../lib/storage');
                            const downloadUrl = await uploadFileToStorage(file, 'avatars');
                            setAvatarUrl(downloadUrl);
                          } catch (error: any) {
                            console.error(error);
                            if (error.message === 'unauthorized' || error.code === 'storage/unauthorized') {
                               alert('⚠️ ไม่สามารถอัปโหลดรูปโปรไฟล์ได้: กรุณาไปที่ Firebase Console > Storage และตั้งค่า Rules เป็น allow read, write: if true;');
                            } else {
                               alert('เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์');
                            }
                          }
                        }
                      }}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="text-rose-600 hover:underline text-[11px]"
                      >
                        ลบรูป
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {isAddingNew ? 'บันทึกสมาชิก & สิทธิ์ใหม่' : 'บันทึกการแก้ไขสิทธิ์'}
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-2">
            {members.map((member) => {
              const isAdmin = member.roleLevel === 'admin';
              const isApprover = member.roleLevel === 'approver' || member.canApprove;

              return (
                <div
                  key={member.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs transition flex-wrap"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div 
                      className={`w-9 h-9 rounded-xl overflow-hidden ${!member.avatarUrl && !member.color ? member.avatarBg : ''} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}
                      style={!member.avatarUrl && member.color ? { backgroundColor: member.color } : undefined}
                    >
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.slice(0, 2)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{member.name}</h4>
                        
                        {/* Permission Badge */}
                        {isAdmin ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center space-x-0.5">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>Admin</span>
                          </span>
                        ) : isApprover ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-bold flex items-center space-x-0.5">
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                            <span>ผู้อนุมัติ</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium flex items-center space-x-0.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>สมาชิก</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-medium border border-slate-200">
                          {member.department}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Quick toggle approval rights */}
                    <button
                      type="button"
                      onClick={() => handleToggleApproveQuick(member)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center space-x-1 border transition cursor-pointer ${
                        member.canApprove || isAdmin
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={member.canApprove ? 'คลิกเพื่อปิดสิทธิ์การอนุมัติ' : 'คลิกเพื่อเปิดสิทธิ์อนุมัติ'}
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 ${member.canApprove || isAdmin ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{member.canApprove || isAdmin ? 'สิทธิ์อนุมัติ: เปิด' : 'สิทธิ์อนุมัติ: ปิด'}</span>
                    </button>

                    <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => reorderMember(member.id, 'up')}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white transition"
                        title="ย้ายขึ้น (เลื่อนซ้าย)"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderMember(member.id, 'down')}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white transition border-t border-slate-200"
                        title="ย้ายลง (เลื่อนขวา)"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => startEdit(member)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      title="แก้ไขชื่อ/สิทธิ์"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(member.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="ลบสมาชิก"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">ยืนยันการลบสมาชิกนี้?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  การลบสมาชิกจะทำให้คอลัมน์ของสมาชิกคนนี้ถูกซ่อนออกจากตาราง (งานที่ผูกไว้จะไม่หายไป)
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};

