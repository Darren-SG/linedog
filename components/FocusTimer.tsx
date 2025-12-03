import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, RotateCcw } from './Icons';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (minutes: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ isOpen, onClose, onComplete }) => {
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customInput, setCustomInput] = useState("25");
  
  // Use a ref to track the end time for background consistency
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && endTimeRef.current) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((endTimeRef.current! - now) / 1000);
        
        if (diff <= 0) {
          // Timer finished
          setIsActive(false);
          setTimeLeft(0);
          endTimeRef.current = null;
          clearInterval(interval);
          onComplete(duration);
          // Optional vibration
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, duration, onComplete]);

  const toggleTimer = () => {
    if (!isActive) {
      // Start
      const secondsToRun = timeLeft > 0 ? timeLeft : duration * 60;
      endTimeRef.current = Date.now() + secondsToRun * 1000;
      setIsActive(true);
    } else {
      // Pause
      setIsActive(false);
      endTimeRef.current = null; // Clear end time on pause
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    endTimeRef.current = null;
    setTimeLeft(duration * 60);
  };

  const handleDurationChange = (mins: number) => {
    setDuration(mins);
    setCustomInput(mins.toString());
    setIsActive(false);
    setTimeLeft(mins * 60);
    endTimeRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative flex flex-col items-center">
        
        {/* Close Button */}
        {!isActive && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        )}

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Focus Timer</h2>

        {/* Timer Display */}
        <div className="text-7xl font-mono font-bold text-brand-500 mb-8 tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={toggleTimer}
            className={`flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-transform active:scale-95 ${isActive ? 'bg-amber-400' : 'bg-brand-500'}`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-600 shadow hover:bg-gray-200 transition-colors active:scale-95"
          >
            <RotateCcw size={28} />
          </button>
        </div>

        {/* Settings (Only when not running) */}
        {!isActive && (
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-500 mb-2 text-center">Set Duration (mins)</label>
            <div className="flex gap-2 justify-center mb-4">
              {[15, 25, 45].map(mins => (
                <button
                  key={mins}
                  onClick={() => handleDurationChange(mins)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${duration === mins ? 'bg-brand-100 text-brand-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            {/* Custom Input */}
            <div className="flex justify-center items-center gap-2">
               <input 
                 type="number" 
                 min="1" 
                 max="120"
                 value={customInput}
                 onChange={(e) => {
                   setCustomInput(e.target.value);
                   const val = parseInt(e.target.value);
                   if (!isNaN(val) && val > 0) handleDurationChange(val);
                 }}
                 className="w-20 text-center border-b-2 border-gray-200 focus:border-brand-400 outline-none py-1 font-mono text-lg"
               />
               <span className="text-gray-400">min</span>
            </div>
          </div>
        )}

        {isActive && (
          <p className="text-gray-500 text-sm animate-pulse">Focusing... Keep this tab open!</p>
        )}
      </div>
    </div>
  );
};