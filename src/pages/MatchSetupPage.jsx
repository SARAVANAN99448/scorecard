import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Settings } from 'lucide-react';

function MatchSetupPage() {
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [overs, setOvers] = useState(20);
  const [playersPerTeam, setPlayersPerTeam] = useState(11);
  const [wideRuns, setWideRuns] = useState(1);
  const [noBallRuns, setNoBallRuns] = useState(1);
  const [error, setError] = useState('');

  const handleStartMatch = () => {
    if (!teamA.trim() || !teamB.trim()) {
      setError('Please enter both team names');
      return;
    }
    if (teamA.trim() === teamB.trim()) {
      setError('Team names must be different');
      return;
    }

    const matchSettings = {
      teamA: teamA.trim(),
      teamB: teamB.trim(),
      overs: parseInt(overs),
      playersPerTeam: parseInt(playersPerTeam),
      wideRuns: parseInt(wideRuns),
      noBallRuns: parseInt(noBallRuns),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('matchSettings', JSON.stringify(matchSettings));
    navigate('/toss');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 py-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl md:text-7xl mb-4">🏏</div>
          <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
            Cricket Scorecard
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Configure your match settings
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-green-600 space-y-4">
          
          {/* Teams Section */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-black mb-4">Teams</h2>
            
            {/* Team A */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-black mb-2 uppercase">
                Team A
              </label>
              <input
                type="text"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                placeholder="Enter Team A name"
                className="w-full px-4 py-3 bg-white border-2 border-green-600 text-black placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-600 outline-none transition"
              />
            </div>

            {/* Team B */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-black mb-2 uppercase">
                Team B
              </label>
              <input
                type="text"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                placeholder="Enter Team B name"
                className="w-full px-4 py-3 bg-white border-2 border-green-600 text-black placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-600 outline-none transition"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-green-600 my-4"></div>

          {/* Match Settings Section */}
          <div>
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Match Settings
            </h2>

            {/* Overs */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-black mb-2 uppercase">
                Overs: {overs}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={overs}
                  onChange={(e) => setOvers(e.target.value)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <input
                  type="number"
                  value={overs}
                  onChange={(e) => setOvers(e.target.value)}
                  min="1"
                  max="50"
                  className="w-16 px-2 py-1 bg-white border-2 border-green-600 text-black rounded text-sm"
                />
              </div>
            </div>

            {/* Players Per Team */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-black mb-2 uppercase">
                Players Per Team: {playersPerTeam}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(e.target.value)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <input
                  type="number"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(e.target.value)}
                  min="1"
                  max="15"
                  className="w-16 px-2 py-1 bg-white border-2 border-green-600 text-black rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-green-600 my-4"></div>

          {/* Ball Rules Section */}
          <div>
            <h2 className="text-2xl font-black text-black mb-4">⚾ Ball Rules</h2>

            {/* Wide Ball Runs */}
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-green-600">
              <label className="block text-sm font-bold text-black mb-3 uppercase">
                Wide Ball: {wideRuns} Run{wideRuns !== 1 ? 's' : ''}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWideRuns(0)}
                  className={`flex-1 py-2 rounded-lg font-bold transition border-2 ${
                    wideRuns === 0
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white text-black border-gray-300 hover:border-green-400'
                  }`}
                >
                  0 Runs
                </button>
                <button
                  onClick={() => setWideRuns(1)}
                  className={`flex-1 py-2 rounded-lg font-bold transition border-2 ${
                    wideRuns === 1
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white text-black border-gray-300 hover:border-green-400'
                  }`}
                >
                  1 Run
                </button>
                <button
                  onClick={() => setWideRuns(2)}
                  className={`flex-1 py-2 rounded-lg font-bold transition border-2 ${
                    wideRuns === 2
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white text-black border-gray-300 hover:border-green-400'
                  }`}
                >
                  2 Runs
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                🔍 Extra runs awarded when bowler bowls wide
              </p>
            </div>

            {/* No Ball Runs */}
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-green-600">
              <label className="block text-sm font-bold text-black mb-3 uppercase">
                No Ball: {noBallRuns} Run{noBallRuns !== 1 ? 's' : ''}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNoBallRuns(0)}
                  className={`flex-1 py-2 rounded-lg font-bold transition border-2 ${
                    noBallRuns === 0
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white text-black border-gray-300 hover:border-green-400'
                  }`}
                >
                  0 Runs
                </button>
                <button
                  onClick={() => setNoBallRuns(1)}
                  className={`flex-1 py-2 rounded-lg font-bold transition border-2 ${
                    noBallRuns === 1
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white text-black border-gray-300 hover:border-green-400'
                  }`}
                >
                  1 Run
                </button>
                <button
                  onClick={() => setNoBallRuns(2)}
                  className={`flex-1 py-2 rounded-lg font-bold transition border-2 ${
                    noBallRuns === 2
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white text-black border-gray-300 hover:border-green-400'
                  }`}
                >
                  2 Runs
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                🔍 Extra runs awarded when bowler bowls no ball
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartMatch}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-black hover:bg-green-700 transition transform hover:scale-105 flex items-center justify-center gap-2 text-lg mt-6 border-2 border-green-700"
          >
            <Settings className="w-5 h-5" />
            Continue to Toss
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatchSetupPage;
