import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WelcomePage.css';

// Constants for the welcome page
const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  COSMIC: 'cosmic',
  NEON: 'neon'
};

const ANIMATION_TYPES = {
  BOUNCE: 'bounce',
  FADE: 'fade',
  SPIN: 'spin',
  WAVE: 'wave'
};

const WelcomePage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    theme: THEMES.LIGHT,
    soundEnabled: true,
    animationsEnabled: true,
    username: '',
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highScores, setHighScores] = useState([]);
  const [currentAnimation, setCurrentAnimation] = useState(ANIMATION_TYPES.BOUNCE);
  
  const settingsRef = useRef(null);
  const audioRef = useRef(null);
  
  const floatingEmojis = [
    '🎮', '🎯', '🎪', '🎨', '🎭', '🌟', '✨', '🎪', '🎯',
    '🎲', '🎱', '🎳', '🎯', '🎸', '🎺', '🎻', '🎹', '🎼'
  ];

  // Handle click outside settings modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load high scores from localStorage
  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('highScores');
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      }
    } catch (err) {
      console.error('Error loading high scores:', err);
      setError('Failed to load high scores');
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings]);

  // Handle theme changes
  useEffect(() => {
    document.body.className = `theme-${settings.theme}`;
    return () => {
      document.body.className = '';
    };
  }, [settings.theme]);

  const playSound = useCallback((soundType) => {
    if (!settings.soundEnabled) return;
    
    const sounds = {
      click: '/sounds/click.mp3',
      hover: '/sounds/hover.mp3',
      success: '/sounds/success.mp3'
    };

    if (audioRef.current) {
      audioRef.current.src = sounds[soundType];
      audioRef.current.play().catch(console.error);
    }
  }, [settings.soundEnabled]);

  const handleStartGame = useCallback(() => {
    setIsLoading(true);
    playSound('click');
    
    // Simulate loading game assets
    setTimeout(() => {
      setIsLoading(false);
      navigate('/game', { 
        state: { 
          difficulty: settings.difficulty,
          theme: settings.theme,
          username: settings.username 
        } 
      });
    }, 1000);
  }, [navigate, settings, playSound]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    playSound('click');
  }, [playSound]);

  const toggleAnimation = useCallback(() => {
    const animations = Object.values(ANIMATION_TYPES);
    const currentIndex = animations.indexOf(currentAnimation);
    const nextIndex = (currentIndex + 1) % animations.length;
    setCurrentAnimation(animations[nextIndex]);
    playSound('click');
  }, [currentAnimation, playSound]);

  const renderHighScores = () => (
    <div className="high-scores-modal glass-effect">
      <h2>🏆 High Scores</h2>
      <div className="scores-list">
        {highScores.length > 0 ? (
          highScores.map((score, index) => (
            <div key={index} className="score-item">
              <span className="rank">#{index + 1}</span>
              <span className="username">{score.username}</span>
              <span className="score">{score.score}</span>
            </div>
          ))
        ) : (
          <p>No high scores yet. Be the first!</p>
        )}
      </div>
      <button onClick={() => setShowHighScores(false)}>Close</button>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-modal glass-effect" ref={settingsRef}>
      <h2>⚙️ Settings</h2>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Difficulty:</label>
          <select
            value={settings.difficulty}
            onChange={(e) => updateSetting('difficulty', e.target.value)}
          >
            {Object.values(DIFFICULTY_LEVELS).map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="setting-item">
          <label>Theme:</label>
          <select
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value)}
          >
            {Object.values(THEMES).map(theme => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-item">
          <label>Username:</label>
          <input
            type="text"
            value={settings.username}
            onChange={(e) => updateSetting('username', e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        <div className="setting-item">
          <label>Sound:</label>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
          />
        </div>

        <div className="setting-item">
          <label>Animations:</label>
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
          />
        </div>
      </div>
      <button onClick={() => setShowSettings(false)}>Save & Close</button>
    </div>
  );

  return (
    <div className={`welcome-container ${settings.theme}`}>
      <audio ref={audioRef} />
      
      <div className="floating-emoji-container">
        {settings.animationsEnabled && floatingEmojis.map((emoji, index) => (
          <span
            key={index}
            className={`floating-emoji ${currentAnimation}`}
            style={{
              animationDelay: `${index * 0.5}s`,
              left: `${Math.random() * 100}%`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
      
      <div className="welcome-content glass-effect">
        <h1 className="welcome-title">
          <span className={`emoji-${currentAnimation}`}>🎮</span>
          Guess The Emoji
          <span className={`emoji-${currentAnimation}`}>🎯</span>
        </h1>
        
        <div className="welcome-description">
          <p>Ready to test your emoji knowledge?</p>
          <p>10 challenging questions await you!</p>
          {settings.username && <p>Welcome back, {settings.username}! 👋</p>}
        </div>

        <div className="features-grid">
          <div className="feature-item" onClick={toggleAnimation}>
            <span className="feature-emoji">🎯</span>
            <p>10 Questions</p>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">⏱️</span>
            <p>Quick & Fun</p>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">🏆</span>
            <p>Score Points</p>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">🌟</span>
            <p>Learn Emojis</p>
          </div>
        </div>

        <div className="button-container">
          <button 
            className="start-button"
            onClick={handleStartGame}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Start Game'}
            <span className="button-emoji">🚀</span>
          </button>

          <div className="secondary-buttons">
            <button 
              className="settings-button"
              onClick={() => setShowSettings(true)}
            >
              Settings ⚙️
            </button>
            <button 
              className="highscores-button"
              onClick={() => setShowHighScores(true)}
            >
              High Scores 🏆
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
      </div>

      {showSettings && renderSettings()}
      {showHighScores && renderHighScores()}
    </div>
  );
};

export default WelcomePage;
