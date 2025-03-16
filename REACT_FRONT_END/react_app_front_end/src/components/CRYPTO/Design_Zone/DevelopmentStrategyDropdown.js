import React, { useEffect, useState } from 'react';

const DevelopmentStrategyDropdown = ({ setSelectedStrategy, setCode }) => {
  const [strategies, setStrategies] = useState([]);
  const [strategyName, setStrategyName] = useState('');
  const [isOverwriteModalVisible, setIsOverwriteModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [publishSuccessModalVisible, setPublishSuccessModalVisible] = useState(false);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/API/DEVELOPMENT_STRATEGIES/');
      const data = await response.json();
      setStrategies(data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const handleSelectStrategy = (strategy) => {
    setCurrentStrategy(strategy);
    setSelectedStrategy(strategy.STRTEGY_NAME); // Update parent state
    setCode(strategy.STRATEGY_CODE); // Update code in parent editor
    setStrategyName(strategy.STRTEGY_NAME); // Populate text input field
  };

  const handleSave = async () => {
    const isDuplicate = strategies.some((s) => s.STRTEGY_NAME === strategyName);

    if (isDuplicate) {
      setIsOverwriteModalVisible(true); // Show confirmation modal
    } else {
      await saveStrategy(); // Proceed with saving
      fetchStrategies(); // Refresh strategies after saving
    }
  };

  const saveStrategy = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/API/SAVE_DEVELOPMENT_CODE/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          STRTEGY_NAME: strategyName,
          STRATEGY_CODE: currentStrategy?.STRATEGY_CODE || '', // Pass the code
        }),
      });

      if (response.ok) {
        setIsSuccessModalVisible(true); // Show success modal
        fetchStrategies(); // Refresh strategies after saving
      } else {
        console.error('Failed to save strategy.');
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
    }
  };

  const publishStrategy = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/API/PUBLISH_STRATEGY/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          STRTEGY_NAME: strategyName,
          STRATEGY_CODE: currentStrategy?.STRATEGY_CODE || '', // Pass the code
        }),
      });

      if (response.ok) {
        setPublishSuccessModalVisible(true); // Show success modal for publishing
        fetchStrategies(); // Refresh strategies after publishing
      } else {
        console.error('Failed to publish strategy.');
      }
    } catch (error) {
      console.error('Error publishing strategy:', error);
    }
  };

  const confirmOverwrite = async () => {
    setIsOverwriteModalVisible(false);
    await saveStrategy(); // Proceed with saving after confirmation
    fetchStrategies(); // Refresh strategies after saving
  };

  return (
    <div className="grid grid-cols-4 gap-4 items-center">
      {/* Dropdown */}
      <select
        className="select select-bordered w-full text-white bg-gray-800"
        onChange={(e) => {
          const selected = strategies.find((s) => s.STRTEGY_NAME === e.target.value);
          if (selected) handleSelectStrategy(selected);
        }}
        value={currentStrategy?.STRTEGY_NAME || ''}
      >
        <option disabled value="">
          Select Development Strategy
        </option>
        {strategies.map((strategy) => (
          <option key={strategy.STRTEGY_NAME} value={strategy.STRTEGY_NAME}>
            {strategy.STRTEGY_NAME}
          </option>
        ))}
      </select>

      {/* Text Input */}
      <input
        type="text"
        className="input input-bordered w-full text-white bg-gray-800"
        placeholder="Name of your Strategy :"
        value={strategyName || ''} // Ensures an empty string when no name is set
        onChange={(e) => setStrategyName(e.target.value)}
      />

      {/* Save Button */}
      <button className="btn btn-outline btn-warning w-full" onClick={handleSave}>
        Save as Development
      </button>

      {/* Publish Button */}
      <button className="btn btn-outline btn-success w-full" onClick={publishStrategy}>
        Publish as Active
      </button>

{/* Overwrite Confirmation Modal */}
<dialog id="overwriteModal" className={`modal ${isOverwriteModalVisible ? 'modal-open' : ''}`}>
  <div className="modal-box">
    <h3 className="font-bold text-lg text-neutral-content">Overwrite Strategy</h3>
    <p className="py-4 text-neutral-content">
      A strategy with the name <b>{strategyName}</b> already exists. Do you want to overwrite it?
    </p>
    <div className="modal-action flex justify-between">
      <button
        className="btn btn-outline btn-error w-1/2"
        onClick={() => setIsOverwriteModalVisible(false)}
      >
        No
      </button>
      <button
        className="btn btn-outline btn-success w-1/2 ml-2"
        onClick={confirmOverwrite}
      >
        Yes
      </button>
    </div>
  </div>
</dialog>

{/* Save Success Modal */}
<dialog id="successModal" className={`modal ${isSuccessModalVisible ? 'modal-open' : ''}`}>
  <div className="modal-box">
    <h3 className="font-bold text-lg text-neutral-content">Success</h3>
    <p className="py-4 text-neutral-content">
      Your development strategy <b>{strategyName}</b> was successfully saved.
    </p>
    <div className="modal-action">
      <button
        className="btn btn-outline w-full"
        onClick={() => setIsSuccessModalVisible(false)}
      >
        Close
      </button>
    </div>
  </div>
</dialog>

{/* Publish Success Modal */}
<dialog id="publishSuccessModal" className={`modal ${publishSuccessModalVisible ? 'modal-open' : ''}`}>
  <div className="modal-box">
    <h3 className="font-bold text-lg text-neutral-content">Success</h3>
    <p className="py-4 text-neutral-content">
      Your development strategy <b>{strategyName}</b> was successfully published as active.
    </p>
    <div className="modal-action">
      <button
        className="btn btn-outline w-full"
        onClick={() => setPublishSuccessModalVisible(false)}
      >
        Close
      </button>
    </div>
  </div>
</dialog>
    </div>
  );
};

export default DevelopmentStrategyDropdown;