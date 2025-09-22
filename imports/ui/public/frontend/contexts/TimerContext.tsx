import React, { createContext, useContext, useState, useEffect } from 'react';

interface TimerContextType {
  startTime: number | null;
  endTime: number | null;
  elapsedTime: string;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
}

// Default context value
const defaultContextValue: TimerContextType = {
  startTime: null,
  endTime: null,
  elapsedTime: '00:00',
  isRunning: false,
  startTimer: () => {},
  stopTimer: () => {}
};

const TimerContext = createContext<TimerContextType>(defaultContextValue);

export const TimerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // Start the timer
  const startTimer = () => {
    // Only start if not already running
    if (!startTime) {
      setStartTime(Date.now());
      setIsRunning(true);
    }
  };
  
  // Stop the timer
  const stopTimer = () => {
    setEndTime(Date.now());
    setIsRunning(false);
  };
  
  // Update elapsed time every second
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (startTime && !endTime) {
      // Use requestAnimationFrame for more efficient updates
      const updateTimer = () => {
        const now = Date.now();
        const seconds = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`);
      };
      
      interval = setInterval(updateTimer, 1000);
      // Initial update
      updateTimer();
    } else if (startTime && endTime) {
      // Calculate final time when timer is stopped
      const seconds = Math.floor((endTime - startTime) / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      setElapsedTime(`${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startTime, endTime]);
  
  return (
    <TimerContext.Provider value={{ 
      startTime, 
      endTime, 
      elapsedTime, 
      isRunning,
      startTimer,
      stopTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  return context;
};
