import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';

function WicketModal({ isOpen, onClose, onSubmit, battingTeam, bowler, striker, nonStriker }) {
  const [dismissalMode, setDismissalMode] = useState('');
  const [error, setError] = useState('');
  const [selectedBatsman, setSelectedBatsman] = useState('');
  const [fieldersName, setFieldersName] = useState('');
  const [extraRuns, setExtraRuns] = useState(null);

  const handleSubmit = () => {
    if (!dismissalMode) {
      setError('Please select a dismissal mode');
      return;
    }

    if (dismissalMode === 'runout' && !selectedBatsman) {
      setError('Please select which batsman is out');
      return;
    }

    if (dismissalMode === 'runout' && extraRuns === null) {
      setError('Please select extra runs');
      return;
    }

    if ((dismissalMode === 'caught' || dismissalMode === 'runout') && !fieldersName.trim()) {
      setError(dismissalMode === 'caught' ? 'Please enter fielder name' : 'Please enter who helped for the run-out');
      return;
    }

    const details = {
      dismissalMode,
      bowler: bowler || 'N/A',
      fieldersName: fieldersName.trim() || null,
      extraRuns: dismissalMode === 'runout' ? extraRuns : null
    };

    if (dismissalMode === 'runout') {
      details.selectedBatsman = selectedBatsman;
    }

    onSubmit(dismissalMode, details);
    resetForm();
  };

  const resetForm = () => {
    setDismissalMode('');
    setSelectedBatsman('');
    setFieldersName('');
    setExtraRuns(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isRunOutSelected = dismissalMode === 'runout';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Wicket Fallen">
      <div className="space-y-3 md:space-y-6">
        {/* Bowler Info - Auto-filled */}
        <div className="p-3 md:p-4 bg-white rounded-lg md:rounded-xl border-2 border-green-600">
          <p className="text-gray-600 text-xs md:text-sm font-bold mb-1 uppercase">💨 Bowler</p>
          <p className="text-black font-black text-lg md:text-xl truncate">{bowler || 'N/A'}</p>
        </div>

        {/* Dismissal Mode Selection - Dropdown */}
        <div>
          <label className="block text-sm md:text-base font-black text-black mb-3 md:mb-4 uppercase">
            How is the batter out?
          </label>
          
          <select
            value={dismissalMode}
            onChange={(e) => {
              setDismissalMode(e.target.value);
              setSelectedBatsman('');
              setFieldersName('');
              setExtraRuns(null);
              setError('');
            }}
            className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border-2 border-green-600 text-black rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-600 outline-none text-sm md:text-base font-bold cursor-pointer"
          >
            <option value="">-- Select Dismissal Type --</option>
            <option value="bowled">🎳 Bowled</option>
            <option value="lbw">🛡️ LBW</option>
            <option value="caught">🤲 Caught</option>
            <option value="stumped">🚪 Stumped</option>
            <option value="runout">🏃 Run Out</option>
            <option value="timed_out">⏱️ Timed Out</option>
          </select>
        </div>

        {/* Caught: Select Fielder */}
        {dismissalMode === 'caught' && (
          <div className="p-3 md:p-4 bg-white rounded-lg md:rounded-xl border-2 border-green-600">
            <label className="block text-sm md:text-base font-black text-black mb-3 md:mb-4 uppercase">
              🧤 Caught by
            </label>
            
            <input
              type="text"
              value={fieldersName}
              onChange={(e) => setFieldersName(e.target.value)}
              placeholder="Enter fielder name"
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border-2 border-green-600 text-black placeholder-gray-400 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-600 outline-none text-sm md:text-base"
              autoFocus
            />
          </div>
        )}

        {/* Run-Out: Select Which Batsman */}
        {isRunOutSelected && (
          <div className="space-y-3 md:space-y-4">
            {/* Striker and Non-Striker in Flex Row */}
            <div className="p-3 md:p-4 bg-white rounded-lg md:rounded-xl border-2 border-green-600">
              <label className="block text-sm md:text-base font-black text-black mb-3 md:mb-4 uppercase">
                Which batsman is out?
              </label>
              
              <div className="flex flex-row gap-2 md:gap-3">
                {/* Striker Option */}
                <button
                  onClick={() => setSelectedBatsman('striker')}
                  className={`flex-1 p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition ${
                    selectedBatsman === 'striker'
                      ? 'border-green-600 bg-green-100 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
                  }`}
                >
                  <div className="text-xl md:text-2xl mb-1">⚔️</div>
                  <p className="font-bold text-xs md:text-sm">Striker</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">{striker}</p>
                </button>

                {/* Non-Striker Option */}
                <button
                  onClick={() => setSelectedBatsman('nonstriker')}
                  className={`flex-1 p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition ${
                    selectedBatsman === 'nonstriker'
                      ? 'border-green-600 bg-green-100 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
                  }`}
                >
                  <div className="text-xl md:text-2xl mb-1">🤝</div>
                  <p className="font-bold text-xs md:text-sm">Non-Striker</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">{nonStriker}</p>
                </button>
              </div>
            </div>

            {/* Who helped for run-out */}
            <div className="p-3 md:p-4 bg-white rounded-lg md:rounded-xl border-2 border-green-600">
              <label className="block text-sm md:text-base font-black text-black mb-3 md:mb-4 uppercase">
                👥 Who helped for the run-out?
              </label>
              
              <input
                type="text"
                value={fieldersName}
                onChange={(e) => setFieldersName(e.target.value)}
                placeholder="e.g., Wicket Keeper / Fielder Name"
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border-2 border-green-600 text-black placeholder-gray-400 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-600 outline-none text-sm md:text-base"
                autoFocus
              />
            </div>

            {/* Extra Runs Selection */}
            <div className="p-3 md:p-4 bg-white rounded-lg md:rounded-xl border-2 border-green-600">
              <label className="block text-sm md:text-base font-black text-black mb-3 md:mb-4 uppercase">
                Extra Runs on Run-Out
              </label>
              
              <div className="flex flex-row gap-2 md:gap-3">
                {[0, 1, 2, 3].map((run) => (
                  <button
                    key={run}
                    onClick={() => setExtraRuns(run)}
                    className={`flex-1 w-10 h-10 md:w-12 md:h-12 rounded-full font-black text-sm md:text-base transition transform hover:scale-110 flex items-center justify-center border-2 ${
                      extraRuns === run
                        ? 'border-green-600 bg-green-100 text-green-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
                    }`}
                  >
                    {run}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 md:p-4 bg-red-100 border-2 border-red-600 rounded-lg">
            <p className="text-red-700 text-xs md:text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-row gap-2 md:gap-3 pt-3 md:pt-4 border-t-2 border-green-600">
          <button
            onClick={handleClose}
            className="flex-1 bg-white text-black py-2 md:py-3 rounded-lg md:rounded-xl font-bold hover:bg-gray-100 transition text-xs md:text-base border-2 border-green-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition text-xs md:text-base border-2 ${
              dismissalMode
                ? 'bg-green-600 text-white hover:bg-green-700 border-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 border-gray-400'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default WicketModal;
