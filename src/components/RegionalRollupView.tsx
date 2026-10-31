/**
 * Sub-Regional Rollup View (Corresponding to Sheet 2 of Excel Workbook)
 * Consolidates financial metrics across all Reporting Regions with GAD vs Non-GAD analysis,
 * GM EBITDA basis, SG&A burden, and independent FY performance.
 */

import React from 'react';
import { FormattingConfig, PnlRecord } from '../types/pnl';
import { formatFinancialValue, formatPercent } from '../utils/formatters';

interface RegionalRollupViewProps {
  records: PnlRecord[];
  formatting: FormattingConfig;
  onSelectRegionFilter: (region: string) => void;
}

export const RegionalRollupView: React.FC<RegionalRollupViewProps> = ({
  records,
  formatting,
  onSelectRegionFilter
}) => {
  // Aggregate data by region
  const regionMap = new Map<
    string,
    {
      wks: number;
      gadQRev: number;
      nonGadQRev: number;
      totalQRev: number;
      monthlyRev: number;
      gm: number;
      sga: number;
      totalQEbitda: number;
      totalFyRev: number;
      totalFyEbitda: number;
    }
  >();

  records.forEach((r) => {
    const reg = r.reportingRegion || 'Unspecified';
    const entry = regionMap.get(reg) || {
      wks: 0,
      gadQRev: 0,
      nonGadQRev: 0,
      totalQRev: 0,
      monthlyRev: 0,
      gm: 0,
      sga: 0,
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
    entry.monthlyRev += Number(r.monthlyRevenue || 0);
    entry.gm += Number(r.grossMargin || 0);
    entry.sga += Number(r.sga || 0);
    entry.totalQEbitda += Number(r.quarterlyEbitda || 0);
    entry.totalFyRev += Number(r.fyRevenue || 0);
    entry.totalFyEbitda += Number(r.fyEbitda || 0);

    regionMap.set(reg, entry);
  });

  const regionRows = Array.from(regionMap.entries()).sort(
    (a, b) => b[1].totalQRev - a[1].totalQRev
  );

  const totalAllQRev = regionRows.reduce((a, b) => a + b[1].totalQRev, 0);
  const totalAllGadQRev = regionRows.reduce((a, b) => a + b[1].gadQRev, 0);
  const totalAllNonGadQRev = regionRows.reduce((a, b) => a + b[1].nonGadQRev, 0);
  const totalAllGM = regionRows.reduce((a, b) => a + b[1].gm, 0);
  const totalAllSga = regionRows.reduce((a, b) => a + b[1].sga, 0);
  const totalAllQEbitda = regionRows.reduce((a, b) => a + b[1].totalQEbitda, 0);
  const totalAllFyRev = regionRows.reduce((a, b) => a + b[1].totalFyRev, 0);
  const totalAllFyEbitda = regionRows.reduce((a, b) => a + b[1].totalFyEbitda, 0);

  const grandQMargin = totalAllQRev > 0 ? (totalAllQEbitda / totalAllQRev) * 100 : 0;
  const grandFyMargin = totalAllFyRev > 0 ? (totalAllFyEbitda / totalAllFyRev) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Editorial Overview Header */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Sub-Regional Consolidation P&amp;L (Sheet 2)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated financial performance by reporting territory, distinguishing GAD workstreams, EBITDA on GM basis, and SG&amp;A.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block">Total Regions:</span>
            <span className="font-mono font-semibold text-slate-900 text-sm">{regionRows.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block">GAD Revenue Share:</span>
            <span className="font-mono font-semibold text-indigo-700 text-sm">
              {formatPercent(totalAllQRev > 0 ? (totalAllGadQRev / totalAllQRev) * 100 : 0)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Consolidated EBITDA:</span>
            <span className="font-mono font-semibold text-emerald-700 text-sm">
              {formatPercent(grandQMargin)}
            </span>
          </div>
        </div>
      </div>

      {/* Regional Rollup Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Reporting Sub-Region</th>
                <th className="py-2.5 px-3 text-center">WKs</th>
                <th className="py-2.5 px-3 text-right">GAD Q-Rev</th>
                <th className="py-2.5 px-3 text-right">Non-GAD Q-Rev</th>
                <th className="py-2.5 px-3 text-right bg-blue-50/50">Total Q-Revenue</th>
                <th className="py-2.5 px-3 text-right" title="EBITDA basis: Gross Margin">
                  Recorded GM
                </th>
                <th className="py-2.5 px-3 text-right" title="Captured separately for analysis">
                  SG&amp;A Expense
                </th>
                <th className="py-2.5 px-3 text-right bg-emerald-50/40">Total Q-EBITDA</th>
                <th className="py-2.5 px-3 text-right bg-emerald-50/40">EBITDA %</th>
                <th className="py-2.5 px-3 text-right bg-amber-50/40">FY Revenue (Manual)</th>
                <th className="py-2.5 px-3 text-right bg-amber-50/40">FY EBITDA (Manual)</th>
                <th className="py-2.5 px-3 text-right bg-amber-50/40">FY Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {regionRows.map(([region, stat]) => {
                const qMargin = stat.totalQRev > 0 ? (stat.totalQEbitda / stat.totalQRev) * 100 : 0;
                const fyMargin = stat.totalFyRev > 0 ? (stat.totalFyEbitda / stat.totalFyRev) * 100 : 0;
                const gadShare = stat.totalQRev > 0 ? (stat.gadQRev / stat.totalQRev) * 100 : 0;

                return (
                  <tr key={region} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <button
                        type="button"
                        onClick={() => onSelectRegionFilter(region)}
                        className="hover:text-blue-600 transition-colors text-left"
                        title="Filter ledger to this region"
                      >
                        {region}
                      </button>
                      <div className="w-24 bg-slate-200 h-1 rounded overflow-hidden mt-1">
                        <div
                          className="bg-indigo-600 h-full"
                          style={{ width: `${gadShare}%` }}
                          title={`GAD Share: ${gadShare.toFixed(0)}%`}
                        />
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {stat.wks}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-700">
                      {formatFinancialValue(stat.gadQRev, formatting)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(stat.nonGadQRev, formatting)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 bg-blue-50/30">
                      {formatFinancialValue(stat.totalQRev, formatting)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      {formatFinancialValue(stat.gm, formatting)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(stat.sga, formatting)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700 bg-emerald-50/20">
                      {formatFinancialValue(stat.totalQEbitda, formatting)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-800 bg-emerald-50/20">
                      {formatPercent(qMargin)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 bg-amber-50/20">
                      {formatFinancialValue(stat.totalFyRev, formatting)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-900 bg-amber-50/20">
                      {formatFinancialValue(stat.totalFyEbitda, formatting)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 bg-amber-50/20">
                      {formatPercent(fyMargin)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Grand Total Summary Row */}
            <tfoot className="bg-slate-900 text-white font-semibold text-xs border-t-2 border-slate-950">
              <tr>
                <td className="py-3 px-3 uppercase tracking-wider">
                  CONSOLIDATED TOTAL
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  {records.length}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-indigo-300">
                  {formatFinancialValue(totalAllGadQRev, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                  {formatFinancialValue(totalAllNonGadQRev, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-white">
                  {formatFinancialValue(totalAllQRev, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                  {formatFinancialValue(totalAllGM, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                  {formatFinancialValue(totalAllSga, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                  {formatFinancialValue(totalAllQEbitda, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                  {formatPercent(grandQMargin)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300">
                  {formatFinancialValue(totalAllFyRev, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300">
                  {formatFinancialValue(totalAllFyEbitda, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300">
                  {formatPercent(grandFyMargin)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
