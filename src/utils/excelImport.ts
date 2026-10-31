/**
 * Excel / CSV Bulk Upload Parser
 * Handles Excel workbooks and CSV files, extracts records with fuzzy column matching,
 * parses numbers with Indian and international format support, and flags row issues.
 */

import * as XLSX from 'xlsx';
import { BidType, GadClassification, PlCategory, PnlRecord } from '../types/pnl';
import { parseFinancialInput } from './formatters';

export interface ParseResult {
  records: PnlRecord[];
  errors: string[];
  warnings: string[];
  totalRows: number;
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Prefer first sheet or a sheet named 'WK-wise P&L' or 'P&L'
        let sheetName = workbook.SheetNames[0];
        const match = workbook.SheetNames.find(
          (name) => /wk[-_ ]?wise/i.test(name) || /p&l/i.test(name) || /data/i.test(name)
        );
        if (match) {
          sheetName = match;
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          return resolve({
            records: [],
            errors: ['The uploaded workbook contains no readable sheets.'],
            warnings: [],
            totalRows: 0
          });
        }

        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        });

        if (rawJson.length === 0) {
          return resolve({
            records: [],
            errors: ['The selected worksheet is completely empty.'],
            warnings: [],
            totalRows: 0
          });
        }

        // Find header row (usually row 0 or 1)
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(rawJson.length, 5); i++) {
          const rowStr = rawJson[i].join(' ').toLowerCase();
          if (rowStr.includes('region') || rowStr.includes('wk') || rowStr.includes('revenue')) {
            headerRowIdx = i;
            break;
          }
        }

        const rawHeaders = rawJson[headerRowIdx].map((h) => String(h || '').trim());
        const rows = rawJson.slice(headerRowIdx + 1);

        // Build header index map
        const findColIndex = (patterns: RegExp[]): number => {
          return rawHeaders.findIndex((h) =>
            patterns.some((pattern) => pattern.test(h))
          );
        };

        const colMap = {
          region: findColIndex([/reporting.*region/i, /^region/i, /sub.*region/i]),
          wk: findColIndex([/^wk$/i, /^wk.*code/i, /^code/i]),
          wkName: findColIndex([/wk.*name/i, /workstream/i, /business.*unit/i, /^name/i]),
          gad: findColIndex([/gad.*non.*gad/i, /^gad/i, /classification/i]),
          bidType: findColIndex([/bid.*type/i, /^bid/i, /contract.*type/i]),
          plCategory: findColIndex([/p&?l.*category/i, /^category/i, /^pl/i]),
          monthlyRev: findColIndex([/monthly.*rev/i, /^month.*rev/i]),
          grossMargin: findColIndex([/gross.*margin/i, /^gm$/i, /^margin/i]),
          sga: findColIndex([/sg&?a/i, /selling.*general/i, /admin.*exp/i]),
          qRev: findColIndex([/quarterly.*rev/i, /^q.*rev/i, /^q3.*rev/i]),
          qEbitda: findColIndex([/quarterly.*ebitda/i, /^q.*ebitda/i, /^q3.*ebitda/i]),
          fyRev: findColIndex([/fy.*rev/i, /full.*year.*rev/i, /annual.*rev/i]),
          fyEbitda: findColIndex([/fy.*ebitda/i, /full.*year.*ebitda/i, /^fy.*ebitda/i]),
          periodMonth: findColIndex([/period.*month/i, /^month/i]),
          periodQuarter: findColIndex([/period.*quarter/i, /^quarter/i, /^period/i]),
          periodFy: findColIndex([/period.*fy/i, /^fy$/i, /financial.*year/i])
        };

        const warnings: string[] = [];
        const errors: string[] = [];
        const parsedRecords: PnlRecord[] = [];

        if (colMap.wk === -1 && colMap.wkName === -1) {
          warnings.push('Could not detect a clear "WK" or "WK Name" column header; mapped default columns.');
        }

        let skippedRows = 0;
        rows.forEach((row, idx) => {
          // Check if row is empty or total row
          const rowText = row.join('').trim().toLowerCase();
          if (!rowText || rowText.includes('total') || rowText.includes('summary')) {
            skippedRows++;
            return;
          }

          const getVal = (colIdx: number): string => {
            if (colIdx >= 0 && colIdx < row.length) {
              return String(row[colIdx] ?? '').trim();
            }
            return '';
          };

          const rawWk = getVal(colMap.wk) || `WK-${idx + 1}`;
          const rawWkName = getVal(colMap.wkName) || `Workstream ${idx + 1}`;
          const rawRegion = getVal(colMap.region) || 'Unspecified Region';

          let rawGad = getVal(colMap.gad).toUpperCase();
          const gadNonGad: GadClassification =
            rawGad.includes('NON') || rawGad.includes('N') ? 'Non-GAD' : 'GAD';

          let rawBid = getVal(colMap.bidType);
          let bidType: BidType = 'Fixed Price';
          if (/rfp/i.test(rawBid)) bidType = 'RFP';
          else if (/sole/i.test(rawBid)) bidType = 'Sole Source';
          else if (/framework/i.test(rawBid)) bidType = 'Framework';
          else if (/time|t&m/i.test(rawBid)) bidType = 'Time & Material';
          else if (/renewal/i.test(rawBid)) bidType = 'Renewal';

          let rawPlCat = getVal(colMap.plCategory);
          let plCategory: PlCategory = 'Revenue';
          if (/gross|gm/i.test(rawPlCat)) plCategory = 'Gross Margin';
          else if (/sg&?a/i.test(rawPlCat)) plCategory = 'SG&A';
          else if (/direct/i.test(rawPlCat)) plCategory = 'Direct Cost';
          else if (/operating|opex/i.test(rawPlCat)) plCategory = 'Operating Expense';
          else if (/other/i.test(rawPlCat)) plCategory = 'Other Income/Cost';

          const monthlyRev = parseFinancialInput(getVal(colMap.monthlyRev));
          const grossMargin = parseFinancialInput(getVal(colMap.grossMargin));
          const sga = parseFinancialInput(getVal(colMap.sga));
          const qRev = parseFinancialInput(getVal(colMap.qRev));
          const qEbitda = parseFinancialInput(getVal(colMap.qEbitda));
          const fyRev = parseFinancialInput(getVal(colMap.fyRev));
          const fyEbitda = parseFinancialInput(getVal(colMap.fyEbitda));

          const pMonth = getVal(colMap.periodMonth) || 'Oct 2026';
          const pQuarter = getVal(colMap.periodQuarter) || 'Q3 FY26';
          const pFy = getVal(colMap.periodFy) || 'FY2026-27';

          parsedRecords.push({
            id: `imported-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            reportingRegion: rawRegion,
            wk: rawWk,
            wkName: rawWkName,
            gadNonGad,
            bidType,
            plCategory,
            monthlyRevenue: monthlyRev,
            grossMargin,
            sga,
            quarterlyRevenue: qRev,
            quarterlyEbitda: qEbitda,
            fyRevenue: fyRev,
            fyEbitda: fyEbitda,
            periodMonth: pMonth,
            periodQuarter: pQuarter,
            periodFy: pFy
          });
        });

        resolve({
          records: parsedRecords,
          errors,
          warnings,
          totalRows: rows.length
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Failed to process Excel workbook.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}
