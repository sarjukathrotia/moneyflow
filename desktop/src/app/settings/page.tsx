'use client';

import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Shield,
  RotateCcw,
  CheckCircle2,
  Database,
  Lock,
  Smartphone,
  Cloud,
  Key,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Unlink,
  Terminal,
  Bug,
  Activity,
  FileText,
  Play,
  Trash2,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useMoneyFlow } from '../../lib/store';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const {
    profile,
    updateProfile,
    currency,
    exportData,
    importBackup,
    resetToDefaults,
    isLive,
    syncStatus,
    supabaseUrl,
    supabaseAnonKey,
    connectSupabase,
    disconnectSupabase,
    debugLogs,
    clearLogs,
    runDiagnosticTest,
  } = useMoneyFlow();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [autoLockDuration, setAutoLockDuration] = useState('5 minutes');

  // Debug Log State
  const [logFilter, setLogFilter] = useState<'ALL' | 'DATABASE' | 'SYNC' | 'TRANSACTION' | 'SYSTEM' | 'ERROR'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = debugLogs.filter(log => {
    if (logFilter === 'ERROR' && log.level !== 'ERROR') return false;
    if (logFilter !== 'ALL' && logFilter !== 'ERROR' && log.category !== logFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchCat = log.category.toLowerCase().includes(q);
      const matchData = log.data ? JSON.stringify(log.data).toLowerCase().includes(q) : false;
      return matchMsg || matchCat || matchData;
    }
    return true;
  });

  const handleCopyLogs = () => {
    const formatted = debugLogs
      .map(
        l =>
          `[${l.timestamp}] [${l.level}] [${l.category}] ${l.message}${
            l.data ? '\nPayload: ' + JSON.stringify(l.data, null, 2) : ''
          }`
      )
      .join('\n\n');
    navigator.clipboard.writeText(formatted);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2500);
  };

  const handleDownloadLogs = () => {
    const formatted = debugLogs
      .map(
        l =>
          `[${l.timestamp}] [${l.level}] [${l.category}] ${l.message}${
            l.data ? '\nPayload: ' + JSON.stringify(l.data, null, 2) : ''
          }`
      )
      .join('\n\n');
    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneyflow-debug-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    await runDiagnosticTest();
    setIsRunningDiagnostics(false);
  };

  // Supabase Database Form State
  const [dbUrl, setDbUrl] = useState(supabaseUrl || '');
  const [dbKey, setDbKey] = useState(supabaseAnonKey || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbFeedback, setDbFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importBackup(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to parse backup JSON file.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleConnectDb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl.trim() || !dbKey.trim()) {
      setDbFeedback({ type: 'error', message: 'Please provide both your Supabase Project URL and Anon API key.' });
      return;
    }

    setIsConnecting(true);
    setDbFeedback(null);

    const result = await connectSupabase(dbUrl.trim(), dbKey.trim());
    setIsConnecting(false);

    if (result.success) {
      setDbFeedback({ type: 'success', message: result.message });
    } else {
      setDbFeedback({ type: 'error', message: result.message });
    }
  };

  const handleDisconnectDb = () => {
    disconnectSupabase();
    setDbUrl('');
    setDbKey('');
    setDbFeedback({ type: 'success', message: 'Disconnected from cloud database. MoneyFlow is now operating in offline local mode.' });
  };

  const handleCopySqlPath = () => {
    navigator.clipboard.writeText('supabase/migrations/20261004000000_initial_schema.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-primaryText">Settings & Security</h1>
        <p className="text-xs text-secondaryText">Manage database connectivity, preferences, security locks, and backups</p>
      </div>

      {/* 1. Supabase Cloud Database Connection */}
      <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-primaryText flex items-center gap-2">
            <Cloud className="w-4 h-4 text-primaryAccent" />
            <span>Supabase Cloud Database (PostgreSQL)</span>
          </h2>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                isLive
                  ? 'bg-positive-light text-positive border border-green-200'
                  : 'bg-gray-100 text-secondaryText border border-border'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-positive animate-pulse' : 'bg-gray-400'}`} />
              <span>{isLive ? 'PostgreSQL Connected' : 'Local Storage Mode'}</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-secondaryText leading-relaxed">
          Connect your MoneyFlow instance to a remote Supabase PostgreSQL database for automatic multi-device synchronization and instant cloud persistence.
        </p>

        {dbFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
              dbFeedback.type === 'success'
                ? 'bg-positive-light border-green-200 text-positive'
                : 'bg-negative-light border-red-200 text-negative'
            }`}
          >
            {dbFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p>{dbFeedback.message}</p>
              {dbFeedback.type === 'error' && dbFeedback.message.includes('tables are missing') && (
                <button
                  type="button"
                  onClick={() => setShowSqlGuide(true)}
                  className="mt-1.5 underline font-semibold text-xs text-primaryAccent block"
                >
                  View Step-by-Step SQL Migration Instructions →
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleConnectDb} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-secondaryText" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="url"
                value={dbUrl}
                onChange={e => setDbUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-secondaryText" />
                <span>Supabase Anon / Publishable API Key</span>
              </label>
              <input
                type="password"
                value={dbKey}
                onChange={e => setDbKey(e.target.value)}
                placeholder="sb_publishable_... or eyJhbGci..."
                className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isConnecting}
                className="px-4 py-2 bg-primaryAccent hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                {isConnecting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{isLive ? 'Update & Reconnect' : 'Connect Database'}</span>
                  </>
                )}
              </button>

              {isLive && (
                <button
                  type="button"
                  onClick={handleDisconnectDb}
                  className="px-3 py-2 bg-surface hover:bg-gray-100 text-negative border border-red-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowSqlGuide(prev => !prev)}
              className="text-xs font-semibold text-primaryAccent hover:underline flex items-center gap-1"
            >
              <span>{showSqlGuide ? 'Hide SQL Schema Guide' : 'SQL Setup Instructions'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Expandable SQL Setup Instructions */}
        {showSqlGuide && (
          <div className="p-4 rounded-xl bg-background border border-border space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-primaryText">Database Schema Migration Guide</h3>
              <button
                type="button"
                onClick={handleCopySqlPath}
                className="text-[11px] font-semibold text-primaryAccent flex items-center gap-1 hover:underline"
              >
                {copiedSql ? <Check className="w-3 h-3 text-positive" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Path Copied!' : 'Copy Migration File Path'}</span>
              </button>
            </div>
            <ol className="text-xs text-secondaryText list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>Open your project at <strong>https://supabase.com/dashboard</strong></li>
              <li>Navigate to <strong>SQL Editor</strong> in the left sidebar and click <strong>New query</strong></li>
              <li>Paste the contents of <code className="px-1.5 py-0.5 bg-surface border border-border rounded text-primaryText font-mono text-[11px]">supabase/migrations/20261004000000_initial_schema.sql</code></li>
              <li>Click <strong>Run</strong> to create all tables (<code className="text-primaryText">accounts</code>, <code className="text-primaryText">categories</code>, <code className="text-primaryText">transactions</code>, <code className="text-primaryText">transfers</code>), RLS policies, and triggers</li>
              <li>Copy your <strong>Project URL</strong> and <strong>anon key</strong> from <strong>Project Settings → API</strong> into the form above and click <strong>Connect Database</strong>!</li>
            </ol>
          </div>
        )}
      </div>

      {/* 2. General Preferences & Currency */}
      <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-4">
        <h2 className="text-sm font-bold text-primaryText flex items-center gap-2">
          <Settings className="w-4 h-4 text-primaryAccent" />
          <span>General Preferences</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1">Your Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={e => updateProfile({ full_name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1">Primary Currency</label>
            <select
              value={currency}
              onChange={e => updateProfile({ currency: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30 cursor-pointer"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Security & App Lock (Prompt Section 50 & 51) */}
      <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-4">
        <h2 className="text-sm font-bold text-primaryText flex items-center gap-2">
          <Shield className="w-4 h-4 text-positive" />
          <span>Security & App Lock</span>
        </h2>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/80">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-secondaryText" />
              <div>
                <p className="text-xs font-semibold text-primaryText">App Lock</p>
                <p className="text-[11px] text-secondaryText">Require PIN or biometric verification to unlock</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={appLockEnabled}
              onChange={e => setAppLockEnabled(e.target.checked)}
              className="w-4 h-4 accent-primaryAccent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/80">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-secondaryText" />
              <div>
                <p className="text-xs font-semibold text-primaryText">Biometric Unlock (Fingerprint / Face ID)</p>
                <p className="text-[11px] text-secondaryText">Use device biometric sensors for instantaneous access</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={biometricEnabled}
              onChange={e => setBiometricEnabled(e.target.checked)}
              className="w-4 h-4 accent-primaryAccent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/80">
            <div>
              <p className="text-xs font-semibold text-primaryText">Auto Lock Timer</p>
              <p className="text-[11px] text-secondaryText">Time before screen automatically locks when inactive</p>
            </div>
            <select
              value={autoLockDuration}
              onChange={e => setAutoLockDuration(e.target.value)}
              className="px-2.5 py-1 text-xs bg-surface border border-border rounded-lg"
            >
              <option value="Immediately">Immediately</option>
              <option value="1 minute">1 minute</option>
              <option value="5 minutes">5 minutes</option>
              <option value="30 minutes">30 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Data Backup, Export & Restore (Prompt Section 52 & 53) */}
      <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-4">
        <h2 className="text-sm font-bold text-primaryText flex items-center gap-2">
          <Database className="w-4 h-4 text-primaryAccent" />
          <span>Data Export & Backup</span>
        </h2>

        {importStatus && (
          <div className="p-3 rounded-xl bg-positive-light border border-green-200 text-positive text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export JSON Backup */}
          <div className="p-4 rounded-xl bg-background border border-border/80 flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold text-primaryText">Full JSON Backup</p>
              <p className="text-[11px] text-secondaryText">
                Complete database snapshot of all your accounts, categories, and transactions.
              </p>
            </div>
            <button
              onClick={() => exportData('json')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-surface hover:bg-gray-100 text-primaryText border border-border rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Export CSV Spreadsheets */}
          <div className="p-4 rounded-xl bg-background border border-border/80 flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold text-primaryText">Export Transactions (CSV)</p>
              <p className="text-[11px] text-secondaryText">
                Open your financial transaction history in Excel, Google Sheets, or Numbers.
              </p>
            </div>
            <button
              onClick={() => exportData('csv')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-surface hover:bg-gray-100 text-primaryText border border-border rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV File</span>
            </button>
          </div>
        </div>

        {/* Restore Backup */}
        <div className="pt-2">
          <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-border hover:border-primaryAccent text-secondaryText hover:text-primaryAccent cursor-pointer text-xs font-medium transition-colors">
            <Upload className="w-4 h-4" />
            <span>Click to upload and restore a JSON backup</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* 5. Sync Engine Status & Reset */}
      <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-4">
        <h2 className="text-sm font-bold text-primaryText flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-warning" />
          <span>Local Data Management & Reset</span>
        </h2>

        <div className="p-4 rounded-xl bg-background border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-primaryText">
              Engine Status: {syncStatus} {isLive ? '(Supabase Live Synced)' : '(Offline Local Mode)'}
            </p>
            <p className="text-[11px] text-secondaryText">
              All transactions are instantly saved locally and automatically synchronized.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Clear all transactions and reset data to a fresh, clean state?')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-negative border border-red-200 hover:bg-negative-light rounded-lg font-medium transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Clean State</span>
          </button>
        </div>
      </div>

      {/* 6. Developer Diagnostics & Debug Logs */}
      <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-primaryText flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primaryAccent" />
              <span>Debug Logs & System Diagnostics</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                syncStatus === 'SYNCED'
                  ? 'bg-positive-light text-positive border border-green-200'
                  : syncStatus === 'SYNCING'
                  ? 'bg-blue-50 text-primaryAccent border border-blue-200'
                  : 'bg-gray-100 text-secondaryText border border-gray-200'
              }`}>
                {debugLogs.length} events
              </span>
            </h2>
            <p className="text-xs text-secondaryText">
              Real-time operational event stream, database ping, network status, and sync telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primaryAccent hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-60 active:scale-95 cursor-pointer"
              title="Test database ping latency and verify local storage"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
              <span>{isRunningDiagnostics ? 'Testing...' : 'Run Diagnostics'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLogs}
              disabled={debugLogs.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-gray-100 text-primaryText border border-border rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
              title="Copy all logs to clipboard"
            >
              {copiedLogs ? <Check className="w-3.5 h-3.5 text-positive" /> : <Copy className="w-3.5 h-3.5 text-secondaryText" />}
              <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadLogs}
              disabled={debugLogs.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-gray-100 text-primaryText border border-border rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
              title="Download logs as text file"
            >
              <Download className="w-3.5 h-3.5 text-secondaryText" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={clearLogs}
              disabled={debugLogs.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-secondaryText hover:text-negative hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
              title="Clear log buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['ALL', 'DATABASE', 'SYNC', 'TRANSACTION', 'SYSTEM', 'ERROR'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setLogFilter(tab)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  logFilter === tab
                    ? 'bg-primaryText text-surface shadow-xs'
                    : 'bg-background hover:bg-gray-200/70 text-secondaryText'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                {tab === 'ERROR' && (
                  <span className="ml-1 text-[10px] text-negative font-bold">
                    ({debugLogs.filter(l => l.level === 'ERROR').length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-secondaryText absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primaryAccent font-mono"
            />
          </div>
        </div>

        {/* Terminal Log Console */}
        <div className="bg-[#0B0F19] text-gray-200 rounded-xl border border-gray-800 p-3 font-mono text-xs overflow-hidden shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800/80 text-[11px] text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-medium text-gray-400">Diagnostic Stream</span>
            </div>
            <span>{filteredLogs.length} / {debugLogs.length} events</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 select-text">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                <Terminal className="w-5 h-5 mx-auto mb-2 opacity-40" />
                <p>No log events matching current filter.</p>
                <button
                  type="button"
                  onClick={handleRunDiagnostics}
                  className="mt-2 text-primaryAccent hover:underline text-[11px] cursor-pointer"
                >
                  Click here to run system diagnostics
                </button>
              </div>
            ) : (
              filteredLogs.map(log => {
                const time = log.timestamp.split('T')[1]?.replace('Z', '') || log.timestamp;
                const isExpanded = expandedLogId === log.id;
                const hasData = Boolean(log.data);

                const levelBadgeClass =
                  log.level === 'SUCCESS'
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                    : log.level === 'ERROR'
                    ? 'text-red-400 bg-red-950/60 border-red-800'
                    : log.level === 'WARN'
                    ? 'text-amber-300 bg-amber-950/60 border-amber-800'
                    : 'text-sky-300 bg-sky-950/60 border-sky-800';

                return (
                  <div
                    key={log.id}
                    className="p-1.5 rounded hover:bg-gray-900/80 transition-colors border border-transparent hover:border-gray-800"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 text-[10px] shrink-0 mt-0.5">{time.slice(0, 12)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${levelBadgeClass}`}>
                        {log.level}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                        [{log.category}]
                      </span>
                      <span className="flex-1 break-words text-gray-200 text-xs">{log.message}</span>
                      {hasData && (
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 rounded bg-gray-800/80 hover:bg-gray-700 shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                    {isExpanded && log.data && (
                      <pre className="mt-2 p-2 rounded bg-black/60 border border-gray-800 text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
