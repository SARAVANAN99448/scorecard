import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';

function ExtraRunsModal({ isOpen, onClose, onSubmit, wideRuns, noBallRuns }) {
  const [selectedExtra, setSelectedExtra] = useState('');

  const handleSubmit = () => {
    if (selectedExtra) {
      onSubmit(selectedExtra);
      setSelectedExtra('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedExtra('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Select Extra Type">
      <div className="space-y-4">
        {/* Extra Type Selection */}
        <div>
          <label className="block text-sm md:text-base font-black text-black mb-3 md:mb-4 uppercase">
            What extra?
          </label>
          
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {/* Wide Button */}
            <button
              onClick={() => setSelectedExtra('wide')}
              className={`p-4 md:p-6 rounded-lg md:rounded-xl border-2 transition transform active:scale-95 ${
                selectedExtra === 'wide'
                  ? 'border-green-600 bg-green-100 text-green-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
              }`}
            >
              <div className="text-3xl md:text-4xl mb-2">📍</div>
              <p className="font-bold text-sm md:text-base">Wide</p>
              <p className="text-xs text-gray-600 mt-2">{wideRuns} Run</p>
            </button>

            {/* No Ball Button */}
            <button
              onClick={() => setSelectedExtra('noball')}
              className={`p-4 md:p-6 rounded-lg md:rounded-xl border-2 transition transform active:scale-95 ${
                selectedExtra === 'noball'
                  ? 'border-green-600 bg-green-100 text-green-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
              }`}
            >
              <div className="text-3xl md:text-4xl mb-2">⚡</div>
              <p className="font-bold text-sm md:text-base">No Ball</p>
              <p className="text-xs text-gray-600 mt-2">{noBallRuns} Run</p>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 pt-3 md:pt-4 border-t-2 border-green-600">
          <button
            onClick={handleClose}
            className="flex-1 bg-white text-black py-2 md:py-3 rounded-lg md:rounded-xl font-bold hover:bg-gray-100 transition text-xs md:text-base border-2 border-green-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition text-xs md:text-base border-2 ${
              selectedExtra
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

export default ExtraRunsModal;
