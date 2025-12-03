
import { GameState, CONSTANTS } from '../types';

const STORAGE_KEY = 'line-puppy-data';
const DB_NAME = 'LinePuppyDB';
const AUDIO_STORE = 'audio';

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
  settings: {
    hungerRateMultiplier: 1.0,
    feedingPowerMultiplier: 1.0,
  }
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
    if (data) {
      const state = JSON.parse(data);
      // Migration: Ensure settings exist for old saves
      if (!state.settings) {
        state.settings = {
          hungerRateMultiplier: 1.0,
          feedingPowerMultiplier: 1.0,
        };
      }
      return state;
    }
    return INITIAL_STATE;
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

// IndexedDB Logic for Large Audio Files
const initAudioDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };
  });
};

export const saveAudioFile = async (file: Blob): Promise<void> => {
  const db = await initAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE);
    store.put(file, 'bgm');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAudioFile = async (): Promise<Blob | undefined> => {
  const db = await initAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readonly');
    const store = tx.objectStore(AUDIO_STORE);
    const request = store.get('bgm');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
