
// ============ Competition Status ============
export const COMPETITION_STATUSES = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const;

export const COMPETITION_STATUS_SELECT = [
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' }
] as const;

export const COMPETITION_STATUS_FILTER = [
  { label: 'All Statuses', value: 'ALL' },
  ...COMPETITION_STATUS_SELECT
] as const;

// ============ Competition Type ============
export const COMPETITION_TYPES = ['LEAGUE', 'CUP', 'FRIENDLY', 'TOURNAMENT'] as const;
export const COMPETITION_TYPE_SELECT = [
  { label: 'League', value: 'LEAGUE' },
  { label: 'Cup', value: 'CUP' },
  { label: 'Tournament', value: 'TOURNAMENT' },
  { label: 'Friendly', value: 'FRIENDLY' }
] as const;

export const COMPETITION_TYPE_FILTER = [
  { label: 'All Types', value: 'ALL' },
  ...COMPETITION_TYPE_SELECT
] as const;

// ============ Competition Scope ============
export const SCOPES = ['LOCAL', 'NATIONAL', 'INTERNATIONAL', 'CONTINENTAL'] as const;

export const SCOPE_SELECT = [
  { label: 'Local', value: 'LOCAL' },
  { label: 'National', value: 'NATIONAL' },
  { label: 'International', value: 'INTERNATIONAL' },
  { label: 'Continental', value: 'CONTINENTAL' }
] as const;

export const SCOPE_FILTER = [
  { label: 'All Scopes', value: 'ALL' },
  ...SCOPE_SELECT
] as const;

// ============ Competition Leg Format ============
export const LEG_FORMATS = ['SINGLE', 'DOUBLE', 'MIXED'] as const;

export const LEG_FORMAT_SELECT = [
  { label: 'Single', value: 'SINGLE' },
  { label: 'Double', value: 'DOUBLE' },
  { label: 'Mixed', value: 'MIXED' }
] as const;

export const LEG_FORMAT_FILTER = [
  { label: 'All Formats', value: 'ALL' },
  ...LEG_FORMAT_SELECT
] as const;

// ============ Helper to generate select options ============
export const CREATE_SELECT_OPTIONS = <T extends string>(
  values: readonly T[],
  labelMap: Record<T, string>
) => {
  return values.map(value => ({
    label: labelMap[value],
    value
  }));
};

// ============ Helper to generate filter options ============
export const CREATE_FILTER_OPTIONS = <T extends string>(
  values: readonly T[],
  labelMap: Record<T, string>,
  allLabel: string = 'All'
) => {
  const selectOptions = values.map(value => ({
    label: labelMap[value],
    value
  }));
  
  return [
    { label: allLabel, value: 'ALL' },
    ...selectOptions
  ];
};