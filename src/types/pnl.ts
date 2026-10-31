/**
 * P&L Dashboard Data Types and Configurations
 */

export type GadClassification = 'GAD' | 'Non-GAD';

export type BidType =
  | 'RFP'
  | 'Sole Source'
  | 'Framework'
  | 'Time & Material'
  | 'Fixed Price'
  | 'Renewal';

export type PlCategory =
  | 'Revenue'
  | 'Gross Margin'
  | 'SG&A'
  | 'Direct Cost'
  | 'Operating Expense'
  | 'Other Income/Cost';

export interface PnlRecord {
  id: string;
  reportingRegion: string;
  wk: string;
  wkName: string;
  gadNonGad: GadClassification;
  bidType: BidType;
  plCategory: PlCategory;
  monthlyRevenue: number;
  grossMargin: number;
  sga: number;
  quarterlyRevenue: number;
  quarterlyEbitda: number;
  fyRevenue: number;
  fyEbitda: number;
  periodMonth?: string;
  periodQuarter?: string;
  periodFy?: string;
  notes?: string;
  updatedAt?: string;
}

export type NumberSystem = 'international' | 'indian';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'NONE';
export type DisplayScale = 'exact' | 'thousands' | 'millions' | 'lakhs' | 'crores';

export interface FormattingConfig {
  numberSystem: NumberSystem;
  currency: CurrencyCode;
  scale: DisplayScale;
  showDecimals: boolean;
}

export interface ValidationIssue {
  recordId: string;
  wk: string;
  wkName: string;
  region: string;
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestedAction?: string;
}

export interface PnlConfig {
  ebitdaBasis: 'gross_margin' | 'revenue_less_all';
  annualizeQuarterly: boolean; // default false as per prompt
  allowManualOverride: boolean; // default true
  divergenceThresholdPercent: number; // e.g. 35%
}

export const INITIAL_REGIONS = [
  'North America - East',
  'North America - West',
  'EMEA - UK & Ireland',
  'EMEA - DACH',
  'EMEA - Nordics',
  'APAC - India',
  'APAC - ASEAN',
  'APAC - ANZ',
  'LATAM - Brazil & South'
];

export const INITIAL_BID_TYPES: BidType[] = [
  'RFP',
  'Sole Source',
  'Framework',
  'Time & Material',
  'Fixed Price',
  'Renewal'
];

export const INITIAL_PL_CATEGORIES: PlCategory[] = [
  'Revenue',
  'Gross Margin',
  'SG&A',
  'Direct Cost',
  'Operating Expense',
  'Other Income/Cost'
];

export const DEFAULT_FORMATTING_CONFIG: FormattingConfig = {
  numberSystem: 'international',
  currency: 'USD',
  scale: 'exact',
  showDecimals: true
};

export const DEFAULT_PNL_CONFIG: PnlConfig = {
  ebitdaBasis: 'gross_margin',
  annualizeQuarterly: false,
  allowManualOverride: true,
  divergenceThresholdPercent: 35
};

// Realistic initial enterprise sample dataset
export const SAMPLE_RECORDS: PnlRecord[] = [
  {
    id: 'pnl-001',
    reportingRegion: 'North America - East',
    wk: 'WK-01',
    wkName: 'Cloud Infrastructure & DevOps',
    gadNonGad: 'GAD',
    bidType: 'Fixed Price',
    plCategory: 'Revenue',
    monthlyRevenue: 2450000.00,
    grossMargin: 931000.00, // 38.0%
    sga: 245000.00, // 10%
    quarterlyRevenue: 7350000.00,
    quarterlyEbitda: 2058000.00, // 28.0%
    fyRevenue: 29400000.00,
    fyEbitda: 8232000.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  },
  {
    id: 'pnl-002',
    reportingRegion: 'North America - East',
    wk: 'WK-02',
    wkName: 'Cybersecurity & Governance',
    gadNonGad: 'Non-GAD',
    bidType: 'Time & Material',
    plCategory: 'Gross Margin',
    monthlyRevenue: 1350000.00,
    grossMargin: 567000.00, // 42.0%
    sga: 148500.00, // 11%
    quarterlyRevenue: 4050000.00,
    quarterlyEbitda: 1255500.00, // 31.0%
    fyRevenue: 16200000.00,
    fyEbitda: 5022000.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  },
  {
    id: 'pnl-003',
    reportingRegion: 'North America - West',
    wk: 'WK-03',
    wkName: 'Data Analytics & AI Systems',
    gadNonGad: 'GAD',
    bidType: 'RFP',
    plCategory: 'Revenue',
    monthlyRevenue: 3100000.00,
    grossMargin: 1240000.00, // 40.0%
    sga: 341000.00, // 11%
    quarterlyRevenue: 9300000.00,
    quarterlyEbitda: 2697000.00, // 29.0%
    fyRevenue: 37200000.00,
    fyEbitda: 10788000.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  },
  {
    id: 'pnl-004',
    reportingRegion: 'EMEA - UK & Ireland',
    wk: 'WK-04',
    wkName: 'Digital Banking & FinTech Platform',
    gadNonGad: 'GAD',
    bidType: 'Sole Source',
    plCategory: 'Revenue',
    monthlyRevenue: 1850000.00,
    grossMargin: 777000.00, // 42.0%
    sga: 185000.00, // 10%
    quarterlyRevenue: 5550000.00,
    quarterlyEbitda: 1776000.00, // 32.0%
    fyRevenue: 22200000.00,
    fyEbitda: 7104000.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  },
  {
    id: 'pnl-005',
    reportingRegion: 'EMEA - DACH',
    wk: 'WK-05',
    wkName: 'Enterprise ERP SAP Migration',
    gadNonGad: 'Non-GAD',
    bidType: 'Framework',
    plCategory: 'Gross Margin',
    monthlyRevenue: 2100000.00,
    grossMargin: 735000.00, // 35.0%
    sga: 231000.00, // 11%
    quarterlyRevenue: 6300000.00,
    quarterlyEbitda: 1512000.00, // 24.0%
    fyRevenue: 25200000.00,
    fyEbitda: 6048000.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  },
  {
    id: 'pnl-006',
    reportingRegion: 'APAC - India',
    wk: 'WK-06',
    wkName: 'Global Capability Center Support',
    gadNonGad: 'GAD',
    bidType: 'Time & Material',
    plCategory: 'Revenue',
    monthlyRevenue: 2800000.00,
    grossMargin: 1260000.00, // 45.0%
    sga: 224000.00, // 8%
    quarterlyRevenue: 8400000.00,
    quarterlyEbitda: 3108000.00, // 37.0%
    fyRevenue: 33600000.00,
    fyEbitda: 12432000.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  },
  {
    id: 'pnl-007',
    reportingRegion: 'APAC - India',
    wk: 'WK-07',
    wkName: 'Applied Machine Learning Labs',
    gadNonGad: 'Non-GAD',
    bidType: 'RFP',
    plCategory: 'Gross Margin',
    monthlyRevenue: 1600000.00,
    grossMargin: 704000.00, // 44.0%
    sga: 176000.00, // 11%
    quarterlyRevenue: 4800000.00,
    quarterlyEbitda: 1584000.00, // 33.0%
    fyRevenue: 19200000.00,
    fyEbitda: 6336000.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  },
  {
    id: 'pnl-008',
    reportingRegion: 'APAC - ASEAN',
    wk: 'WK-08',
    wkName: 'Omnichannel Commerce Modernization',
    gadNonGad: 'GAD',
    bidType: 'Renewal',
    plCategory: 'Revenue',
    monthlyRevenue: 1420000.00,
    grossMargin: 539600.00, // 38.0%
    sga: 156200.00, // 11%
    quarterlyRevenue: 4260000.00,
    quarterlyEbitda: 1150200.00, // 27.0%
    fyRevenue: 17040000.00,
    fyEbitda: 4600800.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  },
  {
    id: 'pnl-009',
    reportingRegion: 'LATAM - Brazil & South',
    wk: 'WK-09',
    wkName: 'Telecom BSS/OSS Transformation',
    gadNonGad: 'Non-GAD',
    bidType: 'Fixed Price',
    plCategory: 'Gross Margin',
    monthlyRevenue: 980000.00,
    grossMargin: 352800.00, // 36.0%
    sga: 117600.00, // 12%
    quarterlyRevenue: 2940000.00,
    quarterlyEbitda: 705600.00, // 24.0%
    fyRevenue: 11760000.00,
    fyEbitda: 2822400.00,
    periodMonth: 'Oct 2026',
    periodQuarter: 'Q3 FY26',
    periodFy: 'FY2026-27'
  }
];
