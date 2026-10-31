/**
 * Validation & Audit View
 * Audits data completeness, calculation integrity, and flags discrepancy warnings
 * while providing direct jump-to-edit action and documentation of calculation rules.
 */

import React from 'react';
import { PnlConfig, PnlRecord, ValidationIssue } from '../types/pnl';
import { AlertCircle, AlertTriangle, CheckCircle2, Edit2, Info, HelpCircle } from 'lucide-react';

interface ValidationViewProps {
  records: PnlRecord[];
  issues: ValidationIssue[];
  config: PnlConfig;
  onEditRecord: (record: PnlRecord) => void;
  onOpenLogicModal: () => void;
}

export const ValidationView: React.FC<ValidationViewProps> = ({
  records,
  issues,
  config,
  onEditRecord,
  onOpenLogicModal
}) => {
  const errorIssues = issues.filter((i) => i.severity === 'error');
  const warningIssues = issues.filter((i) => i.severity === 'warning');
  const infoIssues = issues.filter((i) => i.severity === 'info');

  const healthyCount = records.length - new Set(issues.filter(i => i.severity !== 'info').map((i) => i.recordId)).size;
  const healthPercent = records.length > 0 ? (healthyCount / records.length) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner: Health & Audit Summary */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Financial Validation &amp; Calculation Audit
            </h2>
            <button
              type="button"
              onClick={onOpenLogicModal}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Review Calculation Rules</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System verifies required financial inputs, checks margin sanity, and notes divergence without auto-overwriting manual entries.
          </p>
        </div>

        {/* Health Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center min-w-[90px]">
            <span className="text-slate-400 block text-[11px]">Audit Score</span>
            <span className={`text-base font-bold font-mono ${healthPercent >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {healthPercent.toFixed(0)}%
            </span>
          </div>

          <div className="p-2.5 bg-red-50 border border-red-200 rounded text-center min-w-[80px]">
            <span className="text-red-500 block text-[11px]">Errors</span>
            <span className="text-base font-bold font-mono text-red-700">{errorIssues.length}</span>
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-center min-w-[80px]">
            <span className="text-amber-600 block text-[11px]">Warnings</span>
            <span className="text-base font-bold font-mono text-amber-800">{warningIssues.length}</span>
          </div>

          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-center min-w-[80px]">
            <span className="text-blue-500 block text-[11px]">Notices</span>
            <span className="text-base font-bold font-mono text-blue-800">{infoIssues.length}</span>
          </div>
        </div>
      </div>

      {/* Rules & Calculation Basis Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs text-slate-700 space-y-2">
        <div className="font-semibold text-slate-900 flex items-center gap-2">
          <span>Governing Financial Calculation Logic:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <span className="font-semibold text-slate-900 block mb-0.5">EBITDA Reporting Basis</span>
            <span className="text-slate-600">
              Gross Margin (GM) is confirmed as the official calculation baseline for workstream EBITDA performance.
            </span>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <span className="font-semibold text-slate-900 block mb-0.5">Separate SG&amp;A Capture</span>
            <span className="text-slate-600">
              SG&amp;A costs are isolated and monitored separately to avoid double-deductions in regional consolidations.
            </span>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <span className="font-semibold text-slate-900 block mb-0.5">Manual Period Governance</span>
            <span className="text-slate-600">
              Quarterly and FY entries are independently maintainable; no automated annualization overwrites user numbers.
            </span>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="p-12 text-center bg-white rounded border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">All Financial Records Clean &amp; Valid</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Every workstream record has complete inputs, valid EBITDA margins, and consistent manual period reporting.
            </p>
          </div>
        ) : (
          issues.map((issue, idx) => {
            const record = records.find((r) => r.id === issue.recordId);
            const isError = issue.severity === 'error';
            const isWarning = issue.severity === 'warning';

            return (
              <div
                key={idx}
                className={`p-4 rounded border flex items-start justify-between gap-4 transition-colors ${
                  isError
                    ? 'bg-red-50/40 border-red-200'
                    : isWarning
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-blue-50/30 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isError ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">
                        {issue.wk}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-800">{issue.wkName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{issue.region}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-500">[{issue.field}]</span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium">{issue.message}</p>

                    {issue.suggestedAction && (
                      <p className="text-[11px] text-slate-500">
                        Recommendation: {issue.suggestedAction}
                      </p>
                    )}
                  </div>
                </div>

                {record && (
                  <button
                    type="button"
                    onClick={() => onEditRecord(record)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded text-xs font-semibold shrink-0 shadow-xs transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Record</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
