import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronLeft } from 'lucide-react';

function MatchSettings() {
  const navigate = useNavigate();
  const [overs, setOvers] = useState(20);
  const [playersPerTeam, setPlayersPerTeam] = useState(11);
  const [venue, setVenue] = useState('');
  const [wideRuns, setWideRuns] = useState(1);
  const [noBallRuns, setNoBallRuns] = useState(1);
  const [matchSettings, setMatchSettings] = useState(null);

  useEffect(() => {
    const tempTossData = JSON.parse(localStorage.getItem('tempTossData'));
    if (tempTossData) {
      setMatchSettings(tempTossData);
    } else {
      navigate('/toss');
    }
  }, [navigate]);

  const handleStartMatch = () => {
    const completeSettings = {
      ...matchSettings,
      overs,
      playersPerTeam,
      venue: venue || 'Not specified',
      wideRuns,
      noBallRuns
    };

    localStorage.setItem('matchSettings', JSON.stringify(completeSettings));
    localStorage.removeItem('tempTossData');
    navigate('/scoring');
  };

  if (!matchSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <p className="text-white text-lg md:text-xl font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col p-3 md:p-4 py-4 md:py-8">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 md:w-8 md:h-8" />
            Match Settings
          </h1>
          <p className="text-slate-400 text-xs md:text-base">Configure your match</p>
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-slate-700 flex-1 flex flex-col">
          {/* Teams Display */}
          <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-blue-900/50 to-green-900/50 rounded-xl md:rounded-2xl border-2 border-slate-600">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3">
              <span className="text-lg md:text-3xl font-black text-blue-400 truncate">{matchSettings.teamA}</span>
              <span className="text-slate-400 font-bold text-sm md:text-base">vs</span>
              <span className="text-lg md:text-3xl font-black text-green-400 truncate">{matchSettings.teamB}</span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-2 md:pr-0 space-y-4 md:space-y-6 mb-4 md:mb-6">
            
            {/* Overs and Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                  Overs
                </label>
                <input
                  type="number"
                  value={overs}
                  onChange={(e) => setOvers(Number(e.target.value))}
                  min="1"
                  max="50"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-700 border-2 border-slate-600 text-white text-sm md:text-base rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                  Players/Team
                </label>
                <input
                  type="number"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
                  min="1"
                  max="15"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-700 border-2 border-slate-600 text-white text-sm md:text-base rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                Venue (Optional)
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue name"
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-700 border-2 border-slate-600 text-white text-sm md:text-base placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Extra Runs Settings */}
            <div className="p-4 md:p-6 bg-slate-700/50 rounded-xl md:rounded-2xl border-2 border-slate-600">
              <h3 className="text-sm md:text-lg font-black text-white mb-4 md:mb-6 uppercase">Extra Runs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    Wide Ball
                  </label>
                  <select
                    value={wideRuns}
                    onChange={(e) => setWideRuns(Number(e.target.value))}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-600 border-2 border-slate-500 text-white text-sm md:text-base rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value={0}>0 runs</option>
                    <option value={1}>1 run</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    No Ball
                  </label>
                  <select
                    value={noBallRuns}
                    onChange={(e) => setNoBallRuns(Number(e.target.value))}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-600 border-2 border-slate-500 text-white text-sm md:text-base rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value={0}>0 runs</option>
                    <option value={1}>1 run</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Toss Info */}
            <div className="p-4 md:p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl md:rounded-2xl border-2 border-purple-600">
              <h3 className="text-sm md:text-lg font-black text-white mb-3 md:mb-4 flex items-center gap-2">
                🪙 Toss Details
              </h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/10 rounded-lg border border-purple-500">
                  <p className="text-purple-300 text-xs md:text-xs font-bold mb-1">WINNER</p>
                  <p className="text-white font-black text-sm md:text-base truncate">{matchSettings.tossWinner}</p>
                </div>
                <div className="p-2 md:p-3 bg-white/10 rounded-lg border border-purple-500">
                  <p className="text-purple-300 text-xs md:text-xs font-bold mb-1">DECISION</p>
                  <p className="text-white font-black text-sm md:text-base">
                    {matchSettings.tossDecision === 'bat' ? 'Bat' : 'Bowl'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={() => navigate('/toss')}
              className="flex-1 bg-slate-700 text-slate-100 py-2 md:py-3 rounded-lg md:rounded-xl font-bold hover:bg-slate-600 transition text-sm md:text-base flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              Back
            </button>
            <button
              onClick={handleStartMatch}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2 md:py-3 rounded-lg md:rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition transform hover:scale-105 text-sm md:text-base"
            >
              Start Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchSettings;
