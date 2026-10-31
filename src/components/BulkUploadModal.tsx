/**
 * Bulk Upload Modal for Excel & CSV Workbooks
 * Provides drag-and-drop file ingestion, previewing, column mapping confirmation,
 * error handling, and append vs replace modes.
 */

import React, { useState } from 'react';
import { PnlRecord, FormattingConfig } from '../types/pnl';
import { parseExcelFile, ParseResult } from '../utils/excelImport';
import { downloadExcelTemplate } from '../utils/excelExport';
import { formatFinancialValue } from '../utils/formatters';
import { FileSpreadsheet, UploadCloud, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommitImport: (records: PnlRecord[], replace: boolean) => void;
  formatting: FormattingConfig;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onCommitImport,
  formatting
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setParsing(true);
    setParseResult(null);

    try {
      const result = await parseExcelFile(file);
      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        records: [],
        errors: [err.message || 'Failed to process file'],
        warnings: [],
        totalRows: 0
      });
    } finally {
      setParsing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleApply = () => {
    if (parseResult && parseResult.records.length > 0) {
      onCommitImport(parseResult.records, importMode === 'replace');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bulk Upload Financial Data (Excel / CSV)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Import workstream records from .xlsx, .xls, or .csv files. Supports Indian and International number formats.
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Top Info Strip: Download Template */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded flex items-center justify-between text-xs">
            <div className="text-slate-600">
              Need the exact column sequence? Download the verified template with sample records.
            </div>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-medium transition-colors shadow-xs shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Excel Template</span>
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
            }`}
          >
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">
              {fileName ? `Selected: ${fileName}` : 'Drag & drop your Excel or CSV file here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Supports .xlsx, .xls, and .csv workbooks
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer transition-colors shadow-xs">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <span>Browse Files on Computer</span>
            </label>
          </div>

          {parsing && (
            <div className="py-6 text-center text-xs text-slate-600">
              Parsing Excel sheets and validating financial numbers...
            </div>
          )}

          {/* Parse Results Preview */}
          {parseResult && (
            <div className="space-y-4">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  {parseResult.records.length > 0 ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {parseResult.records.length} records ready to import
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      No valid records extracted
                    </span>
                  )}
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{parseResult.totalRows} raw rows evaluated</span>
                </div>

                {/* Import Mode: Append vs Replace */}
                {parseResult.records.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Mode:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-slate-900 focus:ring-0"
                      />
                      <span>Append</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer ml-2">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-slate-900 focus:ring-0"
                      />
                      <span>Replace All</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Errors / Warnings */}
              {parseResult.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 space-y-1">
                  {parseResult.errors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}

              {parseResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 space-y-1">
                  {parseResult.warnings.map((warn, i) => (
                    <div key={i}>{warn}</div>
                  ))}
                </div>
              )}

              {/* Preview Table (First 5 records) */}
              {parseResult.records.length > 0 && (
                <div className="border border-slate-200 rounded overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                    Preview (First {Math.min(5, parseResult.records.length)} of {parseResult.records.length} records):
                  </div>
                  <div className="max-h-48 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-1.5 px-2 font-medium">Region</th>
                          <th className="py-1.5 px-2 font-medium">WK</th>
                          <th className="py-1.5 px-2 font-medium">Workstream Name</th>
                          <th className="py-1.5 px-2 font-medium">GAD</th>
                          <th className="py-1.5 px-2 font-medium text-right">Quarterly Rev</th>
                          <th className="py-1.5 px-2 font-medium text-right">Quarterly EBITDA</th>
                          <th className="py-1.5 px-2 font-medium text-right">FY Rev</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {parseResult.records.slice(0, 5).map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2 font-sans">{r.reportingRegion}</td>
                            <td className="py-1.5 px-2 font-semibold">{r.wk}</td>
                            <td className="py-1.5 px-2 font-sans truncate max-w-[150px]">{r.wkName}</td>
                            <td className="py-1.5 px-2 font-sans">{r.gadNonGad}</td>
                            <td className="py-1.5 px-2 text-right">
                              {formatFinancialValue(r.quarterlyRevenue, formatting)}
                            </td>
                            <td className="py-1.5 px-2 text-right text-emerald-700">
                              {formatFinancialValue(r.quarterlyEbitda, formatting)}
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              {formatFinancialValue(r.fyRevenue, formatting)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parseResult || parseResult.records.length === 0}
            onClick={handleApply}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded shadow-xs transition-colors"
          >
            Import {parseResult ? parseResult.records.length : 0} Records
          </button>
        </div>
      </div>
    </div>
  );
};
