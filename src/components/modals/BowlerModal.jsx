import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { Wind } from 'lucide-react';

function BowlerModal({ isOpen, onClose, onSubmit, overNumber, isFirstOver = false }) {
  const [bowler, setBowler] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!bowler.trim()) {
      setError('Please enter bowler name');
      return;
    }

    onSubmit(bowler);
    setBowler('');
    setError('');
  };

  const handleClose = () => {
    setBowler('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isFirstOver ? "Opening Bowler" : `New Bowler - Over ${overNumber + 1}`}>
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-semibold">
              {isFirstOver ? 'Select Opening Bowler' : 'Bowling Change'}
            </span>
          </div>
          <p className="text-sm text-green-600">
            {isFirstOver 
              ? 'Enter the name of the bowler who will bowl the first over' 
              : 'Previous over is complete. Select the next bowler'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bowler Name
          </label>
          <input
            type="text"
            value={bowler}
            onChange={(e) => setBowler(e.target.value)}
            placeholder="Enter bowler name"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            autoFocus
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition mt-6"
        >
          Confirm Bowler
        </button>
      </div>
    </Modal>
  );
}

export default BowlerModal;
