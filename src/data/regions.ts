// Region gating configuration
// Maps state codes to their gate group and required sanad

export interface RegionGroup {
  name: string;
  sanadId: string; // item ID required to unlock
  stateCodes: string[]; // state template codes in this group
}

// Region groups — progression gating
export const REGION_GROUPS: RegionGroup[] = [
  {
    name: 'Heartland',
    sanadId: '', // always accessible
    stateCodes: ['D', 'd', 'y', 'l', 'p'],
  },
  {
    name: 'Rajputana',
    sanadId: 'sanad_rajputana',
    stateCodes: ['r', 'g'],
  },
  {
    name: 'Bengal & East',
    sanadId: 'sanad_bengal',
    stateCodes: ['b', 'j', 'w', 'o'],
  },
  {
    name: 'Central India',
    sanadId: 'sanad_deccan',
    stateCodes: ['m', 'c', 'x', 'v', '$'],
  },
  {
    name: 'Southern Kingdoms',
    sanadId: 'sanad_south',
    stateCodes: ['k', 'f', '@', '#'],
  },
  {
    name: 'Northeast Frontier',
    sanadId: 'sanad_northeast',
    stateCodes: ['s', 'z', 'a', 'e', 'n', 'i', 'q', 't'],
  },
  {
    name: 'Himalayas',
    sanadId: '', // always accessible (but harsh terrain)
    stateCodes: ['h', 'u', '^'],
  },
];

// Build lookup: state code → region group
const _codeToGroup = new Map<string, RegionGroup>();
for (const group of REGION_GROUPS) {
  for (const code of group.stateCodes) {
    _codeToGroup.set(code, group);
  }
}

export function getRegionGroup(stateCode: string): RegionGroup | undefined {
  return _codeToGroup.get(stateCode);
}

export function getRequiredSanad(stateCode: string): string {
  const group = _codeToGroup.get(stateCode);
  return group?.sanadId || '';
}

export function getRegionName(stateCode: string): string {
  const group = _codeToGroup.get(stateCode);
  return group?.name || 'Unknown Territory';
}
