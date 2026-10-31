/**
 * GitHub Export & Repository Setup Modal
 * Provides terminal commands to link to GitHub, automatic GitHub Pages deployment instructions,
 * and one-click download of the built distribution package.
 */

import React, { useState } from 'react';
import { X, Check, Copy, Github, Globe, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface GithubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadHtml: () => void;
}

export const GithubExportModal: React.FC<GithubExportModalProps> = ({
  isOpen,
  onClose,
  onDownloadHtml
}) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [repoName, setRepoName] = useState('Payal-FP-A');
  const [githubUser, setGithubUser] = useState('payaljcwa-crypto');
  const [patToken, setPatToken] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string, stepId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  const gitCommands = `# Remote is already linked to your repository:
# https://github.com/${githubUser}/${repoName}.git

# 1. Push code to your main branch:
git push -u origin main`;

  const ghCliCommand = `gh repo create ${repoName} --public --source=. --remote=origin --push`;

  const tokenPushCommand = patToken.trim()
    ? `git push https://${patToken.trim()}@github.com/${githubUser}/${repoName}.git main`
    : `git push https://<YOUR_GITHUB_TOKEN>@github.com/${githubUser}/${repoName}.git main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Export Project to GitHub
              </h2>
              <p className="text-xs text-slate-500">
                Push full source code and host live on GitHub Pages with automated CI/CD.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Direct Standalone HTML Tool Card */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-700" />
                <span>Single-File Offline HTML Tool (Zero Install)</span>
              </div>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Download a self-contained <code>sub_regional_pnl_dashboard.html</code> file that runs offline in any browser or can be uploaded directly to GitHub.
              </p>
            </div>
            <button
              type="button"
              onClick={onDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-xs shadow-xs transition-colors shrink-0"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Download .HTML Tool</span>
            </button>
          </div>

          {/* Repository Details Input */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
            <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Target GitHub Repository
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  GitHub Username / Organization
                </label>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value.trim())}
                  placeholder="e.g. yourname"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.trim())}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Option 1: Standard Git Commands */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>Option 1: Push via Git Terminal</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(gitCommands, 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
              >
                {copiedStep === 1 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>

          {/* Option 2: GitHub CLI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Github className="w-4 h-4 text-slate-700" />
                <span>Option 2: Using GitHub CLI (1-Liner)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(ghCliCommand, 2)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
              >
                {copiedStep === 2 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-2.5 bg-slate-900 text-slate-100 rounded font-mono text-[11px] overflow-x-auto">
              {ghCliCommand}
            </pre>
          </div>

          {/* Option 3: Authenticate with Personal Access Token (PAT) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>Option 3: Push with GitHub Token (PAT)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(tokenPushCommand, 3)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
              >
                {copiedStep === 3 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-2.5 bg-slate-900 text-slate-100 rounded font-mono text-[11px] overflow-x-auto">
              {tokenPushCommand}
            </pre>
          </div>

          {/* GitHub Pages Automated Hosting */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Automated GitHub Pages Deployment Included</span>
            </div>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              A pre-configured GitHub Actions workflow file (<code>.github/workflows/deploy.yml</code>) is already created in the repository.
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-emerald-900 text-[11px]">
              <li>Push your code to GitHub following the commands above.</li>
              <li>In your GitHub repo, navigate to <strong>Settings</strong> &gt; <strong>Pages</strong>.</li>
              <li>Under <strong>Build and deployment</strong>, set Source to <strong>GitHub Actions</strong>.</li>
              <li>Your dashboard will immediately publish live on your free GitHub Pages URL!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Git repository initialized on branch <code>main</code></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
