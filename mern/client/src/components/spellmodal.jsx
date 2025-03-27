/*============================================================================== 
*   Title: Spell Modal Logic for displaying list of spells and their information
*   Author: Grimm_mmirG
*   Date: 2025-26-02
================================================================================*/

import React from "react";

const SpellModal = ({ level, spells, onAddSpell, onClose, remainingSpellPoints }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-cream p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <h2 className="text-xl font-bold mb-4">Level {level} Spells</h2>
        <p className="text-xl font-bold mb-4">Remaining Spell Slots: {remainingSpellPoints} </p>

        {/* Scrollable Spell List */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spells.map((spell) => (
              <div key={spell.index} className="p-4 border border-brown rounded shadow shadow-amber-800">
                <h3 className="font-bold">{spell.name}</h3>
                <p>Level: {spell.level}</p>
                <p>School: {spell.school.name}</p>
                <button
                  type="button"
                  onClick={() => onAddSpell(spell)}
                  disabled={remainingSpellPoints <= 0}
                  className="mt-2 p-2 bg-goblin-green text-gold font-bold button rounded disabled:bg-amber-100"
                >
                  Add to Character
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Static Close Button */}
        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-cancel-red text-gold font-bold rounded button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpellModal;