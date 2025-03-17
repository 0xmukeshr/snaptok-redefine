import React, { useState, useEffect } from 'react';

/**
 * Timer Component
 * 
 * A versatile countdown timer that can display time in seconds or minutes:seconds format.
 * Features:
 * - Configurable duration
 * - Start/stop functionality
 * - Completion callback
 * - Optional minutes display
 * 
 * @param isActive - Controls if timer is running
 * @param duration - Total time in seconds
 * @param onComplete - Callback fired when timer reaches zero
 * @param showMinutes - Whether to show time in MM:SS format
 */
interface TimerProps {
  isActive: boolean;
  duration: number;
  onComplete: () => void;
  showMinutes?: boolean;
}

const Timer: React.FC<TimerProps> = ({ 
  isActive, 
  duration, 
  onComplete, 
  showMinutes = false 
}) => {
  // Track remaining time
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // Reset timer when inactive
    if (!isActive) {
      setTimeLeft(duration);
      return;
    }

    // Handle timer completion
    if (timeLeft === 0) {
      onComplete();
      return;
    }

    // Set up countdown interval
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Cleanup interval on unmount or when timer stops
    return () => clearInterval(timer);
  }, [isActive, timeLeft, duration, onComplete]);

  /**
   * Format time display based on showMinutes setting
   * @param seconds - Time in seconds
   * @returns Formatted time string
   */
  const formatTime = (seconds: number) => {
    if (!showMinutes) return seconds;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-20 h-20 rounded-full border-4 border-gray-800 flex items-center justify-center bg-white">
      <span className="font-bold text-xl">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;