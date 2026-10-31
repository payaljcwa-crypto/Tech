/**
 * Sub-Regional Profit & Loss (P&L) Dashboard Master Application
 *
 * Core capabilities:
 * - Capture Region-wise and WK-wise financial data (13 core fields)
 * - Indian (12,34,567.89) & International (1,234,567.89) number formatting
 * - Gross Margin (GM) EBITDA reporting basis & separate SG&A tracking
 * - Independent manual period reporting (no auto-annualization / no overwrite)
 * - Bulk Excel/CSV upload with preview and column mapping
 * - Exactly three worksheets in downloadable Excel workbook:
 *     Sheet 1: WK-wise P&L (Strict Columns A-J)
 *     Sheet 2: Region-wise Summary P&L
 *     Sheet 3: Category & Performance Master
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DEFAULT_FORMATTING_CONFIG,
  DEFAULT_PNL_CONFIG,
  FormattingConfig,
  INITIAL_REGIONS,
  PnlConfig,
  PnlRecord,
  SAMPLE_RECORDS,
  ValidationIssue
} from './types/pnl';
import { Header } from './components/Header';
import { KpiMetrics } from './components/KpiMetrics';
import { Toolbar } from './components/Toolbar';
import { DataTable } from './components/DataTable';
import { RecordModal } from './components/RecordModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { RegionalRollupView } from './components/RegionalRollupView';
import { CategoryAnalysisView } from './components/CategoryAnalysisView';
import { ValidationView } from './components/ValidationView';
import { FinancialLogicModal } from './components/FinancialLogicModal';
import { GithubExportModal } from './components/GithubExportModal';
import { validateAllRecords, validateRecord } from './utils/validators';
import { downloadExcelTemplate, exportPnlWorkbook } from './utils/excelExport';
import { downloadStandaloneHtml } from './utils/htmlExporter';

const STORAGE_KEY_RECORDS = 'sub_regional_pnl_records_v1';
const STORAGE_KEY_FORMATTING = 'sub_regional_pnl_formatting_v1';
const STORAGE_KEY_CONFIG = 'sub_regional_pnl_config_v1';

export default function App() {
  // 1. Data State with LocalStorage Persistence
  const [records, setRecords] = useState<PnlRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return SAMPLE_RECORDS;
  });

  const [formatting, setFormatting] = useState<FormattingConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FORMATTING);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read formatting config', e);
    }
    return DEFAULT_FORMATTING_CONFIG;
  });

  const [config, setConfig] = useState<PnlConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read pnl config', e);
    }
    return DEFAULT_PNL_CONFIG;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.warn('Could not persist records', e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FORMATTING, JSON.stringify(formatting));
    } catch (e) {
      console.warn('Could not persist formatting', e);
    }
  }, [formatting]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Could not persist config', e);
    }
  }, [config]);

  // 2. Navigation & View State
  const [activeTab, setActiveTab] = useState<'ledger' | 'regional' | 'categories' | 'audit'>('ledger');

  // 3. Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedGad, setSelectedGad] = useState('ALL');

  // 4. Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PnlRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  // Available unique regions across data + defaults
  const availableRegions = useMemo(() => {
    const set = new Set<string>(INITIAL_REGIONS);
    records.forEach((r) => {
      if (r.reportingRegion) set.add(r.reportingRegion);
    });
    return Array.from(set).sort();
  }, [records]);

  // 5. Validation Engine Run
  const validationSummary = useMemo(() => {
    return validateAllRecords(records, config);
  }, [records, config]);

  // Map issues by record ID for quick table lookup
  const issuesMap = useMemo(() => {
    const map = new Map<string, ValidationIssue[]>();
    validationSummary.issues.forEach((issue) => {
      const list = map.get(issue.recordId) || [];
      list.push(issue);
      map.set(issue.recordId, list);
    });
    return map;
  }, [validationSummary.issues]);

  // 6. Filtered Records for Ledger View
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Region match
      if (selectedRegion !== 'ALL' && r.reportingRegion !== selectedRegion) {
        return false;
      }
      // GAD match
      if (selectedGad !== 'ALL' && r.gadNonGad !== selectedGad) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWk = (r.wk || '').toLowerCase().includes(q);
        const matchName = (r.wkName || '').toLowerCase().includes(q);
        const matchRegion = (r.reportingRegion || '').toLowerCase().includes(q);
        const matchBid = (r.bidType || '').toLowerCase().includes(q);
        const matchCat = (r.plCategory || '').toLowerCase().includes(q);
        return matchWk || matchName || matchRegion || matchBid || matchCat;
      }
      return true;
    });
  }, [records, selectedRegion, selectedGad, searchQuery]);

  // Handlers for Data Mutations
  const handleSaveRecord = (savedRecord: PnlRecord) => {
    setRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === savedRecord.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = savedRecord;
        return next;
      }
      return [savedRecord, ...prev];
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeleteSelected = (ids: string[]) => {
    const set = new Set(ids);
    setRecords((prev) => prev.filter((r) => !set.has(r.id)));
  };

  const handleDuplicateRecord = (record: PnlRecord) => {
    const duplicated: PnlRecord = {
      ...record,
      id: `pnl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      wk: `${record.wk}-COPY`,
      wkName: `${record.wkName} (Copy)`,
      updatedAt: new Date().toISOString()
    };
    setRecords((prev) => [duplicated, ...prev]);
  };

  const handleCommitBulkImport = (newRecords: PnlRecord[], replace: boolean) => {
    if (replace) {
      setRecords(newRecords);
    } else {
      setRecords((prev) => [...newRecords, ...prev]);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset dashboard data to the initial verified sample workstreams?')) {
      setRecords(SAMPLE_RECORDS);
      setFormatting(DEFAULT_FORMATTING_CONFIG);
      setConfig(DEFAULT_PNL_CONFIG);
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      localStorage.removeItem(STORAGE_KEY_FORMATTING);
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    }
  };

  const handleExportExcel = () => {
    exportPnlWorkbook(records, 'Sub_Regional_PnL_Master');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* 1. Header (Compliant with Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onExportExcel={handleExportExcel}
        onDownloadTemplate={downloadExcelTemplate}
        onDownloadHtml={downloadStandaloneHtml}
        onOpenGithubModal={() => setIsGithubModalOpen(true)}
        totalRecords={records.length}
        issueCount={validationSummary.errorCount + validationSummary.warningCount}
      />

      {/* 2. KPI Executive Overview Metrics Strip */}
      <KpiMetrics
        records={records}
        formatting={formatting}
        onOpenLogicModal={() => setIsLogicModalOpen(true)}
      />

      {/* 3. Workspace Toolbar & Financial Settings */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        availableRegions={availableRegions}
        selectedGad={selectedGad}
        onGadChange={setSelectedGad}
        formatting={formatting}
        onFormattingChange={setFormatting}
        onOpenAddModal={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onResetData={handleResetData}
        activeCount={filteredRecords.length}
      />

      {/* 4. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  WK-wise Profit &amp; Loss Ledger (Sheet 1 Source)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed workstream financial entries with EBITDA Gross Margin basis, independent Quarterly &amp; FY reporting, and Indian/international formatting.
                </p>
              </div>
              <div className="text-xs text-slate-500 hidden sm:block">
                Showing {filteredRecords.length} of {records.length} records
              </div>
            </div>

            <DataTable
              records={filteredRecords}
              formatting={formatting}
              issuesMap={issuesMap}
              onEdit={(r) => {
                setEditingRecord(r);
                setIsRecordModalOpen(true);
              }}
              onDelete={handleDeleteRecord}
              onDuplicate={handleDuplicateRecord}
              onDeleteSelected={handleDeleteSelected}
            />
          </div>
        )}

        {activeTab === 'regional' && (
          <RegionalRollupView
            records={records}
            formatting={formatting}
            onSelectRegionFilter={(reg) => {
              setSelectedRegion(reg);
              setActiveTab('ledger');
            }}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryAnalysisView
            records={records}
            formatting={formatting}
          />
        )}

        {activeTab === 'audit' && (
          <ValidationView
            records={records}
            issues={validationSummary.issues}
            config={config}
            onEditRecord={(r) => {
              setEditingRecord(r);
              setIsRecordModalOpen(true);
            }}
            onOpenLogicModal={() => setIsLogicModalOpen(true)}
          />
        )}
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Sub-Regional P&amp;L Dashboard</span>
            <span aria-hidden="true">·</span>
            <span>EBITDA Basis: Gross Margin (GM)</span>
            <span aria-hidden="true">·</span>
            <span>Manual Period Reporting</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsLogicModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Calculation Rules
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="text-slate-900 font-medium hover:underline"
            >
              Export 3-Sheet Excel
            </button>
          </div>
        </div>
      </footer>

      {/* 6. Modals */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialData={editingRecord}
        formatting={formatting}
        availableRegions={availableRegions}
      />

      <BulkUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onCommitImport={handleCommitBulkImport}
        formatting={formatting}
      />

      <FinancialLogicModal
        isOpen={isLogicModalOpen}
        onClose={() => setIsLogicModalOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />

      <GithubExportModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        onDownloadHtml={downloadStandaloneHtml}
      />
    </div>
  );
}
