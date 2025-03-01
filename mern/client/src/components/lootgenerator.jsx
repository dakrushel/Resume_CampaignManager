import React, { useState } from 'react';
import { rollCoinTable } from './cointable'; // Import your cointable component
import { rollTreasureHoard } from './treasurehoard'; // Import the treasure hoard function

const LootGenerator = () => {
  const [coinResult, setCoinResult] = useState(null);
  const [hoardResult, setHoardResult] = useState(null); // State for treasure hoard result
  const [cr, setCr] = useState(0); // For Challenge Rating input

  const handleCoinRoll = () => {
    const result = rollCoinTable(cr); // Pass in the Challenge Rating (CR) to determine the correct table
    setCoinResult(result);
  };

  const handleTreasureHoardRoll = () => {
    const result = rollTreasureHoard(cr); // Pass in the CR for the treasure hoard roll
    setHoardResult(result);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Loot Generator</h1>
      <label className="block mb-4">
        Challenge Rating (CR):
        <input
          type="number"
          value={cr}
          onChange={(e) => setCr(Number(e.target.value))}
          min={0}
          max={30}
          className="ml-2 p-2 border rounded"
        />
      </label>

      <div className="mb-4">
        <button
          onClick={handleCoinRoll}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Roll Coins
        </button>
        <button
          onClick={handleTreasureHoardRoll}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Roll Treasure Hoard
        </button>
      </div>

      {coinResult && (
        <div>
          <h2 className="text-xl font-semibold">Coin Results</h2>
          <p>{coinResult}</p>
        </div>
      )}

      {hoardResult && (
        <div>
          <h2 className="text-xl font-semibold">Treasure Hoard Results</h2>
          <p>Gems/Art Objects: {hoardResult.gems}</p>
          <p>Magic Items: {hoardResult.magicItems}</p>
        </div>
      )}
    </div>
  );
};

export default LootGenerator;
