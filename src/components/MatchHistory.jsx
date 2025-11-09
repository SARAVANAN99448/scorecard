import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Plus, Trophy, Check, Clock, TrendingUp } from 'lucide-react';


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

  // Format timestamp to readable date and time
  const formatMatchTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    const dateStr = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const timeStr = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `${dateStr} at ${timeStr}`;
  };


  const toggleSelectMatch = (matchId) => {
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };


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
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigate('/series-stats', { 
                      state: { selectedMatchIds: selectedMatches } 
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition text-sm border-2 border-green-700 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  View Stats
                </button>
                <button
                  onClick={() => setSelectedMatches([])}
                  className="px-4 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition text-sm border-2 border-green-600"
                >
                  Clear ({selectedMatches.length})
                </button>
              </div>
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
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border-2 border-green-600">
                              {match.matchSettings.overs} Overs
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span className="font-bold">{formatMatchTime(match.createdAt)}</span>
                            </div>
                          </div>
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


                        <div className="inline-block px-2 py-1 bg-green-100 rounded border-2 border-green-600 text-green-700 text-xs font-bold">
                          <Trophy className="w-3 h-3 inline mr-1" />
                          {match.winner}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Desktop: Full Width Layout */}
        <div className="hidden lg:block">
          {selectedMatches.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-4 border-2 border-green-600 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-green-700">📊 Series Stats</h3>
                  <p className="text-green-700 text-sm font-bold">{selectedMatches.length} matches selected</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigate('/series-stats', { 
                        state: { selectedMatchIds: selectedMatches } 
                      });
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition text-sm border-2 border-green-700 flex items-center gap-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    View Full Stats
                  </button>
                  <button
                    onClick={() => setSelectedMatches([])}
                    className="px-4 py-3 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition text-sm border-2 border-green-600"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

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
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl md:text-2xl font-black text-black">
                              {match.teamA} <span className="text-gray-500 mx-2">vs</span> {match.teamB}
                            </h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border-2 border-green-600">
                              {match.matchSettings.overs} Overs
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg border-2 border-green-600">
                            <Clock className="w-4 h-4 text-green-700" />
                            <span className="font-bold">{formatMatchTime(match.createdAt)}</span>
                          </div>
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


                        <div className="inline-block px-4 py-2 bg-green-100 rounded-lg border-2 border-green-600">
                          <span className="text-green-700 font-bold flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Winner: {match.winner}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default MatchHistory;
