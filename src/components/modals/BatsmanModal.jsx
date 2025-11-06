import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { Users, User } from 'lucide-react';

function BatsmanModal({ isOpen, onClose, onSubmit, isOpening = false, isSingleBatsman = false }) {
  const [batsman1, setBatsman1] = useState('');
  const [batsman2, setBatsman2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (isSingleBatsman) {
      // Single batsman mode (after wicket)
      if (!batsman1.trim()) {
        setError('Please enter batsman name');
        return;
      }
      onSubmit(batsman1);
      setBatsman1('');
      setError('');
    } else {
      // Opening batsmen mode
      if (!batsman1.trim() || !batsman2.trim()) {
        setError('Please enter both batsmen names');
        return;
      }

      if (batsman1.trim() === batsman2.trim()) {
        setError('Batsmen names must be different');
        return;
      }

      onSubmit(batsman1, batsman2);
      setBatsman1('');
      setBatsman2('');
      setError('');
    }
  };

  const handleClose = () => {
    setBatsman1('');
    setBatsman2('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSingleBatsman ? "New Batsman" : (isOpening ? "Opening Partnership" : "New Batsmen")}
    >
      <div className="space-y-4">
        {isOpening && !isSingleBatsman && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-semibold">Select your opening batsmen</span>
            </div>
            <p className="text-sm text-blue-600">Choose two players to start the innings</p>
          </div>
        )}

        {isSingleBatsman && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-700 font-semibold">Wicket! Player Out</span>
            </div>
            <p className="text-sm text-yellow-600">Enter the new batsman's name</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isSingleBatsman
              ? 'New Batsman'
              : isOpening
              ? 'Opening Batsman 1 (Striker)'
              : 'New Batsman'}
          </label>
          <input
            type="text"
            value={batsman1}
            onChange={(e) => setBatsman1(e.target.value)}
            placeholder="Enter player name"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {!isSingleBatsman && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {isOpening ? 'Opening Batsman 2 (Non-Striker)' : 'Non-Striker'}
            </label>
            <input
              type="text"
              value={batsman2}
              onChange={(e) => setBatsman2(e.target.value)}
              placeholder="Enter player name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition mt-6"
        >
          Confirm {isSingleBatsman ? 'Batsman' : 'Batsmen'}
        </button>
      </div>
    </Modal>
  );
}

export default BatsmanModal;
