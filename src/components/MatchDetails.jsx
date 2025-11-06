import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Trophy } from 'lucide-react';

function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      const matchDoc = await getDoc(doc(db, 'matches', matchId));
      const currentMatch = { id: matchDoc.id, ...matchDoc.data() };
      setMatch(currentMatch);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching match details:', error);
      setLoading(false);
    }
  };

  const calculateStats = (stats) => {
    if (!stats) return { strikeRate: 0, economy: 0 };
    
    const strikeRate = stats.ballsFaced ? ((stats.runs / stats.ballsFaced) * 100).toFixed(2) : 0;
    const economy = stats.ballsBowled ? (stats.runsConceded / (stats.ballsBowled / 6)).toFixed(2) : 0;
    
    return { strikeRate, economy };
  };

  const getBattingByTeam = (team) => {
    const batting = [];
    Object.entries(match.playerStats || {}).forEach(([playerName, stats]) => {
      if (stats.team === team && stats.runs !== undefined && stats.ballsFaced !== undefined) {
        const { strikeRate } = calculateStats(stats);
        batting.push({
          name: playerName,
          team: stats.team,
          runs: stats.runs,
          balls: stats.ballsFaced,
          fours: stats.fours || 0,
          sixes: stats.sixes || 0,
          strikeRate: strikeRate
        });
      }
    });
    return batting.sort((a, b) => b.runs - a.runs);
  };

  const getBowlingByTeam = (team) => {
    const bowling = [];
    Object.entries(match.playerStats || {}).forEach(([playerName, stats]) => {
      if (stats.team === team && stats.wickets !== undefined && stats.ballsBowled !== undefined) {
        const { economy } = calculateStats(stats);
        const overs = Math.floor(stats.ballsBowled / 6);
        const balls = stats.ballsBowled % 6;
        bowling.push({
          name: playerName,
          team: stats.team,
          overs: `${overs}.${balls}`,
          runs: stats.runsConceded || 0,
          wickets: stats.wickets,
          economy: economy
        });
      }
    });
    return bowling.sort((a, b) => b.wickets - a.wickets);
  };

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading match details...</p>
        </div>
      </div>
    );
  }

  const teamABatting = getBattingByTeam(match.teamA);
  const teamABowling = getBowlingByTeam(match.teamA);
  const teamBBatting = getBattingByTeam(match.teamB);
  const teamBBowling = getBowlingByTeam(match.teamB);

  return (
    <div className="min-h-screen bg-white p-2 md:p-4 py-4 md:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/history')}
          className="mb-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-semibold text-sm md:text-base border-2 border-green-600"
        >
          <ArrowLeft className="w-4 md:w-5 h-4 md:h-5" />
          Back
        </button>

        {/* Match Summary */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-6 mb-4 md:mb-6 border-2 border-green-600">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-4xl font-black text-black mb-1 md:mb-2">
              {match.teamA} vs {match.teamB}
            </h1>
            <div className="inline-block px-4 py-2 md:py-3 bg-green-600 rounded-lg md:rounded-xl shadow-lg mt-2 border-2 border-green-700">
              <span className="text-white font-black text-sm md:text-lg flex items-center gap-2">
                <Trophy className="w-4 md:w-6 h-4 md:h-6" />
                Winner: {match.winner}
              </span>
            </div>
            {match.winType && (
              <p className="text-gray-600 text-xs md:text-sm mt-2">
                Won by {match.winMargin} {match.winType}
              </p>
            )}
          </div>

          {/* Innings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 md:p-6 bg-green-50 rounded-xl md:rounded-2xl border-2 border-green-600">
              <h3 className="font-bold text-green-700 mb-2 uppercase text-xs md:text-sm">Innings 1</h3>
              <p className="text-black text-lg md:text-2xl font-black mb-2">
                {match.innings1.battingTeam}
              </p>
              <p className="text-3xl md:text-5xl font-black text-green-700 mb-1 md:mb-2">
                {match.innings1.score}/<span className="text-red-600">{match.innings1.wickets}</span>
              </p>
              <p className="text-gray-600 text-xs md:text-sm">
                <span className="text-green-700 font-bold">{match.innings1.overs}</span>/{match.matchSettings.overs} Overs
              </p>
            </div>

            <div className="p-4 md:p-6 bg-green-50 rounded-xl md:rounded-2xl border-2 border-green-600">
              <h3 className="font-bold text-green-700 mb-2 uppercase text-xs md:text-sm">Innings 2</h3>
              <p className="text-black text-lg md:text-2xl font-black mb-2">
                {match.innings2.battingTeam}
              </p>
              <p className="text-3xl md:text-5xl font-black text-green-700 mb-1 md:mb-2">
                {match.innings2.score}/<span className="text-red-600">{match.innings2.wickets}</span>
              </p>
              <p className="text-gray-600 text-xs md:text-sm">
                <span className="text-green-700 font-bold">{match.innings2.overs}</span>/{match.matchSettings.overs} Overs
              </p>
            </div>
          </div>
        </div>

        {/* Team A Section */}
        <div className="mb-6">
          <div className="bg-white rounded-lg p-2 md:p-3 border-2 border-green-600 mb-3">
            <h2 className="text-lg md:text-xl font-black text-black">{match.teamA}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team A Batting */}
            {teamABatting.length > 0 && (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-6 border-2 border-green-600 overflow-x-auto">
                <h3 className="text-lg md:text-lg font-black text-black mb-4">🏏 Batting</h3>

                <div className="min-w-full">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-1 md:gap-2 text-xs md:text-sm font-bold text-green-700 mb-2 md:mb-3 pb-2 border-b-2 border-green-600">
                    <div className="col-span-4 md:col-span-3">Player</div>
                    <div className="col-span-2 text-right">R</div>
                    <div className="col-span-2 text-right">B</div>
                    <div className="col-span-1 text-right">4s</div>
                    <div className="col-span-1 text-right">6s</div>
                    <div className="col-span-1 md:col-span-2 text-right">S/R</div>
                  </div>

                  {/* Table Rows */}
                  {teamABatting.map((stat, idx) => (
                    <div
                      key={stat.name}
                      className={`grid grid-cols-12 gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-3 rounded-lg text-xs md:text-sm ${
                        idx === 0
                          ? 'bg-green-100 border-2 border-green-600'
                          : 'border-b border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <div className="col-span-4 md:col-span-3">
                        <p className="font-bold text-black truncate">{stat.name}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-sm md:text-base">{stat.runs}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-sm md:text-base">{stat.balls}</p>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="font-bold text-gray-700">{stat.fours}</p>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="font-bold text-gray-700">{stat.sixes}</p>
                      </div>
                      <div className="col-span-1 md:col-span-2 text-right">
                        <p className="font-black text-green-700 text-xs md:text-sm">{stat.strikeRate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team A Bowling */}
            {teamABowling.length > 0 && (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-6 border-2 border-green-600 overflow-x-auto">
                <h3 className="text-lg md:text-lg font-black text-black mb-4">⚡ Bowling</h3>

                <div className="min-w-full">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-1 md:gap-2 text-xs md:text-sm font-bold text-green-700 mb-2 md:mb-3 pb-2 border-b-2 border-green-600">
                    <div className="col-span-4 md:col-span-3">Player</div>
                    <div className="col-span-2 text-right">O</div>
                    <div className="col-span-2 text-right">R</div>
                    <div className="col-span-2 text-right">W</div>
                    <div className="col-span-2 text-right">E/R</div>
                  </div>

                  {/* Table Rows */}
                  {teamABowling.map((stat, idx) => (
                    <div
                      key={stat.name}
                      className={`grid grid-cols-12 gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-3 rounded-lg text-xs md:text-sm ${
                        idx === 0
                          ? 'bg-green-100 border-2 border-green-600'
                          : 'border-b border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <div className="col-span-4 md:col-span-3">
                        <p className="font-bold text-black truncate">{stat.name}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-sm md:text-base">{stat.overs}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-sm md:text-base">{stat.runs}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-red-600 text-sm md:text-base">{stat.wickets}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-xs md:text-sm">{stat.economy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team B Section */}
        <div>
          <div className="bg-white rounded-lg p-2 md:p-3 border-2 border-green-600 mb-3">
            <h2 className="text-lg md:text-xl font-black text-black">{match.teamB}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team B Batting */}
            {teamBBatting.length > 0 && (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-6 border-2 border-green-600 overflow-x-auto">
                <h3 className="text-lg md:text-lg font-black text-black mb-4">🏏 Batting</h3>

                <div className="min-w-full">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-1 md:gap-2 text-xs md:text-sm font-bold text-green-700 mb-2 md:mb-3 pb-2 border-b-2 border-green-600">
                    <div className="col-span-4 md:col-span-3">Player</div>
                    <div className="col-span-2 text-right">R</div>
                    <div className="col-span-2 text-right">B</div>
                    <div className="col-span-1 text-right">4s</div>
                    <div className="col-span-1 text-right">6s</div>
                    <div className="col-span-1 md:col-span-2 text-right">S/R</div>
                  </div>

                  {/* Table Rows */}
                  {teamBBatting.map((stat, idx) => (
                    <div
                      key={stat.name}
                      className={`grid grid-cols-12 gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-3 rounded-lg text-xs md:text-sm ${
                        idx === 0
                          ? 'bg-green-100 border-2 border-green-600'
                          : 'border-b border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <div className="col-span-4 md:col-span-3">
                        <p className="font-bold text-black truncate">{stat.name}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-sm md:text-base">{stat.runs}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-sm md:text-base">{stat.balls}</p>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="font-bold text-gray-700">{stat.fours}</p>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="font-bold text-gray-700">{stat.sixes}</p>
                      </div>
                      <div className="col-span-1 md:col-span-2 text-right">
                        <p className="font-black text-green-700 text-xs md:text-sm">{stat.strikeRate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team B Bowling */}
            {teamBBowling.length > 0 && (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-6 border-2 border-green-600 overflow-x-auto">
                <h3 className="text-lg md:text-lg font-black text-black mb-4">⚡ Bowling</h3>

                <div className="min-w-full">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-1 md:gap-2 text-xs md:text-sm font-bold text-green-700 mb-2 md:mb-3 pb-2 border-b-2 border-green-600">
                    <div className="col-span-4 md:col-span-3">Player</div>
                    <div className="col-span-2 text-right">O</div>
                    <div className="col-span-2 text-right">R</div>
                    <div className="col-span-2 text-right">W</div>
                    <div className="col-span-2 text-right">E/R</div>
                  </div>

                  {/* Table Rows */}
                  {teamBBowling.map((stat, idx) => (
                    <div
                      key={stat.name}
                      className={`grid grid-cols-12 gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-3 rounded-lg text-xs md:text-sm ${
                        idx === 0
                          ? 'bg-green-100 border-2 border-green-600'
                          : 'border-b border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <div className="col-span-4 md:col-span-3">
                        <p className="font-bold text-black truncate">{stat.name}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-sm md:text-base">{stat.overs}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-sm md:text-base">{stat.runs}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-red-600 text-sm md:text-base">{stat.wickets}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-black text-green-700 text-xs md:text-sm">{stat.economy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchDetails;
