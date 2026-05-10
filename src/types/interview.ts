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
  
  // Actions
  setSetupData: (data: Partial<InterviewState>) => void;
  startInterview: () => void;
  endInterview: (recordingUrl?: string) => void;
  setRecordingUrl: (url: string) => void;
  nextQuestion: () => void;
  setTimeRemaining: (seconds: number) => void;
  reset: () => void;
}
