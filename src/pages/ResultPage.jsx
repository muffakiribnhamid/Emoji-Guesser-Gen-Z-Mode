import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const score = location.state?.score || 0;
  const [showConfetti, setShowConfetti] = useState(false);

  const getResultMessage = () => {
    if (score === 10) return "🏆 Perfect Score! You're an Emoji Master!";
    if (score >= 8) return "🌟 Amazing! You're a true Emoji Pro!";
    if (score >= 6) return "✨ Not bad! You know your emojis pretty well!";
    if (score >= 4) return "💪 Keep practicing! You're getting there!";
    return "🌱 Room for improvement! Try again!";
  };

  const getResultEmoji = () => {
    if (score === 10) return "👑";
    if (score >= 8) return "🌟";
    if (score >= 6) return "🎉";
    if (score >= 4) return "💪";
    return "🌱";
  };

  useEffect(() => {
    if (score >= 8) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [score]);

  const shareScore = () => {
    const text = `🎮 I just scored ${score}/10 on the Emoji Quiz! ${getResultEmoji()}\nCan you beat my score?`;
    if (navigator.share) {
      navigator.share({
        title: 'My Emoji Quiz Score',
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text)
        .then(() => alert('Score copied to clipboard!'))
        .catch(console.error);
    }
  };

  const renderScoreVisual = () => {
    return Array.from({ length: 10 }, (_, i) => (
      <div 
        key={i} 
        className={`score-dot ${i < score ? 'filled' : 'empty'}`}
      >
        {i < score ? '✨' : '⭕'}
      </div>
    ));
  };

  return (
    <div className="result-container">
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="result-card glass-effect">
        <h1 className="result-title">
          <span className="title-emoji">{getResultEmoji()}</span>
          Game Complete!
        </h1>
        
        <div className="score-section">
          <div className="score-display">
            <span className="score-number">{score}</span>
            <span className="score-total">/10</span>
          </div>
          
          <div className="score-visual">
            {renderScoreVisual()}
          </div>
        </div>

        <div className="result-message glass-effect">
          {getResultMessage()}
        </div>

        <div className="stats-grid">
          <div className="stat-item glass-effect">
            <span className="stat-icon">📊</span>
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{(score / 10 * 100).toFixed(0)}%</span>
          </div>
          <div className="stat-item glass-effect">
            <span className="stat-icon">{score >= 6 ? '🎯' : '🎲'}</span>
            <span className="stat-label">Status</span>
            <span className="stat-value">{score >= 6 ? 'Passed' : 'Try Again'}</span>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="play-again-button"
            onClick={() => navigate('/game')}
          >
            Play Again
            <span className="button-emoji">🎮</span>
          </button>
          
          <button 
            className="share-button"
            onClick={shareScore}
          >
            Share Score
            <span className="button-emoji">📤</span>
          </button>

          <button 
            className="home-button"
            onClick={() => navigate('/')}
          >
            Home
            <span className="button-emoji">🏠</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
