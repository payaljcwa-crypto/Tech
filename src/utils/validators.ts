/**
 * Financial Calculation & Validation Engine
 * Validates Sub-Regional P&L data integrity, flags missing inputs,
 * and detects calculation anomalies while respecting manual period reporting.
 */

import { PnlConfig, PnlRecord, ValidationIssue } from '../types/pnl';

export function validateRecord(record: PnlRecord, config: PnlConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const addIssue = (
    field: string,
    severity: 'error' | 'warning' | 'info',
    message: string,
    suggestedAction?: string
  ) => {
    issues.push({
      recordId: record.id,
      wk: record.wk || 'UNASSIGNED',
      wkName: record.wkName || 'Unnamed Workstream',
      region: record.reportingRegion || 'Unspecified Region',
      field,
      severity,
      message,
      suggestedAction
    });
  };

  // 1. Mandatory metadata fields
  if (!record.reportingRegion?.trim()) {
    addIssue('reportingRegion', 'error', 'Reporting Region is missing.', 'Select or enter a valid Sub-Region.');
  }

  if (!record.wk?.trim()) {
    addIssue('wk', 'error', 'WK Code is missing.', 'Enter a unique WK code (e.g. WK-10).');
  }

  if (!record.wkName?.trim()) {
    addIssue('wkName', 'error', 'WK Name / Business Unit is missing.', 'Provide a descriptive workstream name.');
  }

  // 2. Financial Completeness Checks
  const hasMonthlyRev = typeof record.monthlyRevenue === 'number' && record.monthlyRevenue > 0;
  const hasQuarterlyRev = typeof record.quarterlyRevenue === 'number' && record.quarterlyRevenue > 0;
  const hasFyRev = typeof record.fyRevenue === 'number' && record.fyRevenue > 0;
  const hasGm = typeof record.grossMargin === 'number' && record.grossMargin !== 0;
  const hasQuarterlyEbitda = typeof record.quarterlyEbitda === 'number' && record.quarterlyEbitda !== 0;

  if (!hasMonthlyRev && !hasQuarterlyRev && !hasFyRev) {
    addIssue('revenue', 'error', 'All Revenue fields (Monthly, Quarterly, FY) are zero or empty.', 'Enter revenue figures.');
  }

  if (hasMonthlyRev && !hasGm) {
    addIssue('grossMargin', 'warning', 'Gross Margin (GM) is zero or unrecorded for this monthly revenue.', 'Enter GM to maintain GM-basis EBITDA calculations.');
  }

  if (hasQuarterlyRev && !hasQuarterlyEbitda) {
    addIssue('quarterlyEbitda', 'warning', 'Quarterly EBITDA is zero while Quarterly Revenue is present.', 'Verify if EBITDA should be recorded or if workstream operates at breakeven.');
  }

  // 3. Margin Sanity Checks
  if (record.monthlyRevenue > 0 && record.grossMargin > record.monthlyRevenue) {
    addIssue(
      'grossMargin',
      'warning',
      `Gross Margin (${record.grossMargin}) exceeds Monthly Revenue (${record.monthlyRevenue}), resulting in GM% > 100%.`,
      'Verify whether revenue was understated or GM includes non-operating credits.'
    );
  }

  if (record.monthlyRevenue > 0 && record.grossMargin < 0) {
    addIssue(
      'grossMargin',
      'warning',
      `Gross Margin is negative (${record.grossMargin}), indicating an operational loss.`,
      'Review direct service delivery costs.'
    );
  }

  if (record.quarterlyRevenue > 0 && record.quarterlyEbitda > record.quarterlyRevenue) {
    addIssue(
      'quarterlyEbitda',
      'warning',
      `Quarterly EBITDA exceeds Quarterly Revenue (${((record.quarterlyEbitda / record.quarterlyRevenue) * 100).toFixed(1)}%).`,
      'Confirm quarterly EBITDA input.'
    );
  }

  // 4. Period Relationship Sanity Checks (without auto-overwriting manual inputs)
  if (record.fyRevenue > 0 && record.quarterlyRevenue > 0) {
    if (record.quarterlyRevenue > record.fyRevenue) {
      addIssue(
        'fyRevenue',
        'error',
        `Quarterly Revenue (${record.quarterlyRevenue.toLocaleString()}) exceeds FY Revenue (${record.fyRevenue.toLocaleString()}).`,
        'FY Revenue cannot be lower than single quarter revenue.'
      );
    }
  }

  if (record.fyEbitda > 0 && record.quarterlyEbitda > 0) {
    if (record.quarterlyEbitda > record.fyEbitda) {
      addIssue(
        'fyEbitda',
        'warning',
        `Quarterly EBITDA (${record.quarterlyEbitda.toLocaleString()}) exceeds FY EBITDA (${record.fyEbitda.toLocaleString()}).`,
        'Check if other quarters had negative performance or if FY EBITDA is understated.'
      );
    }
  }

  // 5. Monthly vs Quarterly Divergence Check (Informational for manual period reporting)
  if (record.monthlyRevenue > 0 && record.quarterlyRevenue > 0) {
    const impliedQuarterly = record.monthlyRevenue * 3;
    const diffPercent = Math.abs(impliedQuarterly - record.quarterlyRevenue) / record.quarterlyRevenue * 100;

    if (diffPercent > config.divergenceThresholdPercent) {
      addIssue(
        'quarterlyRevenue',
        'info',
        `3x Monthly Revenue diverges from Quarterly Revenue by ${diffPercent.toFixed(1)}% (Implied 3mo: ${impliedQuarterly.toLocaleString()}, Actual Q: ${record.quarterlyRevenue.toLocaleString()}).`,
        'Period reporting is manual; verify seasonal ramp-ups or contract milestone billings.'
      );
    }
  }

  // 6. SG&A Relationship Check (EBITDA reporting basis: Gross Margin)
  if (record.grossMargin > 0 && record.sga > 0 && record.quarterlyEbitda > 0) {
    // Expected annualized or quarterly GM minus SG&A
    const netOperating = record.grossMargin - record.sga;
    if (netOperating < 0 && record.quarterlyEbitda > 0) {
      addIssue(
        'sga',
        'info',
        `Monthly GM minus SG&A is negative (${netOperating.toLocaleString()}) while Quarterly EBITDA is positive.`,
        'Review SG&A cost allocation across quarters.'
      );
    }
  }

  return issues;
}

export function validateAllRecords(records: PnlRecord[], config: PnlConfig): {
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  healthyCount: number;
} {
  const issues: ValidationIssue[] = [];
  let healthyCount = 0;

  for (const record of records) {
    const recordIssues = validateRecord(record, config);
    if (recordIssues.length === 0) {
      healthyCount++;
    } else {
      issues.push(...recordIssues);
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return {
    issues,
    errorCount,
    warningCount,
    infoCount,
    healthyCount
  };
}
