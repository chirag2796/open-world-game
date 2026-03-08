// Indo-Saracenic Design System
// Anchored in Mughal architectural palette with South Asian symmetry principles

// ─── Core Palette ────────────────────────────────────────────

export const INDO_PALETTE = {
  // Primary stones
  redSandstone: '#422726',
  redSandstoneLight: '#6a3d38',
  whiteMarble: '#C5C2C2',
  whiteMarbleLight: '#E8E4E0',
  creamMarble: '#F0ECE0',

  // Accents
  mughalGreen: '#306030',
  mughalGreenLight: '#48804a',
  lapisBlue: '#003472',
  lapisBlueLight: '#1a5090',
  gold: '#F0EECE',
  goldBright: '#E0C040',
  goldDim: '#B8A040',

  // Functional — Rasa-inspired (aesthetic moods)
  veeraRed: '#C03030',       // heroic / primary action
  veeraRedLight: '#E04040',
  shantaBlue: '#204060',     // calm / background menus
  shantaBlueLight: '#305880',
  adbhutaPurple: '#6040A0',  // wonder / mythic elements
  karunaTeal: '#207068',     // compassion / healing
  bibhatsaGray: '#484048',   // disgust / cursed items
  raudraOrange: '#C06020',   // fury / fire attacks

  // UI surfaces
  panelDark: '#0F0F1E',
  panelMid: '#1A1A2E',
  panelLight: '#252540',
  borderGold: '#E0D8B0',
  borderDim: '#806840',
  textPrimary: '#F0F0E0',
  textSecondary: '#B0B0A0',
  textMuted: '#666666',
} as const;

// ─── Rarity Colors ───────────────────────────────────────────

export const RARITY_COLORS = {
  common: '#a0a0a0',
  uncommon: '#40a040',
  rare: '#4080e0',
  legendary: '#e0a020',
} as const;

export const RARITY_BORDERS = {
  common: '#707070',
  uncommon: '#308030',
  rare: '#2060c0',
  legendary: '#c08010',
} as const;

export const RARITY_LABELS = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
} as const;

// ─── Creature Type Colors (enhanced) ─────────────────────────

export const CREATURE_COLORS = {
  mythic:    { bg: '#6040A0', border: '#8060C0', text: '#D0C0F0' },
  soldier:   { bg: '#805030', border: '#A06040', text: '#E0C8B0' },
  beast:     { bg: '#407030', border: '#609040', text: '#C0E0B0' },
  automaton: { bg: '#505868', border: '#707888', text: '#C0C8D0' },
  naga:      { bg: '#206080', border: '#3080A0', text: '#B0D8E8' },
} as const;

// ─── Typography ──────────────────────────────────────────────

export const FONT = {
  family: 'monospace',
  // Size hierarchy
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 22,
} as const;

// ─── Spacing (Samabhanga symmetry) ───────────────────────────
// All spacing is multiples of 4 for visual harmony

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// ─── Touch Targets ───────────────────────────────────────────
// Minimum 44x44 per Apple HIG / Material guidelines

export const TOUCH = {
  minSize: 44,
  buttonHeight: 48,
  iconButton: 56,
} as const;

// ─── Borders & Corners ──────────────────────────────────────

export const BORDER = {
  thin: 1,
  medium: 2,
  thick: 3,
  radiusSm: 4,
  radiusMd: 8,
  radiusLg: 12,
  radiusRound: 28,
} as const;

// ─── Architectural Decorative Constants ──────────────────────
// For potential UI frame decorations (scalloped arches, etc.)

export const ARCH = {
  // Scalloped arch proportions (width:height = 2:1)
  ratio: 2,
  // Mughal arch curve (percentage of arch width for control point)
  curvePercent: 0.4,
  // Jali (screen) pattern density
  jaliGrid: 6,
} as const;
