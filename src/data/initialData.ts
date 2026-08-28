import { TeamMember, TeamChainProject, PersonalTask, NotificationItem } from '../types';

export const INITIAL_MEMBERS: TeamMember[] = [
  { id: 'mimi', name: 'มีมี่', role: 'Concept & Design Lead', department: 'Design', avatarBg: 'bg-rose-500', color: '#f43f5e', canApprove: true, roleLevel: 'approver' },
  { id: 'mkt', name: 'MKT (การตลาด)', role: 'Marketing Team', department: 'Marketing', avatarBg: 'bg-blue-500', color: '#3b82f6', canApprove: false, roleLevel: 'member' },
  { id: 'npd', name: 'NPD', role: 'New Product Development', department: 'Product', avatarBg: 'bg-amber-500', color: '#f59e0b', canApprove: true, roleLevel: 'approver' },
  { id: 'po', name: 'PO (จัดซื้อ/สั่งผลิต)', role: 'Procurement & Fabric', department: 'Supply Chain', avatarBg: 'bg-emerald-500', color: '#10b981', canApprove: false, roleLevel: 'member' },
  { id: 'suri', name: 'ซูรี', role: 'Product Strategist', department: 'Strategy', avatarBg: 'bg-purple-500', color: '#a855f7', canApprove: false, roleLevel: 'member' },
  { id: 'kafah', name: 'กะฟา', role: 'Supplier & Costing', department: 'Operations', avatarBg: 'bg-teal-500', color: '#14b8a6', canApprove: false, roleLevel: 'member' },
  { id: 'demy', name: 'เดะมี่', role: 'Photo Shoot Director', department: 'Creative & Media', avatarBg: 'bg-indigo-500', color: '#6366f1', canApprove: true, roleLevel: 'approver' },
  { id: 'fani', name: 'ฟานี', role: 'Video Content Director', department: 'Creative & Media', avatarBg: 'bg-pink-500', color: '#ec4899', canApprove: true, roleLevel: 'approver' },
  { id: 'seng', name: 'น้องเซ็ง', role: 'Video Editor (ตัดต่อวิดีโอ)', department: 'Post-Production', avatarBg: 'bg-cyan-500', color: '#06b6d4', canApprove: false, roleLevel: 'member' },
  { id: 'lee', name: 'Mr Lee', role: 'Photo Editor & Retouch (ตัดรูป/รีทัช)', department: 'Post-Production', avatarBg: 'bg-violet-500', color: '#8b5cf6', canApprove: true, roleLevel: 'approver' },
  { id: 'gm', name: 'GM', role: 'General Manager', department: 'Management', avatarBg: 'bg-slate-700', color: '#334155', canApprove: true, roleLevel: 'admin' },
];

export const INITIAL_PROJECTS: TeamChainProject[] = [
  {
    id: 'proj-001',
    code: 'SS26-MAIN',
    title: 'กระบวนการผลิตคอลเลกชันใหม่ (New Collection 2026)',
    category: 'Product Launch & Production',
    description: 'กระบวนการพัฒนาสินค้า ถ่ายแบบ วิดีโอ และผลิตคอลเลกชันใหม่ตามสเต็ปการทำงานของทีม',
    startDate: '2026-08-15',
    targetDate: '2026-09-20',
    status: 'active',
    priority: 'high',
    progress: 45,
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-26T14:30:00Z',
    steps: [
      // 1-5 Main Concept & Design (มีมี่, MKT, NPD)
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'คุย concept ปีทีม / แต่อาจจะมี Concept จาก CEO',
        description: 'ประชุมวางแผนคอนเซปต์ภาพรวมประจำปีของทีม พร้อมรับแนวทางนโยบายจาก CEO',
        assignedRole: 'มีมี่',
        assignedPerson: 'มีมี่',
        status: 'completed',
        dueDate: '2026-08-16',
        completedAt: '2026-08-16T17:00:00Z',
        dependencies: [],
        branch: 'main',
        handoverComment: 'คอนเซปต์ผ่านแล้ว เน้นสไตล์ Modern Minimal ผสมโทนสีธรรมชาติ ส่งต่อให้ทีมการตลาด',
        estimatedHours: 4,
        workLogs: [
          { id: 'log-1', timestamp: '2026-08-16T17:00:00Z', author: 'มีมี่', text: 'สรุปประเด็นกับ CEO เรียบร้อย ได้ทิศทางชัดเจน 4 โทนสี', durationMinutes: 120, type: 'handover' }
        ]
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'เสนอ Concept ให้ NPD',
        description: 'ทีม MKT นำเสนอรายละเอียดคอนเซปต์และกลุ่มเป้าหมายให้ทีมพัฒนาสินค้า (NPD)',
        assignedRole: 'MKT',
        assignedPerson: 'MKT (การตลาด)',
        status: 'completed',
        dueDate: '2026-08-17',
        completedAt: '2026-08-17T15:30:00Z',
        dependencies: ['step-1'],
        branch: 'main',
        handoverComment: 'ส่งบรีฟ NPD เรียบร้อย แนบสถิติความต้องการตลาดไตรมาส 3',
        estimatedHours: 3,
        workLogs: [
          { id: 'log-2', timestamp: '2026-08-17T15:30:00Z', author: 'MKT', text: 'ประชุมส่งมอบข้อมูลตลาดให้ทีม NPD พิจารณา', durationMinutes: 90, type: 'handover' }
        ]
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'พิจารณารับเรื่อง',
        description: 'NPD ตรวจสอบความเป็นไปได้ สเปก และความพร้อมของทรัพยากรการผลิต',
        assignedRole: 'NPD',
        assignedPerson: 'NPD',
        status: 'completed',
        dueDate: '2026-08-18',
        completedAt: '2026-08-18T16:00:00Z',
        dependencies: ['step-2'],
        branch: 'main',
        handoverComment: 'NPD อนุมัติรับเรื่อง ส่งต่อให้มีมี่ขึ้นลายและเตรียมตัวอย่างผ้า',
        estimatedHours: 4,
        workLogs: [
          { id: 'log-3', timestamp: '2026-08-18T16:00:00Z', author: 'NPD', text: 'อนุมัติโครงสร้างสินค้า 3 หมวดหมู่หลัก', durationMinutes: 180, type: 'status_change' }
        ]
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'หากผ่าน ก็ขึ้นลาย',
        description: 'มีมี่ออกแบบและขึ้นลายกราฟิก/ลายผ้าตามที่ได้รับอนุมัติ',
        assignedRole: 'มีมี่',
        assignedPerson: 'มีมี่',
        status: 'completed',
        dueDate: '2026-08-19',
        completedAt: '2026-08-19T18:00:00Z',
        dependencies: ['step-3'],
        branch: 'main',
        handoverComment: 'ขึ้นลายเสร็จสมบูรณ์ 6 ลาย พร้อม Color swatch',
        estimatedHours: 8,
        workLogs: [
          { id: 'log-4', timestamp: '2026-08-19T18:00:00Z', author: 'มีมี่', text: 'เรนเดอร์ลายแบบความละเอียดสูงเสร็จแล้ว', durationMinutes: 240, type: 'log' }
        ]
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'ส่งไลน์กลุ่ม',
        description: 'ส่งสรุปผลงานและลายผ้าลงใน LINE กลุ่มทีมงานเพื่อเปิดการทำงานในสายจัดซื้อและพัฒนาสินค้า',
        assignedRole: 'มีมี่',
        assignedPerson: 'มีมี่',
        status: 'completed',
        dueDate: '2026-08-20',
        completedAt: '2026-08-20T10:00:00Z',
        dependencies: ['step-4'],
        branch: 'main',
        handoverComment: 'ส่งเข้า LINE กลุ่มและอัปโหลดเข้าไดรฟ์กลางแล้ว ส่งต่อให้ PO และซูรีดำเนินการคู่ขนาน',
        estimatedHours: 1,
        workLogs: [
          { id: 'log-5', timestamp: '2026-08-20T10:00:00Z', author: 'มีมี่', text: 'แจ้งในไลน์กลุ่ม ส่งต่องานลูกโซ่ถัดไป', durationMinutes: 30, type: 'handover' }
        ]
      },

      // Branch 1: PO (Fabric & Manufacturing)
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'ขึ้นตัวอย่างผ้า',
        description: 'จัดทำ Swatch ตัวอย่างผ้าจริงและทดสอบความยืดหยุ่น การหดตัว และสีสกรีน',
        assignedRole: 'PO',
        assignedPerson: 'PO (จัดซื้อ/สั่งผลิต)',
        status: 'completed',
        dueDate: '2026-08-22',
        completedAt: '2026-08-22T16:00:00Z',
        dependencies: ['step-5'],
        branch: 'fabric_po',
        handoverComment: 'ตัวอย่างผ้าเกรดพรีเมียมผ่านการทดสอบ QC แล้ว',
        estimatedHours: 12,
        workLogs: [
          { id: 'log-6', timestamp: '2026-08-22T16:00:00Z', author: 'PO', text: 'ตรวจสอบตัวอย่างผ้า 3 โรงงาน เลือกเจ้าที่ดีที่สุด', durationMinutes: 180, type: 'log' }
        ]
      },
      {
        id: 'step-7',
        stepNumber: 7,
        title: 'PO สั่งจำนวนผ้า',
        description: 'คำนวณจำนวนหลา/กิโลกรัมผ้าที่ต้องใช้ตามยอดพยากรณ์และออกใบสั่งซื้อผ้า',
        assignedRole: 'PO',
        assignedPerson: 'PO (จัดซื้อ/สั่งผลิต)',
        status: 'completed',
        dueDate: '2026-08-24',
        completedAt: '2026-08-24T14:00:00Z',
        dependencies: ['step-6'],
        branch: 'fabric_po',
        handoverComment: 'ออก PO สั่งผ้า 1,500 หลา กำหนดส่งถึงโรงงานภายใน 5 วัน',
        estimatedHours: 4,
        workLogs: [
          { id: 'log-7', timestamp: '2026-08-24T14:00:00Z', author: 'PO', text: 'ส่งใบสั่งซื้อผ้าเรียบร้อย โรงงานรับออเดอร์แล้ว', durationMinutes: 60, type: 'status_change' }
        ]
      },
      {
        id: 'step-8',
        stepNumber: 8,
        title: 'PO สั่งผลิต',
        description: 'สั่งตัดเย็บและผลิตชุดจริงกับโรงงานหลัก พร้อมควบคุมกำหนดส่ง',
        assignedRole: 'PO',
        assignedPerson: 'PO (จัดซื้อ/สั่งผลิต)',
        status: 'in_progress',
        dueDate: '2026-08-28',
        dependencies: ['step-7'],
        branch: 'fabric_po',
        estimatedHours: 20,
        workLogs: [
          { id: 'log-8', timestamp: '2026-08-25T11:00:00Z', author: 'PO', text: 'โรงงานเริ่มตัด Pattern แล้ว รอผ้าล็อตแรกเข้าวันพรุ่งนี้', durationMinutes: 90, type: 'log' }
        ]
      },

      // Branch 2: ซูรี & กะฟา (Product & Sourcing)
      {
        id: 'step-9',
        stepNumber: 9,
        title: 'คิดสินค้า',
        description: 'วิเคราะห์โครงสร้างสินค้า รูปแบบแพ็กเกจ และจุดขายเสริม',
        assignedRole: 'ซูรี',
        assignedPerson: 'ซูรี',
        status: 'completed',
        dueDate: '2026-08-21',
        completedAt: '2026-08-21T18:00:00Z',
        dependencies: ['step-5'],
        branch: 'product_dev',
        handoverComment: 'สรุปไอเดียสินค้า 3 SKU พร้อมข้อเสนอราคาเบื้องต้น',
        estimatedHours: 6
      },
      {
        id: 'step-10',
        stepNumber: 10,
        title: 'เสนอ ceo',
        description: 'นำเสนอแนวคิดผลิตภัณฑ์และอัตรากำไรขั้นต้น (GP) ต่อ CEO เพื่ออนุมัติ',
        assignedRole: 'ซูรี',
        assignedPerson: 'ซูรี',
        status: 'completed',
        dueDate: '2026-08-23',
        completedAt: '2026-08-23T15:00:00Z',
        dependencies: ['step-9'],
        branch: 'product_dev',
        handoverComment: 'CEO อนุมัติแบบ 100% พร้อมขยายไซส์พิเศษ',
        estimatedHours: 3
      },
      {
        id: 'step-11',
        stepNumber: 11,
        title: 'ถ้าผ่านส่งให้กะฟา หาซัพ',
        description: 'ส่งสเปกสินค้าที่ผ่านการอนุมัติให้กะฟา เพื่อจัดหาซัพพลายเออร์และโรงงานประกอบ',
        assignedRole: 'ซูรี',
        assignedPerson: 'ซูรี',
        status: 'in_progress',
        dueDate: '2026-08-27',
        dependencies: ['step-10'],
        branch: 'product_dev',
        estimatedHours: 4,
        workLogs: [
          { id: 'log-11', timestamp: '2026-08-26T10:00:00Z', author: 'ซูรี', text: 'ส่งไฟล์ CAD และสเปกวัสดุให้กะฟาเรียบร้อย กำลังประสานงานเทียบราคา', durationMinutes: 45, type: 'log' }
        ]
      },
      {
        id: 'step-12',
        stepNumber: 12,
        title: 'กะฟาได้ราคา',
        description: 'กะฟาเทียบใบเสนอราคาจาก 3 ซัพพลายเออร์ และเลือกเงื่อนไขที่ดีที่สุด',
        assignedRole: 'กะฟา',
        assignedPerson: 'กะฟา',
        status: 'waiting_approval',
        dueDate: '2026-08-29',
        dependencies: ['step-11'],
        branch: 'product_dev',
        estimatedHours: 6,
        workLogs: [
          { id: 'log-12', timestamp: '2026-08-26T14:00:00Z', author: 'กะฟา', text: 'ได้ราคาต้นทุนต่ำกว่าเป้า 8% รอ GM อนุมัติขั้นสุดท้าย', durationMinutes: 60, type: 'status_change' }
        ]
      },
      {
        id: 'step-13',
        stepNumber: 13,
        title: 'สั่งผลิต',
        description: 'กะฟาออกใบสั่งผลิตสินค้าอุปกรณ์เสริมและกล่องบรรจุภัณฑ์',
        assignedRole: 'กะฟา',
        assignedPerson: 'กะฟา',
        status: 'pending',
        dueDate: '2026-09-02',
        dependencies: ['step-12'],
        branch: 'product_dev',
        estimatedHours: 4
      },

      // Branch 3: เดะมี่ (Photo Shoot Team)
      {
        id: 'step-14-photo',
        stepNumber: 14,
        title: 'เสนอคอนเซปถ่ายแบบ',
        description: 'เดะมี่วางแนวทาง Mood & Tone ของการถ่ายภาพนิ่ง ทั้งสตูดิโอและ Outdoor',
        assignedRole: 'เดะมี่',
        assignedPerson: 'เดะมี่',
        status: 'in_progress',
        dueDate: '2026-08-27',
        dependencies: ['step-5'],
        branch: 'photo_shoot',
        estimatedHours: 5,
        workLogs: [
          { id: 'log-14a', timestamp: '2026-08-26T13:00:00Z', author: 'เดะมี่', text: 'รวบรวมเรฟเฟอเรนซ์และเซ็ตแสงสำหรับภาพ Lookbook', durationMinutes: 120, type: 'log' }
        ]
      },
      {
        id: 'step-15-photo',
        stepNumber: 15,
        title: 'ติดต่อ พี่ขวัญ เพื่อหารือความเป็นไปได้ของ concept',
        description: 'ประสานงานสไตลิสต์/โปรดิวเซอร์ (พี่ขวัญ) เช็คตารางนางแบบ สถานที่ และชุด',
        assignedRole: 'เดะมี่',
        assignedPerson: 'เดะมี่',
        status: 'pending',
        dueDate: '2026-08-29',
        dependencies: ['step-14-photo'],
        branch: 'photo_shoot',
        estimatedHours: 4
      },
      {
        id: 'step-16-photo',
        stepNumber: 16,
        title: 'ทำมูดบอร์ดท่าถ่ายแบบแต่ละ Platform',
        description: 'จัดทำ Moodboard ไกด์ท่าโพสต์สำหรับ E-commerce, Instagram, TikTok, Facebook',
        assignedRole: 'เดะมี่',
        assignedPerson: 'เดะมี่',
        status: 'pending',
        dueDate: '2026-09-01',
        dependencies: ['step-15-photo'],
        branch: 'photo_shoot',
        estimatedHours: 6
      },
      {
        id: 'step-17-photo',
        stepNumber: 17,
        title: 'ถ่ายแบบ',
        description: 'วันถ่ายภาพนิ่งจริงในสตูดิโอและภาพไลฟ์สไตล์',
        assignedRole: 'เดะมี่',
        assignedPerson: 'เดะมี่',
        status: 'pending',
        dueDate: '2026-09-04',
        dependencies: ['step-16-photo', 'step-8'],
        branch: 'photo_shoot',
        estimatedHours: 10
      },
      {
        id: 'step-18-photo',
        stepNumber: 18,
        title: 'ส่งรีวิว',
        description: 'คัดเลือกรูปเบื้องต้นส่งให้หัวหน้าทีมและลูกค้าตรวจเช็ค',
        assignedRole: 'เดะมี่',
        assignedPerson: 'เดะมี่',
        status: 'pending',
        dueDate: '2026-09-06',
        dependencies: ['step-17-photo'],
        branch: 'photo_shoot',
        estimatedHours: 4
      },
      {
        id: 'step-19-photo',
        stepNumber: 19,
        title: 'เดะมี่ส่งไฟล์ถ่ายแบบให้ฟานี Mr Lee',
        description: 'ส่ง Raw files & Selected images ให้ฟานีและ Mr Lee รีทัช',
        assignedRole: 'เดะมี่',
        assignedPerson: 'เดะมี่',
        status: 'pending',
        dueDate: '2026-09-08',
        dependencies: ['step-18-photo'],
        branch: 'photo_shoot',
        estimatedHours: 2
      },

      // Branch 4: ฟานี (Video Team)
      {
        id: 'step-14-video',
        stepNumber: 14,
        title: 'เสนอ Concept วิดีโอ',
        description: 'ฟานีเสนอไอเดียวิดีโอโปรโมต Reels / TikTok / Hero Video',
        assignedRole: 'ฟานี',
        assignedPerson: 'ฟานี',
        status: 'in_progress',
        dueDate: '2026-08-27',
        dependencies: ['step-5'],
        branch: 'video_prod',
        estimatedHours: 6,
        workLogs: [
          { id: 'log-14b', timestamp: '2026-08-26T15:00:00Z', author: 'ฟานี', text: 'ร่าง Key Hook 3 วินาทีแรก และธีมเพลง', durationMinutes: 60, type: 'log' }
        ]
      },
      {
        id: 'step-15-video',
        stepNumber: 15,
        title: 'สร้าง Storyboard ส่งให้แบเซ็ง',
        description: 'เขียน Storyboard ช็อตต่อช็อต และบรีฟตัดต่อส่งให้น้องเซ็งเตรียมตัว',
        assignedRole: 'ฟานี',
        assignedPerson: 'ฟานี',
        status: 'pending',
        dueDate: '2026-08-30',
        dependencies: ['step-14-video'],
        branch: 'video_prod',
        estimatedHours: 6
      },
      {
        id: 'step-16-video',
        stepNumber: 16,
        title: 'ทำมูดบอร์ดท่าถ่ายแบบแต่ละ Platform (วิดีโอ)',
        description: 'ทำ Moodboard จังหวะการเคลื่อนไหวและมุมกล้องแบบ Short-form & Long-form',
        assignedRole: 'ฟานี',
        assignedPerson: 'ฟานี',
        status: 'pending',
        dueDate: '2026-09-01',
        dependencies: ['step-15-video'],
        branch: 'video_prod',
        estimatedHours: 4
      },
      {
        id: 'step-17-video',
        stepNumber: 17,
        title: 'ถ่ายวิดีโอ',
        description: 'ถ่ายทำ Footage วิดีโอตาม Storyboard',
        assignedRole: 'ฟานี',
        assignedPerson: 'ฟานี',
        status: 'pending',
        dueDate: '2026-09-04',
        dependencies: ['step-16-video', 'step-8'],
        branch: 'video_prod',
        estimatedHours: 10
      },
      {
        id: 'step-18-video',
        stepNumber: 18,
        title: 'ส่งให้น้องเซ็ง',
        description: 'ถ่ายเสร็จ ส่ง Raw Footage ทั้งหมดพร้อมบันทึกเสียงให้น้องเซ็งตัดต่อ',
        assignedRole: 'ฟานี',
        assignedPerson: 'ฟานี',
        status: 'pending',
        dueDate: '2026-09-06',
        dependencies: ['step-17-video'],
        branch: 'video_prod',
        estimatedHours: 2
      },
      {
        id: 'step-19-video',
        stepNumber: 19,
        title: 'ฟานีเลือกรูป คอนเฟิร์มส่งให้ Mr Lee',
        description: 'เลือก Key Frame และภาพนิ่งที่เข้ากับวิดีโอส่งให้ Mr Lee ทำปกคลิป',
        assignedRole: 'ฟานี',
        assignedPerson: 'ฟานี',
        status: 'pending',
        dueDate: '2026-09-08',
        dependencies: ['step-18-video'],
        branch: 'video_prod',
        estimatedHours: 3
      },

      // Branch 5: Final Post-Production (น้องเซ็ง & Mr Lee)
      {
        id: 'step-20-video',
        stepNumber: 20,
        title: '20. น้องเซ็ง: ตัดวิดีโอทั้งหมด',
        description: 'ตัดต่อวิดีโอ Master, ทำ Subtitle, เกรดดิ้งสี, และทำไซส์ 9:16 กับ 16:9',
        assignedRole: 'น้องเซ็ง',
        assignedPerson: 'น้องเซ็ง',
        status: 'pending',
        dueDate: '2026-09-12',
        dependencies: ['step-18-video'],
        branch: 'post_prod',
        estimatedHours: 16
      },
      {
        id: 'step-20-photo',
        stepNumber: 20,
        title: '20. Mr Lee: ตัดรูปทั้งหมด',
        description: 'รีทัชภาพถ่าย ไดคัท ปรับโทนสี และจัดทำกราฟิกโปรโมตทุกขนาด',
        assignedRole: 'Mr Lee',
        assignedPerson: 'Mr Lee',
        status: 'pending',
        dueDate: '2026-09-12',
        dependencies: ['step-19-photo', 'step-19-video'],
        branch: 'post_prod',
        estimatedHours: 14
      }
    ]
  }
];

export const INITIAL_PERSONAL_TASKS: PersonalTask[] = [
  {
    id: 'pt-001',
    title: 'สรุปรายงานความคืบหน้ารายสัปดาห์ส่ง GM',
    description: 'รวบรวมสถานะของแต่ละแผนก ทั้งงานผ้า การจัดซื้อ และงานสื่อ',
    category: 'รายงาน/ผู้บริหาร',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'มีมี่',
    dueDate: '2026-08-27',
    estimatedMinutes: 60,
    spentMinutes: 30,
    checklist: [
      { id: 'c1', text: 'สรุปสถานะสั่งผ้าจากทีม PO', done: true },
      { id: 'c2', text: 'สรุปการเทียบราคาจากกะฟา', done: true },
      { id: 'c3', text: 'สรุปกำหนดวันถ่ายแบบของเดะมี่/ฟานี', done: false },
    ],
    notes: 'ต้องนำเสนอในที่ประชุมวันศุกร์เช้า',
    tags: ['สำคัญ', 'รายงาน', 'GM'],
    createdAt: '2026-08-25T08:00:00Z',
    workLogs: [
      { id: 'pl-1', timestamp: '2026-08-26T11:00:00Z', author: 'มีมี่', text: 'รวบรวมข้อมูลส่วนจัดซื้อเรียบร้อย', durationMinutes: 30, type: 'log' }
    ]
  },
  {
    id: 'pt-002',
    title: 'ตรวจสอบใบเสนอราคาอุปกรณ์และพร็อพถ่ายแบบ',
    description: 'ตรวจเช็คความถูกต้องของใบเสนอราคาสตูดิโอและพร็อพตกแต่งฉาก',
    category: 'ประสานงาน',
    priority: 'medium',
    status: 'todo',
    assignedTo: 'เดะมี่',
    dueDate: '2026-08-28',
    estimatedMinutes: 45,
    spentMinutes: 0,
    checklist: [
      { id: 'c4', text: 'ขอใบเสนอราคา Studio A', done: true },
      { id: 'c5', text: 'ขอใบเสนอราคา Studio B', done: false },
      { id: 'c6', text: 'ส่งเบิกมัดจำล่วงหน้า', done: false },
    ],
    tags: ['สตูดิโอ', 'เอกสาร'],
    createdAt: '2026-08-26T09:30:00Z'
  },
  {
    id: 'pt-003',
    title: 'สำรองไฟล์ Footage และเตรียมพื้นที่ไดรฟ์สำหรับงานโปรดักชั่น',
    description: 'เคลียร์พื้นที่ SSD 4TB สำหรับรองรับไฟล์ 4K จากการถ่ายวิดีโอสัปดาห์หน้า',
    category: 'เทคนิค/อุปกรณ์',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'น้องเซ็ง',
    dueDate: '2026-08-27',
    estimatedMinutes: 90,
    spentMinutes: 45,
    checklist: [
      { id: 'c7', text: 'Archive โปรเจกต์เก่าขึ้น NAS', done: true },
      { id: 'c8', text: 'Format การ์ด SD และ SSD 4TB', done: false },
      { id: 'c9', text: 'เตรียม Preset สีสำหรับตัดต่อ', done: false },
    ],
    tags: ['เตรียมพร้อม', 'ตัดต่อ'],
    createdAt: '2026-08-26T10:00:00Z'
  },
  {
    id: 'pt-004',
    title: 'ติดต่อซัพพลายเออร์ป้ายแท็กและถุงบรรจุภัณฑ์',
    description: 'ขอตัวอย่างป้ายทอและเช็คระยะเวลาการผลิตให้ทันกับรอบสั่งผ้า',
    category: 'จัดซื้อ',
    priority: 'urgent',
    status: 'todo',
    assignedTo: 'กะฟา',
    dueDate: '2026-08-27',
    estimatedMinutes: 30,
    spentMinutes: 0,
    checklist: [
      { id: 'c10', text: 'โทรคอนเฟิร์มสเปกป้ายทอ', done: false },
      { id: 'c11', text: 'เทียบราคา 2 โรงงาน', done: false }
    ],
    tags: ['ด่วน', 'ซัพพลายเออร์'],
    createdAt: '2026-08-26T12:00:00Z'
  },
  {
    id: 'pt-005',
    title: 'อัปเดตระบบบันทึกงานประจำวันและแผนงานส่วนตัว',
    description: 'จัดระเบียบตารางนัดหมายและการส่งต่องานลูกโซ่ของตนเอง',
    category: 'ส่วนตัว',
    priority: 'low',
    status: 'completed',
    assignedTo: 'ฟานี',
    dueDate: '2026-08-26',
    completedAt: '2026-08-26T16:00:00Z',
    estimatedMinutes: 20,
    spentMinutes: 20,
    checklist: [
      { id: 'c12', text: 'ตรวจสเต็ป 14 วิดีโอ', done: true },
      { id: 'c13', text: 'นัดคุยกับน้องเซ็งวันพรุ่งนี้', done: true }
    ],
    tags: ['จัดระเบียบ'],
    createdAt: '2026-08-26T08:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'step_unlocked',
    title: 'สเต็ป 11 กำลังดำเนินการ',
    message: 'ซูรี กำลังส่งสเปกให้กะฟาเพื่อหาซัพพลายเออร์ (Step 11)',
    timestamp: '2026-08-26T10:00:00Z',
    read: false,
    relatedProjectId: 'proj-001',
    relatedStepId: 'step-11',
    targetRole: 'กะฟา'
  },
  {
    id: 'notif-2',
    type: 'due_soon',
    title: 'แจ้งเตือนกำหนดส่งใกล้ถึง (พรุ่งนี้)',
    message: 'งาน "PO สั่งผลิต (Step 8)" ครบกำหนดใน 2 วัน และมีงานส่วนตัวด่วน 2 รายการ',
    timestamp: '2026-08-26T14:30:00Z',
    read: false,
    relatedProjectId: 'proj-001',
    relatedStepId: 'step-8'
  },
  {
    id: 'notif-3',
    type: 'handover',
    title: 'ส่งต่องานทีมเรียบร้อย',
    message: 'มีมี่ ส่งต่องานสเต็ป 5 (ส่งไลน์กลุ่ม) ให้ทีม PO และ ซูรี สำเร็จ',
    timestamp: '2026-08-20T10:00:00Z',
    read: true,
    relatedProjectId: 'proj-001',
    relatedStepId: 'step-5'
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-001',
    title: 'สคริปต์ไลฟ์สดเปิดตัวคอลเลกชันใหม่ SS26',
    category: 'scripts',
    content: `
      <div style="font-family: 'Prompt', sans-serif; line-height: 1.6; color: #1e293b; padding: 10px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">
          สคริปต์สำหรับการไลฟ์สดเปิดตัวคอลเลกชันใหม่ 2026 (SS26-MAIN)
        </h1>
        <p style="margin-bottom: 12px;"><strong>ผู้รับผิดชอบ:</strong> ทีมการตลาด (MKT)</p>
        <p style="margin-bottom: 12px;"><strong>วันที่วางแผน:</strong> 2026-08-27</p>
        
        <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">ช่วงที่ 1: แนะนำตัวและดึงดูดผู้เข้าชม (นาทีที่ 0-5)</h2>
        <p style="margin-bottom: 12px; background-color: #f1f5f9; padding: 12px; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <em>"สวัสดีค่ะทุกคนนน ยินดีต้อนรับเข้าสู่ Live เปิดตัวคอลเลกชันพิเศษสุดแห่งปี SS26 ของเรานะคะ! ใครเข้ามาแล้วพิมพ์ทักทาย กดไลก์ กดแชร์กันหน่อยน้าาา วันนี้เรามีเซอร์ไพรส์ใหญ่ แจกของรางวัลพรีเมียมและโปรลดพิเศษสุดที่มีเฉพาะในไลฟ์นี้เท่านั้น!"</em>
        </p>

        <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">ช่วงที่ 2: เจาะลึก Concept & งานดีไซน์ (นาทีที่ 5-15)</h2>
        <p style="margin-bottom: 12px;">ดึงเอาแนวคิด <strong>Modern Minimal ผสมโทนสีธรรมชาติ (โดยคุณมีมี่ Concept Design Lead)</strong> มาเล่าให้ผู้ฟังอินกับความประณีต:</p>
        <ul style="list-style-type: disc; margin-left: 20px; margin-bottom: 16px;">
          <li style="margin-bottom: 6px;">เล่าถึงเส้นใยธรรมชาติและสัมผัสที่เป็นมิตรต่อสิ่งแวดล้อม</li>
          <li style="margin-bottom: 6px;">ชูจุดเด่น ลายผ้าลิขสิทธิ์เฉพาะ 6 ลายเด่นของปีนี้</li>
        </ul>

        <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">ช่วงที่ 3: เปิดตัวราคาสินค้าและสิทธิพิเศษ (นาทีที่ 15-30)</h2>
        <p style="margin-bottom: 12px;">ชี้เป้ารหัสส่วนลดสินค้าเฉพาะในไลฟ์ พิมพ์คำว่า <strong>"SS26NEW"</strong> รับส่วนลดพิเศษ 15% พร้อมส่งฟรีทันที!</p>
      </div>
    `,
    createdAt: '2026-08-27T10:00:00Z',
    createdBy: 'MKT (การตลาด)',
    updatedAt: '2026-08-27T10:00:00Z'
  },
  {
    id: 'doc-002',
    title: 'คอนเทนต์เปิดตัวคอลเลกชันใหม่ทาง Facebook & Instagram',
    category: 'contents',
    content: `
      <div style="font-family: 'Prompt', sans-serif; line-height: 1.6; color: #1e293b; padding: 10px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #10b981; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">
          แผนโพสต์คอนเทนต์เปิดตัวทางโซเชียลมีเดีย
        </h1>
        <p style="margin-bottom: 12px;"><strong>สไตล์คอนเทนต์:</strong> Aesthetic, Minimalist, Earth tone</p>

        <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">หัวข้อโพสต์: "The Art of Simplicity - New Collection SS26"</h2>
        <p style="margin-bottom: 12px; font-weight: 500;">รายละเอียดแคปชันโพสต์:</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          ✨ สัมผัสความเบาสบายและดีไซน์ประณีตที่ลงตัว... ต้อนรับความเรียบง่ายรูปแบบใหม่กับ คอลเลกชันพิเศษ "Modern Minimal 2026"<br/><br/>
          คัดสรรเส้นใยผ้าแบบพิเศษ อ่อนโยนต่อผิวสัมผัส สะท้อนตัวตนของคุณในแบบที่เรียบง่ายแต่เปี่ยมด้วยเรื่องราว<br/><br/>
          🛍️ สั่งจองก่อนใครแบบ Early Bird วันนี้ รับทันทีส่วนลด 15% พร้อมรับกระเป๋าผ้าพิมพ์ลายคอลเลกชันฟรี!<br/>
          👉 สนใจพิมพ์ "SS26" ใต้คอมเมนต์นี้เลยค่ะ!
        </div>

        <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">ภาพประกอบและมู้ดแอนด์โทน (Moodboard)</h2>
        <p style="margin-bottom: 12px;">จัดวางรูปภาพแบบคอลลาจ (Grid 4 ช่อง) เน้นภาพพอร์ตเทรตพนักงานและโทนธรรมชาติอบอุ่น</p>
      </div>
    `,
    createdAt: '2026-08-27T11:00:00Z',
    createdBy: 'มีมี่',
    updatedAt: '2026-08-27T11:00:00Z'
  },
  {
    id: 'doc-003',
    title: 'รายละเอียดโปรโมชั่นเปิดตัวคอลเลกชันพิเศษ',
    category: 'promotions',
    content: `
      <div style="font-family: 'Prompt', sans-serif; line-height: 1.6; color: #1e293b; padding: 10px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #ea580c; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">
          รายละเอียดข้อเสนอแคมเปญและโปรโมชั่น (Promotion Details)
        </h1>
        
        <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">โปรโมชั่นหลัก: "Early Bird Launch Campaign"</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #fef2f2; border-bottom: 2px solid #fca5a5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #fee2e2;">เงื่อนไขหลัก</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #fee2e2;">ส่วนลดสิทธิพิเศษ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #fee2e2;">สั่งซื้อก่อนวันที่ 5 กันยายน 2026</td>
              <td style="padding: 10px; border: 1px solid #fee2e2; color: #ea580c; font-weight: bold;">ส่วนลด 15% ทันที</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #fee2e2;">ยอดสั่งซื้อครบ 2,500 บาท</td>
              <td style="padding: 10px; border: 1px solid #fee2e2; color: #ea580c; font-weight: bold;">แถมร่มพับสกรีนโลโก้ คอลเลกชันใหม่ และจัดส่งฟรี</td>
            </tr>
          </tbody>
        </table>

        <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">วิธีการใช้งานสำหรับพนักงานแอดมิน (Admin / CSR บัญชี)</h2>
        <ol style="list-style-type: decimal; margin-left: 20px; margin-bottom: 16px;">
          <li style="margin-bottom: 6px;">ตรวจสอบยอดโอนเงินให้ตรงตามตารางราคาส่วนลด</li>
          <li style="margin-bottom: 6px;">เลือกประเภทคูปองโค้ดในระบบ ERP รหัส "EARLYSS26"</li>
          <li style="margin-bottom: 6px;">ระบบจะคำนวณราคาส่วนลดและแถมของอัตโนมัติ</li>
        </ol>
      </div>
    `,
    createdAt: '2026-08-27T12:00:00Z',
    createdBy: 'NPD',
    updatedAt: '2026-08-27T12:00:00Z'
  }
];
