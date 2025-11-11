import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Trophy, Award } from 'lucide-react';

function SeriesStatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedMatchIds = location.state?.selectedMatchIds || [];
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orange'); // 'orange' or 'purple'

  useEffect(() => {
    if (selectedMatchIds.length === 0) {
      navigate('/history');
      return;
    }
    fetchSelectedMatches();
  }, [selectedMatchIds]);

  const fetchSelectedMatches = async () => {
    try {
      const matchesData = [];
      
      // Fetch each selected match
      for (const matchId of selectedMatchIds) {
        const matchDoc = await getDocs(
          query(collection(db, 'matches'), where('__name__', '==', matchId))
        );
        matchDoc.forEach(doc => {
          matchesData.push({ id: doc.id, ...doc.data() });
        });
      }
      
      setMatches(matchesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  };

  const calculateSeriesStats = () => {
    const playerStats = {};

    matches.forEach(match => {
      Object.entries(match.playerStats || {}).forEach(([playerName, stats]) => {
        // KEY FIX: Use playerName as unique key, not creating duplicates
        if (!playerStats[playerName]) {
          playerStats[playerName] = {
            name: playerName,
            runs: 0,
            wickets: 0,
            ballsFaced: 0,
            ballsBowled: 0,
            fours: 0,
            sixes: 0,
            matchesPlayed: 0,
            team: stats.team
          };
        }
        
        // FIXED: Accumulate stats properly
        playerStats[playerName].runs += stats.runs || 0;
        playerStats[playerName].wickets += stats.wickets || 0;
        playerStats[playerName].ballsFaced += stats.ballsFaced || 0;
        playerStats[playerName].ballsBowled += stats.ballsBowled || 0;
        playerStats[playerName].fours += stats.fours || 0;
        playerStats[playerName].sixes += stats.sixes || 0;
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/history')}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition border-2 border-green-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-black">
              📊 Series Statistics
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              {selectedMatchIds.length} matches selected
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('orange')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition border-2 ${
              activeTab === 'orange'
                ? 'bg-green-600 text-white border-green-700'
                : 'bg-white text-black border-green-600 hover:bg-green-50'
            }`}
          >
            🧡 Orange Cap
          </button>
          <button
            onClick={() => setActiveTab('purple')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition border-2 ${
              activeTab === 'purple'
                ? 'bg-green-600 text-white border-green-700'
                : 'bg-white text-black border-green-600 hover:bg-green-50'
            }`}
          >
            💜 Purple Cap
          </button>
        </div>

        {/* Orange Cap Leaderboard */}
        {activeTab === 'orange' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-green-700 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Top Run Scorers
            </h2>

            {orangeCapList.length > 0 ? (
              orangeCapList.map((player, idx) => (
                <div
                  key={player.name}
                  className={`bg-white rounded-xl p-4 border-2 shadow-lg transition hover:shadow-xl ${
                    idx === 0
                      ? 'border-yellow-500 bg-yellow-50'
                      : idx === 1
                      ? 'border-gray-400 bg-gray-50'
                      : idx === 2
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-green-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl ${
                        idx === 0 ? 'bg-yellow-500 text-white' :
                        idx === 1 ? 'bg-gray-500 text-white' :
                        idx === 2 ? 'bg-orange-600 text-white' :
                        'bg-green-600 text-white'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div>
                        <p className="text-lg md:text-xl font-black text-black">
                          {player.name}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 font-bold">
                          {player.team}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-black text-green-700">
                        {player.runs}
                      </p>
                      <p className="text-xs text-gray-600 font-bold">runs</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t-2 border-green-600">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-bold">Matches</p>
                      <p className="text-lg font-black text-black">{player.matchesPlayed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-bold">Balls</p>
                      <p className="text-lg font-black text-black">{player.ballsFaced || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-bold">4s</p>
                      <p className="text-lg font-black text-orange-600">{player.fours || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-bold">6s</p>
                      <p className="text-lg font-black text-red-600">{player.sixes || 0}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No batting data available</p>
            )}
          </div>
        )}

        {/* Purple Cap Leaderboard */}
        {activeTab === 'purple' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-green-700 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Top Wicket Takers
            </h2>

            {purpleCapList.length > 0 ? (
              purpleCapList.map((player, idx) => (
                <div
                  key={player.name}
                  className={`bg-white rounded-xl p-4 border-2 shadow-lg transition hover:shadow-xl ${
                    idx === 0
                      ? 'border-purple-500 bg-purple-50'
                      : idx === 1
                      ? 'border-gray-400 bg-gray-50'
                      : idx === 2
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-green-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl ${
                        idx === 0 ? 'bg-purple-600 text-white' :
                        idx === 1 ? 'bg-gray-500 text-white' :
                        idx === 2 ? 'bg-orange-600 text-white' :
                        'bg-green-600 text-white'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div>
                        <p className="text-lg md:text-xl font-black text-black">
                          {player.name}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 font-bold">
                          {player.team}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-black text-green-700">
                        {player.wickets}
                      </p>
                      <p className="text-xs text-gray-600 font-bold">wickets</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t-2 border-green-600">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-bold">Matches</p>
                      <p className="text-lg font-black text-black">{player.matchesPlayed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-bold">Balls Bowled</p>
                      <p className="text-lg font-black text-black">{player.ballsBowled || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-bold">Avg</p>
                      <p className="text-lg font-black text-green-600">
                        {player.matchesPlayed > 0 
                          ? (player.wickets / player.matchesPlayed).toFixed(1)
                          : '0.0'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No bowling data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeriesStatsPage;
