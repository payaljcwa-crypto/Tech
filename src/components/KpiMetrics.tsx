/**
 * Financial KPI Executive Metrics Bar
 * Strict adherence to tabular numerals and single-elevation styling
 */

import React from 'react';
import { FormattingConfig, PnlRecord } from '../types/pnl';
import { formatFinancialValue, formatPercent } from '../utils/formatters';

interface KpiMetricsProps {
  records: PnlRecord[];
  formatting: FormattingConfig;
  onOpenLogicModal: () => void;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  records,
  formatting,
  onOpenLogicModal
}) => {
  const totalQuarterlyRev = records.reduce((acc, r) => acc + (Number(r.quarterlyRevenue) || 0), 0);
  const totalQuarterlyEbitda = records.reduce((acc, r) => acc + (Number(r.quarterlyEbitda) || 0), 0);
  const quarterlyMargin = totalQuarterlyRev > 0 ? (totalQuarterlyEbitda / totalQuarterlyRev) * 100 : 0;

  const totalFyRev = records.reduce((acc, r) => acc + (Number(r.fyRevenue) || 0), 0);
  const totalFyEbitda = records.reduce((acc, r) => acc + (Number(r.fyEbitda) || 0), 0);
  const fyMargin = totalFyRev > 0 ? (totalFyEbitda / totalFyRev) * 100 : 0;

  const totalMonthlyRev = records.reduce((acc, r) => acc + (Number(r.monthlyRevenue) || 0), 0);
  const totalGM = records.reduce((acc, r) => acc + (Number(r.grossMargin) || 0), 0);
  const gmPercent = totalMonthlyRev > 0 ? (totalGM / totalMonthlyRev) * 100 : 0;
  const totalSga = records.reduce((acc, r) => acc + (Number(r.sga) || 0), 0);

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Card 1: Quarterly Revenue */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Quarterly Revenue
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatFinancialValue(totalQuarterlyRev, formatting)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across {records.length} WKs
            </div>
          </div>

          {/* Card 2: Quarterly EBITDA */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Quarterly EBITDA
              </span>
              <button
                type="button"
                onClick={onOpenLogicModal}
                className="text-[10px] text-blue-600 hover:underline"
                title="View EBITDA GM calculation basis logic"
              >
                Basis info
              </button>
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-1">
              {formatFinancialValue(totalQuarterlyEbitda, formatting)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Margin: <span className="font-mono font-semibold text-emerald-800">{formatPercent(quarterlyMargin)}</span>
            </div>
          </div>

          {/* Card 3: FY Revenue */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Full-Year Revenue
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatFinancialValue(totalFyRev, formatting)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Independent manual entry
            </div>
          </div>

          {/* Card 4: FY EBITDA */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Full-Year EBITDA
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatFinancialValue(totalFyEbitda, formatting)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              FY Margin: <span className="font-mono font-semibold text-slate-700">{formatPercent(fyMargin)}</span>
            </div>
          </div>

          {/* Card 5: Monthly Gross Margin (GM Basis) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Monthly GM (Basis)
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatFinancialValue(totalGM, formatting)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              GM %: <span className="font-mono font-semibold text-slate-700">{formatPercent(gmPercent)}</span>
            </div>
          </div>

          {/* Card 6: SG&A Captured Separately */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              SG&amp;A Allocation
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatFinancialValue(totalSga, formatting)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Reported separately
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
