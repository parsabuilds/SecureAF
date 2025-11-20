import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, ExternalLink, Github } from 'lucide-react';
import { githubService } from '../services/githubService';
import type { SecurityIssue } from '../types';

interface PRGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: SecurityIssue;
  repoOwner: string;
  repoName: string;
}

type Step = 'auth' | 'generating' | 'review' | 'creating' | 'success' | 'error';

export function PRGenerationModal({
  isOpen,
  onClose,
  issue,
  repoOwner,
  repoName,
}: PRGenerationModalProps) {
  const [step, setStep] = useState<Step>('auth');
  const [error, setError] = useState<string | null>(null);
  const [fix, setFix] = useState<any>(null);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const authenticated = githubService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        startFixGeneration();
      } else {
        setStep('auth');
      }
    }
  }, [isOpen]);

  const handleGitHubAuth = () => {
    githubService.initiateOAuth();
  };

  const startFixGeneration = async () => {
    setStep('generating');
    setError(null);

    try {
      if (!issue.filePath) {
        throw new Error('No file path available for this issue');
      }

      const fileContent = await githubService.fetchFileContent(
        repoOwner,
        repoName,
        issue.filePath
      );

      const fixResponse = await githubService.generateFix(
        issue,
        fileContent,
        { name: repoName, language: 'javascript' }
      );

      if (!fixResponse.success) {
        throw new Error('Failed to generate fix');
      }

      setFix(fixResponse.fix);
      setStep('review');
    } catch (err: any) {
      console.error('Fix generation error:', err);
      setError(err.message || 'Failed to generate fix');
      setStep('error');
    }
  };

  const handleCreatePR = async () => {
    if (!fix) return;

    setStep('creating');
    setError(null);

    try {
      const prResponse = await githubService.createPR(
        repoOwner,
        repoName,
        issue,
        fix
      );

      if (!prResponse.success) {
        throw new Error('Failed to create pull request');
      }

      setPrUrl(prResponse.pr.url);
      setStep('success');
    } catch (err: any) {
      console.error('PR creation error:', err);
      setError(err.message || 'Failed to create pull request');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('auth');
    setError(null);
    setFix(null);
    setPrUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Generate Fix PR</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'auth' && (
            <div className="text-center py-12">
              <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Connect GitHub Account
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                To create pull requests, we need access to your GitHub account.
                We'll only request the minimum permissions needed.
              </p>
              <button
                onClick={handleGitHubAuth}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <Github className="w-5 h-5" />
                Connect with GitHub
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Required permission: <code className="bg-gray-100 px-2 py-1 rounded">repo</code>
              </p>
            </div>
          )}

          {step === 'generating' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Generating AI-Powered Fix
              </h3>
              <p className="text-gray-600">
                Analyzing the security issue and creating a production-ready fix...
              </p>
            </div>
          )}

          {step === 'review' && fix && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Review Before Creating PR
                    </h4>
                    <p className="text-sm text-blue-700">
                      AI Confidence: {Math.round((fix.confidence || 0.8) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Issue Being Fixed</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {issue.severity}
                    </span>
                    <span className="text-sm text-gray-600">{issue.category}</span>
                  </div>
                  <h5 className="font-medium text-gray-900 mb-1">{issue.title}</h5>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Explanation</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{fix.explanation}</p>
                </div>
              </div>

              {fix.changes_summary && fix.changes_summary.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Changes Made</h4>
                  <ul className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    {fix.changes_summary.map((change: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Fixed Code Preview</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-64">
                  <code>{fix.fixed_content}</code>
                </pre>
              </div>
            </div>
          )}

          {step === 'creating' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Creating Pull Request
              </h3>
              <p className="text-gray-600">
                Creating a new branch and opening a pull request on GitHub...
              </p>
            </div>
          )}

          {step === 'success' && prUrl && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pull Request Created Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Your security fix has been submitted as a pull request.
              </p>
              <a
                href={prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                View Pull Request
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {step === 'error' && error && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Something Went Wrong
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {step === 'review' && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePR}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Pull Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
