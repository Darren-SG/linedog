
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Music, Upload, Volume2, VolumeX } from './Icons';
import { saveAudioFile, getAudioFile } from '../utils/storage';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasTrack, setHasTrack] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;

    // Try to load saved audio
    const loadSaved = async () => {
      try {
        const blob = await getAudioFile();
        if (blob && audioRef.current) {
          const url = URL.createObjectURL(blob);
          audioRef.current.src = url;
          setHasTrack(true);
        }
      } catch (e) {
        console.error("Error loading saved audio", e);
      }
    };
    loadSaved();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle Play/Pause
  useEffect(() => {
    if (!audioRef.current || !hasTrack) return;

    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.error("Autoplay prevented:", e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, hasTrack]);

  // Handle Mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && audioRef.current) {
      // Save to IndexedDB
      await saveAudioFile(file);
      
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setHasTrack(true);
      setIsPlaying(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-2 mb-6 text-gray-800">
          <Music className="text-brand-500" />
          <h2 className="text-2xl font-bold">Music Player</h2>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Visualizer Placeholder */}
          <div className="w-full h-32 bg-brand-50 rounded-xl flex items-center justify-center overflow-hidden relative">
            {isPlaying ? (
              <div className="flex gap-1 items-end h-16">
                 {[...Array(8)].map((_, i) => (
                   <div key={i} className="w-2 bg-brand-400 rounded-t-sm animate-bounce" style={{ animationDuration: `${0.5 + Math.random()}s` }}></div>
                 ))}
              </div>
            ) : (
              <Music size={40} className="text-brand-200" />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
             <button 
               onClick={() => setIsMuted(!isMuted)}
               className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
             >
               {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
             </button>

             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               disabled={!hasTrack}
               className="w-16 h-16 flex items-center justify-center bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
             </button>

             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
             >
               <Upload size={24} />
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
               accept="audio/mp3,audio/wav,audio/mpeg" 
               className="hidden" 
             />
          </div>
          
          <p className="text-sm text-gray-400">
            {hasTrack ? (isPlaying ? "Now Playing" : "Paused") : "No track loaded"}
          </p>
        </div>
      </div>
    </div>
  );
};
