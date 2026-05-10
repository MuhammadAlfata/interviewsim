export interface QuestionTimestamp {
  index: number;
  text: string;
  timeMs: number;
}

export interface InterviewState {
  companyName: string;
  roleName: string;
  interviewType: string;
  questions: string[];
  durationMinutes: number;
  status: "setup" | "active" | "finished";
  currentQuestionIndex: number;
  timeRemainingSeconds: number | null;
  recordingUrl: string | null;
  questionTimestamps: QuestionTimestamp[];
  
  // Actions
  setSetupData: (data: Partial<InterviewState>) => void;
  startInterview: () => void;
  endInterview: (recordingUrl?: string) => void;
  setRecordingUrl: (url: string) => void;
  nextQuestion: () => void;
  addQuestionTimestamp: (timestamp: QuestionTimestamp) => void;
  setTimeRemaining: (seconds: number) => void;
  reset: () => void;
}
