/*=========================== 
*   Title: PlayerCharacterStats
*   Author: Grimm_mmirG
*   Date: 2025-26-02
=============================*/

import React, { useState } from "react";
import CharacterStats from "./characterstats";
import SpellTable from "./spelltable";

const CharacterDisplay = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [characterLevel, setCharacterLevel] = useState(1);
  const [selectedSpells, setSelectedSpells] = useState([]);

  // Define spell slots for the Wizard class
  const wizardSpellSlots = {};

  /* Get spell slots for the current character level */
  const spellSlots = wizardSpellSlots[characterLevel] || {};

  /* Calculate remaining spell points for each level */
  const calculateRemainingSpellPoints = (level) => {
    const maxSpellPoints = spellSlots[level] || 0;
    const usedSpellPoints = selectedSpells.filter((spell) => spell.level === level).length;
    return maxSpellPoints - usedSpellPoints;
  };

  /* Add a spell to the selected spells list */
  const addSpellToCharacter = (spell) => {
    const remainingPoints = calculateRemainingSpellPoints(spell.level);
    if (remainingPoints > 0) {
      setSelectedSpells((prev) => [...prev, spell]);
    } else {
      alert(`No remaining spell points for level ${spell.level} spells.`);
    }
  };

  /* Remove a spell from the selected spells list */
  const removeSpellFromCharacter = (spellIndex) => {
    setSelectedSpells((prev) => prev.filter((_, index) => index !== spellIndex));
  };

  return (
    <div>
      <CharacterStats
        onClassSelect={setSelectedClass}
        characterLevel={characterLevel}
        onLevelChange={setCharacterLevel}
        onAddSpell={addSpellToCharacter}
        selectedSpells={selectedSpells}
      />
      <SpellTable selectedClass={selectedClass} characterLevel={characterLevel} />

      {/* Display Selected Spells and Remaining Spell Points */}
      <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-bold mb-4">Selected Spells</h2>
        {/* Display Remaining Spell Points for Each Level */}
        {Object.keys(spellSlots).map((level) => (
          <div key={level} className="mb-4">
            <h3 className="font-bold">Level {level} Spells</h3>
            <p>Remaining Points: {calculateRemainingSpellPoints(parseInt(level))}</p>
          </div>
        ))}
        {/* Display Selected Spells */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedSpells.map((spell, index) => (
            <div key={index} className="p-4 border rounded shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold">{spell.name}</h3>
                <p>Level: {spell.level}</p>
                <p>School: {spell.school.name}</p>
              </div>
              <button
                type="button"
                onClick={() => removeSpellFromCharacter(index)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterDisplay;