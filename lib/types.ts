export type AnalysisPlan = "basic" | "detailed";

export type AnalysisResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  grammarIssues: string[];
  missingKeywords: string[];
  atsOptimization: string[];
  summary: string;
  improvedResume?: string;
  plan: AnalysisPlan;
};

export type StoredAnalysis = {
  extractedText: string;
  result: AnalysisResult;
};

export type SessionUser = {
  email: string;
};
