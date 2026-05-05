import { TreeCardTheme, TreeState } from './types';

type TreeCardConfig = NonNullable<TreeState['cardConfig']>;

interface TreeCardThemeDesign {
  id: TreeCardTheme;
  label: string;
  frameClass: string;
  artClass: string;
  miniClass: string;
  chipClass: string;
  progressClass: string;
  textClass: string;
  mutedTextClass: string;
  glowClass: string;
  defaultIcon: string;
}

const TREE_CARD_THEMES: TreeCardThemeDesign[] = [
  {
    id: 'classic',
    label: '햇살 농장',
    frameClass: 'bg-white border-stone-200 text-stone-800 shadow-xl shadow-stone-200/50',
    artClass: 'bg-linear-to-br from-red-50 via-white to-lime-50 border-red-100',
    miniClass: 'bg-white/80 text-stone-700 border-white/70',
    chipClass: 'bg-red-50 text-apple-red border-red-100',
    progressClass: 'bg-apple-red',
    textClass: 'text-stone-800',
    mutedTextClass: 'text-stone-500',
    glowClass: 'bg-red-200/40',
    defaultIcon: '🍎',
  },
  {
    id: 'nature',
    label: '초록 과수원',
    frameClass: 'bg-linear-to-br from-green-50 to-emerald-100 border-green-200 text-green-950 shadow-lg shadow-green-200/50',
    artClass: 'bg-linear-to-br from-lime-100 via-emerald-50 to-white border-green-100',
    miniClass: 'bg-white/65 text-green-950 border-white/70',
    chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    progressClass: 'bg-emerald-500',
    textClass: 'text-green-950',
    mutedTextClass: 'text-green-700/70',
    glowClass: 'bg-lime-200/50',
    defaultIcon: '🍏',
  },
  {
    id: 'sunset',
    label: '노을 사과',
    frameClass: 'bg-linear-to-br from-orange-50 via-rose-50 to-yellow-100 border-orange-200 text-stone-900 shadow-lg shadow-orange-200/50',
    artClass: 'bg-linear-to-br from-orange-100 via-rose-50 to-yellow-50 border-orange-100',
    miniClass: 'bg-white/70 text-stone-800 border-white/70',
    chipClass: 'bg-orange-50 text-orange-700 border-orange-100',
    progressClass: 'bg-orange-500',
    textClass: 'text-stone-900',
    mutedTextClass: 'text-orange-800/65',
    glowClass: 'bg-orange-200/50',
    defaultIcon: '🍎',
  },
  {
    id: 'picnic',
    label: '피크닉 박스',
    frameClass: 'bg-linear-to-br from-yellow-50 via-white to-red-50 border-yellow-200 text-stone-900 shadow-lg shadow-yellow-200/40',
    artClass: 'bg-[linear-gradient(45deg,#fff7ed_25%,#ffffff_25%,#ffffff_50%,#fff7ed_50%,#fff7ed_75%,#ffffff_75%,#ffffff)] bg-[length:18px_18px] border-yellow-100',
    miniClass: 'bg-white/80 text-stone-800 border-white/70',
    chipClass: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    progressClass: 'bg-yellow-500',
    textClass: 'text-stone-900',
    mutedTextClass: 'text-yellow-800/65',
    glowClass: 'bg-yellow-200/45',
    defaultIcon: '🍯',
  },
  {
    id: 'sky',
    label: '맑은 영주',
    frameClass: 'bg-linear-to-br from-sky-50 via-white to-cyan-100 border-sky-200 text-slate-900 shadow-lg shadow-sky-200/45',
    artClass: 'bg-linear-to-br from-sky-100 via-white to-cyan-50 border-sky-100',
    miniClass: 'bg-white/70 text-slate-800 border-white/70',
    chipClass: 'bg-sky-50 text-sky-700 border-sky-100',
    progressClass: 'bg-sky-500',
    textClass: 'text-slate-900',
    mutedTextClass: 'text-sky-800/65',
    glowClass: 'bg-sky-200/50',
    defaultIcon: '🍏',
  },
  {
    id: 'blossom',
    label: '꽃피는 봄',
    frameClass: 'bg-linear-to-br from-pink-50 via-white to-rose-100 border-pink-200 text-stone-900 shadow-lg shadow-pink-200/45',
    artClass: 'bg-linear-to-br from-pink-100 via-white to-rose-50 border-pink-100',
    miniClass: 'bg-white/75 text-stone-800 border-white/70',
    chipClass: 'bg-pink-50 text-pink-700 border-pink-100',
    progressClass: 'bg-pink-500',
    textClass: 'text-stone-900',
    mutedTextClass: 'text-pink-800/65',
    glowClass: 'bg-pink-200/50',
    defaultIcon: '🌸',
  },
  {
    id: 'golden',
    label: '황금 수확',
    frameClass: 'bg-linear-to-br from-amber-100 via-yellow-50 to-white border-amber-300 text-stone-900 shadow-lg shadow-amber-200/55',
    artClass: 'bg-linear-to-br from-amber-100 via-yellow-50 to-white border-amber-100',
    miniClass: 'bg-white/75 text-stone-800 border-white/70',
    chipClass: 'bg-amber-50 text-amber-700 border-amber-100',
    progressClass: 'bg-amber-500',
    textClass: 'text-stone-900',
    mutedTextClass: 'text-amber-800/65',
    glowClass: 'bg-amber-200/55',
    defaultIcon: '⭐',
  },
  {
    id: 'night',
    label: '별빛 농장',
    frameClass: 'bg-linear-to-br from-stone-900 via-slate-900 to-blue-950 border-blue-500 text-white shadow-blue-500/20',
    artClass: 'bg-linear-to-br from-slate-800 via-blue-950 to-stone-900 border-white/10',
    miniClass: 'bg-white/15 text-white border-white/20',
    chipClass: 'bg-white/15 text-white border-white/20',
    progressClass: 'bg-cyan-300',
    textClass: 'text-white',
    mutedTextClass: 'text-white/65',
    glowClass: 'bg-cyan-300/20',
    defaultIcon: '🌙',
  },
  {
    id: 'forest',
    label: '소백 숲',
    frameClass: 'bg-linear-to-br from-teal-50 via-emerald-50 to-stone-100 border-teal-200 text-teal-950 shadow-lg shadow-teal-200/40',
    artClass: 'bg-linear-to-br from-teal-100 via-emerald-50 to-white border-teal-100',
    miniClass: 'bg-white/70 text-teal-950 border-white/70',
    chipClass: 'bg-teal-50 text-teal-700 border-teal-100',
    progressClass: 'bg-teal-500',
    textClass: 'text-teal-950',
    mutedTextClass: 'text-teal-800/65',
    glowClass: 'bg-teal-200/50',
    defaultIcon: '🌿',
  },
  {
    id: 'neon',
    label: '밤하늘 카드',
    frameClass: 'bg-linear-to-br from-stone-900 to-blue-900 border-blue-500 text-white shadow-blue-500/20',
    artClass: 'bg-linear-to-br from-indigo-950 via-stone-900 to-blue-950 border-white/10',
    miniClass: 'bg-white/15 text-white border-white/20',
    chipClass: 'bg-white/15 text-white border-white/20',
    progressClass: 'bg-blue-300',
    textClass: 'text-white',
    mutedTextClass: 'text-white/65',
    glowClass: 'bg-blue-300/20',
    defaultIcon: '✨',
  },
  {
    id: 'vintage',
    label: '빈티지 수확',
    frameClass: 'bg-linear-to-br from-stone-100 via-orange-50 to-yellow-50 border-stone-300 text-stone-900 shadow-lg shadow-stone-200/50',
    artClass: 'bg-linear-to-br from-stone-100 via-orange-50 to-white border-stone-200',
    miniClass: 'bg-white/70 text-stone-800 border-white/70',
    chipClass: 'bg-stone-100 text-stone-700 border-stone-200',
    progressClass: 'bg-stone-600',
    textClass: 'text-stone-900',
    mutedTextClass: 'text-stone-500',
    glowClass: 'bg-stone-200/45',
    defaultIcon: '🍂',
  },
];

const TREE_CARD_THEME_IDS = TREE_CARD_THEMES.map(theme => theme.id);
const TREE_CARD_ICONS = ['🍎', '🍏', '🍎', '🍏', '🍯', '🌸', '⭐', '🌿'];
const STICKER_TYPES = ['leaf', 'sparkle', 'apple', 'flower', 'sun'];

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const pickByHash = <T,>(items: readonly T[], seed: string, offset = 0) =>
  items[(hashString(`${seed}:${offset}`) + offset) % items.length];

const pickRandom = <T,>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)];

export const createRandomTreeCardConfig = (): TreeCardConfig => ({
  theme: pickRandom(TREE_CARD_THEME_IDS),
  icon: pickRandom(TREE_CARD_ICONS),
  stickers: Array.from({ length: 3 }, (_, index) => ({
    id: Math.random().toString(36).slice(2, 8),
    x: 14 + Math.round(Math.random() * 72),
    y: 14 + Math.round(Math.random() * 68),
    type: pickRandom(STICKER_TYPES),
  })),
});

export const getTreeCardDesign = (tree: TreeState) => {
  const themeId = tree.cardConfig?.theme && TREE_CARD_THEME_IDS.includes(tree.cardConfig.theme)
    ? tree.cardConfig.theme
    : pickByHash(TREE_CARD_THEME_IDS, tree.id || tree.nickname);
  const theme = TREE_CARD_THEMES.find(item => item.id === themeId) ?? TREE_CARD_THEMES[0];
  const icon = tree.cardConfig?.icon || pickByHash(TREE_CARD_ICONS, tree.id || tree.nickname, 7) || theme.defaultIcon;

  return {
    ...theme,
    icon,
    displayIcon: tree.growthStage === '시즌종료' ? icon : '🌳',
    stickers: tree.cardConfig?.stickers?.length
      ? tree.cardConfig.stickers
      : [
          { id: `${tree.id}-a`, x: 18, y: 20, type: pickByHash(STICKER_TYPES, tree.id, 1) },
          { id: `${tree.id}-b`, x: 78, y: 26, type: pickByHash(STICKER_TYPES, tree.id, 2) },
          { id: `${tree.id}-c`, x: 64, y: 72, type: pickByHash(STICKER_TYPES, tree.id, 3) },
        ],
  };
};

export const getTreeCardStickerIcon = (type: string) => {
  switch (type) {
    case 'leaf':
      return '🌿';
    case 'sparkle':
      return '✨';
    case 'flower':
      return '🌸';
    case 'sun':
      return '☀️';
    case 'apple':
    default:
      return '🍎';
  }
};
