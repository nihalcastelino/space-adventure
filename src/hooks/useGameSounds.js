import { useRef, useEffect } from 'react';

// Sound generator using Web Audio API
class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.3; // 30% volume
    this.enabled = true;
  }

  init() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Handle audio context errors
        this.audioContext.addEventListener('statechange', () => {
          if (this.audioContext.state === 'interrupted' || this.audioContext.state === 'closed') {
            console.warn('AudioContext interrupted or closed, disabling sounds');
            this.enabled = false;
          }
        });
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
        this.enabled = false;
        this.audioContext = null;
      }
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    try {
      // Check if context is in a valid state
      if (this.audioContext.state === 'closed' || this.audioContext.state === 'interrupted') {
        console.warn('AudioContext not available, disabling sounds');
        this.enabled = false;
        return;
      }

      // Resume if suspended (but don't wait - sounds will play once resumed)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(err => {
          console.warn('Failed to resume AudioContext:', err);
          this.enabled = false;
        });
        // Continue anyway - the sound will play once context resumes
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      // Handle oscillator errors
      oscillator.onerror = (e) => {
        console.warn('Oscillator error:', e);
      };
    } catch (e) {
      console.warn('Error playing sound:', e);
      // If context is broken, disable sounds
      if (e.name === 'InvalidStateError' || e.name === 'NotSupportedError') {
        this.enabled = false;
      }
    }
  }

  playSequence(notes, duration = 100) {
    if (!this.enabled || !this.audioContext) return;
    
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note.frequency, note.duration || 0.1, note.type || 'sine', note.volume || 0.3);
      }, index * duration);
    });
  }

  // Dice roll sound - rapid clicks
  playDiceRoll() {
    if (!this.enabled || !this.audioContext) return;
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.playTone(200 + Math.random() * 100, 0.05, 'square', 0.2);
      }, i * 50);
    }
  }

  // Spaceport warp - ascending whoosh
  playSpaceport() {
    if (!this.enabled || !this.audioContext) return;
    
    const frequencies = [200, 300, 400, 500, 600, 700, 800];
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', 0.4);
      }, i * 30);
    });
    // Add a whoosh effect
    setTimeout(() => {
      this.playTone(800, 0.3, 'sawtooth', 0.3);
    }, 200);
  }

  // Alien encounter - ominous low tone
  playAlien() {
    if (!this.enabled || !this.audioContext) return;
    
    // Low ominous tone
    this.playTone(80, 0.4, 'sawtooth', 0.5);
    // Scary pulse
    setTimeout(() => {
      this.playTone(100, 0.2, 'square', 0.4);
    }, 200);
    setTimeout(() => {
      this.playTone(120, 0.2, 'square', 0.4);
    }, 400);
  }

  // Checkpoint reached - pleasant chime
  playCheckpoint() {
    if (!this.enabled || !this.audioContext) return;
    
    const notes = [
      { frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.3 }, // C5
      { frequency: 659.25, duration: 0.1, type: 'sine', volume: 0.3 }, // E5
      { frequency: 783.99, duration: 0.2, type: 'sine', volume: 0.3 }  // G5
    ];
    this.playSequence(notes, 80);
  }

  // Victory fanfare
  playVictory() {
    if (!this.enabled || !this.audioContext) return;
    
    const fanfare = [
      { frequency: 523.25, duration: 0.15, type: 'sine', volume: 0.4 }, // C5
      { frequency: 659.25, duration: 0.15, type: 'sine', volume: 0.4 }, // E5
      { frequency: 783.99, duration: 0.15, type: 'sine', volume: 0.4 }, // G5
      { frequency: 1046.50, duration: 0.3, type: 'sine', volume: 0.5 }  // C6
    ];
    this.playSequence(fanfare, 100);
    
    // Add celebration
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.playTone(800 + Math.random() * 400, 0.1, 'sine', 0.3);
        }, i * 50);
      }
    }, 600);
  }

  // Rocket movement - whoosh
  playRocketMove() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(300, 0.2, 'sawtooth', 0.2);
    setTimeout(() => {
      this.playTone(400, 0.2, 'sawtooth', 0.2);
    }, 100);
  }

  // Turn change - subtle beep
  playTurnChange() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(440, 0.1, 'sine', 0.2);
  }

  // Button click
  playClick() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(800, 0.05, 'square', 0.15);
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

export function useGameSounds() {
  const soundGenRef = useRef(null);

  useEffect(() => {
    soundGenRef.current = new SoundGenerator();
    soundGenRef.current.init();

    // Resume audio context on user interaction (browser autoplay policy)
    const resumeAudio = () => {
      if (soundGenRef.current?.audioContext?.state === 'suspended') {
        soundGenRef.current.audioContext.resume().catch(err => {
          console.warn('Failed to resume AudioContext on user interaction:', err);
          // Don't disable sounds on resume failure - user might need to interact again
        });
      }
    };

    document.addEventListener('click', resumeAudio, { once: true });
    document.addEventListener('touchstart', resumeAudio, { once: true });

    return () => {
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

  const playSound = (soundType) => {
    if (!soundGenRef.current) return;

    // Resume context if suspended (with error handling)
    if (soundGenRef.current.audioContext?.state === 'suspended') {
      soundGenRef.current.audioContext.resume().catch(err => {
        console.warn('Failed to resume AudioContext:', err);
        // Disable sounds if resume fails
        soundGenRef.current.setEnabled(false);
        return;
      });
    }

    // Check if context is in a bad state
    if (soundGenRef.current.audioContext?.state === 'closed' || 
        soundGenRef.current.audioContext?.state === 'interrupted') {
      console.warn('AudioContext unavailable, skipping sound');
      return;
    }

    switch (soundType) {
      case 'dice':
        soundGenRef.current.playDiceRoll();
        break;
      case 'spaceport':
        soundGenRef.current.playSpaceport();
        break;
      case 'alien':
        soundGenRef.current.playAlien();
        break;
      case 'checkpoint':
        soundGenRef.current.playCheckpoint();
        break;
      case 'victory':
        soundGenRef.current.playVictory();
        break;
      case 'rocket':
        soundGenRef.current.playRocketMove();
        break;
      case 'turn':
        soundGenRef.current.playTurnChange();
        break;
      case 'click':
        soundGenRef.current.playClick();
        break;
      default:
        break;
    }
  };

  const setVolume = (volume) => {
    if (soundGenRef.current) {
      soundGenRef.current.setVolume(volume);
    }
  };

  const setEnabled = (enabled) => {
    if (soundGenRef.current) {
      soundGenRef.current.setEnabled(enabled);
    }
  };

  return {
    playSound,
    setVolume,
    setEnabled
  };
}

