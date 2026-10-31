/**
 * Category & Bid Type Analysis View (Corresponding to Sheet 3 of Excel Workbook)
 * Displays performance matrix by P&L Category and Bid Type with Gross Margin basis,
 * SG&A allocation, and Quarterly vs FY EBITDA margins.
 */

import React from 'react';
import { FormattingConfig, PnlRecord } from '../types/pnl';
import { formatFinancialValue, formatPercent } from '../utils/formatters';

interface CategoryAnalysisViewProps {
  records: PnlRecord[];
  formatting: FormattingConfig;
}

export const CategoryAnalysisView: React.FC<CategoryAnalysisViewProps> = ({
  records,
  formatting
}) => {
  // Aggregate by PL Category + Bid Type
  const catBidMap = new Map<
    string,
    {
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
    }
  >();

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

  const matrixRows = Array.from(catBidMap.values()).sort(
    (a, b) => b.qRev - a.qRev
  );

  const totalMonthlyRev = matrixRows.reduce((a, b) => a + b.monthlyRev, 0);
  const totalGM = matrixRows.reduce((a, b) => a + b.gm, 0);
  const totalSga = matrixRows.reduce((a, b) => a + b.sga, 0);
  const totalQRev = matrixRows.reduce((a, b) => a + b.qRev, 0);
  const totalQEbitda = matrixRows.reduce((a, b) => a + b.qEbitda, 0);
  const totalFyRev = matrixRows.reduce((a, b) => a + b.fyRev, 0);
  const totalFyEbitda = matrixRows.reduce((a, b) => a + b.fyEbitda, 0);

  const totalGmPercent = totalMonthlyRev > 0 ? (totalGM / totalMonthlyRev) * 100 : 0;
  const totalSgaPercent = totalMonthlyRev > 0 ? (totalSga / totalMonthlyRev) * 100 : 0;
  const totalQMargin = totalQRev > 0 ? (totalQEbitda / totalQRev) * 100 : 0;
  const totalFyMargin = totalFyRev > 0 ? (totalFyEbitda / totalFyRev) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Category &amp; Bid Type Matrix Master (Sheet 3)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Examines margin performance across contract bid types and P&amp;L classifications, highlighting EBITDA profitability under Gross Margin reporting basis.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block">Matrix Clusters:</span>
            <span className="font-mono font-semibold text-slate-900 text-sm">
              {matrixRows.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Overall GM %:</span>
            <span className="font-mono font-semibold text-slate-900 text-sm">
              {formatPercent(totalGmPercent)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Overall SG&amp;A %:</span>
            <span className="font-mono font-semibold text-slate-900 text-sm">
              {formatPercent(totalSgaPercent)}
            </span>
          </div>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">P&amp;L Category</th>
                <th className="py-2.5 px-3">Bid Type</th>
                <th className="py-2.5 px-3 text-center">WKs</th>
                <th className="py-2.5 px-3 text-right">Monthly Revenue</th>
                <th className="py-2.5 px-3 text-right">Gross Margin (GM)</th>
                <th className="py-2.5 px-3 text-right">GM %</th>
                <th className="py-2.5 px-3 text-right">SG&amp;A</th>
                <th className="py-2.5 px-3 text-right">SG&amp;A %</th>
                <th className="py-2.5 px-3 text-right bg-blue-50/50">Quarterly Rev</th>
                <th className="py-2.5 px-3 text-right bg-emerald-50/40">Quarterly EBITDA</th>
                <th className="py-2.5 px-3 text-right bg-emerald-50/40">Q-EBITDA %</th>
                <th className="py-2.5 px-3 text-right bg-amber-50/40">FY Revenue (Manual)</th>
                <th className="py-2.5 px-3 text-right bg-amber-50/40">FY EBITDA (Manual)</th>
                <th className="py-2.5 px-3 text-right bg-amber-50/40">FY EBITDA %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {matrixRows.map((row, idx) => {
                const gmPercent = row.monthlyRev > 0 ? (row.gm / row.monthlyRev) * 100 : 0;
                const sgaPercent = row.monthlyRev > 0 ? (row.sga / row.monthlyRev) * 100 : 0;
                const qMargin = row.qRev > 0 ? (row.qEbitda / row.qRev) * 100 : 0;
                const fyMargin = row.fyRev > 0 ? (row.fyEbitda / row.fyRev) * 100 : 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {row.category}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {row.bidType}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {row.count}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatFinancialValue(row.monthlyRev, formatting)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                      {formatFinancialValue(row.gm, formatting)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatPercent(gmPercent)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(row.sga, formatting)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                      {formatPercent(sgaPercent)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 bg-blue-50/30">
                      {formatFinancialValue(row.qRev, formatting)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700 bg-emerald-50/20">
                      {formatFinancialValue(row.qEbitda, formatting)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-800 bg-emerald-50/20">
                      {formatPercent(qMargin)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 bg-amber-50/20">
                      {formatFinancialValue(row.fyRev, formatting)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-900 bg-amber-50/20">
                      {formatFinancialValue(row.fyEbitda, formatting)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 bg-amber-50/20">
                      {formatPercent(fyMargin)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Grand Total Row */}
            <tfoot className="bg-slate-900 text-white font-semibold text-xs border-t-2 border-slate-950">
              <tr>
                <td className="py-3 px-3 uppercase tracking-wider" colSpan={2}>
                  TOTAL CONSOLIDATED
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  {records.length}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                  {formatFinancialValue(totalMonthlyRev, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                  {formatFinancialValue(totalGM, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                  {formatPercent(totalGmPercent)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                  {formatFinancialValue(totalSga, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                  {formatPercent(totalSgaPercent)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-white">
                  {formatFinancialValue(totalQRev, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                  {formatFinancialValue(totalQEbitda, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                  {formatPercent(totalQMargin)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300">
                  {formatFinancialValue(totalFyRev, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300">
                  {formatFinancialValue(totalFyEbitda, formatting)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300">
                  {formatPercent(totalFyMargin)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
