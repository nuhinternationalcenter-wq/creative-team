import React, { useState } from 'react';
import { HelpCircle, X, CheckCircle2, Send, User, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const QuickHelpBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition shadow-xs"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>💡 ดูวิธีใช้งานง่ายๆ 3 สเต็ป</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              💡 วิธีใช้งานระบบส่งต่องานทีมง่ายๆ ใน 3 ขั้นตอน
            </h3>
            <p className="text-xs text-slate-500">
              ระบบส่งต่องานอัตโนมัติ ไม่ต้องคอยตามงานในแชทให้สับสน
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          title="ซ่อนคำแนะนำ"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Simple Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs flex items-start space-x-3">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
            1
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900">เลือกชื่อของคุณ</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              กดเลือกชื่อของคุณที่แถบด้านบน เพื่อดูเฉพาะงานที่คุณต้องทำทันที
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs flex items-start space-x-3">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
            2
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900">ทำงาน & กด "ส่งต่องาน"</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              เมื่อทำสเต็ปของคุณเสร็จ ให้กดปุ่มสีเขียว <span className="font-semibold text-emerald-600">"ส่งต่องาน"</span> พร้อมแนบข้อความหรือไฟล์
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs flex items-start space-x-3">
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
            3
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900">ระบบปลดล็อกเพื่อนต่อทันที</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              เพื่อนร่วมทีมในสเต็ปถัดไปจะได้รับการแจ้งเตือนอัตโนมัติ งานไหลลื่นไม่มีสะดุด!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
