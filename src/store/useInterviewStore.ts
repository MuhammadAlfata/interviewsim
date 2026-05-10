import { create } from 'zustand';
import { InterviewState } from '../types/interview';

export const useInterviewStore = create<InterviewState>((set) => ({
  companyName: '',
  roleName: '',
  interviewType: 'General',
  questions: [],
  durationMinutes: 15,
  status: 'setup',
  currentQuestionIndex: 0,
  timeRemainingSeconds: null,
  recordingUrl: null,

  setSetupData: (data) => set((state) => ({ ...state, ...data })),
  
  startInterview: () => set((state) => ({ 
    status: 'active', 
    currentQuestionIndex: 0,
    timeRemainingSeconds: state.durationMinutes * 60,
    recordingUrl: null
  })),
  
  endInterview: (recordingUrl) => set((state) => ({ 
    status: 'finished', 
    recordingUrl: recordingUrl !== undefined ? recordingUrl : state.recordingUrl 
  })),

  setRecordingUrl: (url) => set({ recordingUrl: url }),
  
  nextQuestion: () => set((state) => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      return { currentQuestionIndex: state.currentQuestionIndex + 1 };
    }
    return { status: 'finished' };
  }),
  
  setTimeRemaining: (seconds) => set({ timeRemainingSeconds: seconds }),
  
  reset: () => set({
    companyName: '',
    roleName: '',
    interviewType: 'General',
    questions: [],
    durationMinutes: 15,
    status: 'setup',
    currentQuestionIndex: 0,
    timeRemainingSeconds: null,
    recordingUrl: null,
  })
}));
