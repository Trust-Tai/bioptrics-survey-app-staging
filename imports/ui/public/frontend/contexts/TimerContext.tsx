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
      console.log('Timer started');
      setStartTime(Date.now());
      setIsRunning(true);
    } else {
      console.log('Timer already started, ignoring');
    }
  };
  
  // Stop the timer
  const stopTimer = () => {
    setEndTime(Date.now());
    setIsRunning(false);
  };
  
  // Update elapsed time every second
  useEffect(() => {
    console.log('Timer effect running with:', { startTime, endTime, isRunning });
    let interval: NodeJS.Timeout | null = null;
    
    if (startTime && !endTime) {
      console.log('Setting up timer interval');
      interval = setInterval(() => {
        const now = Date.now();
        const seconds = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const newTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        console.log('Updating elapsed time:', newTime);
        setElapsedTime(newTime);
      }, 1000);
    } else if (startTime && endTime) {
      // Calculate final time when timer is stopped
      console.log('Timer stopped, calculating final time');
      const seconds = Math.floor((endTime - startTime) / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      setElapsedTime(`${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`);
    }
    
    return () => {
      if (interval) {
        console.log('Clearing timer interval');
        clearInterval(interval);
      }
    };
  }, [startTime, endTime, isRunning]);
  
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
