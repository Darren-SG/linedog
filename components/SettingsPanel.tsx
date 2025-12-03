
import React from 'react';
import { X, Sliders } from './Icons';
import { GameSettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdate: (s: Partial<GameSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onUpdate }) => {
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
          <Sliders className="text-brand-500" />
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Hunger Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-medium text-gray-700">Hunger Rate</label>
              <span className="text-sm text-gray-500 font-mono">{settings.hungerRateMultiplier.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="3.0" 
              step="0.1"
              value={settings.hungerRateMultiplier}
              onChange={(e) => onUpdate({ hungerRateMultiplier: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <p className="text-xs text-gray-400 mt-1">Controls how fast your pet gets hungry. Lower is slower.</p>
          </div>

          {/* Feeding Effectiveness */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-medium text-gray-700">Snack Power</label>
              <span className="text-sm text-gray-500 font-mono">{settings.feedingPowerMultiplier.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1"
              value={settings.feedingPowerMultiplier}
              onChange={(e) => onUpdate({ feedingPowerMultiplier: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
             <p className="text-xs text-gray-400 mt-1">Controls how much stats restore when feeding.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
