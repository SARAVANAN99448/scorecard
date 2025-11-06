import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function LiveScorecard() {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState({});
  const [matchSettings, setMatchSettings] = useState(null);

  // Load data from localStorage every second
  useEffect(() => {
    const interval = setInterval(() => {
      const savedState = localStorage.getItem('currentMatchState');
      const settings = localStorage.getItem('matchSettings');

      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setPlayerStats(state.playerStats || {});
        } catch (error) {
          console.error('Error loading state:', error);
        }
      }

      if (settings) {
        try {
          setMatchSettings(JSON.parse(settings));
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateStrikeRate = (runs, balls) => {
    if (balls === 0) return 0;
    return ((runs / balls) * 100).toFixed(2);
  };

  const calculateEconomy = (runs, balls) => {
    if (balls === 0) return 0;
    const overs = balls / 6;
    return (runs / overs).toFixed(2);
  };

  const getPlayersByTeam = (team) => {
    return Object.entries(playerStats).filter(([_, stats]) => stats.team === team);
  };

  const getBattersByTeam = (team) => {
    return getPlayersByTeam(team)
      .filter(([_, stats]) => stats.ballsFaced && stats.ballsFaced > 0)
      .sort((a, b) => (b[1].runs || 0) - (a[1].runs || 0));
  };

  const getBowlersByTeam = (team) => {
    return getPlayersByTeam(team)
      .filter(([_, stats]) => stats.ballsBowled && stats.ballsBowled > 0)
      .sort((a, b) => (b[1].wickets || 0) - (a[1].wickets || 0));
  };

  const teamA = matchSettings?.teamA || 'Team A';
  const teamB = matchSettings?.teamB || 'Team B';

  return (
    <div className="min-h-screen bg-white p-2 md:p-4 py-4 md:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <button
            onClick={() => navigate('/scoring')}
            className="px-3 md:px-4 py-2 md:py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-semibold text-sm md:text-base border-2 border-green-600"
          >
            <ArrowLeft className="w-4 md:w-5 h-4 md:h-5" />
            Back
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-black">📊 Live Scorecard</h1>
            <p className="text-gray-600 text-xs md:text-sm">
              {teamA} vs {teamB}
            </p>
          </div>
        </div>

        {/* Team A Section */}
        <div className="mb-6">
          <div className="bg-white rounded-lg p-2 md:p-3 border-2 border-green-600 mb-3">
            <h2 className="text-lg md:text-xl font-black text-black">{teamA}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Team A Batting */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border-2 border-green-600">
              <h3 className="text-base md:text-lg font-black text-black mb-4">🏏 Batting</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b-2 border-green-600">
                      <th className="text-left py-2 px-2 text-green-700 font-bold">Player</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">R</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">B</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">4s</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">6s</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">S/R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBattersByTeam(teamA).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-600">
                          No batsmen
                        </td>
                      </tr>
                    ) : (
                      getBattersByTeam(teamA).map(([playerName, stats]) => (
                        <tr key={playerName} className="border-b border-green-200 hover:bg-green-50">
                          <td className="py-2 px-2 text-black font-bold truncate">{playerName}</td>
                          <td className="text-right py-2 px-2 text-green-700 font-black">{stats.runs || 0}</td>
                          <td className="text-right py-2 px-2 text-green-700 font-bold">{stats.ballsFaced || 0}</td>
                          <td className="text-right py-2 px-2 text-gray-700">{stats.fours || 0}</td>
                          <td className="text-right py-2 px-2 text-gray-700">{stats.sixes || 0}</td>
                          <td className="text-right py-2 px-2 text-green-700 font-bold">
                            {calculateStrikeRate(stats.runs || 0, stats.ballsFaced || 0)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team A Bowling */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border-2 border-green-600">
              <h3 className="text-base md:text-lg font-black text-black mb-4">⚡ Bowling</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b-2 border-green-600">
                      <th className="text-left py-2 px-2 text-green-700 font-bold">Player</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">O</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">R</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">W</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBowlersByTeam(teamA).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-600">
                          No bowlers
                        </td>
                      </tr>
                    ) : (
                      getBowlersByTeam(teamA).map(([playerName, stats]) => {
                        const overs = Math.floor((stats.ballsBowled || 0) / 6);
                        const balls = (stats.ballsBowled || 0) % 6;
                        const economy = calculateEconomy(stats.runsConceded || 0, stats.ballsBowled || 0);

                        return (
                          <tr key={playerName} className="border-b border-green-200 hover:bg-green-50">
                            <td className="py-2 px-2 text-black font-bold truncate">{playerName}</td>
                            <td className="text-right py-2 px-2 text-green-700 font-bold">{overs}.{balls}</td>
                            <td className="text-right py-2 px-2 text-green-700 font-bold">{stats.runsConceded || 0}</td>
                            <td className="text-right py-2 px-2 text-red-600 font-black">{stats.wickets || 0}</td>
                            <td className="text-right py-2 px-2 text-green-700 font-bold">{economy}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Team B Section */}
        <div>
          <div className="bg-white rounded-lg p-2 md:p-3 border-2 border-green-600 mb-3">
            <h2 className="text-lg md:text-xl font-black text-black">{teamB}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team B Batting */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border-2 border-green-600">
              <h3 className="text-base md:text-lg font-black text-black mb-4">🏏 Batting</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b-2 border-green-600">
                      <th className="text-left py-2 px-2 text-green-700 font-bold">Player</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">R</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">B</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">4s</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">6s</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">S/R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBattersByTeam(teamB).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-600">
                          No batsmen
                        </td>
                      </tr>
                    ) : (
                      getBattersByTeam(teamB).map(([playerName, stats]) => (
                        <tr key={playerName} className="border-b border-green-200 hover:bg-green-50">
                          <td className="py-2 px-2 text-black font-bold truncate">{playerName}</td>
                          <td className="text-right py-2 px-2 text-green-700 font-black">{stats.runs || 0}</td>
                          <td className="text-right py-2 px-2 text-green-700 font-bold">{stats.ballsFaced || 0}</td>
                          <td className="text-right py-2 px-2 text-gray-700">{stats.fours || 0}</td>
                          <td className="text-right py-2 px-2 text-gray-700">{stats.sixes || 0}</td>
                          <td className="text-right py-2 px-2 text-green-700 font-bold">
                            {calculateStrikeRate(stats.runs || 0, stats.ballsFaced || 0)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team B Bowling */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border-2 border-green-600">
              <h3 className="text-base md:text-lg font-black text-black mb-4">⚡ Bowling</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b-2 border-green-600">
                      <th className="text-left py-2 px-2 text-green-700 font-bold">Player</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">O</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">R</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">W</th>
                      <th className="text-right py-2 px-2 text-green-700 font-bold">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBowlersByTeam(teamB).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-600">
                          No bowlers
                        </td>
                      </tr>
                    ) : (
                      getBowlersByTeam(teamB).map(([playerName, stats]) => {
                        const overs = Math.floor((stats.ballsBowled || 0) / 6);
                        const balls = (stats.ballsBowled || 0) % 6;
                        const economy = calculateEconomy(stats.runsConceded || 0, stats.ballsBowled || 0);

                        return (
                          <tr key={playerName} className="border-b border-green-200 hover:bg-green-50">
                            <td className="py-2 px-2 text-black font-bold truncate">{playerName}</td>
                            <td className="text-right py-2 px-2 text-green-700 font-bold">{overs}.{balls}</td>
                            <td className="text-right py-2 px-2 text-green-700 font-bold">{stats.runsConceded || 0}</td>
                            <td className="text-right py-2 px-2 text-red-600 font-black">{stats.wickets || 0}</td>
                            <td className="text-right py-2 px-2 text-green-700 font-bold">{economy}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveScorecard;
