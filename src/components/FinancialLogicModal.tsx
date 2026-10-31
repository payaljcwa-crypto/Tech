/**
 * Financial Calculation Logic & Governance Configuration Modal
 * Explicitly documents the calculation principles specified in Section 3
 * and allows users to configure validation tolerances.
 */

import React from 'react';
import { PnlConfig } from '../types/pnl';
import { X, CheckCircle2, ShieldCheck, FileText, Sliders } from 'lucide-react';

interface FinancialLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PnlConfig;
  onConfigChange: (newConfig: PnlConfig) => void;
}

export const FinancialLogicModal: React.FC<FinancialLogicModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Financial Calculation Logic &amp; Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Governing rules for EBITDA calculation basis, SG&amp;A reporting, and period integrity.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Principle 1: EBITDA Reporting Basis */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. EBITDA Reporting Basis: Gross Margin (GM)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              As established, workstream operating EBITDA performance is anchored on <strong>Gross Margin (GM)</strong> as the primary gross profitability baseline. Workstream operational profitability is derived from direct service gross margins rather than total company net overheads.
            </p>
            <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800">
              Formula: Gross Margin % = (Gross Margin / Revenue) × 100
              <br />
              Quarterly EBITDA % = (Quarterly EBITDA / Quarterly Revenue) × 100
            </div>
          </div>

          {/* Principle 2: SG&A Captured Separately */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. SG&amp;A Captured Separately</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Selling, General &amp; Administrative (SG&amp;A) expenses are tracked as an independent operational metric for reporting and analytical rollups across Sub-Regions. This ensures corporate and sales overheads are isolated without distorting direct delivery gross margins.
            </p>
          </div>

          {/* Principle 3: Manual Period Reporting & No Auto-Annualization */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Independent Period Reporting (Manual)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Quarterly and Full-Year (FY) values are <strong>independently maintained</strong>.
              The application strictly enforces:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>No Automatic Annualization:</strong> Quarterly figures are never multiplied by 4 to artificially compute FY numbers, respecting seasonality, contract milestone billings, and renewals.</li>
              <li><strong>No Overwriting:</strong> Manually keyed values in Monthly, Quarterly, and FY fields remain pristine and are never overwritten by automated algorithms.</li>
            </ul>
          </div>

          {/* Configuration Controls */}
          <div className="pt-2 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Sliders className="w-4 h-4 text-slate-800" />
              <span>Configurable Validation Thresholds</span>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Monthly vs Quarterly Divergence Notice Threshold (%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={config.divergenceThresholdPercent}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        divergenceThresholdPercent: Number(e.target.value)
                      })
                    }
                    className="flex-1 accent-slate-900"
                  />
                  <span className="font-mono font-bold text-slate-900 w-12 text-right">
                    {config.divergenceThresholdPercent}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Flags an informational notice if 3× Monthly Revenue diverges from Quarterly Revenue by more than this percentage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs transition-colors"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
