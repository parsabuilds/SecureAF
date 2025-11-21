import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  Home,
  GitPullRequest,
  Sparkles
} from 'lucide-react';
import { PRGenerationModal } from './PRGenerationModal';
import type { AnalysisResult, SecurityIssue, IssueSeverity } from '../types';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onBack: () => void;
}

const severityConfig = {
  critical: {
    color: 'red',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: AlertTriangle,
    label: 'Critical',
  },
  high: {
    color: 'orange',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: AlertCircle,
    label: 'High',
  },
  medium: {
    color: 'yellow',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: AlertCircle,
    label: 'Medium',
  },
  low: {
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: Info,
    label: 'Low',
  },
};

export function ResultsDashboard({ result, onBack }: ResultsDashboardProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState<IssueSeverity | 'all'>('all');
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<SecurityIssue | null>(null);

  const toggleIssue = (issueId: string) => {
    setExpandedIssues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  const filteredIssues = selectedSeverity === 'all'
    ? result.issues
    : result.issues.filter((issue) => issue.severity === selectedSeverity);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-orange-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">New Analysis</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="font-bold text-gray-900">{result.repoName}</h1>
              <p className="text-sm text-gray-500">{result.repoOwner}</p>
            </div>
          </div>
          <div className="relative group">
            <button
              onClick={() => {
                const criticalOrHighIssues = result.issues.filter(
                  (i) => (i.severity === 'critical' || i.severity === 'high') && i.filePath
                );
                if (criticalOrHighIssues.length > 0) {
                  setSelectedIssue(criticalOrHighIssues[0]);
                  setPrModalOpen(true);
                }
              }}
              disabled={!result.issues.some((i) => (i.severity === 'critical' || i.severity === 'high') && i.filePath)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600"
            >
              <Sparkles className="w-4 h-4" />
              Generate Fix PR
            </button>
            {!result.issues.some((i) => (i.severity === 'critical' || i.severity === 'high') && i.filePath) && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                No critical or high severity issues to fix
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-48 h-48 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(result.securityScore / 100) * 552.92} 552.92`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className={`${result.securityScore >= 80 ? 'stop-green-500' : result.securityScore >= 60 ? 'stop-yellow-500' : 'stop-red-500'}`} />
                        <stop offset="100%" className={`${result.securityScore >= 80 ? 'stop-emerald-500' : result.securityScore >= 60 ? 'stop-orange-500' : 'stop-orange-600'}`} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-gray-900">{result.securityScore}</span>
                    <span className="text-gray-500 text-sm mt-1">{getScoreLabel(result.securityScore)}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Security Score</h2>
                <p className="text-gray-600 mb-6">
                  Based on {result.totalIssues} issue{result.totalIssues !== 1 ? 's' : ''} found across your repository
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm font-medium text-red-700">Critical</span>
                    </div>
                    <p className="text-3xl font-bold text-red-700">{result.criticalCount}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      <span className="text-sm font-medium text-orange-700">High</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-700">{result.highCount}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-sm font-medium text-yellow-700">Medium</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">{result.mediumCount}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium text-blue-700">Low</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{result.lowCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedSeverity('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSeverity === 'all'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            All Issues ({result.totalIssues})
          </button>
          {Object.entries(severityConfig).map(([severity, config]) => {
            const count = result.issues.filter((i) => i.severity === severity).length;
            return (
              <button
                key={severity}
                onClick={() => setSelectedSeverity(severity as IssueSeverity)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSeverity === severity
                    ? `${config.bg} ${config.text} border-2 ${config.border} shadow-lg`
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Issues Found</h3>
            <p className="text-gray-600">
              {selectedSeverity === 'all'
                ? 'Great job! Your repository has no security issues.'
                : `No ${selectedSeverity} severity issues found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const config = severityConfig[issue.severity];
              const Icon = config.icon;
              const isExpanded = expandedIssues.has(issue.id);

              return (
                <div
                  key={issue.id}
                  className={`bg-white rounded-2xl border-2 ${config.border} overflow-hidden transition-all duration-300 hover:shadow-lg`}
                >
                  <button
                    onClick={() => toggleIssue(issue.id)}
                    className="w-full px-6 py-5 flex items-start gap-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-1 text-xs font-bold ${config.bg} ${config.text} rounded uppercase`}>
                          {issue.severity}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {issue.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{issue.title}</h3>
                      {issue.filePath && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FileCode className="w-4 h-4" />
                          <span>
                            {issue.filePath}
                            {issue.lineNumber && `:${issue.lineNumber}`}
                          </span>
                        </div>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                      <div className="pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-700 leading-relaxed">{issue.description}</p>
                      </div>

                      {issue.codeSnippet && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Code Snippet</h4>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                            <code>{issue.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      <div className={`${config.bg} rounded-xl p-4 border ${config.border}`}>
                        <h4 className={`font-semibold ${config.text} mb-2 flex items-center gap-2`}>
                          <Shield className="w-4 h-4" />
                          Recommendation
                        </h4>
                        <p className={`${config.text} leading-relaxed`}>{issue.recommendation}</p>
                      </div>

                      {(issue.severity === 'critical' || issue.severity === 'high') && issue.filePath && (
                        <div className="pt-4">
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setPrModalOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
                          >
                            <Sparkles className="w-5 h-5" />
                            Generate AI-Powered Fix PR
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedIssue && (
        <PRGenerationModal
          isOpen={prModalOpen}
          onClose={() => {
            setPrModalOpen(false);
            setSelectedIssue(null);
          }}
          issue={selectedIssue}
          repoOwner={result.repoOwner}
          repoName={result.repoName}
        />
      )}
    </div>
  );
}
