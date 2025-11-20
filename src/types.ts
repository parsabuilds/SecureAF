export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AnalysisStatus = 'idle' | 'fetching' | 'analyzing' | 'completed' | 'error';

export interface SecurityIssue {
  id: string;
  severity: IssueSeverity;
  category: string;
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  codeSnippet?: string;
  recommendation: string;
}

export interface AnalysisResult {
  repoName: string;
  repoOwner: string;
  repoUrl: string;
  securityScore: number;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  issues: SecurityIssue[];
  analyzedAt: string;
}

export interface RepoFile {
  path: string;
  content: string;
  size: number;
}
