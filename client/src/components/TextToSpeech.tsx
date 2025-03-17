import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * TextToSpeech Component
 * 
 * Converts text to speech using the Web Speech API.
 * Features:
 * - Play/pause functionality
 * - Automatic voice selection
 * - Configurable speech settings
 * - Optional autoplay
 * 
 * @param text - The text to be spoken
 * @param autoPlay - Whether to start speaking automatically
 */
interface TextToSpeechProps {
  text: string;
  autoPlay?: boolean;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, autoPlay = true }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  useEffect(() => {
    if (!text) return;
    
    const synth = window.speechSynthesis;
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    newUtterance.rate = 1.0;  // Normal speaking rate
    newUtterance.pitch = 1.0; // Normal pitch
    
    // Select the best available voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Natural') || 
      voice.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      newUtterance.voice = preferredVoice;
    }
    
    // Set up event handlers
    newUtterance.onstart = () => setIsSpeaking(true);
    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onerror = () => setIsSpeaking(false);
    
    setUtterance(newUtterance);
    
    // Auto-play if enabled
    if (autoPlay) {
      synth.cancel(); // Cancel any ongoing speech
      synth.speak(newUtterance);
    }
    
    // Cleanup on unmount
    return () => {
      synth.cancel();
    };
  }, [text, autoPlay]);
  
  /**
   * Toggle speech playback
   */
  const toggleSpeech = () => {
    const synth = window.speechSynthesis;
    
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else if (utterance) {
      synth.speak(utterance);
    }
  };
  
  return (
    <button
      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      onClick={toggleSpeech}
      title={isSpeaking ? "Stop speaking" : "Read aloud"}
    >
      {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
};

export default TextToSpeech;