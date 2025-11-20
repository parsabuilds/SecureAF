import { useEffect, useState } from 'react';
import { Shield, FolderGit2, Search, ScanLine, FileSearch, CheckCircle2 } from 'lucide-react';

interface AnalysisProgressProps {
  repoUrl: string;
}

type Stage = {
  id: string;
  label: string;
  icon: React.ReactNode;
  duration: number;
};

const stages: Stage[] = [
  {
    id: 'fetch',
    label: 'Fetching repository',
    icon: <FolderGit2 className="w-6 h-6" />,
    duration: 1500,
  },
  {
    id: 'scan',
    label: 'Scanning files',
    icon: <FileSearch className="w-6 h-6" />,
    duration: 2000,
  },
  {
    id: 'analyze',
    label: 'Analyzing security patterns',
    icon: <Search className="w-6 h-6" />,
    duration: 2500,
  },
  {
    id: 'detect',
    label: 'Detecting vulnerabilities',
    icon: <ScanLine className="w-6 h-6" />,
    duration: 2000,
  },
  {
    id: 'complete',
    label: 'Generating report',
    icon: <CheckCircle2 className="w-6 h-6" />,
    duration: 1000,
  },
];

export function AnalysisProgress({ repoUrl }: AnalysisProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 90);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stageProgress = (progress / 100) * stages.length;
    setCurrentStage(Math.floor(stageProgress));
  }, [progress]);

  const repoName = repoUrl.split('/').slice(-2).join('/').replace('.git', '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl mb-6 animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analyzing Repository</h2>
          <p className="text-gray-600 text-lg">{repoName}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isActive = index === currentStage && progress < 100;
              const isCompleted = index < currentStage || progress >= 100;
              const isPending = index > currentStage && progress < 100;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : isCompleted
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-gray-50 border-2 border-gray-100'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 text-white animate-pulse'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold transition-colors ${
                        isActive
                          ? 'text-blue-900'
                          : isCompleted
                          ? 'text-green-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {stage.label}
                    </p>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {isActive && (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-900 text-center">
              <span className="font-semibold">Tip:</span> We're scanning your code for exposed secrets, SQL injection, XSS vulnerabilities, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
