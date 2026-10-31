/**
 * Add / Edit Financial Record Modal
 * Captures all 13 core fields, allows Indian or International input syntax,
 * provides live formatted previews, and enforces calculation validations.
 */

import React, { useState, useEffect } from 'react';
import {
  BidType,
  GadClassification,
  INITIAL_BID_TYPES,
  INITIAL_PL_CATEGORIES,
  INITIAL_REGIONS,
  PlCategory,
  PnlRecord,
  FormattingConfig
} from '../types/pnl';
import { formatFinancialValue, formatPercent, parseFinancialInput } from '../utils/formatters';
import { X, Check } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: PnlRecord) => void;
  initialData?: PnlRecord | null;
  formatting: FormattingConfig;
  availableRegions: string[];
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  formatting,
  availableRegions
}) => {
  const [region, setRegion] = useState('');
  const [isCustomRegion, setIsCustomRegion] = useState(false);
  const [customRegionText, setCustomRegionText] = useState('');
  const [wk, setWk] = useState('');
  const [wkName, setWkName] = useState('');
  const [gadNonGad, setGadNonGad] = useState<GadClassification>('GAD');
  const [bidType, setBidType] = useState<BidType>('Fixed Price');
  const [plCategory, setPlCategory] = useState<PlCategory>('Revenue');

  // Input raw strings to allow typing with commas, Lakhs, Crores, etc.
  const [monthlyRevenueStr, setMonthlyRevenueStr] = useState('');
  const [grossMarginStr, setGrossMarginStr] = useState('');
  const [sgaStr, setSgaStr] = useState('');
  const [quarterlyRevenueStr, setQuarterlyRevenueStr] = useState('');
  const [quarterlyEbitdaStr, setQuarterlyEbitdaStr] = useState('');
  const [fyRevenueStr, setFyRevenueStr] = useState('');
  const [fyEbitdaStr, setFyEbitdaStr] = useState('');

  // Manual period reporting
  const [periodMonth, setPeriodMonth] = useState('Oct 2026');
  const [periodQuarter, setPeriodQuarter] = useState('Q3 FY26');
  const [periodFy, setPeriodFy] = useState('FY2026-27');
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      if (availableRegions.includes(initialData.reportingRegion)) {
        setRegion(initialData.reportingRegion);
        setIsCustomRegion(false);
        setCustomRegionText('');
      } else {
        setRegion('CUSTOM');
        setIsCustomRegion(true);
        setCustomRegionText(initialData.reportingRegion);
      }
      setWk(initialData.wk);
      setWkName(initialData.wkName);
      setGadNonGad(initialData.gadNonGad);
      setBidType(initialData.bidType);
      setPlCategory(initialData.plCategory);

      setMonthlyRevenueStr(initialData.monthlyRevenue ? initialData.monthlyRevenue.toString() : '');
      setGrossMarginStr(initialData.grossMargin ? initialData.grossMargin.toString() : '');
      setSgaStr(initialData.sga ? initialData.sga.toString() : '');
      setQuarterlyRevenueStr(initialData.quarterlyRevenue ? initialData.quarterlyRevenue.toString() : '');
      setQuarterlyEbitdaStr(initialData.quarterlyEbitda ? initialData.quarterlyEbitda.toString() : '');
      setFyRevenueStr(initialData.fyRevenue ? initialData.fyRevenue.toString() : '');
      setFyEbitdaStr(initialData.fyEbitda ? initialData.fyEbitda.toString() : '');

      setPeriodMonth(initialData.periodMonth || 'Oct 2026');
      setPeriodQuarter(initialData.periodQuarter || 'Q3 FY26');
      setPeriodFy(initialData.periodFy || 'FY2026-27');
      setNotes(initialData.notes || '');
    } else {
      // Defaults for new entry
      setRegion(availableRegions[0] || INITIAL_REGIONS[0]);
      setIsCustomRegion(false);
      setCustomRegionText('');
      setWk(`WK-${Math.floor(10 + Math.random() * 89)}`);
      setWkName('');
      setGadNonGad('GAD');
      setBidType('Fixed Price');
      setPlCategory('Revenue');

      setMonthlyRevenueStr('');
      setGrossMarginStr('');
      setSgaStr('');
      setQuarterlyRevenueStr('');
      setQuarterlyEbitdaStr('');
      setFyRevenueStr('');
      setFyEbitdaStr('');

      setPeriodMonth('Oct 2026');
      setPeriodQuarter('Q3 FY26');
      setPeriodFy('FY2026-27');
      setNotes('');
    }
    setFormError(null);
  }, [initialData, isOpen, availableRegions]);

  if (!isOpen) return null;

  // Real-time parsed values
  const parsedMonthlyRev = parseFinancialInput(monthlyRevenueStr);
  const parsedGrossMargin = parseFinancialInput(grossMarginStr);
  const parsedSga = parseFinancialInput(sgaStr);
  const parsedQuarterlyRev = parseFinancialInput(quarterlyRevenueStr);
  const parsedQuarterlyEbitda = parseFinancialInput(quarterlyEbitdaStr);
  const parsedFyRev = parseFinancialInput(fyRevenueStr);
  const parsedFyEbitda = parseFinancialInput(fyEbitdaStr);

  const gmMarginPercent = parsedMonthlyRev > 0 ? (parsedGrossMargin / parsedMonthlyRev) * 100 : 0;
  const quarterlyMarginPercent = parsedQuarterlyRev > 0 ? (parsedQuarterlyEbitda / parsedQuarterlyRev) * 100 : 0;
  const fyMarginPercent = parsedFyRev > 0 ? (parsedFyEbitda / parsedFyRev) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalRegion = isCustomRegion ? customRegionText.trim() : region.trim();
    if (!finalRegion) {
      setFormError('Please select or specify a Reporting Sub-Region.');
      return;
    }

    if (!wk.trim()) {
      setFormError('Please enter a WK Code.');
      return;
    }

    if (!wkName.trim()) {
      setFormError('Please enter a WK / Workstream Name.');
      return;
    }

    if (parsedQuarterlyRev > 0 && parsedFyRev > 0 && parsedQuarterlyRev > parsedFyRev) {
      setFormError('Quarterly Revenue cannot exceed Full-Year (FY) Revenue.');
      return;
    }

    const newRecord: PnlRecord = {
      id: initialData?.id || `pnl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reportingRegion: finalRegion,
      wk: wk.trim(),
      wkName: wkName.trim(),
      gadNonGad,
      bidType,
      plCategory,
      monthlyRevenue: parsedMonthlyRev,
      grossMargin: parsedGrossMargin,
      sga: parsedSga,
      quarterlyRevenue: parsedQuarterlyRev,
      quarterlyEbitda: parsedQuarterlyEbitda,
      fyRevenue: parsedFyRev,
      fyEbitda: parsedFyEbitda,
      periodMonth,
      periodQuarter,
      periodFy,
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialData ? `Edit Record: ${initialData.wk}` : 'Add New WK Financial Record'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter Sub-Regional and WK financial details. Indian &amp; international input supported.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
              {formError}
            </div>
          )}

          {/* Section 1: Classification & Identification */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              1. Workstream &amp; Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Region */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reporting Region *
                </label>
                <select
                  value={isCustomRegion ? 'CUSTOM' : region}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomRegion(true);
                    } else {
                      setIsCustomRegion(false);
                      setRegion(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white"
                >
                  {availableRegions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Custom Region Name</option>
                </select>
                {isCustomRegion && (
                  <input
                    type="text"
                    value={customRegionText}
                    onChange={(e) => setCustomRegionText(e.target.value)}
                    placeholder="Enter custom region name"
                    className="w-full mt-2 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-500"
                  />
                )}
              </div>

              {/* WK Code */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WK Code *
                </label>
                <input
                  type="text"
                  required
                  value={wk}
                  onChange={(e) => setWk(e.target.value)}
                  placeholder="e.g. WK-01, WK-101"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white"
                />
              </div>

              {/* WK Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WK Name / Business Unit *
                </label>
                <input
                  type="text"
                  required
                  value={wkName}
                  onChange={(e) => setWkName(e.target.value)}
                  placeholder="e.g. Cloud Modernization"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white"
                />
              </div>

              {/* GAD / Non-GAD */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Classification (GAD / Non-GAD)
                </label>
                <select
                  value={gadNonGad}
                  onChange={(e) => setGadNonGad(e.target.value as GadClassification)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white"
                >
                  <option value="GAD">GAD</option>
                  <option value="Non-GAD">Non-GAD</option>
                </select>
              </div>

              {/* Bid Type */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bid Type
                </label>
                <select
                  value={bidType}
                  onChange={(e) => setBidType(e.target.value as BidType)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white"
                >
                  {INITIAL_BID_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              {/* P&L Category */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  P&amp;L Category
                </label>
                <select
                  value={plCategory}
                  onChange={(e) => setPlCategory(e.target.value as PlCategory)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white"
                >
                  {INITIAL_PL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Numbers (Monthly, Gross Margin, SG&A) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                2. Operational Financials (EBITDA GM Basis &amp; SG&amp;A)
              </h3>
              <span className="text-[11px] text-slate-400">
                You can type: e.g. 2,450,000 or 24,50,000 or 2.45M or 24.5L
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Monthly Revenue */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Monthly Revenue
                </label>
                <input
                  type="text"
                  value={monthlyRevenueStr}
                  onChange={(e) => setMonthlyRevenueStr(e.target.value)}
                  placeholder="e.g. 2,450,000.00"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white text-right"
                />
                <div className="mt-1 text-[11px] font-mono text-slate-500 text-right">
                  Preview: {formatFinancialValue(parsedMonthlyRev, formatting)}
                </div>
              </div>

              {/* Gross Margin */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gross Margin (GM Basis)
                </label>
                <input
                  type="text"
                  value={grossMarginStr}
                  onChange={(e) => setGrossMarginStr(e.target.value)}
                  placeholder="e.g. 931,000.00"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white text-right"
                />
                <div className="mt-1 text-[11px] flex items-center justify-between text-slate-500">
                  <span>GM%: {formatPercent(gmMarginPercent)}</span>
                  <span className="font-mono">{formatFinancialValue(parsedGrossMargin, formatting)}</span>
                </div>
              </div>

              {/* SG&A */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  SG&amp;A (Captured Separately)
                </label>
                <input
                  type="text"
                  value={sgaStr}
                  onChange={(e) => setSgaStr(e.target.value)}
                  placeholder="e.g. 245,000.00"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white text-right"
                />
                <div className="mt-1 text-[11px] font-mono text-slate-500 text-right">
                  Preview: {formatFinancialValue(parsedSga, formatting)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Period Reporting (Quarterly & Full Year - Independent & Manual) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                3. Quarterly &amp; FY Performance (Manual Period Reporting)
              </h3>
              <span className="text-[11px] text-slate-400">
                Quarterly &amp; FY are maintained independently; not auto-annualized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded border border-slate-200">
              {/* Quarterly Rev */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quarterly Revenue
                </label>
                <input
                  type="text"
                  value={quarterlyRevenueStr}
                  onChange={(e) => setQuarterlyRevenueStr(e.target.value)}
                  placeholder="e.g. 7,350,000.00"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-500 text-right"
                />
                <div className="mt-1 text-[11px] font-mono text-slate-500 text-right">
                  Preview: {formatFinancialValue(parsedQuarterlyRev, formatting)}
                </div>
              </div>

              {/* Quarterly EBITDA */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quarterly EBITDA
                </label>
                <input
                  type="text"
                  value={quarterlyEbitdaStr}
                  onChange={(e) => setQuarterlyEbitdaStr(e.target.value)}
                  placeholder="e.g. 2,058,000.00"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-500 text-right"
                />
                <div className="mt-1 text-[11px] flex items-center justify-between text-slate-500">
                  <span>EBITDA Margin: {formatPercent(quarterlyMarginPercent)}</span>
                  <span className="font-mono text-emerald-700">{formatFinancialValue(parsedQuarterlyEbitda, formatting)}</span>
                </div>
              </div>

              {/* FY Revenue */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full-Year (FY) Revenue
                </label>
                <input
                  type="text"
                  value={fyRevenueStr}
                  onChange={(e) => setFyRevenueStr(e.target.value)}
                  placeholder="e.g. 29,400,000.00"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-500 text-right"
                />
                <div className="mt-1 text-[11px] font-mono text-slate-500 text-right">
                  Preview: {formatFinancialValue(parsedFyRev, formatting)}
                </div>
              </div>

              {/* FY EBITDA */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full-Year (FY) EBITDA
                </label>
                <input
                  type="text"
                  value={fyEbitdaStr}
                  onChange={(e) => setFyEbitdaStr(e.target.value)}
                  placeholder="e.g. 8,232,000.00"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-500 text-right"
                />
                <div className="mt-1 text-[11px] flex items-center justify-between text-slate-500">
                  <span>FY Margin: {formatPercent(fyMarginPercent)}</span>
                  <span className="font-mono text-slate-800">{formatFinancialValue(parsedFyEbitda, formatting)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Period Tags & Audit Notes */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              4. Reporting Periods &amp; Documentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reporting Month
                </label>
                <input
                  type="text"
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reporting Quarter
                </label>
                <input
                  type="text"
                  value={periodQuarter}
                  onChange={(e) => setPeriodQuarter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reporting FY
                </label>
                <input
                  type="text"
                  value={periodFy}
                  onChange={(e) => setPeriodFy(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Optional Notes &amp; Assumptions
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Contract milestone delivered; pass-through cloud costs included"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
