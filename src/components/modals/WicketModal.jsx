import React, { useState } from 'react';
import { X } from 'lucide-react';

function WicketModal({ isOpen, onClose, onSubmit, battingTeam, bowler, striker, nonStriker }) {
  const [dismissalMode, setDismissalMode] = useState('');
  const [fielder, setFielder] = useState('');
  const [selectedBatsman, setSelectedBatsman] = useState('striker');
  const [extraRuns, setExtraRuns] = useState(null);

  const dismissalModes = [
    'bowled',
    'caught',
    'lbw',
    'stumped',
    'runout',
    'hitwicket',
    'retiredout'
  ];

  const dismissalDisplayNames = {
    'bowled': 'Bowled',
    'caught': 'Caught',
    'lbw': 'LBW',
    'stumped': 'Stumped',
    'runout': 'Run Out',
    'hitwicket': 'Hit Wicket',
    'retiredout': 'Retired Out'
  };

  const handleSubmit = () => {
    if (!dismissalMode) {
      alert('Please select a dismissal mode');
      return;
    }

    if ((dismissalMode === 'caught' || dismissalMode === 'stumped') && !fielder) {
      alert('Please enter fielder name');
      return;
    }

    const details = {
      fielder: fielder || null,
      selectedBatsman: dismissalMode === 'runout' ? selectedBatsman : 'striker',
      extraRuns: dismissalMode === 'runout' ? extraRuns : null
    };

    onSubmit(dismissalMode, details);

    // Reset state
    setDismissalMode('');
    setFielder('');
    setSelectedBatsman('striker');
    setExtraRuns(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full border-4 border-green-600 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-black">🚪 Wicket</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dismissal Mode Selection */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Dismissal Mode
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">  {/* Added scrolling */}
            {dismissalModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setDismissalMode(mode)}
                className={`px-3 py-2.5 rounded-lg font-bold transition border-2 text-xs md:text-sm ${
                  dismissalMode === mode
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white text-black border-green-600 hover:bg-green-50'
                }`}
              >
                {dismissalDisplayNames[mode]}
              </button>
            ))}
          </div>
        </div>


        {/* Fielder Input (for Caught and Stumped) */}
        {(dismissalMode === 'caught' || dismissalMode === 'stumped') && (
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fielder Name
            </label>
            <input
              type="text"
              value={fielder}
              onChange={(e) => setFielder(e.target.value)}
              placeholder="Enter fielder name"
              className="w-full px-4 py-3 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {/* Run Out Options */}
        {dismissalMode === 'runout' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Who is Out?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedBatsman('striker')}
                  className={`px-4 py-3 rounded-lg font-bold transition border-2 ${selectedBatsman === 'striker'
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white text-black border-green-600 hover:bg-green-50'
                    }`}
                >
                  {striker}
                </button>
                <button
                  onClick={() => setSelectedBatsman('nonstriker')}
                  className={`px-4 py-3 rounded-lg font-bold transition border-2 ${selectedBatsman === 'nonstriker'
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white text-black border-green-600 hover:bg-green-50'
                    }`}
                >
                  {nonStriker}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Runs Before Run Out (Optional)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((runs) => (
                  <button
                    key={runs}
                    onClick={() => setExtraRuns(runs)}
                    className={`px-4 py-3 rounded-lg font-bold transition border-2 ${extraRuns === runs
                        ? 'bg-green-600 text-white border-green-700'
                        : 'bg-white text-black border-green-600 hover:bg-green-50'
                      }`}
                  >
                    {runs}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full px-6 py-4 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition text-lg border-2 border-red-700"
        >
          Confirm Wicket
        </button>
      </div>
    </div>
  );
}

export default WicketModal;
