import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Plus, Trophy, Check } from 'lucide-react';

function MatchHistory() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatches, setSelectedMatches] = useState([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const q = query(collection(db, 'matches'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const matchesData = [];
      querySnapshot.forEach((doc) => {
        matchesData.push({ id: doc.id, ...doc.data() });
      });
      
      setMatches(matchesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  };

  const toggleSelectMatch = (matchId) => {
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  const calculateSeriesStats = () => {
    const selectedMatchData = matches.filter(m => selectedMatches.includes(m.id));
    
    if (selectedMatchData.length === 0) {
      return { orangeCapList: [], purpleCapList: [] };
    }

    const playerStats = {};

    selectedMatchData.forEach(match => {
      Object.entries(match.playerStats || {}).forEach(([playerName, stats]) => {
        if (!playerStats[playerName]) {
          playerStats[playerName] = {
            name: playerName,
            runs: 0,
            wickets: 0,
            matchesPlayed: 0,
            team: stats.team
          };
        }
        playerStats[playerName].runs += stats.runs || 0;
        playerStats[playerName].wickets += stats.wickets || 0;
        playerStats[playerName].matchesPlayed += 1;
      });
    });

    const players = Object.values(playerStats);

    const orangeCapList = players
      .filter(p => p.runs > 0)
      .sort((a, b) => b.runs - a.runs);

    const purpleCapList = players
      .filter(p => p.wickets > 0)
      .sort((a, b) => b.wickets - a.wickets);

    return { orangeCapList, purpleCapList };
  };

  const { orangeCapList, purpleCapList } = calculateSeriesStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 md:p-4 py-4 md:py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-black mb-1">
              🏏 Match History
            </h1>
            <p className="text-gray-600 text-xs md:text-base">Relive your cricket moments</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap text-sm md:text-base border-2 border-green-700"
          >
            <Plus className="w-4 md:w-5 h-4 md:h-5" />
            New Match
          </button>
        </div>

        {/* Mobile: Single Column */}
        <div className="lg:hidden">
          {selectedMatches.length > 0 && (
            <div className="space-y-3 mb-4">
              {/* Orange Cap */}
              <div className="bg-white rounded-xl p-3 border-2 border-green-600 shadow-lg">
                <h4 className="text-green-700 font-black mb-2 text-sm flex items-center gap-2">
                  🧡 Orange Cap
                </h4>
                {orangeCapList.length > 0 ? (
                  <div className="space-y-2">
                    {orangeCapList.slice(0, 3).map((player, idx) => (
                      <div key={player.name} className="flex justify-between items-center text-xs p-2 bg-green-50 rounded border border-green-600">
                        <span className="text-black font-bold truncate flex-1">
                          #{idx + 1} {player.name}
                        </span>
                        <span className="text-lg ml-1">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                        </span>
                        <span className="text-green-700 font-black ml-2">{player.runs}R</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs text-center py-2">No data</p>
                )}
              </div>

              {/* Purple Cap */}
              <div className="bg-white rounded-xl p-3 border-2 border-green-600 shadow-lg">
                <h4 className="text-green-700 font-black mb-2 text-sm flex items-center gap-2">
                  💜 Purple Cap
                </h4>
                {purpleCapList.length > 0 ? (
                  <div className="space-y-2">
                    {purpleCapList.slice(0, 3).map((player, idx) => (
                      <div key={player.name} className="flex justify-between items-center text-xs p-2 bg-green-50 rounded border border-green-600">
                        <span className="text-black font-bold truncate flex-1">
                          #{idx + 1} {player.name}
                        </span>
                        <span className="text-lg ml-1">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                        </span>
                        <span className="text-green-700 font-black ml-2">{player.wickets}W</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs text-center py-2">No data</p>
                )}
              </div>

              {/* Clear Button */}
              <button
                onClick={() => setSelectedMatches([])}
                className="w-full px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition text-xs border-2 border-green-600"
              >
                Clear Selection ({selectedMatches.length})
              </button>
            </div>
          )}

          {matches.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-6 text-center border-2 border-green-600">
              <p className="text-gray-700 text-lg md:text-xl mb-4 font-semibold">
                No matches played yet
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition transform hover:scale-105 inline-flex items-center gap-2 text-sm border-2 border-green-700"
              >
                <Plus className="w-4 h-4" />
                Start Your First Match
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const isSelected = selectedMatches.includes(match.id);
                
                return (
                  <div
                    key={match.id}
                    className={`bg-white rounded-xl shadow-lg p-3 cursor-pointer transition transform border-2 ${
                      isSelected 
                        ? 'border-green-600 ring-2 ring-green-400' 
                        : 'border-green-600 hover:shadow-2xl'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleSelectMatch(match.id)}
                        className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition flex-shrink-0 ${
                          isSelected
                            ? 'bg-green-600 border-green-700'
                            : 'border-green-600 hover:border-green-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>

                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => !isSelected && navigate(`/match/${match.id}`)}
                      >
                        <div className="mb-2">
                          <h3 className="text-base font-black text-black truncate">
                            {match.teamA} <span className="text-gray-500 mx-1">vs</span> {match.teamB}
                          </h3>
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border-2 border-green-600 mt-1">
                            {match.matchSettings.overs} Overs
                          </span>
                        </div>

                        <div className="space-y-1 text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-700">
                              {match.innings1.battingTeam}:
                            </span>
                            <span className="text-gray-700 truncate">
                              {match.innings1.score}/{match.innings1.wickets} ({match.innings1.overs})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-700">
                              {match.innings2.battingTeam}:
                            </span>
                            <span className="text-gray-700 truncate">
                              {match.innings2.score}/{match.innings2.wickets} ({match.innings2.overs})
                            </span>
                          </div>
                        </div>

                        <div className="inline-block px-2 py-1 bg-green-100 rounded border-2 border-green-600 text-green-700 text-xs font-bold mb-2">
                          <Trophy className="w-3 h-3 inline mr-1" />
                          {match.winner}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="px-2 py-2 bg-green-50 border-2 border-green-600 rounded text-center">
                            <p className="text-green-700 text-xs font-bold">🧡</p>
                            <p className="text-black text-xs font-bold truncate">{match.orangeCap.name}</p>
                            <p className="text-green-700 text-xs">{match.orangeCap.runs}R</p>
                          </div>
                          <div className="px-2 py-2 bg-green-50 border-2 border-green-600 rounded text-center">
                            <p className="text-green-700 text-xs font-bold">💜</p>
                            <p className="text-black text-xs font-bold truncate">{match.purpleCap.name}</p>
                            <p className="text-green-700 text-xs">{match.purpleCap.wickets}W</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop: Two Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {matches.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-2 border-green-600">
                <p className="text-gray-700 text-2xl mb-6 font-semibold">
                  No matches played yet
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition transform hover:scale-105 inline-flex items-center gap-2 border-2 border-green-700"
                >
                  <Plus className="w-5 h-5" />
                  Start Your First Match
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => {
                  const isSelected = selectedMatches.includes(match.id);
                  
                  return (
                    <div
                      key={match.id}
                      className={`bg-white rounded-2xl shadow-xl p-6 cursor-pointer transition transform border-2 ${
                        isSelected 
                          ? 'border-green-600 ring-2 ring-green-400 hover:scale-102' 
                          : 'border-green-600 hover:shadow-2xl hover:scale-102'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleSelectMatch(match.id)}
                          className={`mt-2 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition flex-shrink-0 ${
                            isSelected
                              ? 'bg-green-600 border-green-700'
                              : 'border-green-600 hover:border-green-700'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </button>

                        <div 
                          className="flex-1"
                          onClick={() => !isSelected && navigate(`/match/${match.id}`)}
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-3">
                            <h3 className="text-xl md:text-2xl font-black text-black">
                              {match.teamA} <span className="text-gray-500 mx-2">vs</span> {match.teamB}
                            </h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border-2 border-green-600">
                              {match.matchSettings.overs} Overs
                            </span>
                          </div>

                          <div className="space-y-2 text-sm md:text-base mb-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-700">
                                {match.innings1.battingTeam}:
                              </span>
                              <span className="text-gray-700">
                                {match.innings1.score}/{match.innings1.wickets} ({match.innings1.overs})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-700">
                                {match.innings2.battingTeam}:
                              </span>
                              <span className="text-gray-700">
                                {match.innings2.score}/{match.innings2.wickets} ({match.innings2.overs})
                              </span>
                            </div>
                          </div>

                          <div className="inline-block px-4 py-2 bg-green-100 rounded-lg border-2 border-green-600 mb-4">
                            <span className="text-green-700 font-bold flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              Winner: {match.winner}
                            </span>
                          </div>

                          <div className="flex flex-row gap-3">
                            <div className="flex-1 px-4 py-3 bg-green-50 border-2 border-green-600 rounded-xl text-center">
                              <p className="text-green-700 text-xs font-bold mb-1">🧡 ORANGE</p>
                              <p className="text-black font-bold text-sm truncate">
                                {match.orangeCap.name}
                              </p>
                              <p className="text-green-700 text-xs font-semibold">{match.orangeCap.runs} runs</p>
                            </div>
                            <div className="flex-1 px-4 py-3 bg-green-50 border-2 border-green-600 rounded-xl text-center">
                              <p className="text-green-700 text-xs font-bold mb-1">💜 PURPLE</p>
                              <p className="text-black font-bold text-sm truncate">
                                {match.purpleCap.name}
                              </p>
                              <p className="text-green-700 text-xs font-semibold">{match.purpleCap.wickets} wickets</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop: Series Stats Right */}
          <div className="lg:col-span-1">
            {selectedMatches.length > 0 ? (
              <div className="sticky top-4 space-y-4">
                <div className="bg-white rounded-2xl shadow-xl p-4 border-2 border-green-600">
                  <h3 className="text-xl font-black text-green-700 mb-2">📊 Series Stats</h3>
                  <p className="text-green-700 text-sm font-bold">{selectedMatches.length} matches selected</p>
                  <button
                    onClick={() => setSelectedMatches([])}
                    className="mt-3 w-full px-3 py-2 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition text-sm border-2 border-green-600"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-4 border-2 border-green-600">
                  <h4 className="text-lg font-black text-green-700 mb-4">🧡 Orange Cap</h4>
                  {orangeCapList.length > 0 ? (
                    <div className="space-y-3">
                      {orangeCapList.map((player, idx) => (
                        <div
                          key={player.name}
                          className={`p-3 rounded-lg transition border-2 ${
                            idx === 0
                              ? 'bg-green-100 border-green-600'
                              : idx === 1
                              ? 'bg-green-50 border-green-600'
                              : 'bg-white border-green-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-black font-black text-sm">
                              #{idx + 1} {player.name}
                            </p>
                            <span className={`text-lg font-black ${
                              idx === 0 ? 'text-yellow-500' : 
                              idx === 1 ? 'text-gray-500' :
                              idx === 2 ? 'text-orange-600' : 'text-green-700'
                            }`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•'}
                            </span>
                          </div>
                          <p className="text-green-700 font-bold text-base">{player.runs} runs</p>
                          <p className="text-green-600 text-xs">In {player.matchesPlayed} matches</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm text-center py-4">No data</p>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-4 border-2 border-green-600">
                  <h4 className="text-lg font-black text-green-700 mb-4">💜 Purple Cap</h4>
                  {purpleCapList.length > 0 ? (
                    <div className="space-y-3">
                      {purpleCapList.map((player, idx) => (
                        <div
                          key={player.name}
                          className={`p-3 rounded-lg transition border-2 ${
                            idx === 0
                              ? 'bg-green-100 border-green-600'
                              : idx === 1
                              ? 'bg-green-50 border-green-600'
                              : 'bg-white border-green-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-black font-black text-sm">
                              #{idx + 1} {player.name}
                            </p>
                            <span className={`text-lg font-black ${
                              idx === 0 ? 'text-purple-600' : 
                              idx === 1 ? 'text-gray-500' :
                              idx === 2 ? 'text-orange-600' : 'text-green-700'
                            }`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•'}
                            </span>
                          </div>
                          <p className="text-green-700 font-bold text-base">{player.wickets} wickets</p>
                          <p className="text-green-600 text-xs">In {player.matchesPlayed} matches</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm text-center py-4">No data</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="sticky top-4 bg-white rounded-2xl shadow-xl p-6 border-2 border-green-600 text-center">
                <p className="text-gray-600 font-semibold">Select matches to see series statistics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchHistory;
