import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ArrowLeft, Trash2, AlertCircle, CheckCircle, Trophy } from 'lucide-react';

function AdminPanel() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setError('');
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
      setError('Failed to load matches: ' + error.message);
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

  const deleteSelectedMatches = async () => {
    if (selectedMatches.length === 0) {
      setDeleteMessage('Please select matches to delete');
      return;
    }

    setShowConfirm(false);
    setDeletingIds(selectedMatches);
    setError('');

    const successCount = [];
    const failedCount = [];

    try {
      for (const matchId of selectedMatches) {
        try {
          await deleteDoc(doc(db, 'matches', matchId));
          successCount.push(matchId);
        } catch (err) {
          console.error('Error deleting match:', matchId, err);
          failedCount.push(matchId);
        }
      }

      if (successCount.length > 0) {
        setMatches(matches.filter(m => !successCount.includes(m.id)));
        setSelectedMatches([]);
        setDeleteMessage(`✅ Successfully deleted ${successCount.length} match(es)!`);
      }

      if (failedCount.length > 0) {
        setError(`❌ Failed to delete ${failedCount.length} match(es). Check Firestore Rules.`);
      }

      setDeletingIds([]);
      setTimeout(() => setDeleteMessage(''), 4000);
    } catch (error) {
      console.error('Error deleting matches:', error);
      setError('❌ Error deleting matches: ' + error.message);
      setDeletingIds([]);
      setTimeout(() => setError(''), 4000);
    }
  };

  const deleteSingleMatch = async (matchId) => {
    setDeletingIds([matchId]);
    setError('');
    
    try {
      await deleteDoc(doc(db, 'matches', matchId));
      setMatches(matches.filter(m => m.id !== matchId));
      setDeletingIds([]);
      setDeleteMessage('✅ Match deleted successfully!');
      setTimeout(() => setDeleteMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting match:', error);
      setError(`❌ Error: ${error.message}`);
      setDeletingIds([]);
      setTimeout(() => setError(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 md:p-4 py-4 md:py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <button
            onClick={() => navigate('/history')}
            className="px-3 md:px-4 py-2 md:py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-semibold text-sm md:text-base border-2 border-green-600"
          >
            <ArrowLeft className="w-4 md:w-5 h-4 md:h-5" />
            Back
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-black">⚙️ Admin Panel</h1>
            <p className="text-gray-600 text-xs md:text-sm">Manage and delete matches</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border-2 bg-red-100 border-red-600 text-red-700 text-sm md:text-base font-semibold flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              <p className="text-xs text-red-600 mt-1">
                💡 Check Firebase Rules or console for details
              </p>
            </div>
          </div>
        )}

        {/* Delete Message */}
        {deleteMessage && (
          <div className="mb-4 p-4 rounded-lg border-2 text-sm md:text-base font-semibold flex items-center gap-2 bg-green-100 border-green-600 text-green-700">
            <CheckCircle className="w-5 h-5" />
            {deleteMessage}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm border-2 border-green-600 shadow-2xl">
              <h2 className="text-2xl font-black text-black mb-3">⚠️ Confirm Delete</h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-bold text-red-600">{selectedMatches.length}</span> match(es)? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition border-2 border-green-600"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteSelectedMatches}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 border-2 border-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-green-600">
            <p className="text-gray-600 text-xs font-bold">Total Matches</p>
            <p className="text-2xl md:text-3xl font-black text-black">{matches.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 md:p-4 border-2 border-green-600">
            <p className="text-green-700 text-xs font-bold">Selected</p>
            <p className="text-2xl md:text-3xl font-black text-green-700">{selectedMatches.length}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 md:p-4 border-2 border-red-600">
            <p className="text-red-700 text-xs font-bold">To Delete</p>
            <p className="text-2xl md:text-3xl font-black text-red-700">{selectedMatches.length}</p>
          </div>
        </div>

        {/* Bulk Delete Controls */}
        {selectedMatches.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 border-2 border-red-600 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <p className="text-black font-black text-lg">🗑️ Bulk Delete</p>
                <p className="text-gray-600 text-sm">{selectedMatches.length} match(es) selected</p>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm md:text-base border-2 border-red-700"
              >
                <Trash2 className="w-5 h-5" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border-2 border-green-600">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 text-lg font-semibold">No matches to manage</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition border-2 border-green-700"
            >
              Create New Match
            </button>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {matches.map((match) => {
              const isSelected = selectedMatches.includes(match.id);
              const isDeleting = deletingIds.includes(match.id);
              
              return (
                <div
                  key={match.id}
                  className={`bg-white rounded-lg md:rounded-xl p-3 md:p-4 border-2 transition ${
                    isSelected
                      ? 'border-green-600 bg-green-50'
                      : 'border-green-600 hover:shadow-lg'
                  } ${isDeleting ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectMatch(match.id)}
                      disabled={isDeleting}
                      className="mt-1 w-5 h-5 rounded cursor-pointer accent-green-600"
                    />

                    {/* Match Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                        <h3 className="text-base md:text-lg font-black text-black truncate">
                          {match.teamA} vs {match.teamB}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold border-2 border-green-600 w-fit">
                          {match.matchSettings?.overs || '20'} Overs
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <p className="text-gray-600 text-xs">Innings 1</p>
                          <p className="text-green-700 font-bold text-sm">
                            {match.innings1?.battingTeam}: {match.innings1?.score}/{match.innings1?.wickets}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">Innings 2</p>
                          <p className="text-green-700 font-bold text-sm">
                            {match.innings2?.battingTeam}: {match.innings2?.score}/{match.innings2?.wickets}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-green-700 font-bold text-sm">
                          🏆 {match.winner || 'N/A'}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {match.timestamp ? new Date(match.timestamp).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteSingleMatch(match.id)}
                      disabled={isDeleting}
                      className="flex-shrink-0 p-2 md:p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-600"
                      title="Delete this match"
                    >
                      {isDeleting ? (
                        <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 md:w-5 h-4 md:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
