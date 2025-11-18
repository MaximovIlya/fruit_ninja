// hooks/useSound.ts
import { useRef, useCallback } from 'react';
import { slice_sound, bomb_sound } from '../assets';

export const useSound = () => {
  const sliceSoundRef = useRef<HTMLAudioElement | null>(null);
  const bombSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const loadSounds = useCallback(() => {
    try {
      
      sliceSoundRef.current = new Audio(slice_sound);
      bombSoundRef.current = new Audio(bomb_sound);

      
      

      [sliceSoundRef.current, bombSoundRef.current].forEach(audio => {
        audio.preload = 'auto';
        audio.volume = 0.7; // Настройка громкости
      });
      
      
    } catch (error) {
      console.warn('Failed to load sounds:', error);
    }
  }, []);

  const playSliceSound = useCallback(() => {
    console.log('Attempting to play sound...'); // ДЛЯ ОТЛАДКИ
    if (sliceSoundRef.current) {
      console.log('Sound ref exists, playing...'); // ДЛЯ ОТЛАДКИ
      sliceSoundRef.current.currentTime = 0;
      sliceSoundRef.current.play().catch((error) => {
        console.error('Audio play failed:', error);
      });
    } else {
      console.log('No sound ref available'); // ДЛЯ ОТЛАДКИ
    }
  }, []);

  const playBombSound = useCallback(() => {
    if (bombSoundRef.current) {
      bombSoundRef.current.currentTime = 0;
      bombSoundRef.current.play().catch(() => {
        // Игнорируем ошибки автоплей
      });
    }
  }, []);

  return {
    loadSounds,
    playSliceSound,
    playBombSound
  };
};