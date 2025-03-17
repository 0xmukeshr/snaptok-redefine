import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuestionData } from '../types';

/**
 * AI Service Module
 * 
 * Handles all AI-related functionality including:
 * - Question generation
 * - Speech analysis
 * - Performance evaluation
 */

// Initialize Gemini AI (Note: Replace with actual API key in production)
const API_KEY = "YOUR_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates interview questions based on user profile
 * @param profile - User profile containing skills and experience
 * @param count - Number of questions to generate
 * @returns Array of generated questions
 */
export async function generateInterviewQuestions(profile: {
  name: string;
  skills: string;
  description: string;
  level: string;
}, count: number = 5): Promise<QuestionData[]> {
  try {
    // Mock questions based on profile (Replace with actual AI generation)
    const mockQuestionTexts = [
      `Based on your experience with ${profile.skills}, can you describe a challenging project you've worked on?`,
      `As someone with ${profile.level} level experience, how do you approach learning new technologies in ${profile.skills}?`,
      `Can you explain how your background in ${profile.description} has prepared you for roles involving ${profile.skills}?`,
      `What do you think are the most important skills for someone working with ${profile.skills}?`,
      `How do you stay updated with the latest developments in ${profile.skills}?`
    ];
    
    return mockQuestionTexts.slice(0, count).map((text, index) => ({
      id: `q-${index + 1}`,
      text
    }));
  } catch (error) {
    console.error("Error generating questions:", error);
    // Return fallback question if generation fails
    return [{
      id: "q-1",
      text: "Could you tell me about your experience with the technologies you've listed?"
    }];
  }
}

/**
 * Analyzes recorded audio/video for speech patterns and quality
 * @param audioBlob - Recorded audio data
 * @param videoBlob - Optional recorded video data
 * @returns Analysis results including transcript and recommendations
 */
export async function analyzeRecording(audioBlob: Blob) {
  try {
    const response = await fetch("http://localhost:8080/api/analyze");
    const data = await response.json();

    return {
      transcript: data.transcript,         // Raw transcript from speech-to-text
      correctedText: data.correctedText,   // Corrected text with removed disfluencies
      disfluencyAnalysis: data.disfluencyAnalysis, // Analysis of speech disfluencies
      repeatedWords: data.repeatedWords,   // Frequency analysis of words used,
      aiRecommendations: {
        strengths: [
          "Clear articulation of main points",
          "Good use of technical terminology",
          "Maintained professional tone"
        ],
        improvements: [
          "Reduce filler words",
          "Work on concise sentence structure",
          "Practice smoother transitions"
        ],
        personalizedTips: [
          "Try pausing instead of using filler words",
          "Record practice sessions",
          "Focus on breathing techniques"
        ]
      }
    };
  } catch (error) {
    console.error("Error fetching speech analysis:", error);
    return {
      transcript: "Error processing speech...",
      correctedText: "Error processing text...",
      disfluencyAnalysis: {},
      repeatedWords: {},
      aiRecommendations: {
        strengths: [],
        improvements: [],
        personalizedTips: []
      }
    };
  }
}