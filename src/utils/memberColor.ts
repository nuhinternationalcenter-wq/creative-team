import { TeamMember } from '../types';

export interface MemberColorStyle {
  hex: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  columnBg: string;
  columnBorder: string;
  cardBorderLeft: string;
  cardBorderHover: string;
  badgeBg: string;
  badgeText: string;
  subtleBg: string;
  ringFocus: string;
}

// Preset color map for clean minimalist design
const COLOR_THEMES: Record<string, MemberColorStyle> = {
  rose: {
    hex: '#f43f5e',
    headerBg: 'bg-rose-50/80',
    headerBorder: 'border-rose-200',
    headerText: 'text-rose-900',
    columnBg: 'bg-rose-50/25',
    columnBorder: 'border-rose-200/90',
    cardBorderLeft: 'border-l-rose-500',
    cardBorderHover: 'hover:border-rose-300',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    subtleBg: 'bg-rose-50',
    ringFocus: 'ring-rose-400',
  },
  blue: {
    hex: '#3b82f6',
    headerBg: 'bg-blue-50/80',
    headerBorder: 'border-blue-200',
    headerText: 'text-blue-900',
    columnBg: 'bg-blue-50/25',
    columnBorder: 'border-blue-200/90',
    cardBorderLeft: 'border-l-blue-500',
    cardBorderHover: 'hover:border-blue-300',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    subtleBg: 'bg-blue-50',
    ringFocus: 'ring-blue-400',
  },
  amber: {
    hex: '#f59e0b',
    headerBg: 'bg-amber-50/80',
    headerBorder: 'border-amber-200',
    headerText: 'text-amber-900',
    columnBg: 'bg-amber-50/25',
    columnBorder: 'border-amber-200/90',
    cardBorderLeft: 'border-l-amber-500',
    cardBorderHover: 'hover:border-amber-300',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    subtleBg: 'bg-amber-50',
    ringFocus: 'ring-amber-400',
  },
  emerald: {
    hex: '#10b981',
    headerBg: 'bg-emerald-50/80',
    headerBorder: 'border-emerald-200',
    headerText: 'text-emerald-900',
    columnBg: 'bg-emerald-50/25',
    columnBorder: 'border-emerald-200/90',
    cardBorderLeft: 'border-l-emerald-500',
    cardBorderHover: 'hover:border-emerald-300',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    subtleBg: 'bg-emerald-50',
    ringFocus: 'ring-emerald-400',
  },
  indigo: {
    hex: '#6366f1',
    headerBg: 'bg-indigo-50/80',
    headerBorder: 'border-indigo-200',
    headerText: 'text-indigo-900',
    columnBg: 'bg-indigo-50/25',
    columnBorder: 'border-indigo-200/90',
    cardBorderLeft: 'border-l-indigo-500',
    cardBorderHover: 'hover:border-indigo-300',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    subtleBg: 'bg-indigo-50',
    ringFocus: 'ring-indigo-400',
  },
  pink: {
    hex: '#ec4899',
    headerBg: 'bg-pink-50/80',
    headerBorder: 'border-pink-200',
    headerText: 'text-pink-900',
    columnBg: 'bg-pink-50/25',
    columnBorder: 'border-pink-200/90',
    cardBorderLeft: 'border-l-pink-500',
    cardBorderHover: 'hover:border-pink-300',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-800',
    subtleBg: 'bg-pink-50',
    ringFocus: 'ring-pink-400',
  },
  cyan: {
    hex: '#06b6d4',
    headerBg: 'bg-cyan-50/80',
    headerBorder: 'border-cyan-200',
    headerText: 'text-cyan-900',
    columnBg: 'bg-cyan-50/25',
    columnBorder: 'border-cyan-200/90',
    cardBorderLeft: 'border-l-cyan-500',
    cardBorderHover: 'hover:border-cyan-300',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    subtleBg: 'bg-cyan-50',
    ringFocus: 'ring-cyan-400',
  },
  violet: {
    hex: '#8b5cf6',
    headerBg: 'bg-violet-50/80',
    headerBorder: 'border-violet-200',
    headerText: 'text-violet-900',
    columnBg: 'bg-violet-50/25',
    columnBorder: 'border-violet-200/90',
    cardBorderLeft: 'border-l-violet-500',
    cardBorderHover: 'hover:border-violet-300',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    subtleBg: 'bg-violet-50',
    ringFocus: 'ring-violet-400',
  },
  purple: {
    hex: '#a855f7',
    headerBg: 'bg-purple-50/80',
    headerBorder: 'border-purple-200',
    headerText: 'text-purple-900',
    columnBg: 'bg-purple-50/25',
    columnBorder: 'border-purple-200/90',
    cardBorderLeft: 'border-l-purple-500',
    cardBorderHover: 'hover:border-purple-300',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    subtleBg: 'bg-purple-50',
    ringFocus: 'ring-purple-400',
  },
  teal: {
    hex: '#14b8a6',
    headerBg: 'bg-teal-50/80',
    headerBorder: 'border-teal-200',
    headerText: 'text-teal-900',
    columnBg: 'bg-teal-50/25',
    columnBorder: 'border-teal-200/90',
    cardBorderLeft: 'border-l-teal-500',
    cardBorderHover: 'hover:border-teal-300',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    subtleBg: 'bg-teal-50',
    ringFocus: 'ring-teal-400',
  },
  slate: {
    hex: '#334155',
    headerBg: 'bg-slate-100/90',
    headerBorder: 'border-slate-300',
    headerText: 'text-slate-900',
    columnBg: 'bg-slate-50/40',
    columnBorder: 'border-slate-300/80',
    cardBorderLeft: 'border-l-slate-700',
    cardBorderHover: 'hover:border-slate-400',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-800',
    subtleBg: 'bg-slate-100',
    ringFocus: 'ring-slate-400',
  },
};

export const getMemberColorStyle = (memberOrBg?: string | TeamMember): MemberColorStyle => {
  if (!memberOrBg) return COLOR_THEMES.blue;

  let bgStr = '';
  if (typeof memberOrBg === 'string') {
    bgStr = memberOrBg;
  } else {
    bgStr = memberOrBg.color || memberOrBg.avatarBg || '';
  }

  const lower = bgStr.toLowerCase();
  if (lower.includes('rose') || lower.includes('f43f5e') || lower.includes('e11d48')) return COLOR_THEMES.rose;
  if (lower.includes('blue') || lower.includes('3b82f6') || lower.includes('2563eb')) return COLOR_THEMES.blue;
  if (lower.includes('amber') || lower.includes('f59e0b') || lower.includes('d97706') || lower.includes('yellow')) return COLOR_THEMES.amber;
  if (lower.includes('emerald') || lower.includes('10b981') || lower.includes('059669') || lower.includes('green')) return COLOR_THEMES.emerald;
  if (lower.includes('indigo') || lower.includes('6366f1') || lower.includes('4f46e5')) return COLOR_THEMES.indigo;
  if (lower.includes('pink') || lower.includes('ec4899') || lower.includes('db2777')) return COLOR_THEMES.pink;
  if (lower.includes('cyan') || lower.includes('06b6d4') || lower.includes('0284c7') || lower.includes('sky')) return COLOR_THEMES.cyan;
  if (lower.includes('violet') || lower.includes('8b5cf6') || lower.includes('7c3aed')) return COLOR_THEMES.violet;
  if (lower.includes('purple') || lower.includes('a855f7') || lower.includes('9333ea')) return COLOR_THEMES.purple;
  if (lower.includes('teal') || lower.includes('14b8a6') || lower.includes('0d9488')) return COLOR_THEMES.teal;
  if (lower.includes('slate') || lower.includes('334155') || lower.includes('475569') || lower.includes('gray')) return COLOR_THEMES.slate;

  if (bgStr.startsWith('#')) {
    return {
      hex: bgStr,
      headerBg: 'bg-white',
      headerBorder: 'border-slate-300',
      headerText: 'text-slate-900',
      columnBg: 'bg-slate-50/40',
      columnBorder: 'border-slate-200',
      cardBorderLeft: 'border-l-slate-700',
      cardBorderHover: 'hover:border-slate-400',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-900',
      subtleBg: 'bg-slate-50',
      ringFocus: 'ring-blue-500',
    };
  }

  return COLOR_THEMES.blue;
};
