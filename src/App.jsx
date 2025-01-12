import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import WelcomePage from './pages/WelcomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import './App.css';

function App() {
  useEffect(() => {
    // Create animated stars
    const createStars = () => {
      const starsContainer = document.createElement('div');
      starsContainer.className = 'stars';
      document.body.appendChild(starsContainer);

      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${Math.random() * 3 + 1}s`);
        star.style.setProperty('--opacity', `${Math.random() * 0.7 + 0.3}`);
        starsContainer.appendChild(star);
      }
    };

    createStars();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
