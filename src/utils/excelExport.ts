/**
 * Excel Workbook Generator for Sub-Regional P&L Dashboard
 * Generates an Excel workbook containing EXACTLY THREE worksheets:
 *   Sheet 1: WK-wise P&L (Strict Column sequence A through J)
 *   Sheet 2: Region-wise Summary P&L (Sub-regional consolidation roll-up)
 *   Sheet 3: Category & Performance Master (PL Category & Bid Type matrix with margins)
 */

import * as XLSX from 'xlsx';
import { PnlRecord } from '../types/pnl';

export function exportPnlWorkbook(
  records: PnlRecord[],
  filename: string = 'Sub_Regional_PnL_Report'
) {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: WK-wise P&L
  // Columns in EXACT sequence:
  // A: Reporting Region
  // B: WK
  // C: WK Name
  // D: GAD/Non GAD
  // E: Bid Type
  // F: PL Category
  // G: Quarterly Revenue
  // H: Quarterly EBITDA
  // I: FY Revenue
  // J: FY EBITDA
  // ==========================================
  const sheet1Headers = [
    'Reporting Region',
    'WK',
    'WK Name',
    'GAD/Non GAD',
    'Bid Type',
    'PL Category',
    'Quarterly Revenue',
    'Quarterly EBITDA',
    'FY Revenue',
    'FY EBITDA'
  ];

  const sheet1Data = records.map((r) => [
    r.reportingRegion || '',
    r.wk || '',
    r.wkName || '',
    r.gadNonGad || '',
    r.bidType || '',
    r.plCategory || '',
    Number(r.quarterlyRevenue || 0),
    Number(r.quarterlyEbitda || 0),
    Number(r.fyRevenue || 0),
    Number(r.fyEbitda || 0)
  ]);

  // Compute Total Row for Sheet 1
  const s1TotalQRev = records.reduce((acc, r) => acc + (Number(r.quarterlyRevenue) || 0), 0);
  const s1TotalQEbitda = records.reduce((acc, r) => acc + (Number(r.quarterlyEbitda) || 0), 0);
  const s1TotalFyRev = records.reduce((acc, r) => acc + (Number(r.fyRevenue) || 0), 0);
  const s1TotalFyEbitda = records.reduce((acc, r) => acc + (Number(r.fyEbitda) || 0), 0);

  const sheet1TotalRow = [
    'TOTAL / SUMMARY',
    `${records.length} WKs`,
    '',
    '',
    '',
    '',
    s1TotalQRev,
    s1TotalQEbitda,
    s1TotalFyRev,
    s1TotalFyEbitda
  ];

  const ws1 = XLSX.utils.aoa_to_sheet([
    sheet1Headers,
    ...sheet1Data,
    [],
    sheet1TotalRow
  ]);

  // Set explicit column widths for Sheet 1
  ws1['!cols'] = [
    { wch: 25 }, // A: Reporting Region
    { wch: 12 }, // B: WK
    { wch: 35 }, // C: WK Name
    { wch: 15 }, // D: GAD/Non GAD
    { wch: 18 }, // E: Bid Type
    { wch: 18 }, // F: PL Category
    { wch: 20 }, // G: Quarterly Revenue
    { wch: 20 }, // H: Quarterly EBITDA
    { wch: 20 }, // I: FY Revenue
    { wch: 20 }  // J: FY EBITDA
  ];

  // ==========================================
  // SHEET 2: Region-wise Summary P&L
  // Consolidated roll-up by Sub-Region
  // ==========================================
  const sheet2Headers = [
    'Reporting Region',
    'Total Active WKs',
    'GAD Quarterly Revenue',
    'Non-GAD Quarterly Revenue',
    'Total Quarterly Revenue',
    'Monthly GM (Recorded)',
    'SG&A Expense',
    'Total Quarterly EBITDA',
    'Quarterly EBITDA Margin %',
    'Total FY Revenue',
    'Total FY EBITDA',
    'FY EBITDA Margin %'
  ];

  // Group by region
  const regionMap = new Map<string, {
    wks: number;
    gadQRev: number;
    nonGadQRev: number;
    totalQRev: number;
    totalGM: number;
    totalSga: number;
    totalQEbitda: number;
    totalFyRev: number;
    totalFyEbitda: number;
  }>();

  records.forEach((r) => {
    const reg = r.reportingRegion || 'Unspecified';
    const entry = regionMap.get(reg) || {
      wks: 0,
      gadQRev: 0,
      nonGadQRev: 0,
      totalQRev: 0,
      totalGM: 0,
      totalSga: 0,
      totalQEbitda: 0,
      totalFyRev: 0,
      totalFyEbitda: 0
    };

    entry.wks += 1;
    const qRev = Number(r.quarterlyRevenue || 0);
    if (r.gadNonGad === 'GAD') {
      entry.gadQRev += qRev;
    } else {
      entry.nonGadQRev += qRev;
    }
    entry.totalQRev += qRev;
    entry.totalGM += Number(r.grossMargin || 0);
    entry.totalSga += Number(r.sga || 0);
    entry.totalQEbitda += Number(r.quarterlyEbitda || 0);
    entry.totalFyRev += Number(r.fyRevenue || 0);
    entry.totalFyEbitda += Number(r.fyEbitda || 0);

    regionMap.set(reg, entry);
  });

  const sheet2Data = Array.from(regionMap.entries()).map(([region, stat]) => {
    const qMargin = stat.totalQRev > 0 ? (stat.totalQEbitda / stat.totalQRev) * 100 : 0;
    const fyMargin = stat.totalFyRev > 0 ? (stat.totalFyEbitda / stat.totalFyRev) * 100 : 0;
    return [
      region,
      stat.wks,
      stat.gadQRev,
      stat.nonGadQRev,
      stat.totalQRev,
      stat.totalGM,
      stat.totalSga,
      stat.totalQEbitda,
      `${qMargin.toFixed(1)}%`,
      stat.totalFyRev,
      stat.totalFyEbitda,
      `${fyMargin.toFixed(1)}%`
    ];
  });

  const s2TotalGadQRev = Array.from(regionMap.values()).reduce((a, b) => a + b.gadQRev, 0);
  const s2TotalNonGadQRev = Array.from(regionMap.values()).reduce((a, b) => a + b.nonGadQRev, 0);
  const s2TotalQMargin = s1TotalQRev > 0 ? (s1TotalQEbitda / s1TotalQRev) * 100 : 0;
  const s2TotalFyMargin = s1TotalFyRev > 0 ? (s1TotalFyEbitda / s1TotalFyRev) * 100 : 0;
  const s2TotalGM = Array.from(regionMap.values()).reduce((a, b) => a + b.totalGM, 0);
  const s2TotalSga = Array.from(regionMap.values()).reduce((a, b) => a + b.totalSga, 0);

  const sheet2TotalRow = [
    'CONSOLIDATED TOTAL',
    records.length,
    s2TotalGadQRev,
    s2TotalNonGadQRev,
    s1TotalQRev,
    s2TotalGM,
    s2TotalSga,
    s1TotalQEbitda,
    `${s2TotalQMargin.toFixed(1)}%`,
    s1TotalFyRev,
    s1TotalFyEbitda,
    `${s2TotalFyMargin.toFixed(1)}%`
  ];

  const ws2 = XLSX.utils.aoa_to_sheet([
    sheet2Headers,
    ...sheet2Data,
    [],
    sheet2TotalRow
  ]);

  ws2['!cols'] = [
    { wch: 28 }, // Region
    { wch: 16 }, // Active WKs
    { wch: 22 }, // GAD Q Rev
    { wch: 24 }, // Non-GAD Q Rev
    { wch: 22 }, // Total Q Rev
    { wch: 20 }, // GM
    { wch: 18 }, // SG&A
    { wch: 22 }, // Total Q EBITDA
    { wch: 24 }, // Q EBITDA Margin %
    { wch: 22 }, // Total FY Rev
    { wch: 22 }, // Total FY EBITDA
    { wch: 22 }  // FY EBITDA Margin %
  ];

  // ==========================================
  // SHEET 3: Category & Performance Master
  // Breakdown by PL Category & Bid Type with EBITDA Basis
  // ==========================================
  const sheet3Headers = [
    'P&L Category',
    'Bid Type',
    'Workstream Count',
    'Total Monthly Revenue',
    'Gross Margin (GM Basis)',
    'Gross Margin %',
    'Total SG&A',
    'SG&A % of Monthly Rev',
    'Total Quarterly Revenue',
    'Total Quarterly EBITDA',
    'Quarterly EBITDA Margin %',
    'Total FY Revenue',
    'Total FY EBITDA',
    'FY EBITDA Margin %'
  ];

  // Group by (plCategory + bidType)
  const catBidMap = new Map<string, {
    category: string;
    bidType: string;
    count: number;
    monthlyRev: number;
    gm: number;
    sga: number;
    qRev: number;
    qEbitda: number;
    fyRev: number;
    fyEbitda: number;
  }>();

  records.forEach((r) => {
    const key = `${r.plCategory || 'General'}___${r.bidType || 'Other'}`;
    const entry = catBidMap.get(key) || {
      category: r.plCategory || 'General',
      bidType: r.bidType || 'Other',
      count: 0,
      monthlyRev: 0,
      gm: 0,
      sga: 0,
      qRev: 0,
      qEbitda: 0,
      fyRev: 0,
      fyEbitda: 0
    };

    entry.count += 1;
    entry.monthlyRev += Number(r.monthlyRevenue || 0);
    entry.gm += Number(r.grossMargin || 0);
    entry.sga += Number(r.sga || 0);
    entry.qRev += Number(r.quarterlyRevenue || 0);
    entry.qEbitda += Number(r.quarterlyEbitda || 0);
    entry.fyRev += Number(r.fyRevenue || 0);
    entry.fyEbitda += Number(r.fyEbitda || 0);

    catBidMap.set(key, entry);
  });

  const sheet3Data = Array.from(catBidMap.values()).map((item) => {
    const gmPercent = item.monthlyRev > 0 ? (item.gm / item.monthlyRev) * 100 : 0;
    const sgaPercent = item.monthlyRev > 0 ? (item.sga / item.monthlyRev) * 100 : 0;
    const qMargin = item.qRev > 0 ? (item.qEbitda / item.qRev) * 100 : 0;
    const fyMargin = item.fyRev > 0 ? (item.fyEbitda / item.fyRev) * 100 : 0;

    return [
      item.category,
      item.bidType,
      item.count,
      item.monthlyRev,
      item.gm,
      `${gmPercent.toFixed(1)}%`,
      item.sga,
      `${sgaPercent.toFixed(1)}%`,
      item.qRev,
      item.qEbitda,
      `${qMargin.toFixed(1)}%`,
      item.fyRev,
      item.fyEbitda,
      `${fyMargin.toFixed(1)}%`
    ];
  });

  const s3TotalMonthlyRev = Array.from(catBidMap.values()).reduce((a, b) => a + b.monthlyRev, 0);
  const s3TotalGmPercent = s3TotalMonthlyRev > 0 ? (s2TotalGM / s3TotalMonthlyRev) * 100 : 0;
  const s3TotalSgaPercent = s3TotalMonthlyRev > 0 ? (s2TotalSga / s3TotalMonthlyRev) * 100 : 0;

  const sheet3TotalRow = [
    'TOTAL / CONSOLIDATED',
    'ALL BID TYPES',
    records.length,
    s3TotalMonthlyRev,
    s2TotalGM,
    `${s3TotalGmPercent.toFixed(1)}%`,
    s2TotalSga,
    `${s3TotalSgaPercent.toFixed(1)}%`,
    s1TotalQRev,
    s1TotalQEbitda,
    `${s2TotalQMargin.toFixed(1)}%`,
    s1TotalFyRev,
    s1TotalFyEbitda,
    `${s2TotalFyMargin.toFixed(1)}%`
  ];

  const ws3 = XLSX.utils.aoa_to_sheet([
    sheet3Headers,
    ...sheet3Data,
    [],
    sheet3TotalRow
  ]);

  ws3['!cols'] = [
    { wch: 20 }, // PL Category
    { wch: 20 }, // Bid Type
    { wch: 18 }, // Count
    { wch: 22 }, // Monthly Rev
    { wch: 24 }, // GM
    { wch: 18 }, // GM %
    { wch: 18 }, // SG&A
    { wch: 22 }, // SG&A %
    { wch: 22 }, // Q Rev
    { wch: 22 }, // Q EBITDA
    { wch: 24 }, // Q EBITDA %
    { wch: 22 }, // FY Rev
    { wch: 22 }, // FY EBITDA
    { wch: 22 }  // FY EBITDA %
  ];

  // Append exactly 3 worksheets
  XLSX.utils.book_append_sheet(wb, ws1, 'WK-wise P&L');
  XLSX.utils.book_append_sheet(wb, ws2, 'Region-wise Summary P&L');
  XLSX.utils.book_append_sheet(wb, ws3, 'Category & Performance Master');

  // Trigger download in browser
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
}

/**
 * Downloads a clean Excel template with valid sample headers and examples
 * for user bulk-upload.
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  const templateHeaders = [
    'Reporting Region',
    'WK',
    'WK Name',
    'GAD/Non GAD',
    'Bid Type',
    'PL Category',
    'Monthly Revenue',
    'Gross Margin',
    'SG&A',
    'Quarterly Revenue',
    'Quarterly EBITDA',
    'FY Revenue',
    'FY EBITDA',
    'Period Month',
    'Period Quarter',
    'Period FY'
  ];

  const sampleRows = [
    [
      'North America - East',
      'WK-101',
      'Cloud Modernization',
      'GAD',
      'Fixed Price',
      'Revenue',
      2500000.00,
      950000.00,
      250000.00,
      7500000.00,
      2100000.00,
      30000000.00,
      8400000.00,
      'Oct 2026',
      'Q3 FY26',
      'FY2026-27'
    ],
    [
      'APAC - India',
      'WK-102',
      'Enterprise Data Platform',
      'Non-GAD',
      'Time & Material',
      'Gross Margin',
      1800000.00,
      720000.00,
      180000.00,
      5400000.00,
      1620000.00,
      21600000.00,
      6480000.00,
      'Oct 2026',
      'Q3 FY26',
      'FY2026-27'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([templateHeaders, ...sampleRows]);
  ws['!cols'] = templateHeaders.map(() => ({ wch: 22 }));

  XLSX.utils.book_append_sheet(wb, ws, 'P&L Data Entry Template');
  XLSX.writeFile(wb, 'Sub_Regional_PnL_Bulk_Upload_Template.xlsx');
}
