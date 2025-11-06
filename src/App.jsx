import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import TossPage from './components/TossPage';
import ScoringPage from './components/ScoringPage';
import MatchHistory from './components/MatchHistory';
import MatchDetails from './components/MatchDetails';
import LiveScorecard from './pages/LiveScorecard'
import AdminPanel from './pages/AdminPanel';
import MatchSetupPage from './pages/MatchSetupPage';
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<MatchSetupPage />} />
          <Route path="/toss" element={<TossPage />} />
          <Route path="/scoring" element={<ScoringPage />} />
          <Route path="/history" element={<MatchHistory />} />
          <Route path="/scorecard" element={<LiveScorecard />} />
          <Route path="/match/:matchId" element={<MatchDetails />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
