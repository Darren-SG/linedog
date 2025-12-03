import React, { useState, useRef, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { compressImage } from './utils/storage';
import { ProgressBar } from './components/ProgressBar';
import { FocusTimer } from './components/FocusTimer';
import { CONSTANTS } from './types';
import { Heart, Utensils, Timer, Upload, Trophy, AlertCircle, X } from './components/Icons';

function App() {
  const { 
    gameState, 
    uploadImage, 
    feedPet, 
    addSnacks, 
    resetPet, 
    feedbackMessage, 
    clearFeedback 
  } = useGameLogic();

  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [showLove, setShowLove] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Feedback Messages
  useEffect(() => {
    if (feedbackMessage === "I LOVE YOU! ❤️") {
      setShowLove(true);
      const timer = setTimeout(() => setShowLove(false), 3000);
      return () => clearTimeout(timer);
    } else if (feedbackMessage) {
      const timer = setTimeout(clearFeedback, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage, clearFeedback]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        uploadImage(compressed);
      } catch (err) {
        alert("Error loading image. Please try another one.");
      }
    }
  };

  const handleFocusComplete = (minutes: number) => {
    // Reward calculation: 1 snack per 10 minutes focused, min 1
    const snacksEarned = Math.max(1, Math.floor(minutes / 10));
    addSnacks(snacksEarned);
    setIsTimerOpen(false);
  };

  // --- RENDERING ---

  // 1. No Pet (Onboarding)
  if (!gameState.pet.imageSrc) {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-brand-500 w-10 h-10 animate-bounce-slow" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to {gameState.pet.name}</h1>
          <p className="text-gray-500 mb-8">Upload a photo of your pet to start your focus journey together!</p>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-brand-200"
          >
            <Upload size={20} />
            <span>Upload Photo</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>
    );
  }

  // 2. Pet Dead State
  if (gameState.pet.isDead) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-sm w-full">
          <div className="w-32 h-32 mx-auto mb-6 grayscale opacity-50 relative">
             <img 
               src={gameState.pet.imageSrc} 
               alt="Pet" 
               className="w-full h-full object-cover rounded-full border-4 border-gray-700"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <X size={64} className="text-red-500/80" />
             </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Oh no!</h2>
          <p className="text-gray-300 mb-8">
            {gameState.pet.name} got too hungry and ran away. 
            Remember to check back often!
          </p>
          <button 
            onClick={resetPet}
            className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl active:scale-95 transition-transform"
          >
            Call {gameState.pet.name} Back
          </button>
        </div>
      </div>
    );
  }

  // 3. Main Game Loop
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col relative max-w-md mx-auto shadow-2xl overflow-hidden">
      
      {/* Top Bar: Inventory */}
      <header className="px-6 py-4 flex justify-between items-center z-10">
        <h1 className="font-bold text-gray-700">{gameState.pet.name}</h1>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-brand-100">
          <Utensils size={14} className="text-brand-500" />
          <span className="font-mono font-bold text-gray-800">{gameState.snacks}</span>
        </div>
      </header>

      {/* Main Area: Pet Display */}
      <main className="flex-1 flex flex-col items-center justify-center relative p-6">
        
        {/* Floating Hearts Animation Container */}
        {showLove && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <div className="absolute animate-[ping_1s_ease-out_infinite] opacity-50"><Heart size={100} fill="#f43f5e" className="text-brand-500" /></div>
            <div className="absolute -top-10 -right-10 animate-bounce-slow"><Heart size={40} fill="#f43f5e" className="text-brand-400" /></div>
            <div className="absolute -top-20 left-0 animate-pulse"><Heart size={30} fill="#f43f5e" className="text-brand-300" /></div>
          </div>
        )}

        {/* Pet Image */}
        <div className="relative group w-64 h-64 mb-8">
           <div className="absolute inset-0 bg-brand-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
           <div className={`relative w-full h-full rounded-full border-8 border-white shadow-2xl overflow-hidden transition-transform duration-300 ${showLove ? 'scale-110' : ''}`}>
             <img 
               src={gameState.pet.imageSrc} 
               alt="Pet" 
               className="w-full h-full object-cover"
             />
           </div>
           
           {/* Status Bubble */}
           {gameState.pet.fullness < 30 && (
             <div className="absolute -top-2 -right-2 bg-white px-3 py-1 rounded-xl shadow-lg border border-red-100 flex items-center gap-1 animate-bounce">
               <AlertCircle size={14} className="text-red-500" />
               <span className="text-xs font-bold text-red-500">Hungry!</span>
             </div>
           )}
        </div>

        {/* Stats */}
        <div className="w-full max-w-xs space-y-2 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
          <ProgressBar 
            value={gameState.pet.fullness} 
            max={CONSTANTS.MAX_STAT} 
            colorClass={gameState.pet.fullness < 30 ? "bg-red-500" : "bg-green-500"}
            icon={<Utensils size={16} />}
            label="Fullness"
          />
          <ProgressBar 
            value={gameState.pet.satisfaction} 
            max={CONSTANTS.MAX_STAT} 
            colorClass="bg-brand-400"
            icon={<Heart size={16} />}
            label="Satisfaction"
          />
        </div>
      </main>

      {/* Action Bar */}
      <div className="p-6 pb-8 bg-white rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={feedPet}
            disabled={gameState.snacks === 0}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-brand-50 hover:bg-brand-100 active:bg-brand-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-active:scale-95 transition-transform text-brand-500">
              <Utensils size={24} />
            </div>
            <span className="font-bold text-gray-700">Feed</span>
            <span className="text-xs text-gray-400 mt-0.5">-1 Snack</span>
          </button>

          <button 
            onClick={() => setIsTimerOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors group"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-active:scale-95 transition-transform text-indigo-500">
              <Timer size={24} />
            </div>
            <span className="font-bold text-gray-700">Focus</span>
            <span className="text-xs text-gray-400 mt-0.5">Earn Snacks</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {feedbackMessage && !showLove && (
         <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-4">
           {feedbackMessage}
         </div>
      )}

      {/* Focus Timer Modal */}
      <FocusTimer 
        isOpen={isTimerOpen} 
        onClose={() => setIsTimerOpen(false)} 
        onComplete={handleFocusComplete} 
      />
    </div>
  );
}

export default App;