/**
 * Top Bar Header Component
 * Strict compliance with the Top Bar Contract (§2):
 * Zone 1 (Wordmark) — Zone 2 (4-5 Nav Links) — Zone 3 (1 Primary Action)
 */

import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  activeTab: 'ledger' | 'regional' | 'categories' | 'audit';
  onSelectTab: (tab: 'ledger' | 'regional' | 'categories' | 'audit') => void;
  onExportExcel: () => void;
  onDownloadTemplate: () => void;
  onDownloadHtml: () => void;
  onOpenGithubModal: () => void;
  totalRecords: number;
  issueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onExportExcel,
  onDownloadTemplate,
  onDownloadHtml,
  onOpenGithubModal,
  totalRecords,
  issueCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight">
            PL
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Sub-Regional P&amp;L Master
          </span>
        </div>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onSelectTab('ledger')}
            className={`whitespace-nowrap pb-1 transition-colors ${
              activeTab === 'ledger'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            WK-wise Ledger ({totalRecords})
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('regional')}
            className={`whitespace-nowrap pb-1 transition-colors ${
              activeTab === 'regional'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sub-Regional Rollup
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('categories')}
            className={`whitespace-nowrap pb-1 transition-colors ${
              activeTab === 'categories'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Category &amp; Margins
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('audit')}
            className={`whitespace-nowrap pb-1 transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Validation &amp; Audit</span>
            {issueCount > 0 && (
              <span className="px-1.5 py-0.2 text-xs font-mono font-medium rounded bg-amber-100 text-amber-800">
                {issueCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onDownloadHtml}
            title="Download complete standalone HTML file (opens in any browser offline)"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download .HTML Tool</span>
          </button>

          <button
            type="button"
            onClick={onOpenGithubModal}
            title="Export repository to GitHub and setup GitHub Pages"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Export to GitHub</span>
          </button>

          <button
            type="button"
            onClick={onDownloadTemplate}
            title="Download blank Excel upload template"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel Template</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-sm transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 3-Sheet Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
