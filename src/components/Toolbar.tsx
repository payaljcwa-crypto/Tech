/**
 * Workspace Toolbar & Financial Configuration Strip
 * Manages currency mode (Indian vs International), display scale, filters,
 * and data entry actions (Add Record, Bulk Upload Excel).
 */

import React from 'react';
import { CurrencyCode, DisplayScale, FormattingConfig, GadClassification, NumberSystem } from '../types/pnl';
import { Filter, Plus, Search, UploadCloud, RotateCcw } from 'lucide-react';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedRegion: string;
  onRegionChange: (val: string) => void;
  availableRegions: string[];
  selectedGad: string;
  onGadChange: (val: string) => void;
  formatting: FormattingConfig;
  onFormattingChange: (newConfig: FormattingConfig) => void;
  onOpenAddModal: () => void;
  onOpenUploadModal: () => void;
  onResetData: () => void;
  activeCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  availableRegions,
  selectedGad,
  onGadChange,
  formatting,
  onFormattingChange,
  onOpenAddModal,
  onOpenUploadModal,
  onResetData,
  activeCount
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 space-y-3">
      {/* Top Row: Search, Filters, and Primary Data Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search WK, name, region..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">All Sub-Regions</option>
              {availableRegions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* GAD / Non-GAD Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded text-xs">
            <button
              type="button"
              onClick={() => onGadChange('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedGad === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onGadChange('GAD')}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedGad === 'GAD'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GAD
            </button>
            <button
              type="button"
              onClick={() => onGadChange('Non-GAD')}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedGad === 'Non-GAD'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non-GAD
            </button>
          </div>
        </div>

        {/* Right: Data Actions */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <button
            type="button"
            onClick={onResetData}
            title="Reset dataset to default verified samples"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors whitespace-nowrap shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulk Upload Excel</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add WK Record</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Financial Number System & Currency Formatting Controls */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          {/* Number System Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Format:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded">
              <button
                type="button"
                onClick={() =>
                  onFormattingChange({ ...formatting, numberSystem: 'international' })
                }
                className={`px-2 py-0.5 rounded transition-colors ${
                  formatting.numberSystem === 'international'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                International (1,234,567.89)
              </button>
              <button
                type="button"
                onClick={() =>
                  onFormattingChange({ ...formatting, numberSystem: 'indian', currency: 'INR' })
                }
                className={`px-2 py-0.5 rounded transition-colors ${
                  formatting.numberSystem === 'indian'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Indian (12,34,567.89)
              </button>
            </div>
          </div>

          {/* Currency Code Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Currency:</span>
            <select
              value={formatting.currency}
              onChange={(e) =>
                onFormattingChange({
                  ...formatting,
                  currency: e.target.value as CurrencyCode
                })
              }
              className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NONE">None (Raw)</option>
            </select>
          </div>

          {/* Unit Scale Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Scale:</span>
            <select
              value={formatting.scale}
              onChange={(e) =>
                onFormattingChange({
                  ...formatting,
                  scale: e.target.value as DisplayScale
                })
              }
              className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
            >
              <option value="exact">Exact (Full figures)</option>
              <option value="thousands">In Thousands (K)</option>
              <option value="millions">In Millions (M)</option>
              <option value="lakhs">In Lakhs (L)</option>
              <option value="crores">In Crores (Cr)</option>
            </select>
          </div>
        </div>

        {/* Informational Context Tag (Zero-pill text separator) */}
        <div className="text-slate-400 text-xs flex items-center gap-2">
          <span>Showing {activeCount} workstreams</span>
          <span aria-hidden="true">·</span>
          <span>EBITDA Basis: Gross Margin (GM)</span>
          <span aria-hidden="true">·</span>
          <span>Manual Period Reporting</span>
        </div>
      </div>
    </div>
  );
};
