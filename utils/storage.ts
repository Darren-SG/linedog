import { GameState, CONSTANTS } from '../types';

const STORAGE_KEY = 'line-puppy-data';

export const INITIAL_STATE: GameState = {
  pet: {
    name: CONSTANTS.DEFAULT_PET_NAME,
    imageSrc: null,
    fullness: 80,
    satisfaction: 80,
    lastUpdated: Date.now(),
    isDead: false,
  },
  snacks: 2, // Start with a couple of free snacks
};

export const saveGame = (state: GameState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save game state:", e);
    // Likely quota exceeded if image is too big
  }
};

export const loadGame = (): GameState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_STATE;
  } catch (e) {
    console.error("Failed to load game state:", e);
    return INITIAL_STATE;
  }
};

// Helper to resize image to prevent localStorage quota issues
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};