import React, { useState } from 'react';

// Magic item tables (A–I) manually entered based on DMG
const magicItemTables = {
  A: [
    { name: "Potion of Healing", rarity: "Common" },
    { name: "Spell Scroll (Cantrip)", rarity: "Common" },
    // Add more items for Table A
  ],
  B: [
    { name: "Potion of Greater Healing", rarity: "Uncommon" },
    { name: "Spell Scroll (1st level)", rarity: "Uncommon" },
    // Add more items for Table B
  ],
  // Add more tables for C-I
};

const crToTableMapping = {
  0: ['A']&['B'], // CR 0 uses Table A
  5: ['B'], // CR 5 uses Table B
  7: ['B'], // CR 5 uses Table B
  5: ['B'], // CR 5 uses Table B
  5: ['B'], // CR 5 uses Table B
};

const getRandomItemFromTable = (table) => {
  const items = magicItemTables[table];
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
};

const LootGenerator = () => {
  const [cr, setCr] = useState(0);
  const [generatedLoot, setGeneratedLoot] = useState([]);

  const handleGenerateLoot = () => {
    const tablesToUse = crToTableMapping[cr] || ['A']; // Default to Table A if CR not mapped
    const loot = tablesToUse.map((table) => getRandomItemFromTable(table));
    setGeneratedLoot(loot);
  };

  return (
    <div className="loot-generator p-4">
      <h2 className="text-xl font-bold mb-4">Loot Generator</h2>
      
      {/* CR Input */}
      <div className="mb-4">
        <label htmlFor="cr-input" className="font-semibold mr-2">Enter Encounter CR:</label>
        <input
          id="cr-input"
          type="number"
          value={cr}
          onChange={(e) => setCr(Number(e.target.value))}
          className="p-2 border rounded"
        />
      </div>
      
      {/* Generate Loot Button */}
      <button onClick={handleGenerateLoot} className="p-2 bg-blue-500 text-white rounded">
        Generate Loot
      </button>
      
      {/* Display Generated Loot */}
      <div className="generated-loot mt-4">
        {generatedLoot.length > 0 && (
          <ul>
            {generatedLoot.map((item, index) => (
              <li key={index} className="p-2 border-b">
                <strong>{item.name}</strong> - {item.rarity}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LootGenerator;
