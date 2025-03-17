import React, { createContext, useContext, useState } from 'react';
import { UserProfile, RecordingData, QuestionData } from '../types';

/**
 * AppContext Interface
 * Defines the shape of our global application state and available actions
 */
interface AppContextType {
  // User profile information
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  
  // Recording data from interview/presentation
  recordingData: RecordingData;
  setRecordingData: (data: RecordingData) => void;
  
  // Current question being asked/answered
  currentQuestion: string;
  setCurrentQuestion: (question: string) => void;
  
  // List of all questions for the session
  questions: QuestionData[];
  setQuestions: (questions: QuestionData[]) => void;
  
  // Track current question index
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  
  // Add data for a specific question
  addQuestionData: (questionId: string, data: Partial<QuestionData>) => void;
}

// Create context with undefined initial value
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider Component
 * 
 * Provides global state management for:
 * - User profile information
 * - Recording data
 * - Question management
 * - Session progress tracking
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state variables
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recordingData, setRecordingData] = useState<RecordingData>({});
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  /**
   * Updates data for a specific question
   * @param questionId - Unique identifier for the question
   * @param data - New data to merge with existing question data
   */
  const addQuestionData = (questionId: string, data: Partial<QuestionData>) => {
    setQuestions(prevQuestions => {
      const questionIndex = prevQuestions.findIndex(q => q.id === questionId);
      if (questionIndex === -1) return prevQuestions;

      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        ...data,
      };
      return updatedQuestions;
    });
  };

  // Provide context value to children
  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        recordingData,
        setRecordingData,
        currentQuestion,
        setCurrentQuestion,
        questions,
        setQuestions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        addQuestionData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/**
 * Custom hook to use the AppContext
 * Throws an error if used outside of AppProvider
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};