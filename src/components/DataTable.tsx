/**
 * High-Density WK-wise Ledger Data Table
 * Conforms to §2.A & §2.B: 36px-44px rows, right-aligned tabular figures,
 * multi-column sort, row selection, and audit indicators.
 */

import React, { useState } from 'react';
import { FormattingConfig, PnlRecord, ValidationIssue } from '../types/pnl';
import { formatFinancialValue, formatPercent } from '../utils/formatters';
import {
  AlertTriangle,
  ArrowUpDown,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  Info
} from 'lucide-react';

interface DataTableProps {
  records: PnlRecord[];
  formatting: FormattingConfig;
  issuesMap: Map<string, ValidationIssue[]>;
  onEdit: (record: PnlRecord) => void;
  onDelete: (id: string) => void;
  onDuplicate: (record: PnlRecord) => void;
  onDeleteSelected: (ids: string[]) => void;
}

type SortField =
  | 'reportingRegion'
  | 'wk'
  | 'wkName'
  | 'gadNonGad'
  | 'bidType'
  | 'plCategory'
  | 'monthlyRevenue'
  | 'grossMargin'
  | 'sga'
  | 'quarterlyRevenue'
  | 'quarterlyEbitda'
  | 'fyRevenue'
  | 'fyEbitda';

export const DataTable: React.FC<DataTableProps> = ({
  records,
  formatting,
  issuesMap,
  onEdit,
  onDelete,
  onDuplicate,
  onDeleteSelected
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('wk');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      const cmp = (aVal || '').localeCompare((bVal as string) || '');
      return sortAsc ? cmp : -cmp;
    }

    const numA = Number(aVal) || 0;
    const numB = Number(bVal) || 0;
    return sortAsc ? numA - numB : numB - numA;
  });

  return (
    <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Batch Action Bar if rows selected */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs transition-all">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{selectedIds.size}</span> workstreams selected
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${selectedIds.size} selected workstreams?`)) {
                  onDeleteSelected(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main High-Density Table */}
      <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={records.length > 0 && selectedIds.size === records.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all rows"
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-2 w-8 text-center" title="Data Integrity & Audit Status">
                #
              </th>
              <th
                onClick={() => handleSort('reportingRegion')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Reporting Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('wk')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>WK Code</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('wkName')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap min-w-[200px]"
              >
                <div className="flex items-center gap-1">
                  <span>WK / Workstream Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('gadNonGad')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Classification</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('bidType')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Bid Type</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('plCategory')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>P&amp;L Category</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('monthlyRevenue')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Monthly Rev</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('grossMargin')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                title="Gross Margin value (EBITDA reporting basis)"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gross Margin</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sga')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                title="Captured separately for reporting & analysis"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>SG&amp;A</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('quarterlyRevenue')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap bg-blue-50/60"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Quarterly Rev</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('quarterlyEbitda')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap bg-blue-50/60"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Quarterly EBITDA</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('fyRevenue')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap bg-amber-50/60"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>FY Rev (Manual)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('fyEbitda')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap bg-amber-50/60"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>FY EBITDA (Manual)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center w-20 sticky right-0 bg-slate-100 z-10">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-800">
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-slate-500">
                  <p className="text-sm font-medium">No matching financial records found.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search criteria, or add a new WK entry.
                  </p>
                </td>
              </tr>
            ) : (
              sortedRecords.map((r) => {
                const isSelected = selectedIds.has(r.id);
                const issues = issuesMap.get(r.id) || [];
                const hasError = issues.some((i) => i.severity === 'error');
                const hasWarning = issues.some((i) => i.severity === 'warning');
                const hasInfo = issues.some((i) => i.severity === 'info');

                const qMargin =
                  r.quarterlyRevenue > 0
                    ? (r.quarterlyEbitda / r.quarterlyRevenue) * 100
                    : 0;

                return (
                  <tr
                    key={r.id}
                    className={`h-10 hover:bg-slate-50/90 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(r.id)}
                        aria-label={`Select ${r.wk}`}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Audit indicator */}
                    <td className="py-2 px-2 text-center">
                      {hasError ? (
                        <span
                          title={`Error: ${issues[0].message}`}
                          className="inline-flex items-center justify-center text-red-600"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      ) : hasWarning ? (
                        <span
                          title={`Warning: ${issues[0].message}`}
                          className="inline-flex items-center justify-center text-amber-500"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      ) : hasInfo ? (
                        <span
                          title={`Notice: ${issues[0].message}`}
                          className="inline-flex items-center justify-center text-blue-500"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span title="Valid" className="text-emerald-500">
                          <CheckCircle2 className="w-3.5 h-3.5 inline" />
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-700">
                      {r.reportingRegion}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap font-mono font-semibold text-slate-900">
                      {r.wk}
                    </td>

                    <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[240px]">
                      {r.wkName}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-medium ${
                          r.gadNonGad === 'GAD' ? 'text-indigo-700' : 'text-slate-600'
                        }`}
                      >
                        {r.gadNonGad}
                      </span>
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                      {r.bidType}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                      {r.plCategory}
                    </td>

                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatFinancialValue(r.monthlyRevenue, formatting)}
                    </td>

                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-900">
                      {formatFinancialValue(r.grossMargin, formatting)}
                    </td>

                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(r.sga, formatting)}
                    </td>

                    <td className="py-2 px-3 text-right font-mono tabular-nums font-medium text-slate-900 bg-blue-50/30">
                      {formatFinancialValue(r.quarterlyRevenue, formatting)}
                    </td>

                    <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700 bg-blue-50/30">
                      <div>{formatFinancialValue(r.quarterlyEbitda, formatting)}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {formatPercent(qMargin)}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700 bg-amber-50/30">
                      {formatFinancialValue(r.fyRevenue, formatting)}
                    </td>

                    <td className="py-2 px-3 text-right font-mono tabular-nums font-medium text-slate-900 bg-amber-50/30">
                      {formatFinancialValue(r.fyEbitda, formatting)}
                    </td>

                    <td className="py-2 px-3 text-center whitespace-nowrap sticky right-0 bg-white z-10 shadow-xs">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(r)}
                          title="Edit Record"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicate(r)}
                          title="Duplicate Record"
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete record ${r.wk} (${r.wkName})?`)) {
                              onDelete(r.id);
                            }
                          }}
                          title="Delete Record"
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
