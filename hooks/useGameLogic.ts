
import { useState, useEffect, useCallback } from 'react';
import { GameState, CONSTANTS, GameSettings } from '../types';
import { loadGame, saveGame } from '../utils/storage';

const CUTE_MESSAGES = [
  "You're the best!",
  "Hehe, that tickles!",
  "I'm so happy!",
  "*Happy wiggles*",
  "I love you!",
  "Yip yip!",
  "Can I have a snack?",
  "*Wagging tail*"
];

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(loadGame);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Persistence effect
  useEffect(() => {
    saveGame(gameState);
  }, [gameState]);

  // Calculation loop (Decay)
  const processTimePassage = useCallback(() => {
    setGameState(prev => {
      if (prev.pet.isDead || !prev.pet.imageSrc) return prev;

      const now = Date.now();
      const timeDiff = now - prev.pet.lastUpdated;
      const minutesPassed = timeDiff / (1000 * 60);

      if (minutesPassed < 0.5) return prev; // Optimization

      // Apply User Settings Multiplier
      const multiplier = prev.settings?.hungerRateMultiplier ?? 1.0;
      const decayAmount = minutesPassed * CONSTANTS.DECAY_RATE_PER_MINUTE * multiplier;
      
      let newFullness = prev.pet.fullness - decayAmount;
      let newSatisfaction = prev.pet.satisfaction - decayAmount;

      // Check for "death"
      if (newFullness <= 0) {
        return {
          ...prev,
          pet: {
            ...prev.pet,
            fullness: 0,
            satisfaction: 0,
            isDead: true,
            lastUpdated: now,
          }
        };
      }

      // Clamp values
      newFullness = Math.max(0, Math.min(CONSTANTS.MAX_STAT, newFullness));
      newSatisfaction = Math.max(0, Math.min(CONSTANTS.MAX_STAT, newSatisfaction));

      return {
        ...prev,
        pet: {
          ...prev.pet,
          fullness: newFullness,
          satisfaction: newSatisfaction,
          lastUpdated: now,
        }
      };
    });
  }, []);

  useEffect(() => {
    processTimePassage(); 
    const interval = setInterval(processTimePassage, 10000); 
    return () => clearInterval(interval);
  }, [processTimePassage]);

  // Actions
  const uploadImage = (imageSrc: string) => {
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        imageSrc,
        isDead: false,
        fullness: 80,
        satisfaction: 80,
        lastUpdated: Date.now()
      }
    }));
  };

  const feedPet = () => {
    if (gameState.pet.isDead) return;
    if (gameState.snacks <= 0) {
      setFeedbackMessage("No snacks left! Use the Focus Timer to earn more.");
      return;
    }

    setGameState(prev => {
      const multiplier = prev.settings?.feedingPowerMultiplier ?? 1.0;
      
      const newFullness = Math.min(CONSTANTS.MAX_STAT, prev.pet.fullness + (CONSTANTS.SNACK_RECOVERY_FULLNESS * multiplier));
      const newSatisfaction = Math.min(CONSTANTS.MAX_STAT, prev.pet.satisfaction + (CONSTANTS.SNACK_RECOVERY_SATISFACTION * multiplier));
      
      const isMaxSatisfaction = newSatisfaction >= CONSTANTS.MAX_STAT && prev.pet.satisfaction < CONSTANTS.MAX_STAT;

      if (isMaxSatisfaction) {
        setFeedbackMessage("I LOVE YOU! ❤️");
      }

      return {
        ...prev,
        snacks: prev.snacks - 1,
        pet: {
          ...prev.pet,
          fullness: newFullness,
          satisfaction: newSatisfaction,
          lastUpdated: Date.now()
        }
      };
    });
  };

  const petCharacter = () => {
    if (gameState.pet.isDead) return;
    
    // Random cute message
    const msg = CUTE_MESSAGES[Math.floor(Math.random() * CUTE_MESSAGES.length)];
    setFeedbackMessage(msg);

    // Small satisfaction boost for petting
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        satisfaction: Math.min(CONSTANTS.MAX_STAT, prev.pet.satisfaction + 2),
      }
    }));
  };

  const addSnacks = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      snacks: prev.snacks + amount
    }));
    setFeedbackMessage(`Earned ${amount} snacks!`);
  };

  const resetPet = () => {
    setGameState(prev => ({
      ...prev,
      pet: {
        ...prev.pet,
        fullness: 50,
        satisfaction: 50,
        isDead: false,
        lastUpdated: Date.now()
      },
      snacks: Math.max(1, prev.snacks) 
    }));
    setFeedbackMessage("Your pet is back!");
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const clearFeedback = () => setFeedbackMessage(null);

  return {
    gameState,
    uploadImage,
    feedPet,
    petCharacter,
    addSnacks,
    resetPet,
    updateSettings,
    feedbackMessage,
    clearFeedback
  };
};
