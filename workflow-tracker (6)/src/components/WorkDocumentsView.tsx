import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  FolderOpen, 
  Heading1, 
  Heading2, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Link as LinkIcon, 
  Check, 
  ExternalLink,
  BookOpen,
  ChevronRight,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  Eye,
  Type,
  Printer,
  Download,
  ChevronDown,
  FolderPlus
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { WorkDocument } from '../types';

export const WorkDocumentsView: React.FC = () => {
  const { documents, addDocument, updateDocument, deleteDocument, members } = useWork();
  
  // Dynamic categories state
  const [categories, setCategories] = useState<{ id: string; label: string; desc: string; color: string }[]>(() => {
    const saved = localStorage.getItem('workchain_doc_categories_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    return [
      { id: 'scripts', label: 'สคริปต์ (Scripts)', desc: 'บทพูดไลฟ์สด แผนงานรีวิว', color: 'from-blue-500 to-indigo-600' },
      { id: 'contents', label: 'คอนเทนต์ (Contents)', desc: 'แคปชัน Facebook, IG, TikTok', color: 'from-emerald-500 to-teal-600' },
      { id: 'promotions', label: 'รายละเอียดโปรโมชั่น (Promotions)', desc: 'ตารางลดราคา เงื่อนไขแคมเปญ', color: 'from-orange-500 to-amber-600' }
    ];
  });

  // Save to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('workchain_doc_categories_v1', JSON.stringify(categories));
  }, [categories]);

  const [selectedCategory, setSelectedCategory] = useState<string>('scripts');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic Category modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('from-purple-500 to-indigo-600');

  // Print & Download states
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  // Custom states for Rich-text features
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lastFocusedPageIndex, setLastFocusedPageIndex] = useState<number>(0);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Parse query params for shared document links on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('docId');
    if (docId) {
      const foundDoc = documents.find(d => d.id === docId);
      if (foundDoc) {
        setSelectedCategory(foundDoc.category);
        setSelectedDocId(docId);
        // Clear param to avoid sticky URL, but can keep it for bookmarking
      }
    }
  }, [documents]);

  // Set default document if none selected
  useEffect(() => {
    const filtered = documents.filter(d => d.category === selectedCategory);
    if (filtered.length > 0 && !filtered.some(d => d.id === selectedDocId)) {
      setSelectedDocId(filtered[0].id);
    }
  }, [selectedCategory, documents, selectedDocId]);

  // Load document content into editable div when document changes
  const activeDoc = documents.find(d => d.id === selectedDocId);

  // Sync pages into editable elements
  useEffect(() => {
    if (activeDoc) {
      const currentPages = activeDoc.pages && activeDoc.pages.length > 0 
        ? activeDoc.pages 
        : [activeDoc.content];
        
      currentPages.forEach((pageContent, idx) => {
        const el = pageRefs.current[idx];
        if (el) {
          if (el.innerHTML !== pageContent) {
            el.innerHTML = pageContent;
          }
        }
      });
    }
  }, [selectedDocId, activeDoc]);

  // Handle auto-save content on typing/blur for a specific page index
  const handlePageInput = (idx: number) => {
    if (activeDoc) {
      const el = pageRefs.current[idx];
      if (el) {
        const currentPages = activeDoc.pages && activeDoc.pages.length > 0 
          ? [...activeDoc.pages] 
          : [activeDoc.content];
          
        currentPages[idx] = el.innerHTML;
        
        updateDocument(activeDoc.id, {
          pages: currentPages,
          content: currentPages.join('<hr class="a4-page-break" />') // Combined fallback
        });
      }
    }
  };

  // Save all pages contents (useful when invoking formatting toolbar)
  const saveAllPagesToContext = () => {
    if (activeDoc) {
      const currentPages = activeDoc.pages && activeDoc.pages.length > 0 
        ? [...activeDoc.pages] 
        : [activeDoc.content];
        
      const updatedPages = currentPages.map((pageContent, idx) => {
        const el = pageRefs.current[idx];
        return el ? el.innerHTML : pageContent;
      });
      
      updateDocument(activeDoc.id, {
        pages: updatedPages,
        content: updatedPages.join('<hr class="a4-page-break" />')
      });
    }
  };

  // Add a new page sheet
  const handleAddPage = () => {
    if (activeDoc) {
      const currentPages = activeDoc.pages && activeDoc.pages.length > 0 
        ? [...activeDoc.pages] 
        : [activeDoc.content];
        
      const newPageContent = `
        <div style="font-family: 'Prompt', sans-serif; line-height: 1.6; color: #1e293b;">
          <p style="color: #64748b;">เนื้อหาหน้า ${currentPages.length + 1}...</p>
        </div>
      `;
      
      const updatedPages = [...currentPages, newPageContent];
      
      updateDocument(activeDoc.id, {
        pages: updatedPages,
        content: updatedPages.join('<hr class="a4-page-break" />')
      });
      
      // Focus on the newly created page
      setTimeout(() => {
        const nextIndex = updatedPages.length - 1;
        setLastFocusedPageIndex(nextIndex);
        const el = pageRefs.current[nextIndex];
        if (el) el.focus();
      }, 100);
    }
  };

  // Delete a page sheet
  const handleDeletePage = (index: number) => {
    if (activeDoc) {
      const currentPages = activeDoc.pages && activeDoc.pages.length > 0 
        ? [...activeDoc.pages] 
        : [activeDoc.content];
        
      if (currentPages.length <= 1) {
        alert('ไม่สามารถลบหน้ากระดาษแผ่นสุดท้ายได้');
        return;
      }
      
      if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกระดาษแผ่นที่ ${index + 1}?`)) {
        const updatedPages = currentPages.filter((_, idx) => idx !== index);
        // Remove ref
        pageRefs.current = pageRefs.current.filter((_, idx) => idx !== index);
        
        // Adjust focused index if needed
        let newFocusedIndex = lastFocusedPageIndex;
        if (lastFocusedPageIndex >= updatedPages.length) {
          newFocusedIndex = updatedPages.length - 1;
        }
        setLastFocusedPageIndex(newFocusedIndex);
        
        updateDocument(activeDoc.id, {
          pages: updatedPages,
          content: updatedPages.join('<hr class="a4-page-break" />')
        });
      }
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeDoc) {
      updateDocument(activeDoc.id, { title: e.target.value });
    }
  };

  // Category color options for the user to select
  const colorChoices = [
    { name: 'ม่วง-คราม', value: 'from-purple-500 to-indigo-600' },
    { name: 'น้ำเงิน-คราม', value: 'from-blue-500 to-indigo-600' },
    { name: 'เขียว-มรกต', value: 'from-emerald-500 to-teal-600' },
    { name: 'ส้ม-เหลือง', value: 'from-orange-500 to-amber-600' },
    { name: 'ชมพู-กุหลาบ', value: 'from-pink-500 to-rose-600' },
    { name: 'เทา-ดำ', value: 'from-slate-600 to-slate-800' },
    { name: 'แดง-ส้ม', value: 'from-red-500 to-orange-600' },
    { name: 'ฟ้า-คราม', value: 'from-cyan-500 to-blue-600' }
  ];

  // Helper to resolve icon based on category ID
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'scripts': return BookOpen;
      case 'contents': return Sparkles;
      case 'promotions': return FileText;
      default: return FolderOpen;
    }
  };

  // Add a new dynamic category
  const handleAddCategory = () => {
    if (!newCatLabel.trim()) {
      alert('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    const newId = `cat-${Date.now()}`;
    const newCategory = {
      id: newId,
      label: newCatLabel.trim(),
      desc: newCatDesc.trim() || 'หมวดหมู่เพิ่มเติมสำหรับระเบียบงานในอนาคต',
      color: newCatColor
    };

    setCategories(prev => [...prev, newCategory]);
    setSelectedCategory(newId);

    setNewCatLabel('');
    setNewCatDesc('');
    setNewCatColor('from-purple-500 to-indigo-600');
    setShowAddCategoryModal(false);
  };

  // Delete a dynamic category
  const handleDeleteCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (categories.length <= 1) {
      alert('ต้องมีอย่างน้อยหนึ่งหมวดหมู่');
      return;
    }
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? (เอกสารในหมวดหมู่นี้จะไม่ถูกลบ แต่จะยังไม่มีกลุ่ม)')) {
      setCategories(prev => prev.filter(c => c.id !== catId));
      if (selectedCategory === catId) {
        setSelectedCategory(categories[0].id === catId ? categories[1].id : categories[0].id);
      }
    }
  };

  // Print Document (A4 Sheets layout)
  const handlePrint = () => {
    const style = document.createElement('style');
    style.id = 'print-style';
    style.innerHTML = `
      @media print {
        /* Hide everything */
        body * {
          visibility: hidden;
        }
        /* Show only the A4 sheets container */
        #a4-pages-container, #a4-pages-container * {
          visibility: visible;
        }
        #a4-pages-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 210mm !important;
          max-width: none !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        /* Hide indicators and utility buttons */
        #a4-pages-container > div > div.flex {
          display: none !important;
        }
        #add-page-button {
          display: none !important;
        }
        /* Style sheet blocks to exactly match A4 specs */
        div[id^="google-docs-sheet-page-"] {
          border: none !important;
          box-shadow: none !important;
          padding: 20mm !important;
          margin: 0 auto !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          width: 210mm !important;
          height: 297mm !important;
          background: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0;
          background: white !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      const el = document.getElementById('print-style');
      if (el) el.remove();
    }, 1000);
  };

  // Download document as styled standalone HTML
  const handleDownloadHTML = () => {
    if (!activeDoc) return;
    const currentPages = activeDoc.pages && activeDoc.pages.length > 0 
      ? activeDoc.pages 
      : [activeDoc.content];
      
    const pagesHtml = currentPages.map((pageContent, idx) => `
      <div class="page" id="page-${idx + 1}">
        ${pageContent}
      </div>
    `).join('<div class="page-break"></div>');

    const fullHtml = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>${activeDoc.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&family=Sriracha&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #f1f5f9;
      margin: 0;
      padding: 40px 0;
      font-family: 'Prompt', sans-serif;
      color: #1e293b;
    }
    .page {
      background-color: #ffffff;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 30px auto;
      padding: 20mm;
      box-sizing: border-box;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    .page-break {
      page-break-after: always;
    }
    @media print {
      body {
        background-color: transparent;
        padding: 0;
      }
      .page {
        margin: 0;
        box-shadow: none;
        border-radius: 0;
        page-break-after: always;
      }
      .page-break {
        display: none;
      }
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.title || 'untitled-document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadDropdown(false);
  };

  // Download document as Microsoft Word .doc
  const handleDownloadWord = () => {
    if (!activeDoc) return;
    const currentPages = activeDoc.pages && activeDoc.pages.length > 0 
      ? activeDoc.pages 
      : [activeDoc.content];
      
    const pagesHtml = currentPages.join('<br class="page-break" style="page-break-before: always; clear: both;" />');
    
    const wordHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${activeDoc.title}</title>
        <style>
          body {
            font-family: 'Sarabun', 'Prompt', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
          }
          p {
            margin: 0 0 10px 0;
          }
          @page Section1 {
            size: 21.0cm 29.7cm; /* A4 size */
            margin: 2.0cm 2.0cm 2.0cm 2.0cm; /* Margins */
          }
          div.Section1 {
            page: Section1;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${pagesHtml}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.title || 'untitled-document'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadDropdown(false);
  };

  // Filter documents based on search and category
  const filteredDocs = documents
    .filter(doc => doc.category === selectedCategory)
    .filter(doc => {
      const q = searchQuery.toLowerCase();
      return doc.title.toLowerCase().includes(q) || doc.content.toLowerCase().includes(q);
    });

  // Execute Rich Text Command
  const execCommand = (command: string, value: string = '') => {
    const el = pageRefs.current[lastFocusedPageIndex];
    if (el) {
      el.focus();
    }
    document.execCommand(command, false, value);
    saveAllPagesToContext();
  };

  // Copy document link
  const handleCopyLink = (docId: string) => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const shareUrl = `${origin}${path}?tab=documents&docId=${docId}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(docId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Create a new document
  const handleCreateDocument = () => {
    const title = `เอกสารไม่มีชื่อ (${new Date().toLocaleDateString('th-TH')})`;
    const createdBy = members[0]?.name || 'ทีมงาน';
    
    const initialContent = `
      <div style="font-family: 'Prompt', sans-serif; line-height: 1.6; color: #1e293b; padding: 10px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">
          ชื่อหัวข้อเอกสารใหม่
        </h1>
        <p style="margin-bottom: 12px; color: #64748b;">เขียนรายละเอียดและปรับแต่งข้อมูลงานของคุณที่นี่...</p>
      </div>
    `;

    const newId = addDocument({
      title,
      category: selectedCategory,
      content: initialContent,
      pages: [initialContent],
      createdBy
    });
    
    setSelectedDocId(newId);
  };

  // Image insertion via base64 upload or link
  const insertImage = (url: string) => {
    if (!url) return;
    execCommand('insertImage', url);
    setShowImageModal(false);
    setImageUrl('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { uploadFileToStorage } = await import('../lib/storage');
        const downloadUrl = await uploadFileToStorage(file, 'documents');
        insertImage(downloadUrl);
      } catch (err: any) {
        console.error('Failed to upload image:', err);
        alert('Upload failed: ' + err.message);
      }
    }
  };

  // Link insertion
  const insertLink = () => {
    if (!linkUrl) return;
    
    // If no text selected, insert the text as anchor
    const selection = window.getSelection();
    if (selection && selection.toString().length === 0) {
      const textToInsert = linkText || linkUrl;
      const html = `<a href="${linkUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;" rel="noopener noreferrer">${textToInsert}</a>`;
      execCommand('insertHTML', html);
    } else {
      execCommand('createLink', linkUrl);
    }
    
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Insert Table Template
  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 16px; font-family: 'Prompt', sans-serif;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold;">หัวข้อ 1</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold;">หัวข้อ 2</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold;">หัวข้อ 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">ข้อมูล A1</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">ข้อมูล A2</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">ข้อมูล A3</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">ข้อมูล B1</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">ข้อมูล B2</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">ข้อมูล B3</td>
          </tr>
        </tbody>
      </table>
    `;
    execCommand('insertHTML', tableHtml);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]" id="work-documents-view-container">
      
      {/* LEFT COLUMN: Navigation & Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0" id="documents-left-sidebar">
        
        {/* Category List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-3" id="categories-list-container">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">หมวดหมู่เอกสาร</h3>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              title="เพิ่มหมวดหมู่ใหม่"
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มหมวดหมู่
            </button>
          </div>
          <div className="space-y-1">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const isActive = selectedCategory === cat.id;
              const isCustom = cat.id.startsWith('cat-');

              return (
                <div key={cat.id} className="group relative">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 border pr-10 ${
                      isActive 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10' 
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    id={`cat-btn-${cat.id}`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/10' : 'bg-slate-100'} shrink-0`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm leading-snug truncate">{cat.label}</div>
                      <div className={`text-xs mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {cat.desc}
                      </div>
                    </div>
                  </button>

                  {/* Delete button for custom categories */}
                  {isCustom && (
                    <button
                      onClick={(e) => handleDeleteCategory(cat.id, e)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border hover:bg-red-50 text-red-500 border-transparent hover:border-red-200 transition-all cursor-pointer ${
                        isActive ? 'text-slate-300 hover:text-red-500 hover:bg-white' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="ลบหมวดหมู่นี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Documents Search & List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm flex flex-col flex-1" id="documents-list-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">รายการเอกสาร</h3>
            <button
              onClick={handleCreateDocument}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-xs font-bold"
              id="new-doc-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              สร้างใหม่
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mb-4" id="doc-search-box">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อเอกสารหรือเนื้อหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
            />
          </div>

          {/* Documents Scrollable List */}
          <div className="space-y-1 overflow-y-auto max-h-[380px] lg:max-h-[500px] flex-1 pr-1 custom-scrollbar" id="doc-scroll-list">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-8 px-4 text-slate-400 text-xs">
                {searchQuery ? 'ไม่พบเอกสารที่ค้นหา' : 'ยังไม่มีเอกสารในหมวดหมู่นี้'}
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`group w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-2 border cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-medium' 
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    id={`doc-item-${doc.id}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div className="truncate text-sm font-bold leading-tight">
                        {doc.title || 'เอกสารไม่มีชื่อ'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(doc.id);
                        }}
                        title="คัดลอกลิงก์แชร์"
                        className="p-1 rounded hover:bg-slate-200/80 text-slate-500 transition-colors"
                      >
                        {copiedId === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?')) {
                            deleteDocument(doc.id);
                          }
                        }}
                        title="ลบเอกสาร"
                        className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Google Docs Styled Editor */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden" id="google-docs-editor-panel">
        
        {activeDoc ? (
          <>
            {/* Header / Meta Bar */}
            <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4" id="editor-meta-bar">
              <div className="flex-1 space-y-1">
                {/* Editable Document Title */}
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={activeDoc.title}
                    onChange={handleTitleChange}
                    onBlur={saveAllPagesToContext}
                    placeholder="ตั้งชื่อเอกสารงานที่นี่..."
                    className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 font-bold text-lg text-slate-800 px-1 py-0.5 focus:outline-none w-full max-w-md transition-all"
                  />
                </div>
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> สร้างโดย: {activeDoc.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> แก้ไขล่าสุด: {new Date(activeDoc.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. ({new Date(activeDoc.updatedAt).toLocaleDateString('th-TH')})
                  </span>
                </div>
              </div>

              {/* Share & Copy Link section */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 hover:border-slate-350 hover:text-slate-900 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                  id="print-document-button"
                  title="พิมพ์เอกสาร หรือบันทึกเป็น PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>พิมพ์ / PDF</span>
                </button>

                {/* Download Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDownloadDropdown(prev => !prev);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 hover:border-slate-350 hover:text-slate-900 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                    id="download-document-button"
                    title="ดาวน์โหลดเอกสาร"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>ดาวน์โหลด</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showDownloadDropdown && (
                    <div 
                      className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-150 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleDownloadWord}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2.5 font-bold cursor-pointer"
                      >
                        <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">W</span>
                        ดาวน์โหลดเป็น Word (.doc)
                      </button>
                      <button
                        onClick={handleDownloadHTML}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2.5 font-bold cursor-pointer"
                      >
                        <span className="w-5 h-5 rounded bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-[10px]">&lt;&gt;</span>
                        ดาวน์โหลดเป็นเว็บเพจ (.html)
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleCopyLink(activeDoc.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    copiedId === activeDoc.id
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                  }`}
                  id="share-link-button"
                >
                  {copiedId === activeDoc.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      คัดลอกสำเร็จ!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      คัดลอกลิงก์แชร์เอกสาร
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Google Docs Ribbon Toolbar */}
            <div className="bg-slate-100 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1.5" id="ribbon-toolbar">
              
              {/* Font Family Selection */}
              <select 
                onChange={(e) => execCommand('fontName', e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium focus:outline-none"
                defaultValue="Prompt"
              >
                <option value="Prompt">Prompt (ไทยหลัก)</option>
                <option value="Sarabun">Sarabun (ทางการ)</option>
                <option value="Sriracha">Sriracha (เขียนลายมือ)</option>
                <option value="Inter">Inter</option>
                <option value="monospace">Monospace (รหัสโค้ด)</option>
              </select>

              {/* Font Size Selection */}
              <select 
                onChange={(e) => execCommand('fontSize', e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium focus:outline-none w-16"
                defaultValue="4"
              >
                <option value="1">12px</option>
                <option value="2">14px</option>
                <option value="3">16px</option>
                <option value="4">18px</option>
                <option value="5">24px</option>
                <option value="6">32px</option>
                <option value="7">48px</option>
              </select>

              <div className="w-px h-5 bg-slate-300 mx-1" />

              {/* Heading Shortcut */}
              <button 
                onClick={() => execCommand('formatBlock', 'H1')} 
                title="หัวข้อใหญ่ H1"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => execCommand('formatBlock', 'H2')} 
                title="หัวข้อย่อย H2"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => execCommand('formatBlock', 'p')} 
                title="ข้อความปกติ Normal"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors flex items-center text-[10px] font-bold"
              >
                <Type className="w-3.5 h-3.5 mr-0.5" /> Normal
              </button>

              <div className="w-px h-5 bg-slate-300 mx-1" />

              {/* Bold, Italic, Underline */}
              <button 
                onClick={() => execCommand('bold')} 
                title="หนา (Bold)"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button 
                onClick={() => execCommand('italic')} 
                title="เอียง (Italic)"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button 
                onClick={() => execCommand('underline')} 
                title="ขีดเส้นใต้ (Underline)"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Underline className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-slate-300 mx-1" />

              {/* Colors Dropdown & Highlight Buttons */}
              <button 
                onClick={() => execCommand('foreColor', '#1d4ed8')} 
                title="เปลี่ยนสีตัวอักษรเป็น สีน้ำเงิน"
                className="p-1.5 rounded hover:bg-slate-200 transition-colors flex items-center"
              >
                <span className="w-3 h-3 bg-blue-600 rounded-full border border-white" />
              </button>
              <button 
                onClick={() => execCommand('foreColor', '#10b981')} 
                title="เปลี่ยนสีตัวอักษรเป็น สีเขียวมรกต"
                className="p-1.5 rounded hover:bg-slate-200 transition-colors flex items-center"
              >
                <span className="w-3 h-3 bg-emerald-500 rounded-full border border-white" />
              </button>
              <button 
                onClick={() => execCommand('foreColor', '#ea580c')} 
                title="เปลี่ยนสีตัวอักษรเป็น สีส้มแอปริคอท"
                className="p-1.5 rounded hover:bg-slate-200 transition-colors flex items-center"
              >
                <span className="w-3 h-3 bg-orange-600 rounded-full border border-white" />
              </button>
              <button 
                onClick={() => execCommand('foreColor', '#1e293b')} 
                title="เปลี่ยนสีตัวอักษรเป็น สีดำธรรมชาติ"
                className="p-1.5 rounded hover:bg-slate-200 transition-colors flex items-center"
              >
                <span className="w-3 h-3 bg-slate-800 rounded-full border border-white" />
              </button>

              <div className="w-px h-5 bg-slate-300 mx-1" />

              {/* Alignments */}
              <button 
                onClick={() => execCommand('justifyLeft')} 
                title="จัดชิดซ้าย"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => execCommand('justifyCenter')} 
                title="จัดกึ่งกลาง"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => execCommand('justifyRight')} 
                title="จัดชิดขวา"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => execCommand('justifyFull')} 
                title="จัดกระจายเท่ากัน"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-slate-300 mx-1" />

              {/* Lists */}
              <button 
                onClick={() => execCommand('insertUnorderedList')} 
                title="รายการแบบจุด (Bullet List)"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => execCommand('insertOrderedList')} 
                title="รายการแบบตัวเลข (Numbered List)"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-slate-300 mx-1" />

              {/* HTML Insertions (Image, Table, Link) */}
              <button 
                onClick={() => setShowImageModal(true)} 
                title="แทรกรูปภาพงาน"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-0.5"
              >
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-600">รูปภาพ</span>
              </button>
              <button 
                onClick={() => setShowLinkModal(true)} 
                title="แทรกลิงก์ภายนอก"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-0.5"
              >
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600">ลิงก์</span>
              </button>
              <button 
                onClick={insertTable} 
                title="แทรกตารางข้อมูล"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-0.5"
              >
                <TableIcon className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-bold text-orange-600">ตาราง</span>
              </button>

            </div>

            {/* Paper Sheet Workspace area */}
            <div className="flex-1 bg-slate-100 p-6 md:p-10 overflow-y-auto max-h-[600px] flex flex-col items-center custom-scrollbar" id="editor-workspace">
              {/* List of A4 Pages */}
              {(() => {
                const currentPages = activeDoc.pages && activeDoc.pages.length > 0 
                  ? activeDoc.pages 
                  : [activeDoc.content];
                
                return (
                  <div className="w-full space-y-8 max-w-[210mm]" id="a4-pages-container">
                    {currentPages.map((_, idx) => (
                      <div key={idx} className="w-full">
                        {/* Page Indicator and Controls */}
                        <div className="flex items-center justify-between mb-2 px-1 text-xs text-slate-400 font-bold uppercase tracking-wider">
                          <span>หน้า {idx + 1} จาก {currentPages.length}</span>
                          {currentPages.length > 1 && (
                            <button
                              onClick={() => handleDeletePage(idx)}
                              className="text-red-500 hover:text-red-700 hover:underline transition-all flex items-center gap-1 cursor-pointer"
                              title="ลบหน้ากระดาษนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> ลบหน้านี้
                            </button>
                          )}
                        </div>
                        
                        {/* A4 Sheet */}
                        <div 
                          ref={(el) => { pageRefs.current[idx] = el; }}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={() => handlePageInput(idx)}
                          onBlur={() => handlePageInput(idx)}
                          onFocus={() => setLastFocusedPageIndex(idx)}
                          className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-lg border border-slate-200 p-[15mm] md:p-[20mm] outline-none relative mx-auto focus:ring-2 focus:ring-blue-500 rounded-sm select-text text-slate-800"
                          style={{ fontFamily: 'Prompt, sans-serif' }}
                          id={`google-docs-sheet-page-${idx}`}
                        />
                      </div>
                    ))}
                    
                    {/* Add New Page Button */}
                    <div className="flex justify-center pt-2 pb-6">
                      <button
                        onClick={handleAddPage}
                        className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                        id="add-page-button"
                      >
                        <Plus className="w-4 h-4" />
                        เพิ่มกระดาษแผ่นใหม่ (A4)
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick tips footer */}
            <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2" id="editor-footer">
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-blue-500" /> ระบบกำลังเซฟและซิงค์ข้อมูลลงคลาวด์แบบเรียลไทม์...
              </span>
              <span>
                💡 แนะนำ: คัดลอกลิงก์แชร์ด้านบน แล้วไปแปะใน <strong>"ฟังก์ชันส่งมอบงาน"</strong> หรือ <strong>"สคริปต์ / คอมเมนต์"</strong> เพื่อเชื่อมโยงเนื้อหาได้ทันที!
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-slate-400 gap-3" id="no-document-selected-fallback">
            <FolderOpen className="w-12 h-12 text-slate-300" />
            <div className="text-center">
              <h3 className="font-bold text-slate-700 text-sm">ไม่พบเอกสารงาน</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                โปรดเลือกเอกสารจากคอลัมน์ด้านซ้าย หรือคลิกเพื่อสร้างหน้าเอกสารงานใหม่ของคุณเอง
              </p>
            </div>
            <button
              onClick={handleCreateDocument}
              className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              สร้างเอกสารแรก
            </button>
          </div>
        )}

      </div>

      {/* IMAGE INSERTION MODAL */}
      {showImageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" id="image-insert-modal">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-150 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 text-sm">แทรกรูปภาพลงเอกสาร</h4>
              <button 
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option A: Link URL */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ตัวเลือกที่ 1: ใส่ลิงก์ URL รูปภาพ</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 text-xs text-slate-400 font-bold justify-center">
                <div className="h-px bg-slate-200 flex-1" />
                หรือ
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Option B: Local File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ตัวเลือกที่ 2: อัปโหลดรูปภาพจากคอมพิวเตอร์</label>
                <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="text-center space-y-1">
                    <ImageIcon className="w-6 h-6 mx-auto text-slate-400" />
                    <span className="block text-xs text-slate-500 font-bold">เลือกไฟล์ภาพหลักที่นี่</span>
                    <span className="block text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG, WEBP</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setImageUrl('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => insertImage(imageUrl)}
                  disabled={!imageUrl}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors"
                >
                  แทรกรูปภาพ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LINK INSERTION MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" id="link-insert-modal">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-150 shadow-2xl animate-in fade-in duration-200">
            <h4 className="font-bold text-slate-800 text-sm mb-4">แทรกลิงก์เชื่อมโยง</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ลิงก์ URL ปลายทาง</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ข้อความแสดงผล (เลือกใส่ได้)</label>
                <input
                  type="text"
                  placeholder="เช่น คลิกดูเอกสารประกอบ"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={insertLink}
                  disabled={!linkUrl}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors"
                >
                  แทรกลิงก์
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" id="add-category-modal">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-150 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
              <FolderPlus className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-base">เพิ่มหมวดหมู่เอกสารใหม่</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ชื่อหมวดหมู่</label>
                <input
                  type="text"
                  placeholder="เช่น เอกสารจัดซื้อ, แผนการตลาด"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">คำอธิบายหมวดหมู่</label>
                <input
                  type="text"
                  placeholder="เช่น ตารางราคาและข้อมูลสัญญาจัดซื้อจัดจ้าง"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">เลือกธีมโทนสี</label>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {colorChoices.map((choice) => (
                    <button
                      key={choice.value}
                      onClick={() => setNewCatColor(choice.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border text-left transition-all cursor-pointer ${
                        newCatColor === choice.value
                          ? 'border-blue-600 bg-blue-50/50 text-blue-800 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${choice.value}`} />
                      <span>{choice.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCatLabel('');
                    setNewCatDesc('');
                    setNewCatColor('from-purple-500 to-indigo-600');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCatLabel.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg cursor-pointer"
                >
                  บันทึกหมวดหมู่ใหม่
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
