import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GamePage.css';

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 15;

const allQuestions = [
  {
    emoji: '🥺',
    question: "What's this emoji's vibe?",
    options: ['Pleading face', 'Sad face', 'Puppy eyes', 'Crying face'],
    correct: 'Pleading face'
  },
  {
    emoji: '💀',
    question: "What does Gen Z mainly use this emoji for?",
    options: ['Death', 'I\'m dead (from laughter)', 'Spooky', 'Danger'],
    correct: 'I\'m dead (from laughter)'
  },
  {
    emoji: '✨',
    question: "What's the sparkles emoji commonly used for?",
    options: ['Magic', 'Aesthetic vibes', 'Stars', 'Glitter'],
    correct: 'Aesthetic vibes'
  },
  {
    emoji: '👁️👄👁️',
    question: "What does this emoji combination express?",
    options: ['Shock', 'Awkwardness', 'Confusion', 'Creepy stare'],
    correct: 'Awkwardness'
  },
  {
    emoji: '🤌',
    question: "What's this emoji typically used for?",
    options: ['Italian gesture', 'Chef\'s kiss', 'Perfection', 'All of the above'],
    correct: 'All of the above'
  },
  {
    emoji: '😭',
    question: "In Gen Z context, this emoji often means?",
    options: ['Sobbing', 'Extremely funny', 'Overwhelming emotion', 'All of these'],
    correct: 'All of these'
  },
  {
    emoji: '💅',
    question: "What attitude does this emoji represent?",
    options: ['Getting nails done', 'Self-care', 'Unbothered confidence', 'Sass'],
    correct: 'Unbothered confidence'
  },
  {
    emoji: '🗿',
    question: "What's this emoji's meme usage?",
    options: ['Ancient history', 'Bruh moment', 'Easter Island', 'Stone face'],
    correct: 'Bruh moment'
  },
  {
    emoji: '👀',
    question: "What does this emoji typically suggest?",
    options: ['Looking', 'Drama alert', 'Suspicious', 'Tea spilling'],
    correct: 'Tea spilling'
  },
  {
    emoji: '🤡',
    question: "In modern usage, this emoji represents?",
    options: ['Circus clown', 'Self-deprecating humor', 'Foolish behavior', 'Making fun of someone'],
    correct: 'Self-deprecating humor'
  },
  {
    emoji: '🤪',
    question: "This emoji is often used to express?",
    options: ['Silliness', 'Sarcasm', 'Crazy fun', 'All of these'],
    correct: 'All of these'
  },
  {
    emoji: '💁‍♀️',
    question: "What's the common usage of this emoji?",
    options: ['Information desk', 'Sassy response', 'Hair flip', 'Attitude'],
    correct: 'Sassy response'
  },
  {
    emoji: '🥴',
    question: "This emoji typically represents?",
    options: ['Drunk', 'Confused', 'Woozy', 'All of these'],
    correct: 'All of these'
  },
  {
    emoji: '👉👈',
    question: "What does this emoji combination suggest?",
    options: ['Shyness', 'Flirting', 'Nervousness', 'Asking for something'],
    correct: 'Shyness'
  },
  {
    emoji: '🧢',
    question: "In slang, this emoji means?",
    options: ['Hat', 'Cap (lying)', 'Fashion', 'Sports'],
    correct: 'Cap (lying)'
  },
  {
    emoji: '😌',
    question: "This emoji often expresses?",
    options: ['Relief', 'Inner peace', 'Smugness', 'Satisfaction'],
    correct: 'Smugness'
  },
  {
    emoji: '✍️',
    question: "What's the modern usage of this emoji?",
    options: ['Writing', 'Taking notes', 'Paying attention', 'Judging'],
    correct: 'Taking notes'
  },
  {
    emoji: '🤓',
    question: "This emoji is often used to indicate?",
    options: ['Intelligence', 'Nerd behavior', 'Studying', 'Actually knowing'],
    correct: 'Actually knowing'
  },
  {
    emoji: '😤',
    question: "Despite its angry appearance, this emoji often means?",
    options: ['Frustration', 'Determination', 'Pride', 'Triumph'],
    correct: 'Determination'
  },
  {
    emoji: '💯',
    question: "In modern context, this emoji represents?",
    options: ['Perfect score', 'Facts', 'Agreement', 'All of these'],
    correct: 'All of these'
  },
  {
    emoji: '🥱',
    question: "Besides tiredness, this emoji can indicate?",
    options: ['Boredom', 'Unimpressed', 'Dismissive', 'All of these'],
    correct: 'All of these'
  },
  {
    emoji: '🌚',
    question: "What's the meme usage of this emoji?",
    options: ['Night time', 'Creepy jokes', 'Suspicious behavior', 'Dark humor'],
    correct: 'Dark humor'
  },
  {
    emoji: '😈',
    question: "In casual conversation, this emoji suggests?",
    options: ['Evil', 'Mischief', 'Flirting', 'Playful trouble'],
    correct: 'Playful trouble'
  },
  {
    emoji: '🤷‍♀️',
    question: "This emoji is commonly used to express?",
    options: ['Confusion', 'Indifference', 'Not my problem', 'All of these'],
    correct: 'All of these'
  },
  {
    emoji: '🙃',
    question: "This upside-down smile typically indicates?",
    options: ['Happiness', 'Passive aggression', 'Sarcasm', 'Internal screaming'],
    correct: 'Internal screaming'
  }
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const GamePage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Randomly select and shuffle questions at component mount
  const questions = useMemo(() => {
    const shuffled = shuffleArray(allQuestions);
    return shuffled.slice(0, TOTAL_QUESTIONS);
  }, []);

  useEffect(() => {
    if (!isAnswered && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    if (timeLeft === 0 && !isAnswered) {
      handleAnswer(null);
    }
  }, [timeLeft, isAnswered]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowFeedback(true);

    const isCorrect = answer === questions[currentQuestion].correct;
    
    if (isCorrect) {
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(TIME_PER_QUESTION);
        setIsAnswered(false);
      } else {
        navigate('/result', { 
          state: { 
            score: score + (isCorrect ? 1 : 0),
            bestStreak,
            totalQuestions: TOTAL_QUESTIONS
          } 
        });
      }
    }, 1500);
  };

  const getButtonClass = (option) => {
    if (!showFeedback) return '';
    if (option === questions[currentQuestion].correct) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return 'disabled';
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="game-info">
          <span className="question-counter">Question {currentQuestion + 1}/{TOTAL_QUESTIONS}</span>
          <span className="streak-counter">🔥 Streak: {streak}</span>
          <span className="timer">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="question-container glass-effect">
        <div className="emoji-display">{questions[currentQuestion].emoji}</div>
        <h2 className="question-text">{questions[currentQuestion].question}</h2>
      </div>

      <div className="options-grid">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${getButtonClass(option)}`}
            onClick={() => !isAnswered && handleAnswer(option)}
            disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className={`feedback-message ${selectedAnswer === questions[currentQuestion].correct ? 'correct' : 'incorrect'}`}>
          {selectedAnswer === questions[currentQuestion].correct ? (
            <span className="correct-message">
              🎉 Correct! {streak > 1 ? `${streak} in a row! 🔥` : ''}
            </span>
          ) : (
            <span className="incorrect-message">
              😅 Oops! The correct answer was: {questions[currentQuestion].correct}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default GamePage;
